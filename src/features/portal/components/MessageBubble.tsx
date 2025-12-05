import React from "react";
import type { Message, TaskLogMessage } from "../types";
import { Eye, Star, StarOff, Reply, Quote, ClipboardPlus, Clock, Inbox, Paperclip, MessageSquarePlus } from "lucide-react";
import { cn } from "@/lib/utils";

/** Optional meta (giúp xác định nhóm/bo góc như Google Chat) */
type Neighbor = Pick<Message, "sender" | "isMine" | "time">;

interface MessageBubbleProps {
  data: Message;
  /** Truyền prev/next để tự nhóm bubble (khuyến nghị) */
  prev?: Neighbor | null;
  next?: Neighbor | null;
  /** Ngưỡng gộp tin nhắn (ms). Mặc định 5 phút. */
  groupThresholdMs?: number;

  onReply?: (msg: Message) => void;
  onPin?: (msg: Message) => void;
  onOpenFile?: (msg: Message) => void;
  onOpenImage?: (msg: Message) => void;
  onReceiveInfo?: (msg: Message) => void;
  isReceived?: boolean;
  receivedLabel?: string;
  onAssignFromMessage?: (msg: Message) => void;
  viewMode?: "lead" | "staff";
  onOpenTaskLog?: (taskId: string) => void;
  taskLogs?: Record<string, TaskLogMessage[]>;
  currentUserId?: string;
  disableExtraActions?: boolean;
}

/* Utils nhỏ để so sánh thời gian gần nhau */
function toMs(t?: string) {
  // Hỗ trợ string HH:mm hoặc ISO; nếu không parse được → NaN
  if (!t) return NaN;
  const now = new Date();
  // HH:mm
  if (/^\d{1,2}:\d{2}$/.test(t)) {
    const [hh, mm] = t.split(":").map((x) => parseInt(x, 10));
    const d = new Date(now);
    d.setHours(hh, mm, 0, 0);
    return d.getTime();
  }
  const ms = Date.parse(t);
  return Number.isNaN(ms) ? NaN : ms;
}

