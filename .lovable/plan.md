

# Rebuild Chat Page with Proper Chat API

## Overview
Replace the current task-polling chat implementation with the real chat API that supports conversation threading, markdown rendering, and a two-panel layout with conversation history.

## Changes

### 1. Install dependencies
Add `react-markdown` and `remark-gfm` for rendering assistant responses as rich markdown.

### 2. Add chat types to `src/lib/types.ts`
Define new interfaces for the chat API responses:
- `ChatSendResponse` -- response from `POST /chat` (content, task_id, conversation_id, status, lane, model, cost_usd, tokens_used, message_number)
- `Conversation` -- item from `GET /chat/conversations` (id, title, message_count, total_cost_usd, is_active, created_at, last_message_at)
- `ConversationMessage` -- item from `GET /chat/conversations/{id}/messages` (id, role, content, lane, model, cost_usd, timestamp)

### 3. Rewrite `src/hooks/use-chat.ts`
Completely replace with new hook exposing:
- `useConversations()` -- fetches conversation list via `GET /chat/conversations`
- `useConversationMessages(conversationId)` -- fetches messages for a conversation via `GET /chat/conversations/{id}/messages`
- `useSendMessage()` -- mutation that calls `POST /chat` with `{ message, conversation_id }`, handles the response status:
  - `completed`: return content immediately
  - `queued`: start polling `GET /tasks/{task_id}` every 2 seconds until resolved
  - `degraded`: return content with a degraded flag
  - On 429 error: show rate-limit toast via sonner
- State management: track `activeConversationId` and `messages` (local array for the active conversation, updated optimistically)

### 4. Rewrite `src/pages/Chat.tsx`
Two-panel layout inside the existing `<Layout>` wrapper:

**Left panel (conversation list, 280px wide, collapsible on mobile):**
- "New Conversation" button at top -- clears active conversation, shows empty state
- List of conversations from the hook, each showing: truncated title (45 chars), relative time (using `date-fns` `formatDistanceToNow`), message count pill
- Active conversation gets a left border highlight in primary color
- On mobile: toggle with a menu button, overlay panel

**Right panel (chat area, flex-1):**
- Messages area with scroll, auto-scroll to bottom on new messages
- User messages: right-aligned, primary background
- Assistant messages: left-aligned, muted background, content rendered as markdown via `react-markdown` + `remark-gfm`
- Below each assistant message: subtle pill showing `"{lane} . ${cost_usd}"` (e.g., "haiku . $0.002")
- Typing indicator: three animated dots while waiting for queued task resolution
- Empty state (no conversation): 2x2 grid of 4 starter cards ("What can you help me with?", "Research a company", "Draft a follow-up email", "Create a competitive battlecard") -- clicking sends as first message

**Bottom input bar:**
- Textarea (auto-resizing, 1-3 lines, uses existing Textarea component)
- Enter sends, Shift+Enter for newline
- Send button with loading spinner while sending
- Auto-focus on mount and after send
- Disabled while sending

### 5. Add markdown styling to `src/index.css`
Add scoped styles for `.markdown-content` to properly style headings, code blocks, lists, tables, blockquotes, and inline code rendered by react-markdown.

## Technical Details

**Polling for queued responses:**
When `POST /chat` returns `status: "queued"`, the hook will:
1. Add a placeholder "typing" message to the local messages array
2. Start an interval polling `api.get("/tasks/{task_id}")` every 2 seconds
3. When the task reaches `completed` or `failed`, replace the placeholder with the actual result and stop polling
4. Timeout after 60 seconds with a failure message

**Optimistic updates:**
When the user sends a message, it appears immediately in the message list as a user bubble. If the API returns `completed`, the assistant response also appears immediately. If `queued`, a typing indicator shows until polling resolves.

**Error handling:**
- 429 responses trigger a sonner toast: "Rate limited. Please wait a moment."
- Failed tasks show an error message bubble in red
- Network errors show a toast and keep the user's message visible

**File structure:**
- `src/lib/types.ts` -- add chat-specific types
- `src/hooks/use-chat.ts` -- complete rewrite with conversation support
- `src/pages/Chat.tsx` -- complete rewrite with two-panel layout
- `src/index.css` -- add markdown content styles
