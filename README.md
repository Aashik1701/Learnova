# Learnova Pass AI

Learnova Pass AI is an adaptive learning platform that pairs a React/Vite frontend with a FastAPI backend to create tailored lessons, quizzes, and study materials. Learners upload or reference study content, answer a short questionnaire, and receive AI-generated chapters and practice questions powered by Google Gemini. Supabase powers auth-ready integrations and serverless functions for future expansion.

## Project Structure

```
backend/    FastAPI service exposed for Gemini-powered content generation
frontend/   Vite + React + TypeScript client application
supabase/   Edge functions and migrations scaffold for Supabase integrations
```

### Frontend (Vite + React)
- Generates lessons and practice flows based on questionnaire answers.
- Integrates with Google Gemini through `src/lib/lesson-generator.ts` and falls back to local templates if the API is unavailable.
- Includes Supabase-ready hooks for auth and social learning features.

### Backend (FastAPI)
- Provides server-side endpoints for questionnaire generation and study materials at `backend/main.py`.
- Uses `app/services/gemini_service.py` to interact with Gemini models for structured JSON responses.
- Ships with `vercel.json` for deployment on Vercel serverless infrastructure.

## Prerequisites

- Node.js 18+ (or Bun 1+) for the frontend
- Python 3.11 for the backend (installable via Homebrew: `brew install python@3.11`)
- A Google Gemini API key (server) and Supabase project credentials (client)

## Local Development

### 1. Clone and install dependencies

```bash
git clone https://github.com/Aashik1701/learnova-pass-ai.git
cd learnova-pass-ai
```

#### Frontend
```bash
cd frontend
npm install          # or: bun install
```

#### Backend
```bash
cd ../backend
python3.11 -m venv .venv
source .venv/bin/activate  # Windows: .\.venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure environment variables

Create `.env` files where needed:

- `backend/.env`
  ```env
  GEMINI_API_KEY="<your-google-gemini-key>"
  ```

- `frontend/.env`
  ```env
  VITE_SUPABASE_URL="https://<project>.supabase.co"
  VITE_SUPABASE_PROJECT_ID="<project-ref>"
  VITE_SUPABASE_PUBLISHABLE_KEY="<anon-key>"
  ```

Add any additional secrets (e.g., other service URLs) as you integrate new features.

### 3. Run the apps locally

In two terminals:

**Backend**
```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload
```

The API is served at `http://127.0.0.1:8000` with docs under `/docs`.

**Frontend**
```bash
cd frontend
npm run dev          # or: bun dev
```

Open the client at the printed Vite URL (default `http://localhost:5173`).

## Key Commands

| Area     | Command                                   | Purpose                       |
|----------|-------------------------------------------|-------------------------------|
| Frontend | `npm run dev` / `npm run build`           | Dev server / production build |
| Backend  | `uvicorn main:app --reload`               | FastAPI dev server            |
| Backend  | `pip install -r requirements.txt`         | Install backend dependencies  |
| Supabase | `supabase functions serve <fn>`           | Test Supabase edge functions  |

## Deployment Notes

- **Frontend**: Deployable to any static host (Vercel, Netlify, Cloudflare). Run `npm run build` and serve the `dist/` bundle.
- **Backend**: Optimized for Vercel Serverless Functions via `vercel.json`; can also run on traditional hosts or container platforms.
- **Supabase Functions**: Found under `supabase/functions/*`. Use the Supabase CLI to deploy edge functions if needed.

## Troubleshooting

- **Gemini JSON mode**: The project parses plain-text JSON responses. The current SDK version does not support `response_mime_type`, so ensure prompts request raw JSON and remove unsupported config fields.
- **Python environment**: Always activate the `.venv` created with Python 3.11 before running the backend to ensure compatible dependency versions.
- **Port conflicts**: If `uvicorn` reports port 8000 in use, free the port with `lsof -ti tcp:8000 | xargs kill` on macOS.

## Contributing

1. Fork the repository and create a feature branch.
2. Make your changes with clear commits and update documentation/tests as needed.
3. Open a pull request against `main` with a concise summary and testing notes.

---

Happy learning! Reach out via issues or discussions if you have questions about extending Learnova Pass AI.
# Learnova
