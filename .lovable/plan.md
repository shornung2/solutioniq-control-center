
# Comprehensive Testing Suite

## Overview

Add unit tests, integration tests, and validation tests covering the new features: file services, feedback system, budget monitor, routing performance, WebSocket handling, preferences, debounce hook, and form validation logic. All tests use the existing Vitest + React Testing Library setup.

## Test Files

### 1. `src/services/__tests__/fileService.test.ts` -- File Service Unit Tests

- **validateFile**: Test allowed types (image/png, application/pdf, text/plain, application/json) return null
- **validateFile**: Test rejected types (application/zip, video/mp4, empty string) return error message
- **validateFile**: Test file at exactly 100MB passes, file over 100MB fails
- **validateFile**: Test file with empty/missing type returns error
- **uploadFile**: Mock `api.upload` and verify FormData is constructed with the file
- **listFiles**: Mock `api.get`, verify default limit/offset params
- **deleteFileById**: Mock `api.delete`, verify correct endpoint called

### 2. `src/services/__tests__/feedbackService.test.ts` -- Feedback Service Unit Tests

- **submit**: Mock `api.post`, verify payload structure with required and optional fields
- **getForTask**: Mock `api.get`, verify endpoint includes task ID
- **getStats**: Mock `api.get`, verify correct endpoint

### 3. `src/hooks/__tests__/use-debounce.test.ts` -- Debounce Hook Tests

- Returns initial value immediately
- Updates after delay expires (use `vi.useFakeTimers`)
- Resets timer when value changes before delay
- Works with custom delay values

### 4. `src/hooks/__tests__/use-preferences.test.ts` -- Preferences Hook Tests

- Returns default values when localStorage is empty
- Loads saved values from localStorage
- `update()` merges partial updates and persists
- Handles corrupted localStorage JSON gracefully (returns defaults)

### 5. `src/components/__tests__/BudgetMonitor.test.tsx` -- Budget Monitor Component Tests

- Renders loading skeleton when data is loading
- Renders null when no budget data
- Shows daily and monthly percentages
- Shows dollar amounts (used/limit)
- Shows "Paused" badge when `is_paused` is true
- Shows "Hard Stop" badge when `hard_stop_enabled` is true
- Shows warning banner when pct > 90
- Does not show warning when pct < 75

### 6. `src/components/__tests__/FeedbackStars.test.tsx` -- FeedbackStars Component Tests

- Renders 5 star buttons
- Clicking a star calls submitFeedback mutation
- Shows "Thanks!" message after selection
- Has correct ARIA radiogroup role
- Stars get color classes based on rating (red for 1-2, yellow for 3, green for 4-5)

### 7. `src/hooks/__tests__/use-websocket.test.ts` -- WebSocket Hook Tests

- Initializes connection and sets isConnected on open
- Sends auth token on connection
- Parses incoming JSON events and sets lastEvent
- Handles reconnection with exponential backoff
- registerPendingTask and removePendingTask modify the set

### 8. `src/lib/__tests__/validation.test.ts` -- Validation Logic Tests

- Rating values must be 1-5 (test boundary: 0, 1, 5, 6)
- Required fields enforcement (task_id, rating cannot be empty)
- File type validation edge cases (uppercase MIME types, compound types)
- Budget percentage boundaries (0, 75, 90, 100, values above 100)

## Technical Details

### Mocking Strategy

- Mock `@/lib/api` module using `vi.mock()` for all service tests
- Mock `@tanstack/react-query` hooks for component tests that use queries
- Use `vi.useFakeTimers()` for debounce and WebSocket reconnection tests
- Mock `localStorage` for preferences tests
- Mock `WebSocket` global for WebSocket hook tests

### Test Utilities

Each component test wraps renders in necessary providers:
```text
QueryClientProvider (with new QueryClient per test)
```

### File Structure
```text
src/
  services/
    __tests__/
      fileService.test.ts
      feedbackService.test.ts
  hooks/
    __tests__/
      use-debounce.test.ts
      use-preferences.test.ts
      use-websocket.test.ts
  components/
    __tests__/
      BudgetMonitor.test.tsx
      FeedbackStars.test.tsx
  lib/
    __tests__/
      validation.test.ts
```

### Total: 8 test files covering ~45 individual test cases

All tests run via the existing `vitest run` command with no config changes needed.
