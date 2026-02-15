

# File Management System Integration

## Overview

Enhance the existing Files page and Chat with comprehensive file management: upload, delete, pagination, search/sort, and chat file attachments. The existing Files page and API layer provide a solid foundation to build upon.

## Changes

### 1. New Types (`src/lib/types.ts`)

Add `FileMetadata` (with `created_at`) and `FileListResponse` (with `total` for pagination) types alongside the existing `FileAttachment`.

### 2. New File Service (`src/services/fileService.ts`)

Centralized service with:
- `uploadFile(file: File)` -- POST multipart/form-data to `/files`
- `listFiles(limit, offset)` -- GET `/files?limit=&offset=`
- `deleteFile(id)` -- DELETE `/files/{id}`
- `downloadFile(id, filename)` -- reuse existing from `api.ts`

Requires extending `api.ts` with a raw `upload` method that sends `FormData` without the JSON `Content-Type` header.

### 3. New Upload Component (`src/components/FileUpload.tsx`)

- Drag-and-drop zone using native HTML drag events
- Click-to-browse with hidden file input
- File type validation (images, PDFs, Office docs, text, JSON)
- Size validation (max 100MB)
- Upload progress indicator using a Progress bar
- Error handling with toast notifications
- On success, invalidates the `["files"]` query to refresh the list

### 4. Enhanced Files Page (`src/pages/Files.tsx`)

Major upgrade to the existing page:
- **Upload button** at the top that opens the FileUpload component
- **Pagination** using offset/limit with Previous/Next controls
- **Search** input that filters by filename (client-side for current page)
- **Sort** by name, date, or size (toggleable asc/desc)
- **Delete** button per file with confirmation dialog (AlertDialog)
- **Image preview** modal for image files (reuse existing ImagePreviewDialog, fix to use direct API URL instead of proxy)
- **Created date** column in list view
- Invalidate queries after upload or delete

### 5. Chat File Attachment (`src/pages/Chat.tsx`)

- Add a paperclip/attach icon button next to the send button
- Hidden file input triggered by the button
- On file select: upload via fileService, then send a chat message referencing the file
- Show uploading state on the button

### 6. Fix ImagePreviewDialog (`src/components/ImagePreviewDialog.tsx`)

Currently uses old proxy URL pattern. Update to use `getFilePreviewUrl()` from `api.ts` for consistency with the rest of the app.

### 7. API Layer Update (`src/lib/api.ts`)

Add an `upload` method to the `api` object:
```
upload: <T>(endpoint: string, formData: FormData) => fetch with multipart, no Content-Type header (browser sets boundary)
```

Also add a `deleteFile` convenience export.

---

## Technical Details

### File Upload Flow

1. User drops/selects file in FileUpload component
2. Validate type and size client-side
3. Create FormData, POST to `/files` with auth header
4. Show progress (indeterminate or estimated)
5. On success: toast, invalidate `["files"]` query, close upload UI
6. On error: toast with message

### Pagination

- Track `page` state (starting at 0)
- Query with `limit=20&offset=page*20`
- Use `total` from response to calculate page count
- Show "Page X of Y" with Previous/Next buttons

### Sort

- Client-side sort on the current page's data
- `sortBy` state: "name" | "date" | "size"
- `sortDir` state: "asc" | "desc"
- Applied via `useMemo` before rendering

### Delete Flow

- Trash icon per file row/card
- AlertDialog confirmation
- Call DELETE `/files/{id}`
- Invalidate `["files"]` query
- Toast on success/error

### Chat Attachment

- Paperclip button triggers hidden `<input type="file">`
- Upload file first, get back file metadata
- Send chat message with text like "Attached: {filename}" or include file reference
- File appears in response via existing FileCard rendering

