

# Add File Attachment Display to Chat Messages

## Overview
Add support for displaying and downloading file attachments (PDF, Word, Excel, PowerPoint, images) that the backend includes in chat responses. This requires changes to the API layer, types, chat hook, and chat UI.

## Changes

### 1. Add `FileAttachment` type to `src/lib/types.ts`
New interface:
```text
FileAttachment {
  file_id: string
  filename: string
  download_url: string
  mime_type: string
  size_bytes: number
}
```
Also add `files?: FileAttachment[]` to `ChatSendResponse` (the sync response can include files too).

### 2. Add `api.downloadFile()` to `src/lib/api.ts`
- New method: `downloadFile(fileId: string, filename: string)`
- Calls the edge function proxy but needs the raw blob response, not JSON
- The current proxy returns `response.text()` as the body, so we need a separate approach: call `supabase.functions.invoke("api-proxy")` but since that always parses the response, we will instead need to update the edge function to handle file downloads properly
- Actually, `supabase.functions.invoke` returns data as-is when Content-Type is not JSON. But to be safe, we'll add a dedicated `downloadFile` function that constructs the fetch URL manually to the edge function and gets a blob response
- The function will: fetch the edge function URL directly with the proper headers, get a blob, create an object URL, trigger a download via a temporary anchor element, then revoke the URL

### 3. Update the edge function `supabase/functions/api-proxy/index.ts`
- Currently it reads `response.text()` and returns it -- this works for JSON but will corrupt binary files
- Add detection: if the response Content-Type is not JSON (e.g., `application/pdf`, `application/octet-stream`), return the response body as-is using `response.arrayBuffer()` instead of `response.text()`
- This ensures file downloads pass through correctly

### 4. Update `LocalMessage` in `src/hooks/use-chat.ts`
- Add optional `files?: FileAttachment[]` field to `LocalMessage`
- When processing completed responses (sync), extract `files` from the `ChatSendResponse` and attach to the message
- When WebSocket delivers `task.completed`, extract `files` from `evt.result.files` and attach to the message
- When polling resolves a completed task, parse `task.result` (which is a JSON string) to extract files

### 5. Create `src/components/FileCard.tsx` -- new component
A reusable file attachment card:
- Props: `file: FileAttachment`, `onDownload`, `onPreview` (for images)
- Displays: icon (color-coded by mime type), filename (truncated), human-readable size, download button
- Icon mapping:
  - PDF: FileText icon in red
  - Word (.docx): FileText icon in blue
  - Excel (.xlsx): Table icon in green
  - PowerPoint (.pptx): Presentation icon in orange
  - Images (png/jpeg/webp): Image icon in purple, plus a small thumbnail
- `formatFileSize()` helper: converts bytes to "45.2 KB", "1.2 MB", etc.
- Clicking triggers download; for images, clicking opens a preview dialog

### 6. Create `src/components/ImagePreviewDialog.tsx` -- new component
- A Dialog/modal that shows a larger image preview
- Props: `open`, `onOpenChange`, `file: FileAttachment`
- Loads the image via the proxy (constructs the URL similarly to downloadFile)
- Shows the image centered with a "Download" button below

### 7. Update `src/pages/Chat.tsx`
- Import `FileCard` and `ImagePreviewDialog`
- In `MessageBubble`: after the text content div, if `msg.files` exists and has items, render a horizontal row of `FileCard` components
- Track image preview state: `previewFile` in component state
- For image files, clicking opens the `ImagePreviewDialog`
- File cards row styling: `flex flex-wrap gap-2 mt-2`

## Technical Details

**Edge function binary handling:**
The proxy currently does `await response.text()` for all responses. For file downloads, this corrupts binary data. The fix:
- Check if `Content-Type` starts with `application/json` or `text/`
- If yes: use `response.text()` as before
- If no: use `response.arrayBuffer()` and return as a `Response` with the original Content-Type

**Download function in api.ts:**
Since `supabase.functions.invoke()` doesn't support blob responses well, `downloadFile` will construct a direct fetch to the edge function URL:
```text
fetch(`${SUPABASE_URL}/functions/v1/api-proxy`, {
  method: "POST",
  headers: {
    "apikey": SUPABASE_ANON_KEY,
    "x-target-path": `/files/${fileId}`,
    "x-target-method": "GET",
    "Content-Type": "application/json"
  }
})
```
Then: `.blob()` -> `URL.createObjectURL()` -> create `<a>` element -> `.click()` -> `URL.revokeObjectURL()`

**File size formatting:**
Simple utility: if < 1024 bytes show "X B", < 1MB show "X.X KB", else "X.X MB"

**Files in WebSocket events:**
The `WsTaskEvent.result` already has `files?: unknown[]` typed. We'll type it properly as `FileAttachment[]` and extract when processing task.completed events.

**File list:**
- `src/lib/types.ts` -- add FileAttachment interface, update ChatSendResponse
- `src/lib/api.ts` -- add downloadFile method
- `supabase/functions/api-proxy/index.ts` -- handle binary responses
- `src/hooks/use-websocket.ts` -- type files as FileAttachment[]
- `src/hooks/use-chat.ts` -- add files to LocalMessage, extract from responses
- `src/components/FileCard.tsx` -- new
- `src/components/ImagePreviewDialog.tsx` -- new
- `src/pages/Chat.tsx` -- integrate file cards into message bubbles
