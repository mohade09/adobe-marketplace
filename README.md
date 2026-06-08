# Adobe Internal Data Marketplace

Federated data product catalog and access request workflow, deployed as a Databricks App.

## Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Python, FastAPI, SQLAlchemy
- **Metadata (MVP)**: Mock product catalog
- **Requests**: Unity Catalog Delta table `governance.marketplace.access_requests`

## Local development

### Backend

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn server.app:app --reload --port 8000
```

### Frontend

```bash
cd client
npm install
npm run dev
```

Vite proxies `/api` to `http://localhost:8000`.

### Build for deployment

```bash
cd client && npm install && npm run build
```

## Unity Catalog setup

Run once in your SQL warehouse:

```bash
# See scripts/init_uc_schema.sql
```

Grant the app service principal `USE CATALOG`, `USE SCHEMA`, `SELECT`, `MODIFY` on `governance.marketplace`.

## Deploy to Databricks Apps

1. Set your SQL warehouse ID in `databricks.yml`
2. Build the frontend: `cd client && npm run build`
3. Deploy:

```bash
databricks bundle deploy
databricks bundle run adobe-data-marketplace
```

## API endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/products` | List/search/filter products |
| `GET /api/products/{id}` | Product detail |
| `GET /api/domains` | Domain and classification counts |
| `POST /api/requests` | Submit access request |
| `GET /api/requests/mine` | Current user's requests |
| `GET /api/user/me` | Current user info |
