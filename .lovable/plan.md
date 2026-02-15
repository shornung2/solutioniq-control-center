

# Comprehensive Enhancement: Health, Conversations, Skills, UI/UX, and Advanced Features

## Overview

Implement all 5 feature areas across the application: System Health monitoring page, Conversation management with soft delete/archive, Skills Marketplace page, UI/UX improvements (code splitting, keyboard shortcuts, notification center), and Advanced Features (bulk operations, global search, export, user preferences). All features connect to the existing external VPS API -- no database tables needed since data is managed by the backend.

---

## 1. System Health Monitoring

### New Page: `src/pages/SystemStatus.tsx`
- Full-page health dashboard with auto-refresh every 30 seconds
- Service cards for Database, Redis, LLM Providers showing status, latency
- Overall status badge (healthy/degraded/unhealthy)
- Last updated timestamp
- Uses existing `useConnectionStatus()` hook and `/health/deep` endpoint data

### Navigation Update
- Add "System Status" route to `src/App.tsx` at `/system-status`
- Add nav item in `src/components/AppSidebar.tsx` with Activity icon

---

## 2. Conversation Management Enhancements

### Updated Chat Page (`src/pages/Chat.tsx`)
- Add Active/Archived tabs in conversation sidebar
- Conversations with `is_deleted: true` show in Archived tab
- Archive button (soft delete via existing `DELETE /chat/conversations/{id}`)
- Restore button in archived view via `POST /chat/conversations/{id}/restore` (or a PUT)
- Show `total_cost_usd` on each conversation card
- Bulk archive: multi-select with checkboxes, then "Archive Selected" button
- Undo toast notification after archive using sonner's `toast()` with action

### Updated Types (`src/lib/types.ts`)
- Add `is_deleted?: boolean` to `Conversation` interface

### Updated Hook (`src/hooks/use-chat.ts`)
- Add `useArchivedConversations()` query fetching `/chat/conversations?archived=true`
- Add `restoreConversation(id)` function

---

## 3. Skills Marketplace (Dedicated Page)

### New Page: `src/pages/Skills.tsx`
- Full-page skills marketplace (move the marketplace card from Settings into its own page)
- Grid layout of skill cards with search and category filtering
- Skill detail modal with full description, version, author, tags
- Install/Uninstall toggle per skill
- Usage stats section showing last used timestamp for installed skills

### New Component: `src/components/SkillCard.tsx`
- Card with skill name, version, category badge, description
- Tags displayed as small badges
- Install/Uninstall button with loading state
- Author attribution and estimated cost per use

### Navigation Update
- Add "Skills" route to `src/App.tsx` at `/skills`
- Add nav item in `src/components/AppSidebar.tsx` with Puzzle icon
- Remove the skills marketplace section from Settings page

---

## 4. UI/UX Improvements

### Code Splitting (`src/App.tsx`)
- Use `React.lazy()` and `Suspense` for all page components
- Add a loading fallback spinner component

### Keyboard Shortcuts
- New hook: `src/hooks/use-keyboard-shortcuts.ts`
- Cmd/Ctrl+K: opens command palette (using existing cmdk dependency)
- Cmd/Ctrl+N: navigate to create task
- Esc: close modals
- Register shortcuts in Layout component

### Command Palette: `src/components/CommandPalette.tsx`
- Uses the `cmdk` package (already installed)
- Global search across pages
- Quick navigation to any page
- Quick actions: new task, new conversation, upload file

### Notification Center: `src/components/NotificationCenter.tsx`
- Bell icon in Header with unread count badge
- Dropdown showing recent notifications (stored in local state from WebSocket events)
- Mark as read functionality
- Click to navigate to relevant item
- Stores up to 50 recent notifications in-memory

### Debounced Search
- New utility hook: `src/hooks/use-debounce.ts`
- Apply to all search inputs (Files, Skills, Tasks) with 300ms debounce

