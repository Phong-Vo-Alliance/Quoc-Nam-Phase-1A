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
      // chuyển ISO -> Date object
      const dateObj = new Date(m.time);
      // tạo key chỉ gồm ngày (YYYY-MM-DD)
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
                  {msgs.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => onOpenChat(msg)}
                      className="group relative cursor-pointer border-b border-gray-100 hover:bg-brand-50 transition-all p-3 pr-8" // pr-8 để tránh icon tràn
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

                       {/* Reply block nếu có */}
                      {msg.replyTo && (
                        <div className="mb-1 rounded-md border border-gray-200 bg-white/70 px-2 py-1 text-xs text-gray-600 shadow-[inset_0_-1px_3px_rgba(0,0,0,0.05)]">
                          <div className="flex items-center gap-1">
                            <Quote size={12} className="text-gray-400" />
                            <span className="font-medium text-green-600">
                              {msg.replyTo.sender}
                            </span>
                          </div>
                          <div className="line-clamp-1">
                            {msg.replyTo.content ||
                              (msg.replyTo.type === "image"
                                ? "[Hình ảnh]"
                                : msg.replyTo.type === "file"
                                  ? `[Tệp] ${msg.replyTo.fileInfo?.name}`
                                  : "")}
                          </div>
                        </div>
                      )}

                      {/* Nội dung chính */}
                      <div className="text-sm text-gray-800">
                        <span className="font-medium">{msg.sender}{" "} 
                          <span className="text-xs text-gray-500">
                          - {new Date(msg.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span></span>
                        {/* Tin nhắn có hình ảnh */}
                        {msg.type === "image" && msg.files && msg.files.length > 0 && (
                          <div className="mt-2 grid grid-cols-2 gap-1">
                            {msg.files.slice(0, 4).map((file, idx) => (
                              <div
                                key={idx}
                                className="relative cursor-pointer overflow-hidden rounded-md border border-gray-200 hover:opacity-90 transition"
                                title={file.name}
                              >
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  className="object-cover w-full h-24"
                                  // onClick={() => onPreview?.(file)}
                                />
                              </div>
                            ))}
                            {msg.files.length > 4 && (
                              <div className="flex items-center justify-center rounded-md border border-gray-200 bg-white text-xs text-gray-600">
                                +{msg.files.length - 4}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Tin nhắn có file */}
                        {msg.type === "file" && (
                          <div className="mt-2 flex flex-col gap-1">
                            {/* Trường hợp có nhiều file */}
                            {msg.files && msg.files.length > 0
                              ? msg.files.map((file, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 transition"
                                  title={file.name}
                                >
                                  <File size={14} className="text-gray-500" />
                                  <span className="truncate max-w-[160px]">{file.name}</span>
                                </div>
                              ))
                              : msg.fileInfo && (
                                // ✅ Trường hợp chỉ có 1 fileInfo (files null)
                                <div
                                  className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 transition"
                                  title={msg.fileInfo.name}
                                >
                                  <File size={14} className="text-gray-500" />
                                  <span className="truncate max-w-[160px]">{msg.fileInfo.name}</span>
                                </div>
                              )}
                          </div>
                        )}


                        {msg.type === "text" && (
                          <div className="mt-1 text-[13px] text-gray-700 line-clamp-2">
                            {msg.content}
                          </div>
                        )}
                      </div>                      
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
};