function isClose(a?: string, b?: string, threshold = 5 * 60 * 1000) {
  const ma = toMs(a);
  const mb = toMs(b);
  if (Number.isNaN(ma) || Number.isNaN(mb)) return true; // nếu không parse được → vẫn cho gộp theo người gửi
  return Math.abs(ma - mb) <= threshold;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  data,
  prev = null,
  next = null,
  groupThresholdMs = 5 * 60 * 1000,
  onReply,
  onPin,
  onOpenFile,
  onOpenImage,
  onReceiveInfo,
  isReceived,
  receivedLabel,
  onAssignFromMessage,
  viewMode,
  onOpenTaskLog,
  taskLogs = {},
  currentUserId,
  disableExtraActions = false,
}) => {
  // TODO: Bật lại khi qua phase kế tiếp
  const isShowPhasedFeatures = false;

  // System line
  if (data.type === "system") {
    return (
      <div
        className="mx-auto my-2 w-fit rounded-full bg-gray-200 px-3 py-0.5 text-[11px] text-gray-600"
        id={`msg-${data.id}`}
      >
        {data.content}
      </div>
    );
  }

  // Xác định vị trí trong nhóm
  const isSameAsPrev =
    !!prev &&
    prev.isMine === data.isMine &&
    prev.sender === data.sender &&
    isClose(prev.time, data.time, groupThresholdMs);

  const isSameAsNext =
    !!next &&
    next.isMine === data.isMine &&
    next.sender === data.sender &&
    isClose(next.time, data.time, groupThresholdMs);

  const isFirstInGroup = !isSameAsPrev;
  const isLastInGroup = !isSameAsNext;

  // Bo góc theo vị trí nhóm (giống Google Chat)
  const radiusBySide = data.isMine
    ? cn(
        "rounded-2xl", // base
        isFirstInGroup ? "" : "rounded-tr-md",
        isLastInGroup ? "" : "rounded-br-md"
      )
    : cn(
        "rounded-2xl",
        isFirstInGroup ? "" : "rounded-tl-md",
        isLastInGroup ? "" : "rounded-bl-md"
      );

  // Reply compact
  const renderReplyBlock = () => {
  if (!data.replyTo) return null;
  const isMineReply = data.isMine;

    return (
      <div
        className={cn(
          "rounded-t-lg px-3 py-2 text-[13px] border border-gray-200 relative",
          isMineReply
            ? "bg-white/60 text-gray-800"
            : "bg-gray-100 text-gray-700",
          "shadow-[inset_0_-1px_3px_rgba(0,0,0,0.08)]" // 👈 hiệu ứng shadow bên dưới
        )}
        style={{
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
      >
        <div className="flex items-center gap-1.5 mb-1">
          {/* Quote icon */}
          <Quote size={13} className="text-gray-400" />
          {/* Tên người được reply */}
          <span className="font-medium text-[12.5px] text-green-600">
            {data.replyTo.sender}
          </span>
        </div>

        {/* Nội dung được trích dẫn */}
        {data.replyTo.type === "text" && (
          <p className="text-[13px] text-gray-700 line-clamp-2">
            {data.replyTo.content}
          </p>
        )}
        {data.replyTo.type === "image" && (
          <div className="h-14 w-24 overflow-hidden rounded-md bg-gray-100 border border-gray-200">
            <img
              src={data.replyTo.fileInfo?.url}
              alt="reply image"
              className="object-cover w-full h-full"
            />
          </div>
        )}
        {data.replyTo.type === "file" && (
          <div className="flex items-center gap-2 text-[12px] text-gray-600">
            <span className="font-semibold">
              📄 {data.replyTo.fileInfo?.name}
            </span>
          </div>
        )}
      </div>      

    );
  };


  const FileBubble = () => {
    if (!data.fileInfo) return null;
    const iconColor =
      data.fileInfo.type === "pdf"
        ? "bg-red-100 text-red-600"
        : data.fileInfo.type === "excel"
        ? "bg-green-100 text-green-600"
        : "bg-blue-100 text-blue-600";
    const extLabel =
      data.fileInfo.type === "pdf"
        ? "PDF"
        : data.fileInfo.type === "excel"
        ? "XLS"
        : "DOC";
    return (
      <div
        className={cn(
          "flex flex-col border border-gray-200 bg-white shadow-sm p-3 cursor-pointer hover:bg-gray-50 transition",
          radiusBySide
        )}
        onClick={() => onOpenFile?.(data)}
      >
        <div className="flex items-center gap-3">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-md", iconColor)}>
            <span className="font-semibold text-xs">{extLabel}</span>
          </div>
          <div className="flex flex-col text-sm text-gray-700 flex-1">
            <span className="font-medium line-clamp-2">{data.fileInfo.name}</span>
            <span className="text-xs text-gray-500">
              {data.fileInfo.type.toUpperCase()} • {data.fileInfo.size}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-brand-700">
            <Eye size={14} /> Xem
          </div>
        </div>
      </div>
    );
  };

  const ImageBubble = () => {
    const imgs = data.files || (data.fileInfo ? [data.fileInfo] : []);
    if (!imgs.length) return null;

    const displayImgs = imgs.slice(0, 6);
    const extraCount = imgs.length - 6;

    const layoutClass = (() => {
      switch (displayImgs.length) {
        case 1:
          return "grid grid-cols-1";
        case 2:
          return "grid grid-cols-2 gap-1";
        case 3:
          return "grid grid-rows-[1fr_1fr] grid-cols-2 gap-1";
        case 4:
          return "grid grid-cols-2 gap-1";
        default:
          return "grid grid-cols-3 gap-1";
      }
    })();

    

    return (
      <div
        className={cn(
          "overflow-hidden rounded-lg bg-white border border-gray-200",
          displayImgs.length === 1 ? "p-0" : "p-1"
        )}
      >
        <div className={layoutClass}>
          {displayImgs.map((img, idx) => (
            <div
              key={idx}
              className={cn(
                "relative overflow-hidden cursor-pointer hover:opacity-90 transition",
                displayImgs.length === 1
                  ? "rounded-lg"
                  : "rounded-md aspect-[4/3]"
              )}
              onClick={() => onOpenImage?.({ ...data, fileInfo: img })}
              style={{
                gridColumn:
                  displayImgs.length === 3 && idx === 0 ? "span 2" : undefined,
              }}
            >
              <img
                src={img.url}
                alt={img.name || `image-${idx}`}
                className={cn(
                  "object-cover rounded-lg",
                  displayImgs.length === 1
                    ? "max-w-[320px] max-h-[220px] w-auto h-auto"
                    : "w-full h-full"
                )}
                style={{
                  objectFit: "contain",
                }}
              />

              {/* overlay +N nếu nhiều hơn 6 ảnh */}
              {extraCount > 0 && idx === displayImgs.length - 1 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-semibold">
                  +{extraCount}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };


  // Danh sách tên có thể @ (tạm thời hardcode, sau có thể truyền từ props hay context)
  const MENTIONABLES = ["Kho Hàng Quốc Nam", "Quốc Nam Sup"];

  // Escape regexp cho tên có ký tự đặc biệt
  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Build regex: ưu tiên tên dài hơn để tránh ăn nhầm (VD: "Quốc Nam" vs "Quốc Nam Sup")
  const buildMentionRegex = (names: string[]) => {
    const sorted = [...names].sort((a, b) => b.length - a.length);
    const pattern = sorted.map(escapeRegExp).join("|");
    // match: @ + (một trong các tên), sau đó là kết thúc chuỗi/space/dấu câu
    return new RegExp(`@(?:${pattern})(?=\\s|[.,!?;:()]|$)`, "giu");
  };


  // Render content có highlight @mention theo danh sách tên
  const renderContentWithMentions = (text?: string, names: string[] = MENTIONABLES) => {
    if (!text) return null;
    const re = buildMentionRegex(names);
    const out: React.ReactNode[] = [];

    let lastIndex = 0;
    let m: RegExpExecArray | null;

    while ((m = re.exec(text)) !== null) {
      const start = m.index;
      const end = re.lastIndex;

      // text trước @mention
      if (start > lastIndex) out.push(<span key={`t-${lastIndex}`}>{text.slice(lastIndex, start)}</span>);

      // chính @mention
      const mentionText = text.slice(start, end);
      out.push(
        <span
          key={`m-${start}`}
          className="text-brand-600 font-semibold hover:underline cursor-pointer"
          title={`Nhắc tới ${mentionText.slice(1)}`}
        >
          {mentionText}
        </span>
      );

      lastIndex = end;
    }

    // phần còn lại
    if (lastIndex < text.length) out.push(<span key={`t-${lastIndex}`}>{text.slice(lastIndex)}</span>);
    return out;
  };

  const TextBubble = () => (
    <div
      className={cn(
        "bg-white border border-gray-200 shadow-sm px-3 py-2 text-[13.5px] text-gray-800 leading-relaxed whitespace-pre-line hover:bg-brand-50",
        radiusBySide
      )}
    >
      {renderContentWithMentions(data.content)}
    </div>
  );


  const renderContent = () => {
    switch (data.type) {
      case "file":
        return <FileBubble />;
      case "image":
        return <ImageBubble />;
      default:
        return <TextBubble />;
    }
  };

  return (
    <>
    <div
      className={cn(
        // khoảng cách giữa các tin: rất sát như Google Chat
        "flex w-full gap-2",
        data.isMine ? "justify-end" : "justify-start",
        isFirstInGroup ? "mt-1" : "mt-0.5",
        isLastInGroup ? "mb-1" : "mb-0.5"
      )}
      id={`msg-${data.id}`}
    >
      <div className={cn("max-w-[70%] flex flex-col relative group", data.isMine ? "items-end" : "items-start")}>
        {/* Header nhóm (tên + thời gian) chỉ hiển thị ở bubble đầu nhóm */}
        {!data.isMine && isFirstInGroup && (
          <div className="flex items-baseline gap-2 mb-0.5 pl-0.5">
            <span className="text-[13px] font-medium text-gray-800">{data.sender}</span>
            <span className="text-[11px] text-gray-500">{new Date(data.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        )}
        {data.isMine && isFirstInGroup && (
          <div className="flex justify-end mb-0.5 pr-1">
            <span className="text-[11px] text-gray-500">{new Date(data.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        )}

        {/* Bubble nội dung gồm cả reply và message */}
        {data.type === "image" ? (
          <ImageBubble />
        ) : data.type === "file" ? (
          <FileBubble />
        ) : (
          <div
            className={cn(
              "overflow-hidden border border-gray-200 shadow-sm text-[13.5px] text-gray-800 whitespace-pre-line",
              data.isMine ? "bg-brand-50 text-gray-800" : "bg-white text-gray-800",
              radiusBySide
            )}
          >
            {renderReplyBlock()}
                <div className="px-4 py-2 leading-relaxed">
                  {renderContentWithMentions(data.content)}
                </div>
          </div>
        )}

        {/* Time ở góc khi hover (giống Google Chat) */}
        <div
          className={cn(
            "pointer-events-none absolute -bottom-4 text-[11px] text-gray-400 opacity-0 transition-opacity",
            data.isMine ? "right-1 group-hover:opacity-100" : "left-1 group-hover:opacity-100"
          )}
        >
          {new Date(data.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>

        {isReceived && (          
          <span className="inline-flex items-center gap-1 mt-1 text-xs text-emerald-600">
            <Paperclip className="w-3 h-3" /> {receivedLabel ?? "Đã tiếp nhận"}
          </span>
        )}

        {isReceived && (
          <div
            className={cn(
              "absolute -bottom-0.5 right-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md",
              data.isMine ? "translate-x-2" : "-translate-x-2 -translate-y-2"
            )}
            title={receivedLabel ?? "Đã tiếp nhận"}
          >
            <Inbox className="w-3 h-3" />
          </div>
        )}
        
        {/* Actions group – floating card style */}
        <div
          className={cn(
            "absolute -top-4 right-0 flex items-center gap-2 rounded-lg border border-gray-200 bg-white shadow-sm px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200",
            data.isMine ? "translate-x-1" : "-translate-x-1"
          )}
        >
          <button
            className="p-1.5 text-gray-500 hover:text-brand-600 transition"
            onClick={() => onReply?.(data)}
            title="Trả lời tin nhắn"
          >
            <Reply size={14} />
          </button>

          {!disableExtraActions && (
              <button
                className={cn(
                  "p-1.5 transition",
                  data.isPinned
                    ? "text-brand-600 hover:text-rose-500"
                    : "text-gray-500 hover:text-brand-600"
                )}
                onClick={() => onPin?.(data)}
                title={data.isPinned ? "Bỏ đánh dấu tin nhắn" : "Đánh dấu tin nhắn"}
              >
                {data.isPinned ? <StarOff size={14} /> : <Star size={14} />}
              </button>
          )}
          {!data.taskId && (
            <button
              title="Giao Task"
              className="p-1 hover:bg-brand-50 rounded"
              onClick={() => onAssignFromMessage?.(data)}
            >
              <ClipboardPlus className="w-4 h-4 text-brand-600" />
            </button>
          )}
          {data.taskId && onOpenTaskLog && (
            <button
              title="Trao đổi về công việc"
              className="p-1 hover:bg-emerald-50 rounded"
              onClick={() => onOpenTaskLog(data.taskId!)}
            >
              <MessageSquarePlus className="w-4 h-4 text-emerald-600" />
            </button>
          )}

          {isShowPhasedFeatures && !isReceived && viewMode==="lead" && (           
            <button
              onClick={() => onReceiveInfo?.(data)}
              title="Tiếp nhận thông tin"
              className="p-1 rounded hover:bg-brand-50"
            >
              <Inbox className="w-4 h-4 text-brand-600" />
            </button>
          )}
          
          {isShowPhasedFeatures && !disableExtraActions && (
          <button title="Đặt về Pending" className="p-1 hover:bg-amber-50 rounded">
            <Clock className="w-4 h-4 text-amber-500" />
          </button>
          )}
        </div>
      </div>
    </div>

      {data.taskId && taskLogs?.[data.taskId] && (
        <div
          className="mt-1 ml-10 cursor-pointer text-[11px] text-gray-500 hover:text-gray-700 flex items-center gap-1"
          onClick={() => onOpenTaskLog?.(data.taskId!)}
        >
          <span className="text-emerald-600">📝 Nhật ký công việc</span>

          <span className="mx-1">·</span>

          <span>{taskLogs[data.taskId].length} phản hồi</span>

          {(() => {
            const last = taskLogs[data.taskId][taskLogs[data.taskId].length - 1];
            if (!last) return null;
            const t = new Date(last.time);
            const timeStr = t.toLocaleDateString("vi-VN", { weekday: "long" });
            return (
              <>
                <span className="mx-1">·</span>
                <span>cập nhật cuối: {timeStr}</span>
              </>
            );
          })()}
        </div>
      )}
    </>
  );
};
