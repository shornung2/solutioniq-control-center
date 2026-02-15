

# Feedback System Integration

## Overview

Build a comprehensive feedback system that lets users rate completed tasks, leave detailed comments, and view aggregated feedback statistics. This builds on the existing `FeedbackStars` component and extends it with a proper modal, a dedicated stats component, and integration into the Tasks and Analytics pages.

## Changes

### 1. New Types (`src/lib/types.ts`)

Add `TaskFeedback` and `FeedbackStats` interfaces:
- `TaskFeedback`: task_id, rating (1-5), optional accuracy/speed/helpfulness ratings, comment, created_at
- `FeedbackStats`: average_rating, total_feedback, rating_distribution (Record of star count to number)

### 2. New Feedback Service (`src/services/feedbackService.ts`)

Centralized service with:
- `submitFeedback(data)` -- POST to `/feedback`
- `getTaskFeedback(taskId)` -- GET `/feedback/task/{id}`
- `getFeedbackStats()` -- GET `/feedback/stats`

Plus a React Query hook file `src/hooks/use-feedback.ts` with:
- `useTaskFeedback(taskId)` -- fetches existing feedback for a task
- `useFeedbackStats()` -- fetches aggregated stats
- `useSubmitFeedback()` -- mutation to submit/update feedback

### 3. Feedback Modal (`src/components/FeedbackModal.tsx`)

A Dialog component triggered when viewing a completed task:
- **Primary rating**: 5-star interactive selector with hover effects and color coding (red for 1-2, yellow for 3, green for 4-5)
- **Detailed ratings**: Optional sliders for accuracy, speed, helpfulness (1-5 scale each)
- **Comment**: Textarea for free-form feedback
- **Actions**: Submit button with loading state, Skip button to dismiss
- **Pre-fill**: If feedback already exists for this task, pre-populate the form for editing
- Smooth star selection animation using framer-motion (already installed)

### 4. Updated FeedbackStars Component (`src/components/FeedbackStars.tsx`)

Refactor the existing component to:
- Use the new `feedbackService` instead of raw `api.post` calls
- Use the correct endpoint (`/feedback` instead of `/chat/{taskId}/feedback`)
- Add color coding: stars turn red (1-2), yellow (3), or green (4-5) after selection
- Add keyboard navigation (arrow keys to select, Enter to confirm)

### 5. Feedback Stats Component (`src/components/FeedbackStats.tsx`)

A card component showing:
- Large average rating display with filled stars
- Rating distribution as horizontal bar segments (1-5 stars with count and percentage)
- Total feedback count
- Color-coded bars matching the star rating colors

### 6. Task Detail Updates (`src/pages/Tasks.tsx`)

In the existing task detail Dialog:
- For completed tasks, show a "Rate this task" button that opens the FeedbackModal
- If feedback already exists, display the rating inline with an "Edit" button
- Show the FeedbackStars inline below the task result section
- Add a small star indicator on task rows in the table for tasks that have been rated

### 7. Analytics Integration (`src/pages/Analytics.tsx`)

Add a new card in the analytics grid:
- "Feedback Overview" card using the `FeedbackStats` component
- Placed alongside the existing routing performance section
- Shows overall satisfaction metrics

## Technical Details

### API Endpoints

All calls go through the existing `api` helper in `src/lib/api.ts`:
- `POST /feedback` with body `{ task_id, rating, accuracy_rating?, speed_rating?, helpfulness_rating?, comment? }`
- `GET /feedback/task/{id}` returns `TaskFeedback | null`
- `GET /feedback/stats` returns `FeedbackStats`

### Star Color Logic

```text
rating 1-2: text-red-500 fill-red-500
rating 3:   text-yellow-500 fill-yellow-500
rating 4-5: text-green-500 fill-green-500
```

### Keyboard Navigation

Stars support arrow-left/right to move selection and Enter/Space to confirm, following WAI-ARIA practices for radio groups.

### Files Created
- `src/services/feedbackService.ts` -- API calls
- `src/hooks/use-feedback.ts` -- React Query hooks
- `src/components/FeedbackModal.tsx` -- Full feedback dialog
- `src/components/FeedbackStats.tsx` -- Stats display card

### Files Modified
- `src/lib/types.ts` -- Add TaskFeedback and FeedbackStats types
- `src/components/FeedbackStars.tsx` -- Refactor to use service, add colors and keyboard nav
- `src/pages/Tasks.tsx` -- Add feedback display and modal trigger in task detail
- `src/pages/Analytics.tsx` -- Add feedback stats card

