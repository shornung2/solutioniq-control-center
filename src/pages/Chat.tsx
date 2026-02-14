import { useState, useRef, useEffect, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Bot,
  User,
  Loader2,
  Plus,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  Search,
  Mail,
  Swords,
  Trash2,
} from "lucide-react";
import { useChat, useConversations, type LocalMessage } from "@/hooks/use-chat";
import { useWebSocketContext } from "@/contexts/WebSocketContext";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useIsMobile } from "@/hooks/use-mobile";
import { FileCard } from "@/components/FileCard";
import { ImagePreviewDialog } from "@/components/ImagePreviewDialog";
import { FeedbackStars } from "@/components/FeedbackStars";
import { downloadFile } from "@/lib/api";
import type { FileAttachment } from "@/lib/types";
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

const STARTERS = [
  { text: "What can you help me with?", icon: Sparkles },
  { text: "Research a company", icon: Search },
  { text: "Draft a follow-up email", icon: Mail },
  { text: "Create a competitive battlecard", icon: Swords },
];

function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

function MessageBubble({
  msg,
  onImagePreview,
}: {
  msg: LocalMessage;
  onImagePreview: (file: FileAttachment) => void;
}) {
  const isUser = msg.role === "user";
  const hasFiles = !isUser && msg.files && msg.files.length > 0;

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser ? "bg-secondary/30" : "bg-primary/20"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-secondary" />
        ) : msg.status === "typing" ? (
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
        ) : (
          <Bot className="h-4 w-4 text-primary" />
        )}
      </div>
      <div className="max-w-[75%] flex flex-col gap-1">
        <div
          className={`rounded-lg px-4 py-2 text-sm ${
            msg.status === "error"
              ? "bg-destructive/15 text-destructive"
              : msg.status === "typing"
                ? "bg-muted text-muted-foreground"
                : isUser
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
          }`}
        >
          {msg.status === "typing" ? (
            <TypingIndicator />
          ) : isUser ? (
            <p>{msg.content}</p>
          ) : (
            <div className="markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.content}
              </ReactMarkdown>
            </div>
          )}
          {msg.status === "degraded" && (
            <Badge
              variant="outline"
              className="mt-1 text-[10px] border-primary/50 text-primary"
            >
              limited mode
            </Badge>
          )}
        </div>
        {hasFiles && (
          <div className="flex flex-wrap gap-2 mt-2">
            {msg.files!.map((file) => (
              <FileCard
                key={file.file_id}
                file={file}
                onDownload={(f) => downloadFile(f.file_id, f.filename)}
                onPreview={onImagePreview}
              />
            ))}
          </div>
        )}
        {!isUser && msg.lane && msg.status !== "typing" && (
          <span className="text-[10px] text-muted-foreground/70 px-1">
            {msg.lane} · ${msg.cost_usd?.toFixed(4) ?? "0.00"}
          </span>
        )}
        {!isUser && msg.task_id && msg.status !== "typing" && msg.status !== "sending" && (
          <FeedbackStars taskId={msg.task_id} />
        )}
      </div>
    </div>
  );
}

export default function Chat() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const websocket = useWebSocketContext();
  const {
    messages,
    isLoading,
    activeConversationId,
    selectConversation,
    startNewConversation,
    sendMessage,
    isSending,
    deleteConversation,
  } = useChat(websocket);
  const { data: conversations = [], isLoading: convsLoading } =
    useConversations();

  const [input, setInput] = useState("");
  const [previewFile, setPreviewFile] = useState<FileAttachment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [activeConversationId]);

  const handleSend = useCallback(
    (text?: string) => {
      const msg = (text ?? input).trim();
      if (!msg || isSending) return;
      sendMessage(msg);
      if (!text) setInput("");
      setTimeout(() => textareaRef.current?.focus(), 50);
    },
    [input, isSending, sendMessage]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleTextareaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 96) + "px"; // max 3 lines ~96px
  };

  const showEmptyState =
    !activeConversationId && messages.length === 0 && !isLoading;

  return (
    <Layout>
      <div className="flex h-[calc(100vh-8rem)] gap-0 overflow-hidden rounded-lg border border-border">
        {/* Conversation sidebar */}
        {sidebarOpen && (
          <div
            className={`${
              isMobile
                ? "absolute inset-y-0 left-0 z-30 w-72"
                : "w-72 shrink-0"
            } flex flex-col border-r border-border bg-sidebar-background text-sidebar-foreground`}
          >
            <div className="flex items-center justify-between p-3 border-b border-sidebar-border">
              <Button
                size="sm"
                variant="ghost"
                className="flex-1 justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={() => {
                  startNewConversation();
                  if (isMobile) setSidebarOpen(false);
                }}
              >
                <Plus className="h-4 w-4" />
                New Conversation
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={() => setSidebarOpen(false)}
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {convsLoading ? (
                <div className="p-3 space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full bg-sidebar-accent/50" />
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <p className="text-xs text-sidebar-foreground/50 p-4 text-center">
                  No conversations yet
                </p>
              ) : (
                conversations.map((c) => (
                  <div
                    key={c.id}
                    className={`group relative w-full text-left px-3 py-3 hover:bg-sidebar-accent transition-colors cursor-pointer ${
                      activeConversationId === c.id
                        ? "bg-sidebar-accent border-l-2 border-primary"
                        : "border-l-2 border-transparent"
                    }`}
                    onClick={() => {
                      selectConversation(c.id);
                      if (isMobile) setSidebarOpen(false);
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium truncate flex-1">
                        {c.title.length > 45
                          ? c.title.slice(0, 45) + "…"
                          : c.title}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(c.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-destructive/20"
                          aria-label="Delete conversation"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </button>
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-sidebar-accent text-sidebar-foreground"
                        >
                          {c.message_count}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-[11px] text-sidebar-foreground/50">
                      {formatDistanceToNow(new Date(c.last_message_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card">
            {!sidebarOpen && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSidebarOpen(true)}
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            )}
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-heading font-bold">Chat</h2>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-3/4" />
                ))}
              </div>
            ) : showEmptyState ? (
              <div className="flex flex-col items-center justify-center h-full gap-6">
                <div className="text-center space-y-2">
                  <Bot className="h-10 w-10 mx-auto text-primary/60" />
                  <h3 className="font-heading text-lg font-bold">
                    How can I help?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Start a conversation or pick a suggestion below
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 max-w-md w-full">
                  {STARTERS.map((s) => (
                    <button
                      key={s.text}
                      onClick={() => handleSend(s.text)}
                      className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-left text-sm"
                    >
                      <s.icon className="h-4 w-4 text-primary shrink-0" />
                      <span>{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} onImagePreview={setPreviewFile} />
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 flex gap-2 bg-card">
            <textarea
              ref={textareaRef}
              placeholder="Type a message..."
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isSending}
              className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ maxHeight: 96 }}
            />
            <Button
              size="icon"
              onClick={() => handleSend()}
              disabled={isSending || !input.trim()}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
      <ImagePreviewDialog
        file={previewFile}
        open={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
      />
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this conversation and all its messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                const target = deleteTarget;
                setDeleteTarget(null);
                if (target) {
                  await deleteConversation(target);
                }
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
