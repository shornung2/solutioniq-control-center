import { FileText, Table, Presentation, ImageIcon, Download } from "lucide-react";
import type { FileAttachment } from "@/lib/types";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mime: string) {
  if (mime === "application/pdf")
    return <FileText className="h-5 w-5 text-red-500" />;
  if (mime.includes("wordprocessingml"))
    return <FileText className="h-5 w-5 text-blue-500" />;
  if (mime.includes("spreadsheetml"))
    return <Table className="h-5 w-5 text-green-500" />;
  if (mime.includes("presentationml"))
    return <Presentation className="h-5 w-5 text-orange-500" />;
  if (mime.startsWith("image/"))
    return <ImageIcon className="h-5 w-5 text-purple-500" />;
  return <FileText className="h-5 w-5 text-muted-foreground" />;
}

interface FileCardProps {
  file: FileAttachment;
  onDownload: (file: FileAttachment) => void;
  onPreview?: (file: FileAttachment) => void;
}

export function FileCard({ file, onDownload, onPreview }: FileCardProps) {
  const isImage = file.mime_type.startsWith("image/");

  const handleClick = () => {
    if (isImage && onPreview) {
      onPreview(file);
    } else {
      onDownload(file);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-3 border border-border rounded-lg p-3 hover:bg-muted transition-colors text-left min-w-[200px] max-w-[280px]"
    >
      {getFileIcon(file.mime_type)}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.filename}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(file.size_bytes)}
        </p>
      </div>
      <Download className="h-4 w-4 text-muted-foreground shrink-0" />
    </button>
  );
}
