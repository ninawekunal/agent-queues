# Next.js + Custom Node Server (Incremental Build)

This repo is being built step-by-step.

## Current Steps Completed

1. Next.js App Router baseline + custom Node server (`server.js`).
2. Shared typed API envelope (`ok/data` or `ok/error`).
3. Basic API routes:
   - `GET /api/health`
   - `GET /api/version`
4. Upstash setup routes:
   - `GET /api/upstash/redis-ping`
   - `POST /api/upstash/qstash-publish`
   - `POST /api/upstash/qstash-receiver`

## Run

```bash
npm install
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

## Shared API Response Pattern

- Success:

```json
{ "ok": true, "data": { ... } }
```

- Error:

```json
{ "ok": false, "error": { "code": "...", "message": "..." } }
```

## Upstash Setup

Copy `.env.example` to `.env` and fill values:

```bash
HOST=0.0.0.0
PORT=3000
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
QSTASH_TOKEN=
QSTASH_DESTINATION_URL=
```

### Redis validation

```bash
curl -s http://localhost:3000/api/upstash/redis-ping | jq
```

Expected: write + read of key `upstash:redis-ping`.

### QStash validation

```bash
curl -s -X POST http://localhost:3000/api/upstash/qstash-publish \
  -H 'Content-Type: application/json' \
  -d '{"hello":"world"}' | jq
```

Expected: message queued successfully.

For end-to-end callback testing, set `QSTASH_DESTINATION_URL` to a public URL pointing at:

- `https://<your-domain>/api/upstash/qstash-receiver`

## Key Files

- `server.js`
- `src/shared/types/api.ts`
- `src/shared/http/apiResponse.ts`
- `src/app/api/health/route.ts`
- `src/app/api/version/route.ts`
- `src/server/upstash/upstashClients.ts`
- `src/app/api/upstash/redis-ping/route.ts`
- `src/app/api/upstash/qstash-publish/route.ts`
- `src/app/api/upstash/qstash-receiver/route.ts`
