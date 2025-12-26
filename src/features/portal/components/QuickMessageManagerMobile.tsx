import React, { useState, useRef } from "react";
import { ChevronLeft, Plus, Pencil, Trash2, Copy } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface QuickMessage {
  id: number;
  shortcut: string;
  content:  string;
}

export const QuickMessageManagerMobile:  React.FC<{
  open: boolean;
  onClose:  () => void;
}> = ({ open, onClose }) => {
  // State
  const [messages, setMessages] = useState<QuickMessage[]>([
    {
      id: 1,
      shortcut: "xinchao",
      content: "Cảm ơn bạn đã nhắn tin. Mình có thể giúp gì cho bạn?",
    },
    {
      id: 2,
      shortcut: "camondh",
      content: "Em sẽ xử lý yêu cầu này ngay bây giờ.  Cảm ơn anh/chị đã thông tin!",
    },
  ]);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<QuickMessage | null>(null);
  const [shortcut, setShortcut] = useState("");
  const [content, setContent] = useState("");

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<QuickMessage | null>(null);

  // Context menu state
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuMessage, setContextMenuMessage] = useState<QuickMessage | null>(null);

  // Animation states
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Swipe state
  const [swipedId, setSwipedId] = useState<number | null>(null);
  const touchStartX = useRef<number>(0);
  const touchCurrentX = useRef<number>(0);
  
  // Mouse support
  const mouseDownTime = useRef<number>(0);
  const isMouseDown = useRef<boolean>(false);

  // Helpers
  const resetForm = () => {
    setEditing(null);
    setShortcut("");
    setContent("");
    setShowForm(false);
  };

  const handleSave = () => {
    if (! shortcut.trim() || !content.trim()) return;

    const cleanShortcut = shortcut.trim().replace(/^\/+/, ""); // Remove leading slashes

    if (editing) {
      // Update existing
      setMessages((prev) =>
        prev.map((m) =>
          m.id === editing.id
            ? { ... m, shortcut:  cleanShortcut, content:  content. trim() }
            : m
        )
      );
      setHighlightedId(editing.id);
    } else {
      // Add new
      const newId = Date.now();
      setMessages((prev) => [
        { id: newId, shortcut:  cleanShortcut, content: content.trim() },
        ...prev,
      ]);
      setHighlightedId(newId);
    }

    resetForm();
    setTimeout(() => setHighlightedId(null), 1500);
  };

  const handleDelete = (msg: QuickMessage) => {
    setMessageToDelete(msg);
    setShowDeleteConfirm(true);
    setShowContextMenu(false);
  };

  const confirmDelete = () => {
    if (! messageToDelete) return;

    setDeletingId(messageToDelete. id);
    setSwipedId(null); // Reset swipe

    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== messageToDelete.id));
      setDeletingId(null);
      setMessageToDelete(null);
      setShowDeleteConfirm(false);
    }, 300);
  };

  const handleEdit = (msg: QuickMessage) => {
    setEditing(msg);
    setShortcut(msg.shortcut);
    setContent(msg.content);
    setShowForm(true);
    setShowContextMenu(false);
  };

  const handleCopy = (msg: QuickMessage) => {
    navigator.clipboard.writeText(msg.content);
    setShowContextMenu(false);
    // Optional: Show toast notification
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  // Long press detection
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = (msg: QuickMessage, e: React.TouchEvent) => {
    // Prevent default to avoid conflicts with scroll
    e.preventDefault();

    // Start swipe tracking
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX; // ✅ Initialize current position

    // Start long press timer
    longPressTimer.current = setTimeout(() => {
      setContextMenuMessage(msg);
      setShowContextMenu(true);
      // Reset swipe tracking when long press activates
      touchStartX.current = 0;
      touchCurrentX.current = 0;
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Track swipe distance
    touchCurrentX.current = e.touches[0].clientX;

    // Cancel long press if user moves finger > 10px (not a tap)
    const moveDistance = Math.abs(touchStartX.current - touchCurrentX.current);
    if (moveDistance > 10 && longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchEnd = (msg: QuickMessage) => {
    // Clear long press timer if still pending
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    const swipeDistance = touchStartX.current - touchCurrentX.current;

    // Only process swipe if we have valid touch data
    if (touchStartX.current === 0) return;

    // If swiped left > 80px, reveal delete button
    if (swipeDistance > 80) {
      setSwipedId(msg.id);
    } else if (swipeDistance < -20) {
      // Swipe right to close
      setSwipedId(null);
    }

    // Reset touch tracking
    touchStartX.current = 0;
    touchCurrentX.current = 0;
  };

  // Mouse long press handlers
  const handleMouseDown = (msg: QuickMessage, e: React.MouseEvent) => {
    e.preventDefault();

    isMouseDown.current = true;
    mouseDownTime.current = Date.now();

    // Start long press timer (same as touch)
    longPressTimer.current = setTimeout(() => {
      if (isMouseDown.current) {
        setContextMenuMessage(msg);
        setShowContextMenu(true);
      }
    }, 500);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Cancel long press if mouse moves while pressed
    if (isMouseDown.current && longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleMouseUp = (msg: QuickMessage, e: React.MouseEvent) => {
    e.preventDefault();

    isMouseDown.current = false;

    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Calculate how long mouse was pressed
    const pressDuration = Date.now() - mouseDownTime.current;

    // If it was a quick click (< 200ms), do nothing (just deselect any swipe)
    if (pressDuration < 200) {
      // Optional: Close any open swipe state
      setSwipedId(null);
    }

    mouseDownTime.current = 0;
  };

  const handleMouseLeave = () => {
    // Cancel long press if mouse leaves the card
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    isMouseDown.current = false;
  };

  if (! open) return null;

  return (
    <div className="absolute inset-0 z-[70] bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-3 py-3">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition"
          >
            <ChevronLeft className="h-5 w-5 text-brand-600" />
          </button>

          <div className="flex-1 text-center">
            <h1 className="text-sm font-semibold text-gray-900">Tin nhắn nhanh</h1>
          </div>

          <button
            onClick={handleAddNew}
            className="p-2 rounded-full hover: bg-brand-50 active:bg-brand-100 transition"
          >
            <Plus className="h-5 w-5 text-brand-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-400">Chưa có tin nhắn nào</p>
            <button
              onClick={handleAddNew}
              className="mt-3 text-xs text-brand-600 underline"
            >
              Thêm tin nhắn đầu tiên
            </button>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`
              relative overflow-hidden
              transition-all duration-300
              touch-pan-y
              ${highlightedId === msg.id ?  "animate-highlight" : ""}
              ${deletingId === msg.id ? "animate-delete" : ""}
            `}
            style={{ touchAction: "pan-y" }}
            onTouchStart={(e) => handleTouchStart(msg, e)}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => handleTouchEnd(msg)}
            
            onMouseDown={(e) => handleMouseDown(msg, e)}
            onMouseMove={handleMouseMove}
            onMouseUp={(e) => handleMouseUp(msg, e)}
            onMouseLeave={handleMouseLeave}
          >
            {/* Delete background (revealed on swipe) */}
            <div
              className={`
                absolute inset-y-0 right-0 w-20
                bg-rose-500 flex items-center justify-center
                transition-opacity duration-200
                ${swipedId === msg.id ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
              `}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(msg);
              }}
            >
              <Trash2 className="h-5 w-5 text-white" />
            </div>

            {/* Card content */}
            <div
              className="
                relative bg-white rounded-lg border border-gray-200 p-3 shadow-sm
                transition-transform duration-200
              "
              style={{
                transform: swipedId === msg.id ? "translateX(-80px)" : "translateX(0)",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {/* Shortcut */}
                  <div className="inline-block px-2 py-0.5 rounded-md bg-brand-50 border border-brand-200 mb-1">
                    <span className="text-xs font-semibold text-brand-700">
                      /{msg.shortcut}
                    </span>
                  </div>

                  {/* Content */}
                  <p className="text-sm text-gray-700 leading-snug line-clamp-2">
                    {msg.content}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Safe area */}
        <div className="h-[calc(env(safe-area-inset-bottom,0px)+1rem)]" />
      </div>

      {/* Bottom Sheet - Add/Edit Form */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl p-0 w-[92vw] max-w-[430px] left-1/2 -translate-x-1/2 right-auto top-auto z-[80]"
        >
          <SheetHeader className="px-4 py-4 border-b">
            <SheetTitle className="text-sm">
              {editing ? "Sửa tin nhắn nhanh" : "Thêm tin nhắn nhanh"}
            </SheetTitle>
          </SheetHeader>

          <div className="px-4 py-4 space-y-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
            {/* Shortcut input */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Phím tắt <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  /
                </span>
                <input
                  type="text"
                  value={shortcut}
                  onChange={(e) => setShortcut(e.target.value)}
                  placeholder="xinchao"
                  autoFocus
                  className="
                    w-full pl-7 pr-3 py-2. 5 rounded-lg
                    border border-gray-300
                    focus:outline-none focus:ring-2 focus:ring-brand-300
                    text-sm
                  "
                />
              </div>
            </div>

            {/* Content textarea */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Nội dung tin nhắn <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập nội dung tin nhắn..."
                rows={4}
                className="
                  w-full px-3 py-2.5 rounded-lg
                  border border-gray-300
                  focus: outline-none focus:ring-2 focus:ring-brand-300
                  text-sm resize-none
                "
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={resetForm}
                className="
                  flex-1 py-2.5 rounded-lg
                  bg-gray-100 text-gray-700 text-sm font-medium
                  active:bg-gray-200 transition-colors
                "
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={!shortcut.trim() || !content.trim()}
                className="
                  flex-1 py-2.5 rounded-lg
                  bg-brand-600 text-white text-sm font-medium
                  active:bg-brand-700 transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                Lưu
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Context Menu - Long Press */}
      <Sheet open={showContextMenu} onOpenChange={setShowContextMenu}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl p-0 w-[92vw] max-w-[430px] left-1/2 -translate-x-1/2 right-auto top-auto z-[80]"
        >
          <SheetHeader className="px-4 py-3 border-b">
            <SheetTitle className="text-sm">
              /{contextMenuMessage?.shortcut}
            </SheetTitle>
          </SheetHeader>

          <div className="px-3 py-3 space-y-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
            <button
              onClick={() => contextMenuMessage && handleEdit(contextMenuMessage)}
              className="
                w-full flex items-center gap-3 px-3 py-3 rounded-lg
                bg-white border border-gray-200
                active:bg-gray-50 transition-colors
              "
            >
              <Pencil className="h-4 w-4 text-brand-600" />
              <span className="text-sm text-gray-700">Chỉnh sửa</span>
            </button>

            <button
              onClick={() => contextMenuMessage && handleCopy(contextMenuMessage)}
              className="
                w-full flex items-center gap-3 px-3 py-3 rounded-lg
                bg-white border border-gray-200
                active:bg-gray-50 transition-colors
              "
            >
              <Copy className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">Sao chép nội dung</span>
            </button>

            <button
              onClick={() => contextMenuMessage && handleDelete(contextMenuMessage)}
              className="
                w-full flex items-center gap-3 px-3 py-3 rounded-lg
                bg-white border border-rose-200
                active:bg-rose-50 transition-colors
              "
            >
              <Trash2 className="h-4 w-4 text-rose-600" />
              <span className="text-sm text-rose-600">Xóa</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="w-[92vw] max-w-[340px] left-1/2 -translate-x-1/2 right-auto z-[80]">
          <DialogHeader>
            <DialogTitle className="text-sm">Xác nhận xóa</DialogTitle>
          </DialogHeader>

          <div className="py-3">
            <p className="text-sm text-gray-600">
              Bạn có chắc muốn xóa tin nhắn{" "}
              <span className="font-semibold text-gray-900">
                "/{messageToDelete?.shortcut}"
              </span>
              ?
            </p>
          </div>

          <DialogFooter>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="
                  flex-1 py-2.5 rounded-lg
                  bg-gray-100 text-gray-700 text-sm font-medium
                  active:bg-gray-200 transition-colors
                "
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="
                  flex-1 py-2.5 rounded-lg
                  bg-rose-600 text-white text-sm font-medium
                  active:bg-rose-700 transition-colors
                "
              >
                Xóa
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Animations */}
      <style>{`
        @keyframes highlight {
          0%, 100% { background-color:  white; }
          50% { background-color: #f0fdf4; }
        }
        . animate-highlight {
          animation: highlight 1. 5s ease-in-out;
        }

        @keyframes delete {
          0% { opacity: 1; transform: translateX(0); }
          50% { opacity: 0. 5; transform: translateX(-20px); }
          100% { opacity: 0; transform: translateX(-100%); margin-bottom: 0; padding: 0; height: 0; }
        }
        .animate-delete {
          animation: delete 300ms ease-out forwards;
        }
      `}</style>
    </div>
  );
};