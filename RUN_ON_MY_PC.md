# Run PawTrack on your PC (friends alpha)

This is the self-host path for ~10–15 friends. One process on your PC serves
**both** the web app and the API on the same address, so there is no separate
frontend host and no CORS to configure. The **only** thing not yet done is
putting an HTTPS tunnel in front of it (Step 3) — everything else is ready.

> Why a tunnel is required, not optional: browsers only allow **GPS and camera**
> on `localhost` or over **HTTPS**. Friends hitting a plain `http://<your-ip>`
> address will be blocked from those features — and PawTrack is built around
> them. The tunnel gives you a free HTTPS URL.

---

## Step 1 — Build the web app (one time, and after any frontend change)

```bash
cd frontend
npm install        # only needed the first time, or after dependency changes
npm run build      # produces frontend/dist, which the backend serves
cd ..
```

## Step 2 — Start the server

```bash
./serve.sh
```

This runs in **production mode** (config comes from `.env`, which is already set
up with a strong `SECRET_KEY`, your PostgreSQL database, and rate limiting on).
The server listens on port **8000** and serves the app at `http://localhost:8000`.

Open `http://localhost:8000` on the same PC to confirm the app loads. GPS and
camera will work here because it is `localhost`. They will **not** work for
remote friends until Step 3.

To stop the server: `Ctrl+C`.

## Step 3 — Put an HTTPS tunnel in front (the remaining step)

Pick one. Both give you a public `https://…` URL that forwards to your local
port 8000. Keep `./serve.sh` running in one terminal and the tunnel in another.

**Cloudflare Tunnel (recommended — free, no account needed for a quick tunnel):**

```bash
cloudflared tunnel --url http://localhost:8000
```

It prints a URL like `https://something-random.trycloudflare.com`. That URL is
your app. Share it with friends.

**ngrok (alternative):**

```bash
ngrok http 8000
```

Use the `https://…` forwarding URL it prints.

Because the app and API share one origin, **nothing else needs to change** when
the tunnel URL appears — no rebuild, no CORS edit. Friends open the HTTPS URL and
register/log in directly.

> The start command already passes `--forwarded-allow-ips=127.0.0.1`, so the
> tunnel forwards each friend's real IP. That keeps rate limits per-person
> (registration is 3/min, login 5/min) instead of one shared bucket that would
> lock everyone out during a launch.

---

## What friends do

1. Open the HTTPS URL you share.
2. Register, then log in.
3. Allow location + camera when prompted (required for adding animals/sightings).

## Maintenance

- **Where data lives:** PostgreSQL database `pawtrack_db` on your PC. Uploaded
  photos live in `./uploads`. Both persist across restarts; both are lost if the
  PC/database is wiped.
- **Back up before launch** (and periodically):
  ```bash
  pg_dump -h localhost -U pawtrack_admin pawtrack_db > pawtrack_backup_$(date +%F).sql
  ```
- **Restart after a crash:** just re-run `./serve.sh` (and the tunnel).
- **Your PC must be on** for the app to work — the tunnel only forwards while the
  server is running.

## Pre-launch checklist

- [ ] `cd frontend && npm run build` completed without errors.
- [ ] `./serve.sh` starts and `http://localhost:8000` loads the app.
- [ ] `http://localhost:8000/health` returns `{"status":"ok", ...}`.
- [ ] Tunnel running; opening the HTTPS URL on your **phone over cellular**
      (not Wi-Fi) loads the app and lets you register, log in, allow GPS/camera,
      and add an animal with a photo.
- [ ] `pg_dump` backup taken.

Once the phone-over-cellular test passes, share the URL.
