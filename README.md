# For You ❤️ — Birthday Surprise (Next.js + FastAPI + PostgreSQL)

An interactive, animated birthday-surprise experience: a password-locked intro,
a live countdown with pop-able balloons, a birthday reveal with fireworks, an
auto-playing photo/video "memories" carousel, a floating heart-shaped gallery,
a blow-out-the-candles cake (tap or microphone), a gift box, a typed final
message, a highlighted "special" memory, and a closing heart-shaped collage —
all with a canvas particle system (stars, hearts, confetti, fireworks) and
synthesized sound effects.

This is a full rebuild of a single HTML file into a real 3-tier app:

- **frontend/** — Next.js 14 (App Router, TypeScript, Tailwind, Framer Motion)
- **backend/** — FastAPI (JWT auth, file uploads, REST API)
- **PostgreSQL** — stores the event config, photos/videos, and balloon messages

## What's new vs. the original single-file version

- Real database instead of `localStorage` / a base64 hash in the URL
- An actual admin login (username + password, JWT), not just a client-side
  password check
- Upload real **photos and videos** from the admin dashboard (not just
  base64-encoded images pasted into a textarea) — videos autoplay muted in the
  memories carousel, gallery wall, and finale collage
- Per-item toggles: include in gallery wall, include in finale collage, mark
  as the "special" highlighted memory
- Drag-free reordering (↑ / ↓) that persists to the database
- Balloon messages, event date/time/timezone, and all copy are editable from
  a proper dashboard with tabs, not raw textareas
- Framer Motion–driven transitions throughout, more entrance variety in the
  memories carousel, and a nicer glassy visual language

## Project layout

```
birthday-app/
├── docker-compose.yml
├── .env.example
├── backend/            FastAPI app, SQLAlchemy models, JWT auth, uploads
└── frontend/            Next.js app (public experience + /admin dashboard)
```

## Quick start (Docker, recommended)

1. Copy the env file and edit the secrets:
   ```bash
   cp .env.example .env
   # edit JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD
   ```
2. Build and start everything:
   ```bash
   docker compose up --build
   ```
3. Open:
   - Public surprise: http://localhost:3000
   - Admin dashboard: http://localhost:3000/admin/login
     (sign in with `ADMIN_USERNAME` / `ADMIN_PASSWORD` from your `.env` —
     these bootstrap an admin row in Postgres the first time the app starts)
   - API docs: http://localhost:8000/docs

The default unlock password for the visitor-facing page is **`cake`** — change
it from the admin dashboard's "Event & messages" tab.

## Running without Docker

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env         # point DATABASE_URL at your local Postgres
uvicorn app.main:app --reload --port 8000
```

Make sure a PostgreSQL database matching `DATABASE_URL` exists first — the
app creates its own tables (and a starter admin user + config row) on
startup, no separate migration step is required for first use.

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Visit http://localhost:3000.

## How the admin dashboard works

- **Event & messages** — recipient's name, birthday date/time/timezone,
  unlock password, background music URL, all the on-screen copy
- **Photos & videos** — upload images and video clips directly (stored on the
  API server under `/uploads`, served back to the browser); edit each item's
  title/caption/date, toggle whether it appears in the gallery wall and/or
  finale collage, mark one as the "special" highlighted memory, reorder, or
  delete
- **Balloon messages** — the hidden messages revealed when a balloon is
  popped during the countdown

Changes are saved to Postgres immediately — there's no separate "publish"
step, and anyone with the link sees the current state right away.

## Notes on video support

- Uploaded videos autoplay muted and loop in the memories carousel and the
  gallery/finale collages (matching how the photos behave), with `playsInline`
  set for iOS.
- Accepted video types: `.mp4`, `.webm`, `.mov`, `.m4v` (max size configurable
  via `MAX_UPLOAD_MB`, default 80MB per file).
- Accepted image types: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif` — a thumbnail
  is generated automatically for photos.

## Security notes before sharing a link publicly

- Change `JWT_SECRET`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD` before deploying.
- The visitor-facing "unlock password" is intentionally low-stakes (it's a
  fun gate, not real security) — don't reuse a real password for it.
- If you deploy the API on a different domain than the frontend, update
  `CORS_ORIGINS` and `NEXT_PUBLIC_API_URL` accordingly.
