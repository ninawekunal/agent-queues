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
5. Refund seed route:
   - `POST /api/refunds/seed`
6. Startup/build guard:
   - Upstash Redis + QStash connectivity is validated at server start and before build.

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

## API Contract Rule (For All New Endpoints)

Every API route must include:

1. `zod` input schema (`safeParse` before business logic)
2. `zod` output schema (`parse` before `jsonOk`)
3. Shared envelope via `jsonOk` / `jsonError`
4. Shared parser helper: `src/shared/http/contractValidation.ts`

Current contract files are in `src/shared/contracts/*`.

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
  -d '{"agentId":"agent-1","refundRequestId":"rr_1001","amount":129.99,"currency":"USD"}' | jq
```

Expected: message queued successfully.

For end-to-end callback testing, set `QSTASH_DESTINATION_URL` to a public URL pointing at:

- `https://<your-domain>/api/upstash/qstash-receiver`

### Refund seed API

```bash
curl -s -X POST http://localhost:3000/api/refunds/seed \
  -H 'Content-Type: application/json' \
  -d '{"agentId":"agent-1","count":10}' | jq
```

This writes pending refund cards to Redis key:

- `refunds:agent:<agentId>:pending`

### Build/start verification

- `npm run build` runs `scripts/verify-upstash.mjs` first and fails fast if Redis/QStash is not reachable.
- `npm run dev` and `npm start` also verify connections before the server listens.

## Key Files

- `server.js`
- `src/shared/types/api.ts`
- `src/shared/http/apiResponse.ts`
- `src/app/api/health/route.ts`
- `src/app/api/version/route.ts`
- `src/server/upstash/upstashClients.ts`
- `scripts/verify-upstash.mjs`
- `src/app/api/upstash/redis-ping/route.ts`
- `src/app/api/upstash/qstash-publish/route.ts`
- `src/app/api/upstash/qstash-receiver/route.ts`
- `src/app/api/refunds/seed/route.ts`