### Mobile Improvements
- Ensure modals use `max-h-[90vh]` on mobile
- Touch-friendly button sizes already at 44px via shadcn defaults

---

## 5. Advanced Features

### Global Search (`src/components/GlobalSearch.tsx`)
- Integrated into the Command Palette
- Searches across tasks (`/tasks?search=`), conversations, and files
- Shows results grouped by type with icons

### Export Functionality
- Task export: CSV button on Tasks page (similar to existing analytics CSV export)
- Conversation export: Download conversation history as text/markdown

### User Preferences (`src/pages/Settings.tsx`)
- New "Preferences" card in Settings with:
  - Notification toggle (already exists, keep it)
  - Budget alert threshold slider (default 90%)
  - Default task priority selector
  - Auto-archive completed tasks toggle
- Store preferences in `localStorage` via a `usePreferences()` hook

### Bulk Operations on Tasks Page
- Checkbox column in task table for multi-select
- "Select All" checkbox in header
- Bulk actions bar: Delete selected, Export selected
- Confirmation dialog for bulk delete

---

## Technical Details

### File Changes Summary

**New Files (11):**
- `src/pages/SystemStatus.tsx` -- Health monitoring dashboard
- `src/pages/Skills.tsx` -- Skills marketplace page
- `src/components/SkillCard.tsx` -- Skill display card
- `src/components/CommandPalette.tsx` -- Cmd+K command palette
- `src/components/NotificationCenter.tsx` -- Bell icon notification dropdown
- `src/components/GlobalSearch.tsx` -- Search results in command palette
- `src/hooks/use-keyboard-shortcuts.ts` -- Keyboard shortcut registration
- `src/hooks/use-debounce.ts` -- Debounced value hook
- `src/hooks/use-preferences.ts` -- localStorage preferences hook
- `src/components/LoadingFallback.tsx` -- Suspense fallback spinner
- `src/components/BulkActionBar.tsx` -- Floating bar for bulk operations

**Modified Files (8):**
- `src/App.tsx` -- Add routes, React.lazy, Suspense
- `src/components/AppSidebar.tsx` -- Add Skills and System Status nav items
- `src/components/Header.tsx` -- Add NotificationCenter
- `src/components/Layout.tsx` -- Add CommandPalette and keyboard shortcuts
- `src/pages/Chat.tsx` -- Archive/restore, bulk archive, cost display
- `src/pages/Tasks.tsx` -- Bulk select, CSV export
- `src/pages/Settings.tsx` -- Move skills to own page, add preferences card
- `src/lib/types.ts` -- Add is_deleted to Conversation
- `src/hooks/use-chat.ts` -- Add archived conversations query, restore function

### Keyboard Shortcuts Implementation

```text
Cmd/Ctrl + K  -->  Toggle CommandPalette open/close
Cmd/Ctrl + N  -->  Navigate to /tasks and open create dialog
Esc           -->  Close CommandPalette if open
```

Registered via `useEffect` in Layout, using `e.metaKey || e.ctrlKey` for cross-platform support.

### Notification Center Data Flow

```text
WebSocket event received
  --> WebSocketContext dispatches toast (existing)
  --> Also pushes to NotificationCenter's in-memory array
  --> NotificationCenter shows unread count badge
  --> User clicks bell to see list
  --> Click on item navigates to relevant page
```

Notifications stored in React state (no persistence needed), limited to last 50 entries.

### Code Splitting Pattern

```text
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Analytics = React.lazy(() => import("./pages/Analytics"));
// ... all pages

<Suspense fallback={<LoadingFallback />}>
  <Routes>...</Routes>
</Suspense>
```

### Preferences Storage

```text
localStorage key: "solutioniq_preferences"
Value: JSON with fields:
  - budgetAlertThreshold: number (default 90)
  - defaultTaskPriority: number (default 3)
  - autoArchiveCompleted: boolean (default false)
  - notificationsEnabled: boolean (default true)
```

