# Agent Queues Portfolio Demo

A full-stack Next.js + TypeScript demo that simulates a support-agent refund workflow with queue processing and real-time UI updates.

## What This Demo Shows

- Login simulation with 4 selectable agents (dropdown + quick agent buttons)
- Session-based agent context via cookie (no auth provider)
- 10 dummy hotel refund requests per agent
- Selectable refund cards + bulk submit
- Queue simulation (`PENDING -> QUEUED -> PROCESSING -> SUCCESS/FAILED`)
- Stream updates partitioned by `agentId`
- Success and failure buckets that update live
- Initial battery-style loading bar while dashboard loads

## Tech Stack

- Frontend: React (TSX) + Next.js App Router
- Backend: Next.js Route Handlers (TypeScript)
- Realtime transport: Server-Sent Events (`EventSource`)
- Queue + stream backend (current): in-memory simulation

## Local Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How To Use

1. Open `/login`.
2. Pick one of the 4 agents and click **Login to Session**.
3. Select refund cards in the dashboard.
4. Click **Bulk Queue** to submit selected requests.
5. Watch queue status and event log update in real time.
6. Observe completed refunds move into **Successfully Processed** or **Failed** buckets.

## Project Structure

```text
src/
  app/
    page.tsx
    login/page.tsx
    api/
      session/
      refund-requests/
      queue/status/
      stream/[agentId]/
  client/
    components/
    controllers/
    views/
  server/
    api-routes/
    data-sources/
  shared/
    constants/
    routes/
    types/
```

## Current Queue + Stream Simulation

### Queue flow

1. Agent bulk-submits selected refund IDs.
2. Backend enqueues jobs in `queueDataSource`.
3. Simulated worker consumes one job at a time with delay.
4. Backend marks each as success/failure and removes it from active cards.

### Stream flow (partition key = `agentId`)

1. Frontend subscribes to `/api/stream/:agentId`.
2. Server emits events only for that agent partition.
3. Frontend applies events and updates queue panel + status buckets.

## Step-by-Step: Connect Upstash Queue + Redis Streams

This project already has clean boundaries (`api-routes` + `data-sources`), so migration is straightforward.

### 1. Create Upstash resources

1. Create one **Upstash Redis** database.
2. Create one **Upstash QStash** project.
3. Copy tokens/URLs from both dashboards.

### 2. Add packages

```bash
npm install @upstash/redis @upstash/qstash
```

### 3. Add environment variables

Use these in `.env.local` and in Vercel project settings:

```bash
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
QSTASH_TOKEN=...
QSTASH_CURRENT_SIGNING_KEY=...
QSTASH_NEXT_SIGNING_KEY=...
APP_BASE_URL=http://localhost:3000
```

For Vercel, set `APP_BASE_URL` to your production URL.
You can copy from `.env.example` as a starter.

### 4. Create Upstash clients

Create `src/server/data-sources/upstashClients.ts`:

```ts
import { Redis } from "@upstash/redis";
import { Client as QStashClient } from "@upstash/qstash";

export const redis = Redis.fromEnv();
export const qstash = new QStashClient({ token: process.env.QSTASH_TOKEN! });
```

### 5. Publish jobs to QStash from bulk submit route

In `processBulkRefundRequestsRoute` (or queue data source), replace local enqueue execution with QStash publishes to a worker endpoint:

- Destination: `${APP_BASE_URL}/api/workers/process-refund`
- Payload: `{ agentId, requestId }`
- Optional: set incremental delay per message for visible queue ordering

### 6. Add worker endpoint to consume queue jobs

Create `src/app/api/workers/process-refund/route.ts`:

- Verify QStash signature with `verifySignatureAppRouter`.
- Mark request as `PROCESSING`.
- Add simulated delay (`await new Promise(...)`).
- Produce deterministic success/failure.
- Persist final status.

### 7. Write each completion to Redis Stream partition

When worker completes a request, write to stream key by agent partition:

- Key pattern: `refund-stream:${agentId}`
- Command: `XADD`
- Fields: `requestId`, `result`, `processedAt`, `processorMessage`

### 8. Read from Redis Stream in stream route

Update `src/app/api/stream/[agentId]/route.ts` to `XREAD` from `refund-stream:${agentId}` and forward entries over SSE.

- Keep `lastId` cursor in memory for each SSE connection.
- Map stream entry -> `REFUND_PROCESSED` event shape.
- Continue sending keep-alives.

### 9. Keep local fallback for development

If Upstash env vars are missing, continue using the current in-memory queue + stream logic.

### 10. Validate end-to-end

1. Submit 3+ cards.
2. Confirm worker endpoint is called by QStash.
3. Confirm stream entries appear in Redis.
4. Confirm frontend buckets update via SSE.

## Step-by-Step: Deploy To Vercel

### 1. Push code to GitHub

```bash
git add .
git commit -m "feat: multi-agent login + queue stream demo"
git push
```

### 2. Import project in Vercel

1. Go to Vercel dashboard.
2. Click **Add New Project**.
3. Import the GitHub repo.
4. Framework should auto-detect as Next.js.

### 3. Configure environment variables

In Vercel project settings, add the same values from `.env.local`:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `QSTASH_TOKEN`
- `QSTASH_CURRENT_SIGNING_KEY`
- `QSTASH_NEXT_SIGNING_KEY`
- `APP_BASE_URL=https://<your-vercel-domain>`

### 4. Deploy

1. Trigger deploy from Vercel UI.
2. Wait for build to pass.
3. Open production URL.

### 5. Post-deploy verification

1. Log in as one agent.
2. Queue refunds.
3. Check queue log updates and final buckets.
4. Switch to another agent and confirm independent partition state.

## Learnings From This Project

- Queueing improves UX and reliability for bulk actions by decoupling request intake from processing.
- Partition keys (`agentId`) are an effective way to scope real-time updates to the correct user session.
- SSE is a simple and practical pattern for one-way real-time updates in dashboard-style apps.
- Clear separation (`views` / `controllers` / `api-routes` / `data-sources`) makes it easier to swap in real infrastructure later.
- Simulations are useful for portfolio demos because they communicate architecture before external dependencies are introduced.

## Notes

- Current implementation intentionally simulates delay and deterministic failures.
- In-memory data is reset on server restart.
- Upstash migration gives persistence and cloud queue semantics for production-style behavior.
