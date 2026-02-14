import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutGrid,
  List,
  FolderOpen,
  FileText,
  Table as TableIcon,
  Presentation,
  ImageIcon,
  Download,
  AlertCircle,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { api, downloadFile, getFilePreviewUrl } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FileAttachment } from "@/lib/types";

type ViewMode = "grid" | "list";
type FilterMode = "all" | "documents" | "spreadsheets" | "presentations" | "images";

const FILTERS: { key: FilterMode; label: string }[] = [
  { key: "all", label: "All" },
  { key: "documents", label: "Documents" },
  { key: "spreadsheets", label: "Spreadsheets" },
  { key: "presentations", label: "Presentations" },
  { key: "images", label: "Images" },
];

function matchesFilter(mime: string, filter: FilterMode): boolean {
  if (filter === "all") return true;
  if (filter === "documents") return mime.includes("pdf") || mime.includes("wordprocessingml");
  if (filter === "spreadsheets") return mime.includes("spreadsheetml");
  if (filter === "presentations") return mime.includes("presentationml");
  if (filter === "images") return mime.startsWith("image/");
  return true;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getTypeLabel(mime: string): string {
  if (mime === "application/pdf") return "PDF";
  if (mime.includes("wordprocessingml")) return "Word Document";
  if (mime.includes("spreadsheetml")) return "Spreadsheet";
  if (mime.includes("presentationml")) return "Presentation";
  if (mime.startsWith("image/")) return "Image";
  return "File";
}

function getFileIcon(mime: string, size: "sm" | "lg" = "sm") {
  const cls = size === "lg" ? "h-10 w-10" : "h-5 w-5";
  if (mime === "application/pdf") return <FileText className={`${cls} text-red-500`} />;
  if (mime.includes("wordprocessingml")) return <FileText className={`${cls} text-blue-500`} />;
  if (mime.includes("spreadsheetml")) return <TableIcon className={`${cls} text-green-500`} />;
  if (mime.includes("presentationml")) return <Presentation className={`${cls} text-orange-500`} />;
  if (mime.startsWith("image/")) return <ImageIcon className={`${cls} text-purple-500`} />;
  return <FileText className={`${cls} text-muted-foreground`} />;
}

export default function Files() {
  const [view, setView] = useState<ViewMode>("grid");
  const [filter, setFilter] = useState<FilterMode>("all");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["files"],
    queryFn: () => api.get<{ files: FileAttachment[] }>("/files"),
  });

  const files = useMemo(() => {
    const all = data?.files ?? [];
    return all.filter((f) => matchesFilter(f.mime_type, filter));
  }, [data, filter]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Top bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-heading font-bold text-foreground">Files</h1>
          <div className="flex items-center gap-1">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setView("grid")}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setView("list")}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <AlertCircle className="h-12 w-12" />
            <p className="font-medium">Failed to load files</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <FolderOpen className="h-12 w-12" />
            <p className="font-medium text-foreground">No files yet</p>
            <p className="text-sm text-center max-w-md">
              Ask Autopilot to create a document, spreadsheet, or presentation to get started.
            </p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {files.map((file) => {
              const isImage = file.mime_type.startsWith("image/");
              return (
                <Card key={file.file_id} className="overflow-hidden">
                  <CardContent className="p-4 flex flex-col items-center gap-3">
                    {isImage ? (
                      <img
                        src={getFilePreviewUrl(file.file_id)}
                        alt={file.filename}
                        className="h-24 w-full object-cover rounded-md bg-muted"
                      />
                    ) : (
                      <div className="h-24 w-full flex items-center justify-center bg-muted rounded-md">
                        {getFileIcon(file.mime_type, "lg")}
                      </div>
                    )}
                    <p className="text-sm font-medium truncate w-full text-center">{file.filename}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size_bytes)}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => downloadFile(file.file_id, file.filename)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Filename</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.file_id}>
                  <TableCell>{getFileIcon(file.mime_type)}</TableCell>
                  <TableCell className="font-medium">{file.filename}</TableCell>
                  <TableCell className="text-muted-foreground">{getTypeLabel(file.mime_type)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatFileSize(file.size_bytes)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => downloadFile(file.file_id, file.filename)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </Layout>
  );
}
