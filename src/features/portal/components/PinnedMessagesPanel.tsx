import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star, StarOff, Quote, ImageIcon, File } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { PinnedMessage, FileAttachment } from "@/features/portal/types";

interface Props {
  messages: PinnedMessage[];
  onClose: () => void;
  onOpenChat: (msg: PinnedMessage) => void;
  onUnpin?: (id: string) => void;
  onPreview?: (file: FileAttachment) => void;
}

export const PinnedMessagesPanel: React.FC<Props> = ({
  messages,
  onClose,
  onOpenChat,
  onUnpin,
  onPreview,
}) => {
  // const [messages, setMessages] = useState(initialMessages);
  // const [pinnedMessages, setPinnedMessages] = React.useState<PinnedMessage[]>([]);

  // const handleUnpin = (id: string) => {
  //   setPinnedMessages((prev) => prev.filter((m) => m.id !== id));
  // };

  const grouped = React.useMemo(() => {
    const groups: Record<string, PinnedMessage[]> = {};
    messages.forEach((m) => {
      let dateObj = new Date(m.time);

      // Nếu không phải ngày hợp lệ → fallback về hôm nay
      if (isNaN(dateObj.getTime())) {
        dateObj = new Date();
      }

      // toISOString luôn an toàn
      const dateKey = dateObj.toISOString().split("T")[0];

      // group theo key này
      groups[dateKey] = groups[dateKey] ? [...groups[dateKey], m] : [m];
    });
    return groups;
  }, [messages]);

  const hasMessages = messages.length > 0;
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  return (
    <aside className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-y-auto min-h-0">
      <div className="border-b border-gray-200 p-3">        
        <div className="mt-3 flex items-center gap-2">
          <Input placeholder="Tìm kiếm" className="h-9 text-sm" />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="font-medium">Tin Đánh Dấu</div>
      </div>

      {/* Body */}
      <ScrollArea className="flex-1 py-3">
        {!hasMessages ? (
          <div className="flex flex-col items-center justify-center text-center text-gray-500 mt-16">
            <Star className="h-12 w-12 text-brand-400 mb-3" />
            <p className="text-sm max-w-[220px]">
              Đánh dấu tin nhắn để có thể tìm lại một cách nhanh chóng. Các tin
              nhắn được đánh dấu sẽ xuất hiện ở đây.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([date, msgs]) => (
              <div key={date}>
                <p className="text-xs text-gray-500 font-medium mb-1 px-3">
                  {date === today ? "Hôm nay" : date === yesterday ? "Hôm qua" : new Date(date).toLocaleDateString("vi-VN")}
                </p>
                <div>
                  {msgs.map((msg) => {
                    // SAFE PARSE
                    const dt = new Date(msg.time);
                    const isValid = !isNaN(dt.getTime());
                    const displayDate = isValid ? dt.toLocaleDateString("vi-VN") : "";
                    const displayTime = isValid ? dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

                    return (
                      <div
                        key={msg.id}
                        onClick={() => onOpenChat(msg)}
                        className="group relative cursor-pointer border-b border-brand-200 hover:bg-brand-50 transition-all p-3 pr-8" // pr-8 để tránh icon tràn
                      >
                        {/* Star icon top-right */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110"
                                onClick={(e) => {
                                  e.stopPropagation(); // không kích hoạt onOpenChat
                                  onUnpin?.(msg.id);
                                }}
                              >
                                <StarOff
                                  size={17}
                                  className="text-brand-500 hover:text-rose-500 cursor-pointer transition-colors"
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="bg-brand-600 text-white text-xs px-2 py-1 rounded">
                              Bỏ đánh dấu tin nhắn
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Nội dung chính */}
                        <div className="text-sm text-gray-800">
                          <span className="font-medium">{msg.sender}{" "}
                            <span className="text-xs text-gray-500">
                              {isValid ? `- ${displayTime} ${displayDate}` : ""}
                            </span></span>
                          {/* Tin nhắn có hình ảnh */}
                          {msg.type === "image" && msg.fileInfo && (
                            <div className="mt-2">
                              <img
                                src={msg.fileInfo.url}
                                alt={msg.fileInfo.name}
                                className="rounded-md border border-gray-200 object-cover w-full h-28"
                              />
                            </div>
                          )}

                          {/* Tin nhắn có file */}
                          {msg.type === "file" && msg.fileInfo && (
                            <div className="mt-2 flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700">
                              <File size={14} className="text-gray-500" />
                              <span className="truncate max-w-[160px]">{msg.fileInfo.name}</span>
                            </div>
                          )}

                          {/* Tin nhắn text thuần */}
                          {msg.type === "text" && (
                            <div className="mt-1 text-[13px] text-gray-700">
                              {msg.content?.slice(0, 100)}
                              {msg.content && msg.content.length > 100 ? "…" : ""}
                            </div>
                          )}

                          <div className="mt-2 text-[11px] text-gray-500">
                            {msg.groupName} {msg.workTypeName ? ` • ${msg.workTypeName}` : ""}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
};
