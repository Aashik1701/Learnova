# FastAPI Backend for Vercel

This is a FastAPI application configured for deployment on Vercel.

## Development Setup

1. Ensure Python 3.11 is available on your machine. On macOS with Homebrew:
   ```bash
   brew install python@3.11
   ```

2. Create a virtual environment (recommended name: `.venv`):
   ```bash
   python3.11 -m venv .venv
   source .venv/bin/activate  # On Windows: .\.venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the development server:
   ```bash
   uvicorn main:app --reload
   ```

5. Open your browser to:
   - API Docs: http://127.0.0.1:8000/docs
   - Redoc: http://127.0.0.1:8000/redoc

## Deployment to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

## Environment Variables

Create a `.env` file in the root directory with your environment variables:

```env
# Example:
# DATABASE_URL=your_database_url
# SECRET_KEY=your_secret_key
```

## API Endpoints

- `GET /`: Health check endpoint
- `GET /api/hello`: Example endpoint
- `/docs`: Interactive API documentation
- `/redoc`: Alternative API documentation
