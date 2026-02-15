import { useEffect } from "react";

interface ShortcutHandlers {
  onCommandPalette?: () => void;
  onNewTask?: () => void;
}

export function useKeyboardShortcuts({ onCommandPalette, onNewTask }: ShortcutHandlers) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "k") {
        e.preventDefault();
        onCommandPalette?.();
      }
      if (mod && e.key === "n") {
        e.preventDefault();
        onNewTask?.();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onCommandPalette, onNewTask]);
}
