# AGENTS.md

## Cursor Cloud specific instructions

### Product overview

Adobe Internal Data Marketplace — a FastAPI + React app for browsing governed data products and submitting access requests. Local dev works fully offline with mock catalog data, in-memory request storage, and a dev user fallback (`dev.user@adobe.com`).

### Required services (local E2E)

| Service | Port | Start command |
|---------|------|---------------|
| Backend (FastAPI/Uvicorn) | 8000 | `uv run uvicorn server.app:app --reload --reload-dir server --host 0.0.0.0 --port 8000` |
| Frontend (Vite) | 5173 | `cd client && BROWSER=none npx vite --host 0.0.0.0 --port 5173` |

`npm run dev` in `client/` invokes `bunx vite`; **Bun is not required** — use `npx vite` directly if `bunx` is unavailable.

Alternatively, run both via `./watch.sh` (see caveats below).

### Dependency install

See `README.md` for the canonical setup. Quick path:

```bash
export PATH="$HOME/.local/bin:$PATH"
uv sync --extra dev
cd client && npm install
```

`setup.sh` is interactive (Databricks auth prompts) and is intended for full Databricks deployment setup, not minimal local dev.

### Lint / test / format

| Check | Command | Notes |
|-------|---------|-------|
| Python lint | `uv run ruff check .` | Pre-existing docstring/line-length issues in `server/` |
| Python format | `./fix.sh` or `uv run ruff format .` | |
| Frontend lint | `cd client && npm run lint` | **No ESLint config file** in `client/` — command fails until config is added |
| Tests | `uv run pytest` | `server/test_app.py` defines `async def test()` which pytest collects as a test and fails |

### Gotchas

- **`uv` must be on PATH** (`$HOME/.local/bin`). The VM update script handles `uv sync`; install `uv` once if missing: `curl -LsSf https://astral.sh/uv/install.sh | sh`
- **No `.env.local` needed** for offline dev — UC Delta is optional; requests fall back to in-memory storage.
- **`watch.sh`** attempts Databricks CLI auth (`uvx databricks-cli`) and client generation (`scripts.make_fastapi_client`, which is missing from the repo). It still starts servers but logs warnings.
- **Production single-process mode**: `cd client && npm run build` then serve via backend at `http://localhost:8000` (`./watch.sh --prod`).

### API smoke test

```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/products
curl -X POST http://localhost:8000/api/requests \
  -H 'Content-Type: application/json' \
  -d '{"product_id":"fin-revenue-bookings","justification":"Need data for quarterly planning"}'
curl http://localhost:8000/api/requests/mine
```
