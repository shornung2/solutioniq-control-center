

# Create Files Page with Grid/List Views and Filtering

## Overview
Add a new Files page that displays all generated documents and images, with grid/list view toggle and mime-type category filtering. Uses the existing `downloadFile` function and `FileAttachment` type from the codebase.

## Changes

### 1. Create `src/pages/Files.tsx`

New page using the `Layout` component, with the following structure:

**Data fetching:**
- React Query hook inline: `useQuery({ queryKey: ["files"], queryFn: () => api.get<{ files: FileAttachment[] }>("/files") })`

**State:**
- `view`: "grid" | "list" (default "grid")
- `filter`: "all" | "documents" | "spreadsheets" | "presentations" | "images" (default "all")

**Top Bar:**
- Page title "Files" on the left
- View toggle: two icon buttons (LayoutGrid / List icons), highlighted when active
- Filter buttons row: All | Documents | Spreadsheets | Presentations | Images
  - Filter logic by mime_type:
    - documents: `application/pdf` or `wordprocessingml`
    - spreadsheets: `spreadsheetml`
    - presentations: `presentationml`
    - images: `image/*`

**Grid View (default):**
- Responsive grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`
- Each card (Card component):
  - Large file type icon at top (reuse icon logic from FileCard: PDF=red FileText, Word=blue FileText, Excel=green Table, PPT=orange Presentation, Image=purple ImageIcon)
  - For image files: show thumbnail preview using `getFilePreviewUrl(file.file_id)` instead of the icon
  - Filename (truncated, bold, small text)
  - File size (muted, xs text) using the same `formatFileSize` helper
  - Download button (outline, small) calling `downloadFile(file.file_id, file.filename)`

**List View:**
- Table component with columns: Icon (small) | Filename | Type | Size | Download button
- Compact rows
- Type column: human-readable label derived from mime_type (e.g., "PDF", "Word Document", "Spreadsheet", "Image")

**Empty State:**
- Centered: FolderOpen icon (48px, muted) + "No files yet" heading + "Ask Autopilot to create a document, spreadsheet, or presentation to get started." description

**Loading State:**
- Grid: 8 skeleton cards
- List: 5 skeleton table rows

**Error State:**
- AlertCircle icon + "Failed to load files" + Retry button (matching Dashboard pattern)

### 2. Update `src/components/AppSidebar.tsx`
- Import `FolderOpen` from lucide-react
- Add `{ title: "Files", url: "/files", icon: FolderOpen }` to `navItems` between Chat and Approvals (index 4)

### 3. Update `src/App.tsx`
- Import Files page
- Add route: `<Route path="/files" element={<Files />} />`

## Technical Details

**Mime-type filter mapping:**
```text
all -> no filter
documents -> mime includes "pdf" or "wordprocessingml"
spreadsheets -> mime includes "spreadsheetml"
presentations -> mime includes "presentationml"
images -> mime starts with "image/"
```

**Human-readable type labels:**
```text
application/pdf -> "PDF"
*wordprocessingml* -> "Word Document"
*spreadsheetml* -> "Spreadsheet"
*presentationml* -> "Presentation"
image/* -> "Image"
default -> "File"
```

**File size formatting** (same helper as FileCard):
```text
< 1024 -> "X B"
< 1024*1024 -> "X.X KB"
else -> "X.X MB"
```

**Image thumbnail:** For image files in grid view, render an `<img>` tag with `src={getFilePreviewUrl(file.file_id)}` and `object-cover` styling, replacing the type icon.

**Files changed:**
- `src/pages/Files.tsx` -- new page
- `src/components/AppSidebar.tsx` -- add nav item
- `src/App.tsx` -- add route

