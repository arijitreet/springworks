# Spring Works — Books & Stock

A Tally-style books-and-stock app for a water-bottling plant. Double-entry
accounting plus on-hand tracking for three bottle sizes (1000 / 500 / 200 ml).
Runs entirely in the cloud: develop in GitHub Codespaces, the React frontend on
Vercel, the Spring Boot API on Render, data in Neon Postgres.

This repo covers the full MVP build plan — setup, schema, masters, vouchers,
stock, and the reports (trial balance, P&L, balance sheet) — with a working,
designed frontend on top.

## Layout

```
backend/    Spring Boot API (Java 21) — deploys to Render
frontend/   React + Vite + Tailwind  — deploys to Vercel
.devcontainer/  Codespaces image (JDK 21 + Node 22)
render.yaml     Render blueprint for the backend
```

## What's here

- Six-table schema via Flyway (`backend/.../db/migration/V1__init.sql`): the four
  accounting tables plus `stock_items` and `stock_movements`, seeded with a
  starter chart of accounts and the three bottle sizes.
- **Debits = credits is enforced twice**: in `VoucherService` (clear error) and
  by a deferred Postgres constraint trigger (last line of defence).
- REST API: `/api/health`, `/api/groups`, `/api/ledgers`, `/api/stock-items`,
  `/api/stock/levels`, `/api/stock/movements`, `/api/vouchers`.
- Masters you can add to and remove: groups, ledgers (under a group), and stock
  items, with duplicate names and in-use records rejected cleanly.
- Frontend screens: Overview (stock tanks + day book), Vouchers (balanced entry),
  Stock (record production/sales), Masters (create/list/delete), Reports (trial
  balance, Profit & Loss, and Balance Sheet in the classic two-column format).
  Until the API is connected it shows clearly-labelled sample data.
- Reports are computed from the entries on the client, so they work in both live
  and sample mode; they can move server-side later for an audit trail.

## Run it

### 1. Database (Neon)

Create a project at neon.tech and copy the connection string. Split it into the
three values the backend expects (note the `jdbc:` prefix on the URL):

```
SPRING_DATASOURCE_URL=jdbc:postgresql://<host>/<db>?sslmode=require
SPRING_DATASOURCE_USERNAME=<user>
SPRING_DATASOURCE_PASSWORD=<password>
```

### 2. Backend

```bash
cd backend
export SPRING_DATASOURCE_URL=... SPRING_DATASOURCE_USERNAME=... SPRING_DATASOURCE_PASSWORD=...
mvn spring-boot:run
```

Flyway runs `V1` on first start. Check http://localhost:8080/api/health.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the dev server (port 5173). In dev, leave `VITE_API_URL` unset — the Vite
dev server proxies `/api` to the backend on port 8080, so it works as-is in
Codespaces without exposing ports or configuring CORS. Set `VITE_API_URL` only
in production (Vercel), pointing at your Render URL.

## Deploy

**Frontend → Vercel.** Import the repo, set the project root to `frontend/`, and
add an env var `VITE_API_URL` = your Render API URL.

**Backend → Render.** New > Blueprint with `render.yaml` (or a Web Service with
root `backend/`). Set `SPRING_DATASOURCE_URL/USERNAME/PASSWORD` from Neon and
`APP_CORS_ALLOWED_ORIGINS` to your `vercel.app` URL. The free tier sleeps after
~15 min idle; the first request then takes 30–50s to wake. Your data in Neon is
unaffected.

## Beyond the MVP

Auth and multi-company, GST, production (raw material → finished bottles), bank
reconciliation, and import/export. See the build plan doc.
