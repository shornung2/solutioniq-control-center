import { useState, useRef, useCallback } from "react";
import { Upload, X, FileIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { uploadFile, validateFile } from "@/services/fileService";

interface FileUploadProps {
  onClose?: () => void;
  onUploaded?: (fileId: string) => void;
}

export function FileUpload({ onClose, onUploaded }: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFile = useCallback(
    (file: File) => {
      const error = validateFile(file);
      if (error) {
        toast({ title: "Invalid file", description: error, variant: "destructive" });
        return;
      }
      setSelectedFile(file);
    },
    [toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setProgress(20);
    try {
      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + 15, 90));
      }, 300);
      const result = await uploadFile(selectedFile);
      clearInterval(interval);
      setProgress(100);
      toast({ title: "File uploaded", description: selectedFile.name });
      queryClient.invalidateQueries({ queryKey: ["files"] });
      onUploaded?.(result.file_id);
      setTimeout(() => {
        setSelectedFile(null);
        setProgress(0);
        setUploading(false);
        onClose?.();
      }, 500);
    } catch (err: any) {
      setUploading(false);
      setProgress(0);
      toast({
        title: "Upload failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
      >
        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm font-medium">
          Drag & drop a file here, or click to browse
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Images, PDFs, Office docs, text, JSON — up to 100MB
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>

      {selectedFile && (
        <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
          <FileIcon className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          {!uploading && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedFile(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {uploading && <Progress value={progress} className="h-2" />}

      <div className="flex justify-end gap-2">
        {onClose && (
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
        )}
        <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
