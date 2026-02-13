

# Fix Chat and Tasks API Response Mapping

## Problem
The Chat page shows "No messages yet" after sending because the frontend code doesn't match the actual API response structure. Three specific mismatches exist:

1. The API wraps task lists in `{"tasks": [...], "total": N}` but the code expects a flat array
2. Field names differ: the API uses `task_type`, `title`, `result`, `created_at` while the code expects `type`, `input`/`name`, `output`, `created`
3. The chat filter checks `t.type === "chat"` but the API always returns `task_type: "general"`

## Changes

### 1. Update `src/lib/types.ts`
- Add a `TaskListResponse` wrapper type: `{ tasks: Task[]; total: number; page: number; page_size: number }`
- Update the `Task` interface fields to match the API: rename `name` to `title`, `output` to `result`, `created` to `created_at`, `duration` to `tokens_used`, add `task_type`, `description`, `error`, `source_channel`, etc.

### 2. Fix `src/hooks/use-chat.ts`
- Parse the wrapped response: extract `.tasks` from the API result
- Update field references: use `t.title` for user message text, `t.result` for agent response, `t.created_at` for timestamps
- Fix the filter: match on `chatTaskIds` (tasks created from chat) instead of a non-existent `type` field
- Use the correct post body field mapping since the API ignores `type` and stores it as `task_type: "general"`

### 3. Fix `src/hooks/use-tasks.ts`
- Unwrap the `{ tasks: [...] }` response in `useTasks` so the rest of the app receives a flat `Task[]` array

### 4. Clean up `supabase/functions/api-proxy/index.ts`
- Remove the diagnostic `console.log` line that prints token metadata on every request

## Technical Details

The actual API task object looks like:
```text
{
  "id": "uuid",
  "title": "Hi there",
  "task_type": "general",
  "status": "pending",
  "result": null,
  "created_at": "2026-02-13T21:27:57Z",
  "tokens_used": 0,
  ...
}
```

The tasks list endpoint returns:
```text
{
  "tasks": [ ...task objects... ],
  "total": 2,
  "page": 1,
  "page_size": 20
}
```

