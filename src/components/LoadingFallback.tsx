import { Loader2 } from "lucide-react";

export function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
