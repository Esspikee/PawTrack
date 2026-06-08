# PawTrack — Backend API

PawTrack is a community app for tracking neighborhood stray and wildlife animals
(cats and dogs, for now). Users register an **animal** they spot, log new
**sightings** of that same animal over time, **confirm** other people's sightings,
and earn **XP / levels** for participating.

This repository is the **backend only** — a REST API. The mobile/web frontend
(the part the user sees, including the camera flow) is a separate project that
talks to this API over HTTP.

> **You do not need to understand the backend code to build the frontend.**
> You need to (1) get this server running on your machine, and (2) know which
> URLs to call. This README covers both, step by step.

---

## Tech stack (for context)

- **Python 3.12+** (built and tested on 3.13)
- **FastAPI** — the web framework
- **PostgreSQL** — the database
- **SQLAlchemy** — talks to the database
- **JWT (Bearer tokens)** — authentication

---

## Part 1 — One-time setup (Ubuntu)

Do these steps **once**. Copy-paste each command into your Ubuntu terminal.

### Step 0 — Open the project in VS Code

If you haven't cloned the repo yet:

```bash
git clone https://github.com/Esspikee/PawTrack.git
cd PawTrack
code .
```

If you already have it, just update to the latest version:

```bash
cd PawTrack
git checkout main
git pull origin main
code .
```

> Tip: In VS Code, open the integrated terminal with **Ctrl + `** (backtick).
> Run all the commands below from there, inside the project folder.

### Step 1 — Install system packages

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip postgresql postgresql-contrib
```

Start the database service:

```bash
sudo service postgresql start
```

### Step 2 — Create the database and database user

