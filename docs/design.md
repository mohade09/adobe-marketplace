# Adobe Internal Data Marketplace — Technical Design

**Project:** `/Users/debadatta.mohapatra/Documents/repo/cursor-demo/adobe-marketplace`

## 1. Overview

The **Adobe Internal Data Marketplace** is a federated data product catalog and access request workflow deployed as a [Databricks App](https://docs.databricks.com/en/dev-tools/databricks-apps/index.html). It gives Adobe employees a single place to discover governed data products across Finance, HR, Marketing, and Operations domains, inspect metadata and quality signals, and submit access requests to domain teams.

The application follows a **monolithic full-stack pattern**: a FastAPI backend serves both REST APIs and the built React SPA, running inside the Databricks Apps runtime with OAuth-based user identity and SQL warehouse access for request persistence.

**Stack:** React + TypeScript + Tailwind + Shadcn UI frontend; Python + FastAPI + SQLAlchemy backend.

**Scaffold origin:** `claude-databricks-app-template` — FastAPI serves API + React static build in one process (avoids Databricks Apps CORS).

### 1.1 Problem Statement

Enterprise data is scattered across Unity Catalog namespaces owned by different domain teams. Consumers lack a unified discovery experience, and access requests are often handled through ad hoc channels (email, Slack, tickets) with no audit trail. This app centralizes catalog browsing and standardizes the request intake workflow.

### 1.2 Context and Decisions

Mockup follows **Native GDAI Catalog** pattern. Adobe MVP choices:

- **Product metadata** → live reads from published UC schema layer (mock fallback for local dev)
- **Request workflow** → Delta table in Unity Catalog via SQL Warehouse + SQLAlchemy
- **MVP scope** → catalog browse/search/filter, product detail, submit request, My Requests (no domain-team inbox in v1)

### 1.3 MVP Scope

| In scope (MVP) | Out of scope (future) |
|----------------|----------------------|
| Browse/search/filter mock data product catalog | Live Unity Catalog metadata sync |
| Product detail pages with quality, classification, tables | Admin approval/denial workflow UI |
| Submit access requests with justification | Email/Slack notifications to owners |
| View own request history and pending count | Genie / AI search integration (UI stub only) |
| Persist requests to UC Delta table | Role-based access control for approvers |
| Databricks OAuth user identity | Replace mock catalog with real product registry |

### 1.4 MVP vs Live UC

| Area | MVP (done) | Live UC (next phase) |
|------|------------|----------------------|
| Product catalog | `server/data/mock_products.py` | SQL queries against published UC schema |
| Connection | Used for `access_requests` only | Shared SQL Warehouse for catalog + requests |
| Auth | OBO token for requests (when deployed) | Same OBO token for catalog reads (user-scoped UC grants) |
| Fallback | In-memory requests | Mock catalog fallback optional for local dev only |

---

## 2. Implementation Status

| # | Task | Status |
|---|------|--------|
| 1 | Scaffold project (app.yaml, databricks.yml, Tailwind/Shadcn) | Done |
| 2 | Mock products API (`/api/products`, `/api/domains`) | Done |
| 3 | UC Delta requests backend (`/api/requests`, `/api/requests/mine`) | Done |
| 4 | Catalog UI (navbar, hero, filters, product cards) | Done |
| 5 | Request flow UI (detail, request form, My Requests) | Done |
| 6 | Provision published UC schema + `products` table (or confirm existing) | Pending |
| 7 | Seed/migrate product data from mock → UC published layer | Pending |
| 8 | Extend `server/db/session.py` for configurable catalog/schema | Pending |
| 9 | Add `CatalogRepository` — SQL reads from published UC schema | Pending |
| 10 | Refactor `ProductService` to use repository (mock fallback via env flag) | Pending |
| 11 | Pass OBO token into catalog queries (same as requests) | Pending |
| 12 | Add startup/health check for UC catalog connectivity | Pending |
| 13 | Databricks deployment (warehouse ID, bundle deploy, validate live reads) | Pending |

---

## 3. System Architecture

### 3.1 High-Level Diagram (Current MVP)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Databricks Apps Runtime                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     FastAPI (server/app.py)                        │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │  │
│  │  │   Routers   │  │   Services   │  │  Static Files (React SPA) │  │  │
│  │  │ /api/*      │──│ Product      │  │  client/build/            │  │  │
│  │  │             │  │ Request      │  └──────────────────────────┘  │  │
│  │  │             │  │ User         │                                 │  │
│  │  └─────────────┘  └──────┬───────┘                                 │  │
│  └──────────────────────────┼─────────────────────────────────────────┘  │
│                             │                                             │
│         ┌───────────────────┼───────────────────┐                        │
│         ▼                   ▼                   ▼                        │
│  ┌──────────────┐  ┌─────────────────┐  ┌─────────────────────────┐   │
│  │ Mock Catalog │  │ SQL Warehouse   │  │ Databricks Workspace    │   │
│  │ (in-memory)  │  │ (Delta via      │  │ API (current_user.me)   │   │
│  │ mock_products│  │  SQLAlchemy)    │  │ via OBO token           │   │
│  └──────────────┘  └─────────────────┘  └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
         ▲                                           ▲
         │  x-forwarded-access-token                 │
         └─────────────── Browser (React SPA) ───────┘
```

### 3.2 Target Architecture (Live UC)

```
React UI  ──/api──►  FastAPI
                         │
                         ├──►  UC published schema (READ)
                         │     governance.published_catalog.products
                         │     + information_schema / UC tags (optional)
                         │
                         ├──►  UC Delta (WRITE)
                         │     governance.marketplace.access_requests
                         │
                         └──►  OBO token (x-forwarded-access-token)
                               + SQL Warehouse via databricks-sqlalchemy
```

**Connection path:** App → SQL Warehouse → Unity Catalog (same pattern as `server/db/session.py`, extended for catalog reads).

**Pages:** Catalog (`/`) · Product detail (`/products/:id`) · Request access (`/request/:id`) · My Requests (`/requests`)

### 3.3 Request Flow — Access Request Submission

```
User fills form          POST /api/requests           Validate product
(RequestAccessPage)  ──►  (requests router)       ──►  exists in catalog
        │                        │                           │
        │                        ▼                           │
        │               Extract identity via                 │
        │               x-forwarded-access-token             │
        │               → UserService.get_user_info()        │
        │                        │                           │
        │                        ▼                           │
        │               RequestService.create_request()      │
        │                        │                           │
        │            ┌───────────┴───────────┐               │
        │            ▼                       ▼               │
        │     Delta (UC table)         In-memory fallback    │
        │     governance.marketplace   (local dev / failure) │
        │     .access_requests                                 │
        │                        │                           │
        └────────────────────────┴──► Redirect to /requests  │
```

### 3.4 Layered Backend Design

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Entry point** | `server/app.py` | FastAPI app, CORS, lifespan, static file mount |
| **Routers** | `server/routers/` | HTTP routing, query params, auth header extraction |
| **Services** | `server/services/` | Business logic, filtering, persistence orchestration |
| **Models** | `server/models/` | Pydantic schemas (API) + SQLAlchemy ORM (Delta) |
| **Data** | `server/data/` | Mock product catalog (MVP / dev fallback) |
| **DB** | `server/db/session.py` | SQLAlchemy engine for Databricks SQL warehouse |
| **Repository** | `server/db/catalog_repository.py` | SQL reads from published UC schema (to be added) |

Services are instantiated at module level (singleton pattern per router). There is no dependency injection framework.

---

## 4. Technology Stack

### 4.1 Backend

| Component | Technology | Purpose |
|-----------|------------|---------|
| API framework | FastAPI 0.104+ | REST endpoints, OpenAPI, validation |
| Runtime | Uvicorn | ASGI server (port 8000 / `DATABRICKS_APP_PORT`) |
| Validation | Pydantic v2 | Request/response models |
| Persistence | SQLAlchemy 2.0 + databricks-sqlalchemy | Delta table CRUD via SQL warehouse |
| Databricks SDK | databricks-sdk 0.59+ | Workspace client, `current_user.me()` |
| Package mgmt | uv / requirements.txt | Python dependencies |

### 4.2 Frontend

| Component | Technology | Purpose |
|-----------|------------|---------|
| UI library | React 18 + TypeScript | SPA pages and components |
| Build tool | Vite 5 | Dev server (5173), production build → `client/build/` |
| Styling | Tailwind CSS + shadcn/ui | Component library and design tokens |
| State / data | TanStack React Query | Server state, caching, mutations |
| Routing | React Router v6 | Client-side routes |
| Icons | Lucide React | UI icons |
| Dates | date-fns | Request table formatting |

### 4.3 Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| Deployment | Databricks Apps + DABs | `databricks.yml` bundle, `app.yaml` |
| SQL warehouse | Databricks SQL | Query Delta tables for access requests |
| Unity Catalog | `governance.marketplace` | Catalog/schema for request storage |
| Auth | Databricks Apps OAuth | User token forwarded as `x-forwarded-access-token` |

---

## 5. Prerequisites (Databricks Workspace)

### 5.1 Published UC Schema Layer

Data platform should expose a **published schema** (read-only for marketplace consumers). Example layout:

```
governance.marketplace          ← app-owned (requests + optional product registry)
governance.published_catalog    ← published schema layer (source of truth)
  └── products                  ← curated data product registry
  └── product_tables            ← optional: UC table FQNs per product
  └── product_metrics           ← optional: quality_score, usage_count
```

If products already live in domain schemas (e.g. `governance.finance.*`), the published layer is typically a **curated view or Delta table** that denormalizes product metadata — not raw table discovery.

### 5.2 SQL Warehouse

- Serverless or Pro SQL warehouse in the target workspace
- Warehouse ID set in `databricks.yml` and env vars
- App service principal: `CAN USE` on warehouse

### 5.3 Unity Catalog Grants

**App service principal** (startup health checks / admin ops):

```sql
GRANT USE CATALOG ON CATALOG governance TO `<app-sp>`;
GRANT USE SCHEMA ON SCHEMA governance.marketplace TO `<app-sp>`;
GRANT SELECT, MODIFY ON SCHEMA governance.marketplace TO `<app-sp>`;

-- Read published catalog layer
GRANT USE SCHEMA ON SCHEMA governance.published_catalog TO `<app-sp>`;
GRANT SELECT ON SCHEMA governance.published_catalog TO `<app-sp>`;
```

**End users** (via OBO token — catalog browse respects UC permissions):

```sql
GRANT USE CATALOG ON CATALOG governance TO `<users-or-group>`;
GRANT USE SCHEMA ON SCHEMA governance.published_catalog TO `<users-or-group>`;
GRANT SELECT ON SCHEMA governance.published_catalog TO `<users-or-group>`;
```

Users only see products their UC grants allow.

**Required grants** for the app service principal (and users, for OBO) — current MVP (requests only):

- `USE CATALOG` on `governance`
- `USE SCHEMA` on `governance.marketplace`
- `SELECT`, `MODIFY` on `governance.marketplace.access_requests`

Configured in `app.yaml`:

```yaml
user_authorization:
  scopes:
    - sql
```

---

## 6. Data Model

### 6.1 Data Product (Catalog)

Defined in `server/models/data_product.py` and mirrored in `client/src/types/index.ts`.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique slug (e.g. `fin-revenue-bookings`) |
| `title` | string | Display name |
| `description` | string | Business description |
| `domain` | enum | `Finance` \| `HR` \| `Marketing` \| `Operations` |
| `quality_score` | int (0–100) | Data quality metric |
| `certified` | bool | Certification badge |
| `classification` | string | e.g. Confidential, Internal, Highly Confidential |
| `contract_status` | enum | `ok` \| `at_risk` — data contract health |
| `owner_name` | string | Data product owner |
| `owner_initials` | string | Avatar initials |
| `usage_count` | int | Popularity metric for sorting |
| `refresh_cadence` | string | e.g. Daily, Weekly |
| `tags` | string[] | Searchable keywords |
| `tables` | string[] | Unity Catalog table FQNs |

**Current source (MVP):** `server/data/mock_products.py` — 12 products across 4 domains (in-memory, not persisted).

**Mock fallback:** Keep `server/data/mock_products.py` for `USE_MOCK_CATALOG=true` or when warehouse is unavailable.

#### Published UC Schema (`governance.published_catalog.products`)

Align the UC layer to the existing `DataProduct` model so the UI needs minimal changes.

```sql
CREATE SCHEMA IF NOT EXISTS governance.published_catalog;

CREATE TABLE IF NOT EXISTS governance.published_catalog.products (
  product_id        STRING    NOT NULL,   -- slug, e.g. fin-revenue-bookings
  title             STRING    NOT NULL,
  description       STRING    NOT NULL,
  domain            STRING    NOT NULL,   -- Finance | HR | Marketing | Operations
  quality_score     INT,
  certified         BOOLEAN,
  classification    STRING,
  contract_status   STRING,             -- ok | at_risk
  owner_name        STRING,
  owner_initials    STRING,
  usage_count       INT,
  refresh_cadence   STRING,
  tags              ARRAY<STRING>,
  tables            ARRAY<STRING>,        -- UC FQNs
  published_at      TIMESTAMP,
  is_active         BOOLEAN   DEFAULT true
);
```

Optional companion tables:

- `product_tables(product_id, table_fqn, role)` — if tables are normalized
- `product_metrics(product_id, metric_name, metric_value, as_of_date)` — for quality/usage from monitoring jobs

**Alternative:** If the org uses UC **tags** (`data_product=true`) instead of a registry table, query `system.information_schema` + tag APIs — but a published Delta table is simpler and faster for the app.

**Pydantic model** (unchanged — `server/models/data_product.py`):

```python
class DataProduct(BaseModel):
    id: str
    title: str
    description: str
    domain: Literal["Finance", "HR", "Marketing", "Operations"]
    quality_score: int          # 0-100
    certified: bool
    classification: str
    contract_status: Literal["ok", "at_risk"]
    owner_name: str
    owner_initials: str
    usage_count: int
    refresh_cadence: str
    tags: list[str]
    tables: list[str]           # UC FQNs
```

### 6.2 Access Request (Persisted)

**Pydantic API model:** `server/models/access_request.py` → `AccessRequest`, `AccessRequestCreate`

**SQLAlchemy ORM:** `AccessRequestORM` → table `governance.marketplace.access_requests`

| Column | Type | Notes |
|--------|------|-------|
| `request_id` | STRING PK | UUID v4 |
| `product_id` | STRING | FK to catalog (logical, not enforced) |
| `product_title` | STRING | Denormalized snapshot at request time |
| `domain` | STRING | Denormalized from product |
| `requester_email` | STRING | From Databricks user identity |
| `requester_name` | STRING | Optional display name |
| `justification` | STRING | Required, min 10 chars |
| `use_case` | STRING | Optional free text |
| `status` | STRING | `pending` \| `approved` \| `denied` (MVP: always `pending` on create) |
| `created_at` | TIMESTAMP | UTC, timezone-naive |
| `updated_at` | TIMESTAMP | Set equal to `created_at` on insert |

**DDL:**

```sql
CREATE SCHEMA IF NOT EXISTS governance.marketplace;

CREATE TABLE IF NOT EXISTS governance.marketplace.access_requests (
  request_id        STRING    NOT NULL,
  product_id        STRING    NOT NULL,
  product_title     STRING    NOT NULL,
  domain            STRING    NOT NULL,
  requester_email   STRING    NOT NULL,
  requester_name    STRING,
  justification     STRING    NOT NULL,
  use_case          STRING,
  status            STRING    NOT NULL,  -- pending | approved | denied
  created_at        TIMESTAMP NOT NULL,
  updated_at        TIMESTAMP NOT NULL
);
```

Script: `scripts/init_uc_schema.sql`

SQLAlchemy: `server/db/session.py` + `server/models/access_request.py`. In-memory fallback when warehouse unavailable.

### 6.3 Persistence Fallback Strategy

The app uses a **graceful degradation** pattern:

1. **Production (Databricks App):** OBO token from `x-forwarded-access-token` + `DATABRICKS_WAREHOUSE_ID` → SQLAlchemy connection to Delta.
2. **Local dev:** If `DATABRICKS_HOST`, `DATABRICKS_TOKEN`, or warehouse ID are missing, or connection fails → in-memory list `_in_memory_requests` in `request_service.py`.
3. **User identity:** `UserService` falls back to hardcoded `DEV_USER` when WorkspaceClient is unavailable.
4. **Catalog:** `USE_MOCK_CATALOG=true` forces mock products; otherwise live UC reads when warehouse available.

This allows full UI development without UC provisioning while preserving production behavior when credentials exist.

---

## 7. API Design

Base path: `/api` (proxied from Vite dev server to `localhost:8000`).

### 7.1 Products

| Method | Path | Query Params | Response |
|--------|------|--------------|----------|
| `GET` | `/products` | `q`, `domain[]`, `classification[]`, `certified`, `sort` | `ProductListResponse` |
| `GET` | `/products/{id}` | — | `DataProduct` or 404 |
| `GET` | `/domains` | — | `{ domains[], classifications[] }` |

**Sort options:** `most_used` (default), `quality`, `name`

**Filtering logic** (`ProductService.list_products`):
- Text search: title, description, domain, tags (case-insensitive substring)
- Multi-select domain and classification filters (OR within each dimension)
- Certified-only boolean filter
- In-memory sort after filter (MVP); push filters to SQL in live UC phase

**Live UC behavior:** Search `q`, filter `domain[]`, `classification[]`, `certified`, sort `most_used`/`quality`/`name` — live UC query against published schema.

### 7.2 Access Requests

| Method | Path | Body | Response |
|--------|------|------|----------|
| `POST` | `/requests` | `AccessRequestCreate` | `AccessRequest` (201) |
| `GET` | `/requests/mine` | — | `AccessRequest[]` |
| `GET` | `/requests/mine/count` | — | `{ pending: number }` |

Identity is resolved on every request from the incoming HTTP request (no session cookies).

### 7.3 User

| Method | Path | Response |
|--------|------|----------|
| `GET` | `/user/me` | `UserInfo` |

### 7.4 Health

| Method | Path | Response |
|--------|------|----------|
| `GET` | `/health` | `{ status: "healthy" }` |

### 7.5 Backend Implementation (Live UC Phase)

**Services:** `ProductService`, `RequestService`, `CatalogRepository` (new) · **Auth:** OBO token or dev stub user

#### Connection layer (`server/db/session.py`)

- Parameterize `catalog` and `schema` (today hardcoded to `governance.marketplace`)
- Support separate read schema for products vs write schema for requests
- Reuse one engine; use `token` per request for OBO

#### New repository (`server/db/catalog_repository.py`)

```python
# Pseudocode — same fields as DataProduct
SELECT product_id, title, description, domain, ...
FROM governance.published_catalog.products
WHERE is_active = true
  AND (:q IS NULL OR lower(title) LIKE ... OR array_contains(tags, ...))
  AND (:domain IS NULL OR domain IN (...))
ORDER BY usage_count DESC
```

Map rows → `DataProduct` Pydantic model.

#### ProductService refactor

```
ProductService
  ├── CatalogRepository (live UC)     ← default when warehouse available
  └── MOCK_PRODUCTS                   ← fallback if USE_MOCK_CATALOG=true or no warehouse
```

Keep existing filter/sort logic; move data source behind an interface.

---

## 8. Authentication & Authorization

### 8.1 User Identity

Databricks Apps inject the authenticated user's OAuth token into the `x-forwarded-access-token` request header. Routers pass this to:

```python
UserService(obo_token=obo_token).get_user_info()
```

Which calls `WorkspaceClient(host=..., token=obo_token).current_user.me()`.

**Local fallback:** Returns `dev.user@adobe.com` when SDK/client unavailable.

In Databricks Apps, the user token arrives as `x-forwarded-access-token` (already wired for requests).

### 8.2 SQL Warehouse Access (OBO)

`RequestService` passes the same OBO token to `get_db_session(obo_token)` so SQL queries run **on behalf of the user**, respecting Unity Catalog grants.

Same OBO token will be used for catalog reads in the live UC phase (user-scoped UC grants).

### 8.3 Authorization Model (MVP)

- All authenticated users can browse the catalog and submit requests.
- Users can only list their own requests (`requester_email` filter).
- No admin/approver endpoints exist yet; status changes would require direct table updates or future API.
- Users only see products their UC grants allow (live UC phase).

---

## 9. Frontend Architecture

Rebrand to **Adobe Internal Data Marketplace**. Match mockup layout. No changes required for live UC — API contract stays the same.

### 9.1 Routes

| Path | Page | Purpose |
|------|------|---------|
| `/` | `CatalogPage` | Search, filter, sort, product grid |
| `/products/:id` | `ProductDetailPage` | Metadata, tables, request CTA |
| `/request/:id` | `RequestAccessPage` | Access request form |
| `/requests` | `MyRequestsPage` | User's request history table |
| `*` | redirect → `/` | Catch-all |

### 9.2 Component Structure

```
client/src/
├── pages/                    # Route-level page components
├── components/
│   ├── marketplace/          # Domain-specific UI
│   │   ├── AppNavbar         # Nav, pending badge, user avatar
│   │   ├── HeroSearch        # Catalog hero + quick domain chips
│   │   ├── FilterSidebar     # Domain, classification, certified filters
│   │   ├── ProductCard       # Catalog grid item
│   │   ├── SortSelect        # Sort dropdown
│   │   ├── QualityGauge      # Circular quality score
│   │   └── RequestStatusBadge
│   └── ui/                   # shadcn/ui primitives
├── hooks/
│   └── useMarketplace.ts     # React Query hooks (fetch + mutate)
├── types/
│   └── index.ts              # Shared TypeScript interfaces
└── lib/
    └── domains.ts            # Domain → color mapping
```

**Components:** `AppNavbar` · `HeroSearch` · `FilterSidebar` · `ProductCard` · `QualityGauge` · `SortSelect` · `RequestStatusBadge`

### 9.3 Data Fetching

All API calls use native `fetch()` via React Query hooks in `useMarketplace.ts`:

- **Queries:** `useProducts`, `useProduct`, `useDomains`, `useUser`, `useMyRequests`, `usePendingRequestCount`
- **Mutations:** `useSubmitRequest` — invalidates `my-requests` and `pending-request-count` on success

Query keys include filter objects for automatic refetch when catalog filters change.

### 9.4 Design System

- **Brand color:** Adobe red `#EB1000` (CTAs, logo, avatar)
- **Domain colors:** Finance (blue), HR (emerald/green), Marketing (red), Operations (purple)
- **Layout:** Max-width containers (`max-w-7xl` catalog, `max-w-4xl` detail, `max-w-2xl` form)
- **"Ask Genie" button:** Present in navbar as a future AI search entry point (not wired)

---

## 10. Request Workflow

### 10.1 MVP Flow

1. User browses catalog (mock today; live UC in next phase) → opens product
2. Submits access request with justification
3. App INSERTs to Delta (`status=pending`)
4. User tracks on My Requests page

### 10.2 Phase 3 (Future)

Domain-team inbox, approve/deny, UC grants, Slack/ServiceNow notifications.

---

## 11. Deployment

### 11.1 Scaffolding

| File | Purpose |
|------|---------|
| `app.yaml` | `uvicorn server.app:app`, host `0.0.0.0`, port `$DATABRICKS_APP_PORT` |
| `databricks.yml` | DABs bundle, SQL warehouse, `user_api_scopes: [sql]` |
| `requirements.txt` | fastapi, uvicorn, sqlalchemy, databricks-sqlalchemy, databricks-sdk, pydantic |
| `client/` | Vite + React 18 + TS + Tailwind + Shadcn |
| `.env.local` | Local `DATABRICKS_HOST`, `DATABRICKS_TOKEN`, warehouse ID |
| `scripts/init_uc_schema.sql` | One-time UC table provisioning |

App name: `adobe-data-marketplace` (≤26 chars).

### 11.2 Build Pipeline

1. **Frontend:** `cd client && npm run build` → outputs to `client/build/`
2. **Backend:** FastAPI serves static files from `client/build/` when directory exists
3. **Deploy:** `databricks bundle deploy` then `databricks bundle run adobe-data-marketplace`

### 11.3 Deploy Steps (Live UC)

```bash
# 1. Create published schema + products table (or run platform team's DDL)
#    See scripts/init_published_catalog.sql (to be added)
# 2. Load/sync product registry into governance.published_catalog.products
# 3. Run scripts/init_uc_schema.sql for access_requests
# 4. Set warehouse ID in databricks.yml
# 5. Grant app SP + user groups on published schema
cd client && npm install && npm run build
databricks bundle validate --profile <PROFILE>
databricks bundle deploy --profile <PROFILE>
databricks bundle run adobe-data-marketplace --profile <PROFILE>
```

App SP needs `USE CATALOG`, `USE SCHEMA`, `SELECT`, `MODIFY` on `governance.marketplace`, plus `SELECT` on `governance.published_catalog`.

**Verify after deploy:**

1. Open app → catalog loads from UC (not mock)
2. Search/filter returns live rows
3. Submit access request → row appears in `governance.marketplace.access_requests`
4. User without UC grant gets empty catalog or 403 (expected)

### 11.4 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABRICKS_HOST` | Prod / local UC | Workspace URL |
| `DATABRICKS_WAREHOUSE_ID` | Prod | SQL warehouse for Delta access |
| `DATABRICKS_TOKEN` | Local dev | PAT or dev token (App uses OBO in prod) |
| `DATABRICKS_APP_PORT` | Optional | Default 8000 |
| `DATABRICKS_CATALOG` | Optional | Default: `governance` |
| `DATABRICKS_PRODUCT_SCHEMA` | Optional | Default: `published_catalog` |
| `DATABRICKS_REQUEST_SCHEMA` | Optional | Default: `marketplace` |
| `USE_MOCK_CATALOG` | Optional | `true` to force mock products locally |

### 11.5 Local Development

```
Frontend (Vite)  :5173  ──proxy /api──►  Backend (Uvicorn) :8000
```

Recommended via project scripts: `./watch.sh` (starts both with hot reload and client generation).

**Option A — Full live connection (recommended):**

```bash
export DATABRICKS_HOST=https://<workspace>.cloud.databricks.com
export DATABRICKS_WAREHOUSE_ID=<warehouse-id>
export DATABRICKS_TOKEN=<your-pat>
export DATABRICKS_PRODUCT_SCHEMA=published_catalog

uvicorn server.app:app --reload --port 8000
cd client && npm run dev
```

**Option B — Hybrid (catalog mock, requests live):**

```bash
export USE_MOCK_CATALOG=true
# ... warehouse vars for requests only
```

**Option C — Fully offline:**

```bash
export USE_MOCK_CATALOG=true
# no warehouse vars → in-memory requests
```

---

## 12. Key Design Decisions

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| Mock catalog in Python module | Fast MVP without UC metadata pipeline | Catalog updates require code deploy |
| Denormalize product fields on requests | Preserve snapshot if catalog changes | Storage redundancy |
| In-memory fallback for requests | Enables local dev without UC | Data lost on process restart locally |
| OBO token for SQL writes | User-scoped UC permissions | Requires per-user SQL grants |
| Monolith (API + static SPA) | Standard Databricks Apps pattern | No separate CDN for frontend |
| React Query over generated OpenAPI client | Marketplace hooks use raw fetch; template client exists for legacy job routes | Two API consumption patterns in repo |
| Status always `pending` on create | Approval workflow deferred | No self-service status updates |
| Published UC schema layer | Decouples app from domain schemas; curated read-only view | Requires platform team to maintain published layer |
| `USE_MOCK_CATALOG` flag | Enables dev without UC provisioning | Must remember to disable in prod validation |

---

## 13. Future Enhancements

### 13.1 Phase 2 — Real Catalog Integration

- Replace `mock_products.py` with Unity Catalog system tables or a curated `governance.marketplace.products` Delta table
- Sync quality scores from Databricks data quality monitors
- Surface lineage and schema metadata from UC APIs
- Implement `CatalogRepository` and refactor `ProductService` (see Implementation Status)

### 13.2 Phase 3 — Approval Workflow

- Owner/approver role model tied to product `owner_name` or UC grants
- `PATCH /api/requests/{id}` for approve/deny with comments
- Notifications via Databricks email, Slack webhook, or Lakeflow job
- Domain-team inbox + UC permission grants

### 13.3 Phase 4 — AI Discovery

- Wire "Ask Genie" to Databricks Genie or vector search over product descriptions
- Natural language catalog search replacing keyword-only `q` filter

### 13.4 Phase 3+ — Extended Capabilities

| Area | Change |
|------|--------|
| Technical metadata | information_schema, UC lineage, table tags |
| Contracts | ODCS YAML from UC Volume |
| Quality score | Lakeflow Expectations / Lakehouse Monitoring → `product_metrics` |
| Usage count | System tables / audit logs → `product_metrics` |
| Delta Sharing | If published layer is a share, use recipient catalog instead of local schema |
| Genie | Wire "Ask Genie" button |
| Approvals | Domain-team inbox + UC permission grants |

### 13.5 Technical Debt

- Remove unused template components (`client/src/components/jobs/`, legacy fastapi_client services)
- Align `pyproject.toml` with `requirements.txt` (SQLAlchemy deps missing from pyproject)
- Add integration tests for request persistence with mocked SQLAlchemy session
- Implement pagination for large catalogs (`GET /api/products` returns full result set today)
- Add `scripts/init_published_catalog.sql` for published schema DDL

---

## 14. Risks

| Risk | Mitigation |
|------|------------|
| Published schema not ready | Keep `USE_MOCK_CATALOG` flag until UC layer is populated |
| OBO token missing locally | PAT with same grants as prod user |
| Query latency on large catalog | Push filters to SQL; add pagination (`limit`/`offset`) |
| Schema drift vs `DataProduct` model | Version the table contract; map nulls to defaults in repository |
| Users see products they can't access | Filter by UC row-level grants or `is_active` + entitlement join table |
| Delta write latency | Small payloads, submit spinner |
| UC table missing | init scripts + startup warning |
| Warehouse cold start | Connection pool + loading spinner in UI |

---

## 15. Directory Reference

```
adobe-marketplace/
├── docs/
│   └── design.md                 # This document
├── app.yaml                      # Databricks App runtime config
├── databricks.yml                # DABs bundle definition
├── requirements.txt              # Python deps (deploy)
├── pyproject.toml                # Python project config (dev)
├── scripts/
│   ├── init_uc_schema.sql        # UC DDL for access_requests
│   └── init_published_catalog.sql   # to be added
├── server/
│   ├── app.py                    # FastAPI entry + static mount
│   ├── db/
│   │   ├── session.py            # SQLAlchemy / Databricks SQL connection (configurable catalog/schema)
│   │   └── catalog_repository.py # to be added — SQL reads from published UC schema
│   ├── data/mock_products.py     # MVP catalog data / dev fallback only
│   ├── models/                   # Pydantic + SQLAlchemy models
│   ├── routers/                  # API route handlers
│   └── services/                 # Business logic
└── client/
    ├── src/
    │   ├── App.tsx               # Router setup
    │   ├── pages/                # Route pages
    │   ├── components/           # UI components
    │   ├── hooks/useMarketplace.ts
    │   └── types/index.ts
    └── vite.config.ts            # Dev proxy, @ alias, build outDir
```

---

## 16. Related Documents

- [README.md](../README.md) — Quick start, API summary, deploy steps
