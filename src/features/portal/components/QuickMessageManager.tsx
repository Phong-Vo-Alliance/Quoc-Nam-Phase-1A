import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickMessage {
  id: number;
  shortcut: string;
  content: string;
}

export const QuickMessageManager: React.FC<{
  open: boolean;
  onOpenChange: (v: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const [messages, setMessages] = useState<QuickMessage[]>([
    {
      id: 1,
      shortcut: "xinchao",
      content: "Cảm ơn bạn đã nhắn tin. Mình có thể giúp gì cho bạn?",
    },
  ]);
  const [editing, setEditing] = useState<QuickMessage | null>(null);
  const [shortcut, setShortcut] = useState("");
  const [content, setContent] = useState("");
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [deletedId, setDeletedId] = useState<number | null>(null);

  const resetForm = () => {
    setEditing(null);
    setShortcut("");
    setContent("");
  };

  const handleSave = () => {
    if (!shortcut || !content) return;

    if (editing) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === editing.id ? { ...m, shortcut, content } : m
        )
      );
      setHighlightedId(editing.id); // highlight item vừa sửa
    } else {
      const newId = Date.now();
      setMessages((prev) => [
        ...prev,
        { id: newId, shortcut, content },
      ]);
      setHighlightedId(newId); // highlight item mới thêm
    }

    resetForm();
    // Reset hiệu ứng sau 1.5s
    setTimeout(() => setHighlightedId(null), 1500);
  };


  const handleDelete = (id: number) => {
    setDeletedId(id);
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setDeletedId(null);
    }, 400); // khớp thời lượng fade-out
  };

  const startEdit = (msg: QuickMessage) => {
    setEditing(msg);
    setShortcut(msg.shortcut);
    setContent(msg.content);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Tin nhắn nhanh
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Tạo, chỉnh sửa và quản lý phím tắt cho các tin nhắn thường dùng.
          </p>
        </DialogHeader>

        {/* Danh sách tin nhắn */}
        <div className="rounded-lg border border-brand-200 bg-white p-4 shadow-sm">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-1">
              Danh sách tin nhắn ({messages.length})
            </h4>
            <div className="border-b border-gray-200 mb-3" />
          </div>

          <div className="max-h-[240px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
            {messages.length === 0 && (
              <p className="text-sm text-gray-400 italic py-2">
                Chưa có tin nhắn nào.
              </p>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "group relative mb-2 rounded-lg border border-transparent bg-gray-50 px-3 py-2 transition-all hover:border-brand-200 hover:bg-brand-50",
                  highlightedId === msg.id && "fade-highlight",
                  deletedId === msg.id && "fade-out"
                )}
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="inline-block text-xs font-medium text-brand-700 bg-brand-100 px-2 py-0.5 rounded-md w-fit mb-1">
                      /{msg.shortcut}
                    </span>
                    <p className="text-sm text-gray-700 leading-snug">{msg.content}</p>
                  </div>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-3">
                    <Pencil
                      size={15}
                      className="cursor-pointer text-gray-500 hover:text-brand-600"
                      onClick={() => startEdit(msg)}
                    />
                    <Trash2
                      size={15}
                      className="cursor-pointer text-gray-500 hover:text-rose-600"
                      onClick={() => handleDelete(msg.id)}
                    />
                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>


        {/* Form thêm/sửa */}
        <div className="mt-4 space-y-2">
          <Input
            value={shortcut}
            onChange={(e) => setShortcut(e.target.value)}
            placeholder="Phím tắt (ví dụ: xinchao)"
            className="text-sm"
          />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nội dung tin nhắn..."
            className="text-sm h-28"
          />
        </div>

        <DialogFooter className="mt-3 flex justify-end gap-2">
          <Button variant="outline" onClick={() => resetForm()}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={!shortcut || !content}>
            {editing ? "Lưu thay đổi" : "Thêm mới"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
