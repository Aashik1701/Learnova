
# Learnova — Adaptive AI Lessons

A lightweight Vite + React + TypeScript app that generates personalized lessons from a short questionnaire. The project can use Google Gemini (Generative Language API) to produce lesson chapters on-the-fly and falls back to a built-in template if the API is unavailable.

This README explains how to set up and run the project locally, how the Gemini integration works, and important security notes about shipping API keys in client bundles.

## Features

- Create personalized lessons by uploading study material name and answering a brief questionnaire.
- Client-side call to Gemini to produce lesson chapters (with a local template fallback).
- In-app learning flow with chapters, quizzes and progress tracking (stored in localStorage by default).
- Supabase integration present for auth and server functions (some serverless functions live in `supabase/functions`).

## Quick start (macOS / zsh)

1. Clone the repo and install dependencies:

	 ```bash
	 git clone <your-repo-url>
	 cd learnova-pass-ai
	 npm install
	 # or: bun install
	 ```

2. Create a `.env` file in the project root (or update your existing one). The project expects Vite-style env variables (prefixed with `VITE_`). Example:

	 ```env
	 VITE_SUPABASE_PROJECT_ID="tcdhabmttwopjpobppmh"
	 VITE_SUPABASE_PUBLISHABLE_KEY="<your-supabase-publishable-key>"
	 VITE_SUPABASE_URL="https://tcdhabmttwopjpobppmh.supabase.co"
	 ```

3. Start the dev server:

	 ```bash
	 npm run dev
	 # or: bun dev (if you use bun)
	 ```

4. Open the app at the address Vite prints (usually http://localhost:5173).

## How to generate a lesson in the UI

1. Go to the Lessons page (sidebar / dashboard) and click `Create Lesson`.
2. Enter a lesson name and upload a study material file name (the file upload is simulated — the file name is used for display).
3. Complete the short questionnaire about proficiency, goals and learning style.
4. The app will call `generateChapters` in `src/lib/lesson-generator.ts` which invokes the Gemini API. If the call succeeds, the returned chapters will be used. If the call fails or the key is missing, the app falls back to the built-in chapter templates and you will see a toast notification indicating backup content is being used.

Files to review:

- `src/lib/lesson-generator.ts` — the Gemini integration and fallback logic
- `src/pages/Lessons.tsx` — UI flow that calls `generateChapters`
- `src/components/lessons/*` — the lesson creation/questionnaire/learning UI components
- `supabase/functions/generate-lesson/index.ts` — existing serverless function (older Lovable AI usage) — present for reference but the client now calls Gemini directly.
