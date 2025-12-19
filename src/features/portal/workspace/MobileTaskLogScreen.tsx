import React, { useEffect, useRef, useState } from "react";
import type { Task, Message, TaskLogMessage } from "../types";
import { ChevronLeft, SendHorizonal, PlusCircle, ImageUp, User } from "lucide-react";
import { MessageBubble } from "@/features/portal/components/MessageBubble";
import { Badge } from "@/features/portal/components/Badge";
import { IconButton } from "@/components/ui/icon-button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";

/**
 * Helper: lấy title hiển thị cho Nhật ký công việc
 * - Ưu tiên nội dung text của sourceMessage
 * - Nếu là hình ảnh/file: hiển thị [Hình ảnh]/[Tập tin] + tên file
 * - Fallback: title của Task hoặc label chung
 */
function getTaskLogTitle(task?: Task, sourceMsg?: Message): string {
  if (sourceMsg?.type === "text" && sourceMsg.content) {
    const raw = sourceMsg.content.trim();
    return raw.length > 80 ? raw.slice(0, 77) + "…" : raw;
  }

  if (sourceMsg?.type === "image") {
    const fileName =
      sourceMsg.files?.[0]?.name || sourceMsg.fileInfo?.name || "";
    if (fileName) return `[Hình ảnh] ${fileName}`;
    return `[Hình ảnh] từ ${sourceMsg.sender}`;
  }

  if (sourceMsg?.type === "file") {
    const fileName =
      sourceMsg.files?.[0]?.name || sourceMsg.fileInfo?.name || "";
    if (fileName) return `[Tập tin] ${fileName}`;
    return `[Tập tin] từ ${sourceMsg.sender}`;
  }

  if (task?.title) return task.title;
  return "Nhật ký công việc";
}

type MobileTaskLogScreenProps = {
  /** Bật/tắt screen */
  open: boolean;
  onBack: () => void;

  /** Task tương ứng (để lấy meta như trạng thái, assignee…) */
  task?: Task;

  /** Message gốc dùng để tạo task (để lấy title) */
  sourceMessage?: Message;

  /** Danh sách message trong thread nhật ký */
  messages: TaskLogMessage[];

  /** Id user hiện tại – dùng để align bubble phải/trái */
  currentUserId: string;

  members: { id: string; name: string; avatar?: string }[];

  /**
   * Gửi message mới trong thread
   * - content: nội dung text
   * - replyToId: nếu đang trả lời 1 message khác
   */
  onSend: (payload: { content: string; replyToId?: string }) => void;
};

