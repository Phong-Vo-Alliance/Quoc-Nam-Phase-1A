import React, { useState, useRef } from "react";
import { ChevronLeft, Star, File, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { PinnedMessage, FileAttachment } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  pinnedMessages: PinnedMessage[];
  onUnpin: (id: string) => void;
  onOpenChat: (msg: PinnedMessage) => void;
  onPreview?:  (file: FileAttachment) => void;
}

export const PinnedMessagesManagerMobile:  React.FC<Props> = ({
  open,
  onClose,
  pinnedMessages,
  onUnpin,
  onOpenChat,
  onPreview,
}) => {
  // UI states
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnpinConfirm, setShowUnpinConfirm] = useState(false);
  const [messageToUnpin, setMessageToUnpin] = useState<PinnedMessage | null>(null);

  // Animation states
  const [unpinningId, setUnpinningId] = useState<string | null>(null);
  const [pressingId, setPressingId] = useState<string | null>(null);

  // Touch/mouse refs
  const longPressTimer = useRef<NodeJS. Timeout | null>(null);
  const isMouseDown = useRef<boolean>(false);
  const mouseDownTime = useRef<number>(0);

  // ==================== HELPERS ====================

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return "";

    const time = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const day = date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });

    return `${time} ${day}`;
  };

  const formatDateLabel = (dateKey: string): string => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date. now() - 86400000).toISOString().split("T")[0];

    if (dateKey === today) return "HÔM NAY";
    if (dateKey === yesterday) return "HÔM QUA";

    const date = new Date(dateKey);
    const weekday = date. toLocaleDateString("vi-VN", { weekday: "short" });
    const day = date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });

    return `${weekday.toUpperCase()}, ${day}`;
  };

  // Group messages by date
  const groupedByDate = React.useMemo(() => {
    const groups:  Record<string, PinnedMessage[]> = {};

    pinnedMessages.forEach((msg) => {
      const date = new Date(msg.time);
      let dateKey:  string;

      if (isNaN(date.getTime())) {
        dateKey = new Date().toISOString().split("T")[0];
      } else {
        dateKey = date.toISOString().split("T")[0];
      }

      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(msg);
    });

    // Sort dates descending (newest first)
    const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));

    const sorted: Record<string, PinnedMessage[]> = {};
    sortedKeys.forEach((key) => {
      sorted[key] = groups[key];
    });

    return sorted;
  }, [pinnedMessages]);

  // Filter by search
  const filteredGroups = React.useMemo(() => {
    if (!searchQuery. trim()) return groupedByDate;

    const filtered:  Record<string, PinnedMessage[]> = {};
    Object. entries(groupedByDate).forEach(([date, messages]) => {
      const matching = messages.filter(
        (m) =>
          m.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.groupName.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (matching.length > 0) {
        filtered[date] = matching;
      }
    });

    return filtered;
  }, [groupedByDate, searchQuery]);

  // ==================== HANDLERS ====================

  const handleOpenMessage = (msg: PinnedMessage) => {
    onClose();
    onOpenChat(msg);
  };

  const handleQuickUnpin = (msg: PinnedMessage, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();

    setUnpinningId(msg.id);

    setTimeout(() => {
      onUnpin(msg.id);
      setUnpinningId(null);
    }, 300);
  };

  const handleLongPressUnpin = (msg: PinnedMessage) => {
    setMessageToUnpin(msg);
    setShowUnpinConfirm(true);
  };

  const confirmUnpin = () => {
    if (!messageToUnpin) return;

    setUnpinningId(messageToUnpin.id);

    setTimeout(() => {
      onUnpin(messageToUnpin. id);
      setUnpinningId(null);
      setMessageToUnpin(null);
      setShowUnpinConfirm(false);
    }, 300);
  };

  // ==================== TOUCH HANDLERS ====================

  const handleTouchStart = (msg: PinnedMessage, e: React.TouchEvent) => {
    longPressTimer.current = setTimeout(() => {
      handleLongPressUnpin(msg);
    }, 500);
  };

  const handleTouchMove = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer. current);
      longPressTimer.current = null;
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer. current);
      longPressTimer.current = null;
    }
  };

  // ==================== MOUSE HANDLERS ====================

  const handleMouseDown = (msg: PinnedMessage, e:  React.MouseEvent) => {
    e.preventDefault();

    isMouseDown.current = true;
    mouseDownTime.current = Date.now();
    setPressingId(msg.id);

    longPressTimer.current = setTimeout(() => {
      if (isMouseDown.current) {
        handleLongPressUnpin(msg);
        setPressingId(null);
      }
    }, 500);
  };

  const handleMouseMove = () => {
    if (isMouseDown.current && longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      setPressingId(null);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();

    isMouseDown.current = false;
    setPressingId(null);

    if (longPressTimer. current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    mouseDownTime.current = 0;
  };

  const handleMouseLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    isMouseDown.current = false;
    setPressingId(null);
  };

  if (!open) return null;

  const hasMessages = Object.keys(filteredGroups).length > 0;

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
            <h1 className="text-sm font-semibold text-gray-900">Tin đánh dấu</h1>
            {pinnedMessages.length > 0 && (
              <p className="text-xs text-gray-500">
                {pinnedMessages.length} tin nhắn
              </p>
            )}
          </div>

          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-full hover:bg-brand-50 active:bg-brand-100 transition"
          >
            {showSearch ? (
              <X className="h-5 w-5 text-brand-600" />
            ) : (
              <Search className="h-5 w-5 text-brand-600" />
            )}
          </button>
        </div>

        {/* Search bar */}
        {showSearch && (
          <div className="px-3 pb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo người gửi hoặc nội dung..."
              autoFocus
              className="
                w-full px-3 py-2 rounded-lg
                border border-gray-300
                focus:outline-none focus: ring-2 focus:ring-brand-300
                text-sm
              "
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-4 bg-gray-50">
        {/* Empty state */}
        {! hasMessages && ! searchQuery && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <Star className="h-16 w-16 text-brand-400 mb-4" />
            <p className="text-sm text-gray-600 max-w-[280px]">
              Đánh dấu tin nhắn để có thể tìm lại nhanh chóng.  Các tin nhắn được
              đánh dấu sẽ xuất hiện ở đây.
            </p>
          </div>
        )}

        {/* No search results */}
        {!hasMessages && searchQuery && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-400">
              Không tìm thấy tin nhắn phù hợp
            </p>
          </div>
        )}

        {/* Date-grouped messages */}
        {hasMessages && (
          <div className="space-y-6">
            {Object.entries(filteredGroups).map(([date, messages]) => (
              <div key={date}>
                {/* Date header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px flex-1 bg-gray-300" />
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    {formatDateLabel(date)}
                  </span>
                  <div className="h-px flex-1 bg-gray-300" />
                </div>

                {/* Messages */}
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`
                        relative bg-white rounded-lg border border-gray-200 p-3 shadow-sm
                        cursor-pointer active:bg-gray-50 transition-all
                        ${pressingId === msg.id ? "scale-[0.98] opacity-90" : ""}
                        ${unpinningId === msg.id ?  "animate-unpin" : ""}
                      `}
                      onClick={() => handleOpenMessage(msg)}
                      onTouchStart={(e) => handleTouchStart(msg, e)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      onMouseDown={(e) => handleMouseDown(msg, e)}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* Header:  Sender + Time + Unpin */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-gray-800">
                            {msg.sender}
                          </span>
                          <span className="text-xs text-gray-400 ml-2">
                            {formatTime(msg.time)}
                          </span>
                        </div>

                        {/* Unpin icon */}
                        <button
                          onClick={(e) => handleQuickUnpin(msg, e)}
                          className="shrink-0 p-1 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                        >
                          <Star className="h-4 w-4 text-brand-600 fill-brand-600" />
                        </button>
                      </div>

                      {/* Content based on type */}
                      {msg. type === "text" && msg.content && (
                        <p className="text-sm text-gray-700 line-clamp-3 mb-2 break-words">
                          {msg.content}
                        </p>
                      )}

                      {msg.type === "image" && msg.fileInfo && (
                        <div className="mb-2">
                          <img
                            src={msg.fileInfo.url}
                            alt={msg.fileInfo.name}
                            className="w-full h-32 object-cover rounded-md border border-gray-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPreview?.(msg.fileInfo! );
                            }}
                          />
                        </div>
                      )}

                      {msg.type === "file" && msg.fileInfo && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-50 border border-gray-200 mb-2">
                          <File className="h-4 w-4 text-gray-500 shrink-0" />
                          <span className="text-sm text-gray-700 truncate">
                            {msg.fileInfo.name}
                          </span>
                        </div>
                      )}

                      {/* Footer: Group + WorkType */}
                      <div className="text-xs text-gray-500">
                        {msg.groupName}
                        {msg.workTypeName && (
                          <>
                            {" "}•{" "}
                            <span className="text-brand-600">
                              {msg.workTypeName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Safe area */}
        <div className="h-[calc(env(safe-area-inset-bottom,0px)+1rem)]" />
      </div>

      {/* Unpin Confirmation Dialog */}
      <Dialog open={showUnpinConfirm} onOpenChange={setShowUnpinConfirm}>
        <DialogContent className="w-[92vw] max-w-[340px] left-1/2 -translate-x-1/2 right-auto z-[80]">
          <DialogHeader>
            <DialogTitle className="text-sm">Bỏ đánh dấu tin nhắn</DialogTitle>
          </DialogHeader>

          <div className="py-3">
            <p className="text-sm text-gray-600 mb-3">
              Bạn có chắc muốn bỏ đánh dấu tin nhắn này? 
            </p>

            {/* Preview of message being unpinned */}
            {messageToUnpin && (
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <div className="text-xs text-gray-600 mb-1">
                  {messageToUnpin.sender} • {formatTime(messageToUnpin.time)}
                </div>
                <div className="text-sm text-gray-800 line-clamp-2">
                  {messageToUnpin.type === "text"
                    ? messageToUnpin.content
                    : `[${
                        messageToUnpin.type === "image" ? "Hình ảnh" : "File"
                      }]`}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowUnpinConfirm(false)}
                className="
                  flex-1 py-2.5 rounded-lg
                  bg-gray-100 text-gray-700 text-sm font-medium
                  active:bg-gray-200 transition-colors
                "
              >
                Hủy
              </button>
              <button
                onClick={confirmUnpin}
                className="
                  flex-1 py-2.5 rounded-lg
                  bg-brand-600 text-white text-sm font-medium
                  active:bg-brand-700 transition-colors
                "
              >
                Bỏ đánh dấu
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Animations */}
      <style>{`
        @keyframes unpin {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.95);
          }
          100% {
            opacity: 0;
            transform: scale(0. 9);
            height: 0;
            margin:  0;
            padding: 0;
          }
        }
        . animate-unpin {
          animation: unpin 300ms ease-out forwards;
        }
      `}</style>
    </div>
  );
};