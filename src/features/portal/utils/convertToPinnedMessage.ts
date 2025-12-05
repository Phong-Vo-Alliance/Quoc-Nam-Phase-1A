import { Message, PinnedMessage } from "@/features/portal/types";

/**
 * Helper chuyển một message bình thường thành pinned message
 * giữ nguyên quote (replyTo) và files nếu có
 */
export function convertToPinnedMessage(
  msg: Message,
  chatId: string,
  groupName?: string
): PinnedMessage {
  return {
    id: msg.id,
    chatId,
    sender: msg.sender,
    content: msg.content ?? "",
    time: msg.time,
    groupName,
    type: msg.type,
    preview:
      msg.type === "image"
        ? "Đã gửi hình ảnh"
        : msg.type === "file"
        ? `Tệp: ${msg.fileInfo?.name}`
        : msg.content?.slice(0, 80) ?? "",
    replyTo: msg.replyTo,
    files: msg.files,
    fileInfo: msg.fileInfo,
  };
}
