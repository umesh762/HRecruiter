from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from models import RankRequest, RankResponse
from orchestrate_client import rank_candidates
from file_parser import extract_text_from_upload
from typing import Optional, List, Union
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

app = FastAPI(title="TalentLens AI API")

# Maximum upload file size: 10 MB
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB in bytes
ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.txt'}

# Setup CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logging.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "An internal server error occurred while processing your request."},
    )

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

@app.post("/api/rank-candidates", response_model=RankResponse)
async def api_rank_candidates(request: RankRequest):
    """
    Endpoint to rank candidates based on a job description.
    Accepts job description and list of candidates, returns ranked list.
    (Original JSON-only endpoint — kept for backward compatibility.)
    """
    try:
        if not request.job_description or not request.candidates:
            raise HTTPException(status_code=400, detail="Job description and candidates are required.")
            
        result = await rank_candidates(request.job_description, request.candidates)
        return result
    except Exception as e:
        # We re-raise HTTPException if it was already raised
        if isinstance(e, HTTPException):
            raise e
        # Otherwise log and let the global handler catch it
        logging.error(f"Error ranking candidates: {e}")
        raise HTTPException(status_code=502, detail=str(e))


def _validate_upload_file(upload_file: UploadFile, label: str) -> None:
    """
    Validate an uploaded file's type and extension before reading its bytes.
    Raises HTTPException with a clear message on failure.
    """
    filename = upload_file.filename or "unknown"
    ext = ('.' + filename.rsplit('.', 1)[-1].lower()) if '.' in filename else ''

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"{label}: Unsupported file type '{ext}'. Allowed types: {', '.join(sorted(ALLOWED_EXTENSIONS))}."
        )


async def _read_and_validate_size(upload_file: UploadFile, label: str) -> bytes:
    """
    Read uploaded file bytes and enforce the 10 MB size limit.
    Returns the raw bytes if valid.
    """
    file_bytes = await upload_file.read()

    if len(file_bytes) > MAX_FILE_SIZE:
        size_mb = len(file_bytes) / (1024 * 1024)
        raise HTTPException(
            status_code=413,
            detail=f"{label}: File is too large ({size_mb:.1f} MB). Maximum allowed size is 10 MB."
        )

    return file_bytes


@app.post("/api/rank-candidates-upload", response_model=RankResponse)
async def api_rank_candidates_upload(
    job_description_text: Optional[str] = Form(None),
    job_description_file: Optional[UploadFile] = File(None),
    candidate_texts: Optional[Union[List[str], str]] = Form(None),
    candidate_files: Optional[Union[List[UploadFile], UploadFile]] = File(None),
):
    """
    Multipart endpoint to rank candidates with optional file uploads.
    
    For the job description: provide EITHER job_description_text OR job_description_file.
    For candidates: provide any mix of candidate_texts and candidate_files.
    Files are parsed to plain text on the server before ranking.
    """
    try:
        # --- Resolve job description ---
        job_description = ""

        if job_description_file and job_description_file.filename:
            label = f"Job Description file '{job_description_file.filename}'"
            _validate_upload_file(job_description_file, label)
            file_bytes = await _read_and_validate_size(job_description_file, label)
            try:
                job_description = extract_text_from_upload(job_description_file.filename, file_bytes)
                logging.info(f"Extracted {len(job_description)} chars from JD file")
            except ValueError as e:
                raise HTTPException(status_code=400, detail=f"{label}: {str(e)}")
        elif job_description_text:
            job_description = job_description_text.strip()

        if not job_description:
            raise HTTPException(
                status_code=400,
                detail="Job description is required. Provide either text or a file."
            )

        # --- Resolve candidates ---
        all_candidates: List[str] = []

        # Add text-based candidates
        if candidate_texts:
            # Coerce single string to a list of strings
            texts_list = candidate_texts if isinstance(candidate_texts, list) else [candidate_texts]
            for text in texts_list:
                stripped = text.strip()
                if stripped:
                    all_candidates.append(stripped)

        # Add file-based candidates
        if candidate_files:
            # Coerce single UploadFile to a list of UploadFiles
            files_list = candidate_files if isinstance(candidate_files, list) else [candidate_files]
            for i, cfile in enumerate(files_list):
                if not cfile.filename:
                    continue
                label = f"Candidate file #{i + 1} '{cfile.filename}'"
                _validate_upload_file(cfile, label)
                file_bytes = await _read_and_validate_size(cfile, label)
                try:
                    text = extract_text_from_upload(cfile.filename, file_bytes)
                    if text:
                        all_candidates.append(text)
                        logging.info(f"Extracted {len(text)} chars from {label}")
                except ValueError as e:
                    raise HTTPException(status_code=400, detail=f"{label}: {str(e)}")

        if len(all_candidates) == 0:
            raise HTTPException(
                status_code=400,
                detail="At least one candidate is required. Provide either text or file(s)."
            )

        # --- Call the existing ranking pipeline (unchanged) ---
        logging.info(f"Ranking {len(all_candidates)} candidate(s) against JD ({len(job_description)} chars)")
        result = await rank_candidates(job_description, all_candidates)
        return result

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error in rank-candidates-upload: {e}")
        raise HTTPException(status_code=502, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
