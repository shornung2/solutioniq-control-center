

# Add Star Rating Feedback to Assistant Messages

## Overview
Add a 5-star rating widget below each completed assistant message, with optional text feedback. Ratings are sent to the backend via `POST /chat/{task_id}/feedback`.

## Changes

### 1. Add `task_id` to `LocalMessage` in `src/hooks/use-chat.ts`
- Add optional `task_id?: string` field to the `LocalMessage` interface
- When processing completed responses (sync): set `task_id` from `res.task_id`
- When processing degraded responses: set `task_id` from `res.task_id`
- When WebSocket delivers `task.completed`: set `task_id` from `evt.task_id`
- When polling resolves a completed task: set `task_id` from the polled task id
- This is needed so the `FeedbackStars` component knows which task to send feedback for

### 2. Create `src/components/FeedbackStars.tsx`
New component with props: `taskId: string`

Internal state:
- `hoveredStar: number | null` -- which star is being hovered (1-5)
- `selectedStar: number | null` -- which star was clicked
- `showThanks: boolean` -- show "Thanks!" text after rating
- `showFeedbackInput: boolean` -- show text input for additional feedback
- `feedbackText: string` -- the comment text
- `submittingFeedback: boolean` -- loading state for comment submission

Behavior:
- Render 5 Star icons (16px, from lucide-react) in a row
- Default: outlined/gray stars using `text-muted-foreground/40`
- On hover: fill stars up to hovered position with primary/gold color
- On click (first time): send `api.post("/chat/{taskId}/feedback", { rating })` immediately, show filled stars, display "Thanks!" text that fades after 2 seconds
- On click (already rated): toggle inline text input with "Any additional feedback?" placeholder and a small "Submit" button
- Submit button sends `api.post("/chat/{taskId}/feedback", { rating: selectedStar, comment: feedbackText })`
- Entire row uses small, subtle styling: `text-muted-foreground text-xs`

Star rendering logic:
- If `selectedStar` is set: fill stars 1 through `selectedStar`, outline the rest
- If hovering and no selection yet: fill stars 1 through `hoveredStar`, outline the rest
- Use `Star` icon with `fill="currentColor"` for filled, no fill for outline
- Filled color: `text-primary` (the orange accent)
- Outline color: `text-muted-foreground/40`

### 3. Update `src/pages/Chat.tsx`
- Import `FeedbackStars`
- In `MessageBubble`: after the lane/cost pill (line ~126), add a conditional render:
  - Only show if `!isUser && msg.task_id && msg.status !== "typing" && msg.status !== "sending"`
  - Render `<FeedbackStars taskId={msg.task_id} />`

## Technical Details

**API call:** `api.post("/chat/{taskId}/feedback", { rating: 1-5, comment: "optional" })`
- Fire-and-forget on initial rating (no need to block UI)
- Show loading state only on comment submission

**Files changed:**
- `src/hooks/use-chat.ts` -- add `task_id` to `LocalMessage`, populate it in all response paths
- `src/components/FeedbackStars.tsx` -- new component
- `src/pages/Chat.tsx` -- integrate FeedbackStars into MessageBubble

