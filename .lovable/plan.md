
# Add Chat Delete + Fix Duplicate Messages

## Problem 1: Double Messages
When a user sends a message, it's added to `localMessages` with a `local-user-{timestamp}` ID. When the server conversation messages are later fetched, they come back with different server-generated IDs. The deduplication in `use-chat.ts` (line 66) only filters by matching IDs, so both the local and server copies appear.

**Fix**: After the server responds and we invalidate the conversation messages query, clear the local messages that have already been persisted server-side. Specifically, once a send completes successfully, remove the user's local message since the server will return it via the conversation query. Also clear local messages when `serverMessages` updates and covers them.

## Problem 2: No Delete Functionality
Add the ability to delete conversations from the sidebar with a confirmation step.

---

## Changes

### 1. `src/hooks/use-chat.ts` -- Fix duplicate messages
- After a successful send and query invalidation, clear local user messages that would now be in the server response
- Add a smarter merge: when server messages are loaded for the active conversation, only keep local messages that are still "in-flight" (status is "sending", "typing", or pending task resolution)
- Add a `deleteConversation` function that calls `api.delete(`/chat/conversations/${id}`)` and invalidates the conversations query

### 2. `src/pages/Chat.tsx` -- Add delete button to sidebar
- Add a trash icon button on each conversation item in the sidebar (visible on hover)
- Show a confirmation dialog before deleting
- After deletion, if the deleted conversation was active, reset to the empty state
- Wire up the `deleteConversation` function from the hook

---

## Technical Details

**Deduplication fix** (use-chat.ts):
- Change the merge logic so local messages are only kept if they have a "sending", "typing", or pending status -- meaning they haven't been confirmed by the server yet
- This ensures that once the query refetches after `invalidateQueries`, the server copy takes over and the local copy is dropped

**Delete flow** (use-chat.ts + Chat.tsx):
- New `deleteConversation(id)` mutation calling `DELETE /chat/conversations/{id}`
- On success: invalidate `["conversations"]`, and if the deleted ID matches `activeConversationId`, call `startNewConversation()`
- UI: small `Trash2` icon button per conversation row, with an `AlertDialog` for confirmation