export const MobileTaskLogScreen: React.FC<MobileTaskLogScreenProps> = ({
  open,
  onBack,
  task,
  sourceMessage,
  messages,
  currentUserId,
  members,
  onSend,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [openActions, setOpenActions] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const title = getTaskLogTitle(task, sourceMessage);

  // Auto-scroll xuống cuối khi có message mới hoặc khi mở screen
  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open, messages.length]);

  const handleSend = () => {
    const content = inputValue.trim();
    if (!content) return;

    onSend({
      content,
    });

    setInputValue("");
  };

  const handlePickImage = () => {
    imageInputRef.current?.click();
  };

  // Get assignee name
  const assigneeName = task?.assigneeId 
    ? members.find((m) => m.id === task.assigneeId)?.name ?? "Không rõ"
    : "Chưa giao";

  // Get status badge type and label
  const getStatusBadge = () => {
    if (!task?.status) return { type: "neutral" as const, label: "—" };
    
    switch (task.status) {
      case "todo":
        return { type: "neutral" as const, label: "Chưa xử lý" };
      case "in_progress":
        return { type: "processing" as const, label: "Đang xử lý" };
      case "awaiting_review":
        return { type: "waiting" as const, label: "Chờ duyệt" };
      case "done":
        return { type: "done" as const, label: "Hoàn thành" };
      default:
        return { type: "neutral" as const, label: task.status };
    }
  };

  const statusBadge = getStatusBadge();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex flex-col bg-white">
      {/* Header - Fixed */}
      <div className="shrink-0 border-b border-gray-200 bg-white shadow-sm">
        {/* Line 1: Back button + Title + Status badge + Assignee badge */}
        <div className="flex items-center gap-2 px-3 py-2">
          <button
            onClick={onBack}
            className="inline-flex items-center justify-center rounded-full p-1.5 text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0 flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 truncate">
              Nhật Ký Công Việc
            </span>
          </div>

          {/* Status Badge */}
          <Badge type={statusBadge.type}>
            {statusBadge.label}
          </Badge>

          {/* Assignee Badge */}
          <div className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 text-xs font-medium">
            <User className="w-3 h-3" />
            <span>{assigneeName}</span>
          </div>
        </div>

        {/* Line 2: Task title */}
        <div className="px-3 pb-2 pt-0">
          <div className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
            {title}
          </div>
        </div>
      </div>

      {/* Body - Scrollable message list */}
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0 bg-green-900/15 p-2">
        {messages.length === 0 && (
          <div className="mt-20 text-center text-xs text-gray-500">
            Chưa có trao đổi nào trong nhật ký công việc này.
            <br />
            Hãy gửi tin nhắn đầu tiên để bắt đầu trao đổi.
          </div>
        )}

        {messages.map((msg, i) => {
          const prev = i > 0 ? messages[i - 1] : null;
          const next = i < messages.length - 1 ? messages[i + 1] : null;

          return (
            <MessageBubble
              key={msg.id}
              data={{
                ...msg,
                isMine: msg.senderId === currentUserId,
                groupId: "", // không dùng groupId trong task log
              }}
              prev={prev as any}
              next={next as any}
              currentUserId={currentUserId}
              disableExtraActions={true}
              isMobileLayout={true}
            />
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Composer - Fixed at bottom (mobile style from ChatMain) */}
      <div className="border-t p-2 shrink-0 pb-[calc(0.5rem+env(safe-area-inset-bottom,0))]">
        <div className="flex items-center justify-between gap-2">
          {/* PlusCircle - Action selector */}
          <Sheet open={openActions} onOpenChange={setOpenActions}>
            <SheetTrigger asChild>
              <IconButton 
                className="bg-white" 
                icon={<PlusCircle className="h-6 w-6 text-brand-600" />} 
              />
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="rounded-t-2xl p-4 shadow-2xl w-[90%] max-w-[390px] left-1/2 -translate-x-1/2 right-auto top-auto"
              style={{ 
                width: "min(90vw, 390px)",
                left: "50%",
                right: "auto",
                transform: "translateX(-50%)",
                marginBottom: "100px",
              }}
            >
              <SheetHeader className="px-1">
                <SheetTitle className="text-sm text-gray-700">Chọn hành động</SheetTitle>
                <SheetDescription className="text-xs text-gray-500">
                  Thêm nội dung vào nhật ký công việc
                </SheetDescription>
              </SheetHeader>
              <div className="mt-3 space-y-2">
                <button 
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-brand-50 transition"
                  onClick={() => {
                    setOpenActions(false);
                    handlePickImage();
                  }}
                >
                  <ImageUp className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm text-gray-800">Ảnh</span>
                </button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Input */}
          <div className="flex-1">
            <input
              className="w-full h-11 rounded-full border border-gray-300 px-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300"
              placeholder="Nhập nội dung…"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>

          {/* ImageUp - Quick image attach */}
          <IconButton 
            onClick={handlePickImage} 
            className="bg-white" 
            icon={<ImageUp className="h-6 w-6 text-brand-600" />} 
          />
        </div>

        {/* Hidden image input */}
        <input 
          ref={imageInputRef} 
          type="file" 
          accept="image/*" 
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            // Handle image upload here
            e.currentTarget.value = "";
          }}
        />
      </div>
    </div>
  );
};
