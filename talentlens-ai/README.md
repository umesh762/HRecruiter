# TalentLens AI

An AI-powered recruiter platform that ranks job candidates against a job description using IBM watsonx Orchestrate.

## Project Structure

- `backend/` - FastAPI application for communicating with IBM watsonx Orchestrate.
- `frontend/` - Next.js application for the user interface.

## Prerequisites

- Node.js (v18+)
- Python (v3.10+)
- IBM watsonx Orchestrate instance and API credentials.

## Setup Instructions

### 1. Backend Setup (FastAPI)

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies (it is recommended to use a virtual environment):
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Configure environment variables:
Copy the `.env.example` file to `.env` and fill in the required IBM watsonx Orchestrate variables.
```bash
cp .env.example .env
```

Start the development server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

### 2. Frontend Setup (Next.js)

Navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## Usage

1. Open `http://localhost:3000` in your browser.
2. Enter a job description.
3. Add candidate profiles.
4. Click "Rank Candidates" to process the list using AI.