The backend expects a PostgreSQL database called `pawtrack_db` owned by a user
called `pawtrack_admin`. Create them (choose your own password and **remember
it** — you'll need it in Step 5):

```bash
sudo -u postgres psql -c "CREATE USER pawtrack_admin WITH PASSWORD 'choose_a_password_here';"
sudo -u postgres psql -c "CREATE DATABASE pawtrack_db OWNER pawtrack_admin;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE pawtrack_db TO pawtrack_admin;"
```

> You do **not** need to create any tables. The app creates them automatically
> the first time it starts, and seeds the level data too.

### Step 3 — Create a Python virtual environment

A "virtual environment" is an isolated folder for this project's Python packages,
so they don't clash with the rest of your system.

```bash
python3 -m venv .venv
source .venv/bin/activate
```

After activating, your terminal prompt will start with `(.venv)`. You must do
`source .venv/bin/activate` **every time** you open a new terminal to work on
this project (see Part 2).

> In VS Code: press **Ctrl + Shift + P**, type "Python: Select Interpreter",
> and pick the one inside `.venv`. This makes VS Code use the right environment.

### Step 4 — Install the Python dependencies

```bash
pip install -r requirements.txt
```

### Step 5 — Create your `.env` file (configuration + secrets)

The app reads its configuration from a file called `.env`, which is **not** in
the repository (it contains secrets). There is a template called `.env.example`.
Copy it:

```bash
cp .env.example .env
```

Now open `.env` in VS Code and edit two lines:

1. **`DATABASE_URL`** — put the password you chose in Step 2:
   ```
   DATABASE_URL=postgresql://pawtrack_admin:choose_a_password_here@localhost/pawtrack_db
   ```

2. **`SECRET_KEY`** — generate a random one by running this command and pasting
   the output:
   ```bash
   python -c 'import secrets; print(secrets.token_urlsafe(32))'
   ```
   ```
   SECRET_KEY=the_long_random_string_you_just_generated
   ```

Leave the other lines (`ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `ENVIRONMENT`)
as they are.

> **Never commit `.env` to git.** It's already in `.gitignore`, so you don't have
> to do anything — just don't force-add it.

### Step 6 — Run the server

```bash
uvicorn main:app --reload
```

You should see something like `Uvicorn running on http://127.0.0.1:8000`.
The `--reload` flag automatically restarts the server when code changes.

To stop the server, press **Ctrl + C**.

### Step 7 — Verify it works

Open your browser at:

**http://127.0.0.1:8000/docs**

This is the **interactive API documentation** (Swagger UI), generated
automatically. You can see every endpoint and even try them out from the browser.

To confirm everything is wired up, register a test user:
1. On the `/docs` page, expand **POST `/usuarios/`**.
2. Click **"Try it out"**, fill in `username`, a real-looking `email`
   (e.g. `test@gmail.com`), and a `password`.
3. Click **Execute**. A **`200`** response means your setup is fully working.

🎉 You're ready.

---

## Part 2 — Daily workflow

Every time you sit down to work:

```bash
cd PawTrack
git pull origin main            # get the latest backend changes
source .venv/bin/activate       # activate the virtual environment
uvicorn main:app --reload       # start the server
```

If `requirements.txt` changed since last time, also run
`pip install -r requirements.txt`.

---

## Part 3 — How the frontend talks to the API

**Base URL during local development:** `http://127.0.0.1:8000`

The single source of truth for every endpoint is the live docs at `/docs`
(and the machine-readable spec at `/openapi.json`, which you can use to generate
a typed API client). Below are the things that are easy to get wrong.

### 3.1 — Authentication (read this carefully)

Most endpoints require the user to be logged in. The flow is:

**1. Register** — `POST /usuarios/` with a **JSON** body:
```json
{ "username": "ana", "email": "ana@gmail.com", "password": "MyPassword123" }
```
- The email must be a real, valid email format (e.g. `@gmail.com` works;
  `@something.test` is rejected).
- Duplicate email or username returns **`409`**.

**2. Log in** — `POST /login`. ⚠️ **This one is NOT JSON.** It uses
**form-url-encoded** data, and the email goes in a field literally named
`username`:

```js
const form = new URLSearchParams();
form.append("username", "ana@gmail.com"); // <-- the EMAIL goes here
form.append("password", "MyPassword123");

const res = await fetch("http://127.0.0.1:8000/login", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: form,
});
const { access_token } = await res.json(); // save this token
```

**3. Call protected endpoints** — send the token in the `Authorization` header:
```js
await fetch("http://127.0.0.1:8000/usuarios/me", {
  headers: { Authorization: `Bearer ${access_token}` },
});
```

Notes:
- The token **expires after 60 minutes**. There is no refresh endpoint — when you
  get a `401`, send the user back through login.
- **Do NOT use cookies / `credentials: "include"`.** Auth is header-based only.
  (The server's CORS is configured for header auth, not cookies.)

### 3.2 — Uploading images (two steps)

The backend stores images **locally** and serves them. You never send image bytes
to the animal/sighting endpoints — you send a **URL string**.

**Step 1:** upload the file → get a URL back.
```js
const fd = new FormData();
fd.append("file", fileFromCameraOrInput); // field name MUST be "file"

const res = await fetch("http://127.0.0.1:8000/upload", {
  method: "POST",
  headers: { Authorization: `Bearer ${access_token}` }, // do NOT set Content-Type manually
  body: fd,
});
const { url } = await res.json(); // e.g. "/uploads/ab12cd34.jpg" (relative!)
const fullUrl = `http://127.0.0.1:8000${url}`;
```
- Allowed types: **JPEG, PNG, WEBP**. Max size: **5 MB**. Anything else → `400`.
- The returned `url` is **relative** — prepend the base URL to display it.

**Step 2:** use that URL when creating an animal or sighting (see below), passing
it as `foto_principal` or `foto_url`.

### 3.3 — Endpoint reference

| Method & path | Auth? | What it does |
|---|---|---|
| `GET /` | no | Health check ("server is alive") |
| `POST /usuarios/` | no | Register a user (JSON: `username`, `email`, `password`) |
| `GET /usuarios/` | no | List all users (public profiles, no email) |
| `GET /usuarios/me` | **yes** | The logged-in user's full profile + stats |
| `POST /login` | no | Log in (**form-encoded**) → returns `access_token` |
| `POST /upload` | **yes** | Upload one image (multipart, field `file`) → `{filename, url}` |
| `GET /animales/` | no | List all animals (the map/catalogue) |
| `POST /animales/` | **yes** | Register a new animal + its first sighting |
| `GET /animales/{id}` | no | One animal's full detail + its sightings |
| `PUT /animales/{id}` | **yes** | Edit an animal (owner only) |
| `POST /animales/{id}/avistamientos` | **yes** | Log a new sighting of an existing animal |
| `GET /animales/{id}/historial` | no | Full chronological sighting history of an animal |
| `DELETE /avistamientos/{id}` | **yes** | Delete a sighting you created (owner only) |
| `POST /avistamientos/{id}/confirmar` | **yes** | Confirm someone else's sighting (+XP) |
| `DELETE /avistamientos/{id}/confirmar` | **yes** | Remove your confirmation |
| `GET /avistamientos/{id}/confirmaciones` | no | Who confirmed a sighting |

**Request bodies (JSON):**

- `POST /animales/` →
  ```json
  { "especie": "Gato", "color_principal": "Negro", "latitud": 19.43, "longitud": -99.13,
    "descripcion": "Visto cerca del parque", "foto_principal": "/uploads/xxx.jpg" }
  ```
  `especie` must be exactly `"Gato"` or `"Perro"`. `foto_principal` is optional.
- `POST /animales/{id}/avistamientos` →
  ```json
  { "latitud": 19.43, "longitud": -99.13, "descripcion": "Lo vi otra vez",
    "foto_url": "/uploads/yyy.jpg" }
  ```
  `foto_url` is optional.

### 3.4 — Rate limits

To prevent spam, some endpoints are rate-limited **per IP**:
- `POST /usuarios/` — 3 requests/minute
- `POST /login` — 5 requests/minute
- `POST /upload` — 20 requests/minute

If you hit a limit you get **`429`**. While developing/testing locally you can
turn limits off: stop the server and start it like this:
```bash
RATE_LIMIT_ENABLED=false uvicorn main:app --reload
```

---

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `RuntimeError: DATABASE_URL ... is not configured` | You skipped Step 5. Create `.env` from `.env.example`. |
| `password authentication failed for user "pawtrack_admin"` | The password in `.env`'s `DATABASE_URL` doesn't match the one from Step 2. |
| `could not connect to server` / `Connection refused` | PostgreSQL isn't running: `sudo service postgresql start`. |
| `ModuleNotFoundError` when starting the server | Virtual env not active. Run `source .venv/bin/activate`, then `pip install -r requirements.txt`. |
| `Address already in use` on port 8000 | Another server is running. Use a different port: `uvicorn main:app --reload --port 8001`. |
| Login returns `422` | You sent JSON. Login must be **form-url-encoded** (see 3.1). |
| Any protected call returns `401` | Missing `Authorization: Bearer <token>` header, or the token expired (60 min) — log in again. |
| CORS error in the browser | Don't use `credentials: "include"`. Send the token in the `Authorization` header. |

---

## Good to know (current scope)

This is an MVP for a small closed beta (~10–15 friends), so a few things are
intentionally simple for now:
- No pagination — list endpoints return everything (fine at this scale).
- Sightings can be **deleted** by their author but not edited; there's no
  endpoint to delete a whole animal.
- Uploaded images are served publicly via their URL.

When in doubt about a request or response shape, check **`/docs`** — it's always
accurate and generated from the live code.
