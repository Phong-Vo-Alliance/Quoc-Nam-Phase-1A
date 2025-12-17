import React from "react";
import { createPortal } from "react-dom";
import type { Message, TaskLogMessage } from "../types";
import {
  Eye,
  Star,
  StarOff,
  Reply,
  Quote,
  ClipboardPlus,
  Inbox,
  Paperclip,
  MessageSquarePlus,
  Pin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLongPress } from "@/lib/hooks/use-long-press";

type Neighbor = Pick<Message, "sender" | "isMine" | "time">;

interface MessageBubbleProps {
  data: Message;
  prev?: Neighbor | null;
  next?: Neighbor | null;
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
  // NEW: mobile flag from ChatMain
  isMobileLayout?: boolean;
}

function toMs(t?: string) {
  if (!t) return NaN;
  const now = new Date();
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
  if (Number.isNaN(ma) || Number.isNaN(mb)) return true;
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
  isMobileLayout = false,
}) => {
  const isShowPhasedFeatures = false;

  // Mobile-like overlay popup (preview + menu)
  const [showOverlay, setShowOverlay] = React.useState(false);
  const previewRef = React.useRef<HTMLDivElement | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const [menuBottom, setMenuBottom] = React.useState<number>(24);
  const [previewBottom, setPreviewBottom] = React.useState<number>(120);

  // Only enable long-press on mobile layout
  const longPressBind = isMobileLayout
    ? useLongPress<HTMLDivElement>(() => {
        setShowOverlay(true);
      }, { delay: 400, moveThreshold: 8 })
    : {};

  // On desktop, allow right-click to demo the popup (not on mobile)
  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobileLayout) return;
    e.preventDefault();
    setShowOverlay(true);
  };

  React.useEffect(() => {
    if (!showOverlay) return;
    // After render, measure to stack preview above menu neatly
    const measure = () => {
      const mh = menuRef.current?.getBoundingClientRect().height ?? 0;
      const ph = previewRef.current?.getBoundingClientRect().height ?? 0;
      const safe = 16; // small safe bottom gap; could be tuned
      const mBottom = 24 + safe; // distance from bottom for the menu card
      const pBottom = mBottom + mh + 12; // preview just above the menu
      setMenuBottom(mBottom);
      setPreviewBottom(pBottom);
    };
    // Slight timeout to ensure layout settled
    const t = setTimeout(measure, 0);
    return () => clearTimeout(t);
  }, [showOverlay]);

  // ====== System message line ======
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

  // ====== Grouping logic ======
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

  const radiusBySide = data.isMine
    ? cn(
        "rounded-2xl",
        isFirstInGroup ? "" : "rounded-tr-md",
        isLastInGroup ? "" : "rounded-br-md"
      )
    : cn(
        "rounded-2xl",
        isFirstInGroup ? "" : "rounded-tl-md",
        isLastInGroup ? "" : "rounded-bl-md"
      );

  // ====== Mentions highlight ======
  const MENTIONABLES = ["Kho Hàng Quốc Nam", "Quốc Nam Sup"];
  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const buildMentionRegex = (names: string[]) => {
    const sorted = [...names].sort((a, b) => b.length - a.length);
    const pattern = sorted.map(escapeRegExp).join("|");
    return new RegExp(`@(?:${pattern})(?=\\s|[.,!?;:()]|$)`, "giu");
  };
  const renderContentWithMentions = (text?: string, names: string[] = MENTIONABLES) => {
    if (!text) return null;
    const re = buildMentionRegex(names);
    const out: React.ReactNode[] = [];
    let lastIndex = 0;
    let m: RegExpExecArray | null;

    while ((m = re.exec(text)) !== null) {
      const start = m.index;
      const end = re.lastIndex;
      if (start > lastIndex) out.push(<span key={`t-${lastIndex}`}>{text.slice(lastIndex, start)}</span>);
      const mentionText = text.slice(start, end);
      out.push(
        <span key={`m-${start}`} className="text-brand-600 font-semibold hover:underline cursor-pointer" title={`Nhắc tới ${mentionText.slice(1)}`}>
          {mentionText}
        </span>
      );
      lastIndex = end;
    }
    if (lastIndex < text.length) out.push(<span key={`t-${lastIndex}`}>{text.slice(lastIndex)}</span>);
    return out;
  };

  // ====== Bubble variants ======
  const FileBubble = () => {
    if (!data.fileInfo) return null;
    const iconColor =
      data.fileInfo.type === "pdf"
        ? "bg-red-100 text-red-600"
        : data.fileInfo.type === "excel"
        ? "bg-green-100 text-green-600"
        : "bg-blue-100 text-blue-600";
    const extLabel =
      data.fileInfo.type === "pdf" ? "PDF" : data.fileInfo.type === "excel" ? "XLS" : "DOC";
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
    const first = imgs[0];
    return (
      <div className="overflow-hidden rounded-lg bg-white border border-gray-200 p-0">
        <img
          src={first.url}
          alt={first.name || "image"}
          className="object-contain max-w-[320px] max-h-[220px] w-auto h-auto rounded-lg"
        />
      </div>
    );
  };

  const renderTextBubble = () => (
    <div
      className={cn(
        "overflow-hidden border border-gray-200 shadow-sm text-[13.5px] text-gray-800 whitespace-pre-line",
        data.isMine ? "bg-brand-50 text-gray-800" : "bg-white text-gray-800",
        radiusBySide
      )}
    >
      {data.replyTo && (
        <div
          className={cn(
            "rounded-t-lg px-3 py-2 text-[13px] border border-gray-200 relative",
            data.isMine ? "bg-white/60 text-gray-800" : "bg-gray-100 text-gray-700",
            "shadow-[inset_0_-1px_3px_rgba(0,0,0,0.08)]"
          )}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Quote size={13} className="text-gray-400" />
            <span className="font-medium text-[12.5px] text-green-600">
              {data.replyTo.sender}
            </span>
          </div>
          {data.replyTo.type === "text" && (
            <p className="text-[13px] text-gray-700 line-clamp-2">{data.replyTo.content}</p>
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
              <span className="font-semibold">📄 {data.replyTo.fileInfo?.name}</span>
            </div>
          )}
        </div>
      )}
      <div className="px-4 py-2 leading-relaxed">
        {renderContentWithMentions(data.content)}
      </div>
    </div>
  );

  return (
    <>
      <div
        className={cn(
          "flex w-full gap-2",
          data.isMine ? "justify-end" : "justify-start",
          isFirstInGroup ? "mt-1" : "mt-0.5",
          isLastInGroup ? "mb-1" : "mb-0.5"
        )}
        id={`msg-${data.id}`}
        onContextMenu={handleContextMenu}
        {...longPressBind}
      >
        <div className={cn("max-w-[70%] flex flex-col relative group", data.isMine ? "items-end" : "items-start")}>
          {!data.isMine && isFirstInGroup && (
            <div className="flex items-baseline gap-2 mb-0.5 pl-0.5">
              <span className="text-[13px] font-medium text-gray-800">{data.sender}</span>
              <span className="text-[11px] text-gray-500">{data.time}</span>
            </div>
          )}
          {data.isMine && isFirstInGroup && (
            <div className="flex justify-end mb-0.5 pr-1">
              <span className="text-[11px] text-gray-500">{data.time}</span>
            </div>
          )}

          {/* The message bubble itself */}
          {data.type === "image" ? <ImageBubble /> : data.type === "file" ? <FileBubble /> : renderTextBubble()}

          {isReceived && (
            <span className="inline-flex items-center gap-1 mt-1 text-xs text-emerald-600">
              <Paperclip className="w-3 h-3" /> {receivedLabel ?? "Đã tiếp nhận"}
            </span>
          )}

          {/* Hover actions: DO NOT show on mobile */}
          {!isMobileLayout && (
            <div
              className={cn(
                "absolute -top-4 right-0 flex items-center gap-2 rounded-lg border border-gray-200 bg-white shadow-sm px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200",
                data.isMine ? "translate-x-1" : "-translate-x-1"
              )}
            >
              <button className="p-1.5 text-gray-500 hover:text-brand-600 transition" onClick={() => onReply?.(data)} title="Trả lời tin nhắn">
                <Reply size={14} />
              </button>
              {!disableExtraActions && (
                <button
                  className={cn("p-1.5 transition", data.isPinned ? "text-brand-600 hover:text-rose-500" : "text-gray-500 hover:text-brand-600")}
                  onClick={() => onPin?.(data)}
                  title={data.isPinned ? "Bỏ đánh dấu tin nhắn" : "Đánh dấu tin nhắn"}
                >
                  {data.isPinned ? <StarOff size={14} /> : <Star size={14} />}
                </button>
              )}
              {!data.taskId && (
                <button title="Giao Task" className="p-1 hover:bg-brand-50 rounded" onClick={() => onAssignFromMessage?.(data)}>
                  <ClipboardPlus className="w-4 h-4 text-brand-600" />
                </button>
              )}
              {data.taskId && onOpenTaskLog && (
                <button title="Trao đổi về công việc" className="p-1 hover:bg-emerald-50 rounded" onClick={() => onOpenTaskLog(data.taskId!)}>
                  <MessageSquarePlus className="w-4 h-4 text-emerald-600" />
                </button>
              )}
              {!isReceived && viewMode === "lead" && (
                <button onClick={() => onReceiveInfo?.(data)} title="Tiếp nhận thông tin" className="p-1 rounded hover:bg-brand-50">
                  <Inbox className="w-4 h-4 text-brand-600" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile overlay popup: preview + menu (like mobile popup) */}
      {isMobileLayout && showOverlay && typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[9999]">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 animate-[fadeIn_150ms_ease-out]"
              onClick={() => setShowOverlay(false)}
            />

            {/* Floating preview bubble (centered above the menu) */}
            <div
              ref={previewRef}
              className="fixed left-1/2 -translate-x-1/2 max-w-[92%] rounded-2xl border border-gray-300 bg-white shadow-2xl px-3 py-2 animate-[floatIn_180ms_ease-out]"
              style={{ bottom: previewBottom }}
            >
              {data.type === "image" ? (
                <div className="text-sm text-gray-700">Hình ảnh</div>
              ) : data.type === "file" ? (
                <div className="text-sm text-gray-700">Tệp tin: {data.fileInfo?.name}</div>
              ) : (
                <>
                  <div className="text-[13.5px] text-gray-800">
                    {renderContentWithMentions(data.content)}
                  </div>
                  <div className="mt-1 text-[11px] text-gray-500">{data.time}</div>
                </>
              )}
            </div>

            {/* Floating context menu card */}
            <div
              ref={menuRef}
              className="fixed left-1/2 -translate-x-1/2 w-[92%] max-w-[420px] rounded-2xl border border-gray-200 bg-white shadow-2xl p-3 animate-[floatIn_180ms_ease-out]"
              style={{ bottom: menuBottom }}
            >
              <div className="grid grid-cols-4 gap-2">
                <button
                  className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 hover:bg-brand-50 transition"
                  onClick={() => { setShowOverlay(false); onReply?.(data); }}
                >
                  <Reply className="h-5 w-5 text-indigo-600" />
                  <span className="text-[12px] text-gray-800">Trả lời</span>
                </button>

                <button
                  className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 hover:bg-brand-50 transition"
                  onClick={() => { setShowOverlay(false); onAssignFromMessage?.(data); }}
                >
                  <ClipboardPlus className="h-5 w-5 text-sky-600" />
                  <span className="text-[12px] text-gray-800">Giao task</span>
                </button>

                {!disableExtraActions && (
                  <button
                    className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 hover:bg-brand-50 transition"
                    onClick={() => { setShowOverlay(false); onPin?.(data); }}
                  >
                    <Pin className="h-5 w-5 text-amber-600" />
                    <span className="text-[12px] text-gray-800">{data.isPinned ? "Bỏ ghim" : "Ghim"}</span>
                  </button>
                )}

                {!isReceived && viewMode === "lead" && (
                  <button
                    className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 hover:bg-brand-50 transition"
                    onClick={() => { setShowOverlay(false); onReceiveInfo?.(data); }}
                  >
                    <Inbox className="h-5 w-5 text-green-600" />
                    <span className="text-[12px] text-gray-800">Tiếp nhận</span>
                  </button>
                )}

                {data.taskId && onOpenTaskLog && (
                  <button
                    className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 hover:bg-brand-50 transition"
                    onClick={() => { setShowOverlay(false); onOpenTaskLog?.(data.taskId!); }}
                  >
                    <MessageSquarePlus className="h-5 w-5 text-emerald-600" />
                    <span className="text-[12px] text-gray-800">Nhật ký</span>
                  </button>
                )}
              </div>

              <div className="mt-2 text-right">
                <button
                  className="text-xs text-gray-500 hover:text-brand-700 hover:underline"
                  onClick={() => setShowOverlay(false)}
                >
                  Đóng
                </button>
              </div>
            </div>

            <style>
              {`@keyframes fadeIn {
                  0% { opacity: 0; }
                  100% { opacity: 1; }
                }
                @keyframes floatIn {
                  0% { opacity: 0; transform: translateY(8px); }
                  100% { opacity: 1; transform: translateY(0); }
                }`}
            </style>
          </div>,
          document.body
        )
      }
    </>
  );
};