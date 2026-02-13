
## Remove Sample Data & Integrate Backend APIs

### Overview
The application currently has hardcoded sample data throughout all pages. We need to:
1. Remove all mock/sample data from pages
2. Update the API service to use environment variables for the FastAPI backend URL and WebSocket endpoint
3. Create custom React Query hooks for fetching real data from your backend endpoints
4. Update each page to use real API calls instead of local state with mock data
5. Add error handling and loading states

### Current Sample Data to Remove
- **Dashboard.tsx**: `metrics` array, `chartData` array, `activityLog` array
- **Tasks.tsx**: `mockTasks` array
- **Chat.tsx**: `initialMessages` array with placeholder agent response logic
- **Approvals.tsx**: `pendingApprovals` and `completedApprovals` arrays

### Implementation Plan

#### 1. **Environment Configuration** (`vite.config.ts` & `.env.local`)
- Create `.env.local` file with:
  - `VITE_API_URL=https://solutioniq.cloud/api/v1`
  - `VITE_WS_URL=wss://solutioniq.cloud/api/v1/ws/stream`
- Update `vite.config.ts` to expose these environment variables

#### 2. **Update API Service** (`src/lib/api.ts`)
- Replace localStorage-based URL retrieval with `import.meta.env.VITE_API_URL`
- Add WebSocket utility function using `VITE_WS_URL`
- Add typed endpoints for common API routes:
  - `GET /dashboard/metrics` → dashboard stats
  - `GET /dashboard/activities` → activity feed
  - `GET /tasks?status=...` → task list with filtering
  - `GET /approvals/pending` → pending approvals
  - `GET /approvals/completed` → completed approvals
  - `POST /chat` → send message to agent
  - `GET /health` → connection status

#### 3. **Create Custom React Query Hooks** (new files)
Create modular hooks in `src/hooks/` for each data type:
- `useDashboardMetrics()` → fetches task metrics
- `useActivityFeed()` → fetches activity log with polling/WebSocket
- `useTasks(filter?)` → fetches tasks with optional status filter
- `usePendingApprovals()` → fetches pending approvals
- `useCompletedApprovals()` → fetches completed approvals
- `useChatMessages()` → manages chat conversation
- Each hook will handle loading/error states via React Query

#### 4. **Update Pages to Use Real APIs**

**Dashboard.tsx**:
- Replace `metrics` array with `useDashboardMetrics()` hook
- Replace `chartData` with real trend data from `GET /dashboard/metrics`
- Replace `activityLog` with `useActivityFeed()` hook
- Add loading skeletons while fetching
- Add error boundaries with retry buttons

**Tasks.tsx**:
- Replace `mockTasks` with `useTasks(filter)` hook
- Remove local filter logic, integrate with API filtering
- Add loading state for table rows
- Keep dialog for task details (data comes from API)

**Chat.tsx**:
- Replace `initialMessages` with `useChatMessages()` hook
- Remove setTimeout placeholder logic
- Add real API call to `POST /chat` endpoint on message send
- Stream responses or use polling for agent replies
- Add loading indicator while waiting for response

**Approvals.tsx**:
- Replace `pendingApprovals` with `usePendingApprovals()` hook
- Replace `completedApprovals` with `useCompletedApprovals()` hook
- Wire approve/reject buttons to API endpoints
- Add optimistic updates for better UX
- Update badge count dynamically from pending count

#### 5. **Connection Status Monitoring**
- Update `useConnectionStatus()` hook to use new API URL
- Display connection indicator in header based on health checks

#### 6. **Error Handling & UX**
- Add error toast notifications for failed API calls
- Add retry mechanisms for failed requests
- Show loading states (skeletons/spinners) while fetching
- Handle empty states gracefully

### API Response Types (TypeScript Interfaces)
Define interfaces in `src/lib/types.ts`:
```
- Metric { label: string; value: string; trend: string }
- Activity { id: string; action: string; time: string; status: string }
- Task { id: string; name: string; status: Status; created: string; duration: string; output?: string }
- Approval { id: string; action: string; description: string; requestedAt: string; status: Status }
- Message { id: string; role: "user" | "agent"; text: string; time: string }
- DashboardMetrics { metrics: Metric[]; chartData: ChartPoint[]; activities: Activity[] }
```

### Files to Modify
1. `src/lib/api.ts` - Update base URL, add endpoints
2. `vite.config.ts` - Expose environment variables
3. Create `.env.local` - Add API URLs (user provides this)
4. Create `src/lib/types.ts` - Define TypeScript interfaces
5. Create `src/hooks/useDashboardMetrics.ts`
6. Create `src/hooks/useActivityFeed.ts`
7. Create `src/hooks/useTasks.ts`
8. Create `src/hooks/usePendingApprovals.ts`
9. Create `src/hooks/useCompletedApprovals.ts`
10. Create `src/hooks/useChatMessages.ts`
11. Update `src/pages/Dashboard.tsx`
12. Update `src/pages/Tasks.tsx`
13. Update `src/pages/Chat.tsx`
14. Update `src/pages/Approvals.tsx`
15. Update `src/pages/Settings.tsx` - Remove API URL input (now env-based)

### Key Technical Decisions
- **Environment Variables**: Using Vite's `import.meta.env` for type-safe access
- **Caching**: React Query with appropriate staleTime for each endpoint
- **Real-time Updates**: Activity feed will use polling; chat could use WebSocket
- **Error Boundaries**: Each page component will handle errors independently
- **Loading States**: Skeleton components and spinners while data loads

