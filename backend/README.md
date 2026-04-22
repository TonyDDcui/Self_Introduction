# Backend API (FastAPI MVP)

This folder contains the MVP backend for:

- OAuth login (GitHub enabled, Google/WeChat reserved)
- Cookie session (`HttpOnly`, `Secure`, `SameSite=Lax`, path `/api`)
- Daily usage and subscription checks
- AI gateway to Ollama OpenAI-compatible API
- Admin APIs (`/api/admin/*`)
- Blog bridge API (`/api/blog/latest`)

## Quick start

1. Create env file:

```bash
cp backend/.env.example backend/.env
```

2. Install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

3. Run API:

```bash
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Notes

- Tables are auto-created by SQLAlchemy at startup for MVP.
- WeChat/Google OAuth routes return `501 NOT_ENABLED` in MVP.
- AI gateway endpoint:
  - `POST /api/ai/chat`
