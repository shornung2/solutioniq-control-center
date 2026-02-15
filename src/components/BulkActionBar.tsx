import { Button } from "@/components/ui/button";
import { Trash2, Download, X } from "lucide-react";

interface BulkActionBarProps {
  count: number;
  onDelete?: () => void;
  onExport?: () => void;
  onClear: () => void;
}

export function BulkActionBar({ count, onDelete, onExport, onClear }: BulkActionBarProps) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2 shadow-lg">
      <span className="text-sm font-medium">{count} selected</span>
      {onExport && (
        <Button size="sm" variant="outline" className="gap-1" onClick={onExport}>
          <Download className="h-3 w-3" /> Export
        </Button>
      )}
      {onDelete && (
        <Button size="sm" variant="destructive" className="gap-1" onClick={onDelete}>
          <Trash2 className="h-3 w-3" /> Delete
        </Button>
      )}
      <Button size="sm" variant="ghost" onClick={onClear}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
