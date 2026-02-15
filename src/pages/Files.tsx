import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Upload,
  Trash2,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { downloadFile, getFilePreviewUrl } from "@/lib/api";
import { listFiles, deleteFileById } from "@/services/fileService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImagePreviewDialog } from "@/components/ImagePreviewDialog";
import { FileUpload } from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";
import type { FileMetadata, FileAttachment } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

type ViewMode = "grid" | "list";
type FilterMode = "all" | "documents" | "spreadsheets" | "presentations" | "images";
type SortBy = "name" | "date" | "size";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 20;

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
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FileMetadata | null>(null);
  const [previewFile, setPreviewFile] = useState<FileAttachment | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["files", page],
    queryFn: () => listFiles(PAGE_SIZE, page * PAGE_SIZE),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFileById(id),
    onSuccess: () => {
      toast({ title: "File deleted" });
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
    onError: (err: any) => {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    },
  });

  const totalFiles = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalFiles / PAGE_SIZE));

  const files = useMemo(() => {
    let all = data?.files ?? [];

    // Filter by category
    all = all.filter((f) => matchesFilter(f.mime_type, filter));

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      all = all.filter((f) => f.filename.toLowerCase().includes(q));
    }

    // Sort
    const sorted = [...all].sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") cmp = a.filename.localeCompare(b.filename);
      else if (sortBy === "size") cmp = a.size_bytes - b.size_bytes;
      else cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [data, filter, search, sortBy, sortDir]);

  const toggleSort = (col: SortBy) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(col);
      setSortDir(col === "name" ? "asc" : "desc");
    }
  };

  const toFileAttachment = (f: FileMetadata): FileAttachment => ({
    file_id: f.file_id,
    filename: f.filename,
    mime_type: f.mime_type,
    size_bytes: f.size_bytes,
    download_url: f.download_url,
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Top bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-heading font-bold text-foreground">Files</h1>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setUploadOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
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

        {/* Search + Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <Button
                key={f.key}
                variant={filter === f.key ? "secondary" : "ghost"}
                size="sm"
                onClick={() => { setFilter(f.key); setPage(0); }}
              >
                {f.label}
              </Button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Sort controls */}
        <div className="flex gap-2">
          {(["name", "date", "size"] as SortBy[]).map((col) => (
            <Button
              key={col}
              variant={sortBy === col ? "secondary" : "ghost"}
              size="sm"
              onClick={() => toggleSort(col)}
              className="gap-1 capitalize"
            >
              {col}
              {sortBy === col && <ArrowUpDown className="h-3 w-3" />}
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
              Upload a file or ask the agent to create one to get started.
            </p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {files.map((file) => {
              const isImage = file.mime_type.startsWith("image/");
              return (
                <Card key={file.file_id} className="overflow-hidden group relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-background/80 hover:bg-destructive/20"
                    onClick={() => setDeleteTarget(file)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  <CardContent className="p-4 flex flex-col items-center gap-3">
                    {isImage ? (
                      <img
                        src={getFilePreviewUrl(file.file_id)}
                        alt={file.filename}
                        className="h-24 w-full object-cover rounded-md bg-muted cursor-pointer"
                        onClick={() => setPreviewFile(toFileAttachment(file))}
                      />
                    ) : (
                      <div className="h-24 w-full flex items-center justify-center bg-muted rounded-md">
                        {getFileIcon(file.mime_type, "lg")}
                      </div>
                    )}
                    <p className="text-sm font-medium truncate w-full text-center">{file.filename}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(file.size_bytes)}</span>
                      <span>·</span>
                      <span>{formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}</span>
                    </div>
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
                <TableHead>Uploaded</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.file_id}>
                  <TableCell>{getFileIcon(file.mime_type)}</TableCell>
                  <TableCell className="font-medium">{file.filename}</TableCell>
                  <TableCell className="text-muted-foreground">{getTypeLabel(file.mime_type)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatFileSize(file.size_bytes)}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => downloadFile(file.file_id, file.filename)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(file)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
          </DialogHeader>
          <FileUpload onClose={() => setUploadOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Image Preview */}
      <ImagePreviewDialog
        file={previewFile}
        open={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteTarget?.filename}". This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                const target = deleteTarget;
                setDeleteTarget(null);
                if (target) deleteMutation.mutate(target.file_id);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
