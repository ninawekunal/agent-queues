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
6. Refund queue + processing routes:
   - `POST /api/refunds/queue`
   - `POST /api/refunds/process`
7. Startup/build guard:
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

### Refund queue API (enqueue selected IDs)

```bash
curl -s -X POST http://localhost:3000/api/refunds/queue \
  -H 'Content-Type: application/json' \
  -d '{"agentId":"agent-1","refundIds":["rr_agent-1_1","rr_agent-1_2"]}' | jq
```

This pushes IDs into Redis list key:

- `refunds:agent:<agentId>:queue`

### Refund process API (simulate backend processing)

```bash
curl -s -X POST http://localhost:3000/api/refunds/process \
  -H 'Content-Type: application/json' \
  -d '{"agentId":"agent-1","refundId":"rr_agent-1_1"}' | jq
```

Behavior:

- removes one queue item from Redis list
- waits briefly (simulated backend work)
- returns deterministic `SUCCESS` or `FAILED`
- frontend then moves item from stream into success/failure bucket

## Project Learnings (Redis + Streams)

1. Use Redis Lists for queue semantics:
   - Enqueue with `RPUSH`.
   - Remove specific item with `LREM`.
   - Inspect depth with `LLEN`.
2. Keep API contracts strict:
   - Use `zod` input/output schemas on every route.
   - Return one shared envelope shape for all endpoints.
3. Model stream lifecycle separately from queue storage:
   - Queue = pending IDs waiting to process.
   - Stream = live processing timeline (`PROCESSING -> SUCCESS/FAILED`).
   - Buckets = terminal state storage shown in UI.
4. Simulate backend behavior intentionally:
   - Add controlled delay server-side to demonstrate async processing.
   - Return mixed outcomes to show real failure handling.
5. Keep frontend reactive and explicit:
   - optimistic move to stream on click
   - server response updates stream status
   - delayed transfer into success/failure buckets improves observability

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
- `src/app/api/refunds/queue/route.ts`
- `src/app/api/refunds/process/route.ts`
- `src/components/RefundWorkbench.tsx`
- `src/components/QueueStreamPanel.tsx`
- `src/components/SuccessBucket.tsx`
- `src/components/FailureBucket.tsx`
