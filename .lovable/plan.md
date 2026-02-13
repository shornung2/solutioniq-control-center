

# Fix Chat Message Persistence and Display

## Problem
The Chat page tracks which tasks belong to chat using in-memory React state (`useState`). This means:
- Navigating away from Chat and back loses all message history
- Even when tasks complete, messages won't appear if the page was refreshed

The bigger issue (VPS not processing tasks) is a backend problem outside this app's control, but we should still fix the frontend so it works correctly once tasks do get processed.

## Changes

### 1. Update `src/hooks/use-chat.ts`
Instead of tracking `chatTaskIds` in React state (which resets on navigation), change the approach to:
- Fetch ALL tasks from the API (which it already does)
- Display all tasks as chat messages regardless of tracking -- since the chat is the primary way users interact, showing all tasks as conversations makes sense
- Map each task's `title` as the user message and `result` (when available) as the agent response
- Sort messages chronologically by `created_at`
- When sending a new message, immediately add an optimistic user message to the UI while the API call completes

### 2. Update `src/pages/Chat.tsx`
- Show a "Pending..." indicator for tasks that have `status: "pending"` and no `result` yet, instead of showing nothing
- This gives users feedback that their message was received but is waiting to be processed

## Technical Details

The updated chat hook will:
- Remove the `chatTaskIds` state entirely
- Query `/tasks?limit=20` and convert ALL returned tasks into chat messages
- For each task: create a user message from `title`, and if `result` is non-null, create an agent response message
- For pending tasks with no result, show a "Waiting for response..." indicator
- Continue polling every 5 seconds to pick up completed tasks

The `sendMessage` mutation stays the same (POST to `/tasks`), but `onSuccess` just invalidates the query cache without needing to track IDs.

