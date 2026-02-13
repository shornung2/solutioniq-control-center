

## Fix API Endpoints to Match Antigravity Backend

### Problem
All API calls are returning 404 because the frontend endpoints don't match your actual backend API. The proxy edge function is working correctly — it's the backend that's returning "Not Found" because the paths are wrong.

### Endpoint Mapping (Current vs Correct)

| Feature | Current Path | Correct Path |
|---------|-------------|--------------|
| Dashboard metrics | `/dashboard/metrics` | `/usage/metrics` |
| Health check | `/health` | `/agent/status` (or keep `/health` if it exists) |
| Tasks list | `/tasks` | `/tasks?limit=20` |
| Chat send | `/chat` | `/tasks` (with `type="chat"`) |
| Chat messages | `/chat/messages` | Poll task updates or use WebSocket |
| Pending approvals | `/approvals/pending` | `/approvals` (filter client-side) |
| Completed approvals | `/approvals/completed` | `/approvals` (filter client-side) |
| Approve action | `/approvals/{id}/approve` | `/approvals/{id}/approve` (correct) |
| Reject action | `/approvals/{id}/reject` | `/approvals/{id}/reject` (correct) |

### Additional Features to Add
Based on the Antigravity docs, the dashboard should also include:
- **Agent Status** display (Active/Paused/Busy) with Pause/Resume buttons via `GET /agent/status`, `POST /agent/pause`, `POST /agent/resume`
- **Token/Budget Usage** progress bar via `GET /usage/budget`
- **Task creation** form via `POST /tasks`
- **Task trace/detail** view via `GET /tasks/{id}/trace`
- **Capabilities manager** in Settings via `GET /capabilities`
- **WebSocket authentication** — send token as first message after connecting

### Changes Required

#### 1. Update `src/hooks/use-dashboard.ts`
- Change endpoint from `/dashboard/metrics` to `/usage/metrics`
- Add new query for `/usage/budget` (token usage)
- Add new query for `/agent/status` (agent status display)

#### 2. Update `src/pages/Dashboard.tsx`
- Add Agent Status card with Pause/Resume buttons
- Add Token Usage progress bar from budget endpoint
- Wire up Quick Action buttons to actual API calls

#### 3. Update `src/hooks/use-tasks.ts`
- Add `limit=20` default parameter
- Add mutation for creating tasks via `POST /tasks`
- Add query for task trace via `GET /tasks/{id}/trace`

#### 4. Update `src/pages/Tasks.tsx`
- Add "Create Task" button with modal form (title + priority slider)
- Update task detail dialog to show execution trace from `/tasks/{id}/trace`

#### 5. Update `src/hooks/use-chat.ts`
- Change send to `POST /tasks` with `type: "chat"` instead of `/chat`
- Replace message polling with WebSocket listener or task update polling

#### 6. Update `src/hooks/use-approvals.ts`
- Change both pending/completed to use `GET /approvals` and filter by status client-side

#### 7. Update `src/hooks/use-connection-status.ts`
- Change health check to use `/agent/status` endpoint

#### 8. Update `src/lib/types.ts`
- Add types for agent status, budget usage, capabilities, and task trace
- Update Task type to include `priority` field

#### 9. Update `src/lib/api.ts`
- Add WebSocket authentication (send token as first message after connection)
- Note: WS token injection needs the edge function approach or direct connection

#### 10. Update `src/pages/Settings.tsx`
- Add Capabilities Manager section showing enabled/disabled capabilities from `GET /capabilities`

### Technical Details

The WebSocket connection requires special handling: per the Antigravity docs, after connecting you must send the token as the first message (`ws.send(JSON.stringify({ token }))`). Since the token is stored as a secret, the WebSocket connection will need to either:
- Go through a separate edge function that establishes a server-side WS connection (complex), or
- Use polling as a fallback for real-time updates via `GET /tasks/{id}`

For the initial fix, polling will be used for chat updates, with WebSocket support added later.

