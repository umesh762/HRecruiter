import { RankResponse } from '@/types/candidate';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function rankCandidates(
  jobDescriptionText: string,
  jobDescriptionFile: File | null,
  candidates: string[],
  candidateFiles: (File | null)[],
  modes: { jd: 'text' | 'file'; candidates: ('text' | 'file')[] }
): Promise<RankResponse> {
  // Check if we are using only text (no files uploaded)
  const isTextOnly = 
    modes.jd === 'text' && 
    modes.candidates.every(m => m === 'text');

  if (isTextOnly) {
    // Send standard JSON request
    const response = await fetch(`${API_BASE_URL}/api/rank-candidates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job_description: jobDescriptionText,
        candidates: candidates.filter(c => c.trim().length > 0),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || errorData?.error || 'Failed to rank candidates');
    }

    return response.json();
  } else {
    // Use FormData for multipart/form-data
    const formData = new FormData();

    if (modes.jd === 'file' && jobDescriptionFile) {
      formData.append('job_description_file', jobDescriptionFile);
    } else {
      formData.append('job_description_text', jobDescriptionText);
    }

    // Append candidates (texts and files)
    candidates.forEach((candText, index) => {
      const mode = modes.candidates[index] || 'text';
      if (mode === 'file') {
        const file = candidateFiles[index];
        if (file) {
          formData.append('candidate_files', file);
        }
      } else {
        const text = candText.trim();
        if (text) {
          formData.append('candidate_texts', text);
        }
      }
    });

    // Send request — Note: Do NOT set Content-Type header when using FormData;
    // the browser will automatically set it with the correct boundary parameters.
    const response = await fetch(`${API_BASE_URL}/api/rank-candidates-upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || errorData?.error || 'Failed to rank candidates');
    }

    return response.json();
  }
}

