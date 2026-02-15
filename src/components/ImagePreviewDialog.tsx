import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { FileAttachment } from "@/lib/types";
import { downloadFile, getFilePreviewUrl } from "@/lib/api";

interface ImagePreviewDialogProps {
  file: FileAttachment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImagePreviewDialog({ file, open, onOpenChange }: ImagePreviewDialogProps) {
  if (!file) return null;

  const imgSrc = getFilePreviewUrl(file.file_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="truncate">{file.filename}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <img
            src={imgSrc}
            alt={file.filename}
            className="max-h-[60vh] rounded-md object-contain"
          />
          <Button
            variant="outline"
            onClick={() => downloadFile(file.file_id, file.filename)}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
