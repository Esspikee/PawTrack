# PawTrack Friends Alpha Deployment

This checklist is the release path for a small friends alpha.

## 1. Backend Environment

Create production environment variables for the FastAPI service:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
SECRET_KEY=<generate with: python -c "import secrets; print(secrets.token_urlsafe(32))">
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ENVIRONMENT=production
RATE_LIMIT_ENABLED=true
UPLOADS_DIR=/var/data/pawtrack/uploads
```

Use a real PostgreSQL database. The app creates tables and seeds level data on startup.

Uploads are local files served from `/uploads`. On hosts with ephemeral filesystems, mount a persistent disk and set `UPLOADS_DIR` to that path.

## 2. Backend Commands

Install:

```bash
pip install -r requirements.txt
```

Start:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Hosts that support Procfiles can use the root `Procfile` directly.

Local development can use:

```bash
uvicorn main:app --reload --port 8000
```

## 3. Frontend Environment

Create a frontend environment variable pointing to the deployed backend:

```bash
VITE_API_BASE_URL=https://your-pawtrack-api.example.com
```

Local development uses:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## 4. Frontend Commands

Install:

```bash
npm install
```

Build:

```bash
npm run build
```

Deploy the `frontend/dist` output with SPA fallback to `index.html`.
The repo includes `frontend/public/_redirects` for Netlify-style SPA fallback.

## 5. Release Gate

Before inviting friends, run:

```bash
python scripts/release_check.py
```

If PostgreSQL is not available locally, you can still run a local API smoke test
with SQLite. This is only for development verification, not production:

```bash
DATABASE_URL=sqlite:///./pawtrack_smoke.db \
SECRET_KEY=local_smoke_secret_key_for_pawtrack_replace_before_any_shared_environment_8ab2d6f4c9e1 \
RATE_LIMIT_ENABLED=false \
UPLOADS_DIR=uploads_smoke \
uvicorn main:app --reload --port 8000
```

The smoke test uses `PAWTRACK_API_BASE` when you want to test a deployed backend:

```bash
PAWTRACK_API_BASE=https://your-pawtrack-api.example.com python smoke_test.py
```

The release checker will also run the smoke test when `PAWTRACK_API_BASE` is set:

```bash
PAWTRACK_API_BASE=https://your-pawtrack-api.example.com python scripts/release_check.py
```

## 6. Manual Friends-Alpha QA

Use two accounts and verify:

- Register and log in.
- Upload a photo.
- Create an animal with GPS or manual coordinates.
- See the animal on list/map.
- Open detail and history.
- Add a second sighting from another account.
- Confirm and unconfirm the other user's sighting.
- Delete your own non-first sighting.
- Confirm profile stats and achievements update.

Only share the app after this checklist passes against the deployed backend.
