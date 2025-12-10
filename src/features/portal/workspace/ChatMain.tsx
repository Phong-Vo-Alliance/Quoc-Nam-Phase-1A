import React from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Search, PanelRightClose, PanelRightOpen, MessageSquareText, Paperclip, Image as ImageIcon, AlarmClock, Type, SendHorizonal, ChevronLeft, MoreVertical, } from 'lucide-react';
import { IconButton } from '@/components/ui/icon-button';
import { Avatar, Badge } from '../components';
import type { Message, Task, PinnedMessage, FileAttachment, GroupChat, ReceivedInfo, TaskLogMessage } from '../types';
import { MessageBubble } from "@/features/portal/components/MessageBubble";
import { convertToPinnedMessage } from "@/features/portal/utils/convertToPinnedMessage";
import { LinearTabs } from '../components/LinearTabs';

type ViewMode = "lead" | "staff";

export const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const btn = (active = false) =>
  `rounded-lg border px-3 py-1 transition ${active ? 'bg-brand-600 text-white border-sky-600 shadow-sm' : 'bg-white text-brand-700 border-brand-200 hover:bg-brand-50'}`;
const inputCls =
  'rounded-lg border px-3 py-2 text-sm border-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-sky-300';

// Helper component for segmented control 
const SegBtn: React.FC<{active:boolean; onClick:()=>void; children:React.ReactNode}> = ({active,onClick,children}) => (
   <button
     onClick={onClick}
     className={`px-2.5 py-1 text-xs rounded-md border transition ${
       active
         ? "bg-brand-600 text-white border-brand-600"
         : "bg-white text-brand-700 border-brand-200 hover:bg-brand-50"
     }`}
   >
     {children}
   </button>
 );

export const ChatMain: React.FC<{
  selectedGroup?: GroupChat;
  currentUserId: string;
  currentUserName: string;
  selectedChat: { type: "group" | "dm"; id: string } | null;
  currentWorkTypeId?: string;
  title?: string; // NEW: tiêu đề động (group/dm)

  // mobile layout
  isMobile?: boolean;
  onBack?: () => void;
  onOpenMobileMenu?: () => void;

  messages: Message[];  
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  myWork: Task[];
  showRight: boolean;
  setShowRight: (v: boolean) => void;
  showSearch: boolean;
  setShowSearch: (v: boolean) => void;
  q: string;
  setQ: (v: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  onOpenCloseModalFor: (id: string) => void;
  openPreview: (file: FileAttachment) => void;
  onTogglePin: (msg: Message) => void; 
  workTypes?: Array<{id:string; name:string}>;
  selectedWorkTypeId?: string;
  onChangeWorkType?: (id:string)=>void;
  scrollToMessageId?: string;
  onReceiveInfo?: (message: Message) => void;
  receivedInfos?: ReceivedInfo[];
  onAssignFromMessage?: (msg: Message) => void;
  setTab: (v: "info" | "order" | "tasks") => void;
  viewMode?: ViewMode; // 'lead' | 'staff'  
  onOpenTaskLog?: (taskId: string) => void;
  taskLogs?: Record<string, TaskLogMessage[]>
}> = ({
  selectedGroup,
  currentUserId,
  currentUserName,
  selectedChat,
  currentWorkTypeId,
  title = "Trò chuyện",

  isMobile = false,
  onBack,
  onOpenMobileMenu,
  
  messages, setMessages, myWork,
  showRight, setShowRight, showSearch, setShowSearch, q, setQ, searchInputRef,
  onOpenCloseModalFor, openPreview, onTogglePin,
  workTypes = [],
  selectedWorkTypeId,
  onChangeWorkType,
  scrollToMessageId,
  onReceiveInfo,
  receivedInfos,
  onAssignFromMessage,
  setTab,
  viewMode = "staff",
  onOpenTaskLog, 
  taskLogs = {},
}) => {
  // const [showCloseMenu, setShowCloseMenu] = React.useState(false);
  // const [inputValue, setInputValue] = React.useState("");
  // const [pinnedMessages, setPinnedMessages] = React.useState<PinnedMessage[]>([]);
  const [showCloseMenu, setShowCloseMenu] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const isMobileLayout = isMobile;
  const memberCount = selectedGroup?.members?.length ?? 0;
  const headerTitle = selectedGroup?.name ?? title;

  const mainContainerCls = isMobileLayout
    ? "flex flex-col w-full h-full min-h-0 bg-white"
    : "flex flex-col w-full rounded-2xl border border-gray-300 bg-white shadow-sm h-full min-h-0";

  const headerPaddingCls = isMobileLayout ? "px-3 py-2" : "pt-4 pr-4 pl-4";

  const handlePinToggle = useCallback(
    (msg: Message) => {
      // 1) Báo lên trên để cập nhật danh sách pinned (PortalWireframes / WorkspaceView)
      onTogglePin(msg);

      // 2) Đồng thời toggle isPinned trên chính message để icon Star/StarOff hiển thị đúng
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id ? { ...m, isPinned: !m.isPinned } : m
        )
      );
    },
    [onTogglePin, setMessages]
  );

  // const handleOpenFile = (msg: Message) => openPreview(msg.fileInfo!);
  // const handleOpenImage = (msg: Message) => openPreview(msg.fileInfo!);
  const handleOpenFile = useCallback((msg: Message) => {
    if (msg.fileInfo) openPreview(msg.fileInfo);
  }, [openPreview]);

  const handleOpenImage = handleOpenFile;

  const resolveThreadId = () => {
    if (!selectedChat) return "unknown";
    if (selectedChat.type === "group") return selectedChat.id;
    // DM: tạo thread id ổn định từ 2 user
    return `dm:${currentUserId}:${selectedChat.id}`;
  };

  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return;

    const nowIso = new Date().toISOString();
    const threadId = resolveThreadId();

    const newMsg: Message = {
      id: Date.now().toString(),
      type: "text",
      sender: currentUserName,
      content: inputValue.trim(),
      time: nowIso,
      createdAt: nowIso,
      groupId: threadId,
      senderId: currentUserId,
      workTypeId: selectedWorkTypeId ?? currentWorkTypeId,
      isMine: true,
      isPinned: false,
      isSystem: false,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputValue("");
  }, [inputValue, currentUserName, currentUserId, selectedWorkTypeId, currentWorkTypeId, setMessages]);

  const handleReceiveFromBubble = useCallback((msg: Message) => {
    onReceiveInfo?.(msg);  // gọi PortalWireframes.handleReceiveInfo
    setTab("order");       // chuyển panel phải sang tab Công việc
  }, [onReceiveInfo, setTab]);

  const handleReceiveInfo = useCallback((msg: Message) => {
    const timeIso = new Date().toISOString();

    // 1) Mark message as received
    const received = {
      messageId: msg.id,
      time: timeIso,
      receivedBy: currentUserName,
    };

    // 2) Append system message
    const excerpt = msg.content ?? "".length > 40
      ? msg.content ?? "".slice(0, 40) + "…"
      : msg.content;

    const systemMsg: Message = {
      id: "sys-" + Date.now(),
      type: "system",
      content: `${excerpt} được tiếp nhận bởi ${currentUserName} lúc ${new Date(timeIso).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      time: timeIso,
      createdAt: timeIso,
      groupId: msg.groupId,
      sender: "system",
      senderId: "system",
      isMine: false,
      isPinned: false,
      isSystem: true,
    };

    // 3) Add new system message + update receivedInfos externally
    setMessages(prev => [...prev, systemMsg]);

    // 4) Đánh dấu message này là received → RightPanel sẽ nhận được qua props
    onReceiveInfo?.(msg);

    // 5) Auto switch RightPanel tab
    setShowRight(true);  // mở panel phải nếu đang đóng
    setTab("order");     // tab Công việc
  }, [currentUserName, onReceiveInfo, setMessages]);


  // Auto-scroll khi có tin mới
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Scroll to specific message when scrollToMessageId changes
  React.useEffect(() => {
    if (!scrollToMessageId) return;
    // giả sử mỗi bubble có data-mid="msg-xxx"
    const el = document.getElementById(`msg-${scrollToMessageId}`);
    if (el) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      el.classList.add("ring-2", "ring-brand-500");
      // Thêm lớp highlight 
      el.classList.add("pinned-highlight");

      setTimeout(() => {
        el.classList.remove("ring-2", "ring-brand-500");
        el.classList.remove("pinned-highlight");
      }, 2000);
    }
  }, [scrollToMessageId]);

  return (
    <main className={mainContainerCls}>
      {/* Header */}
      <div
        className={`flex items-center justify-between border-b shrink-0 ${headerPaddingCls}`}
      >
        {isMobileLayout ? (
          <>
            {/* HEADER MOBILE */}
            <div className="flex items-center gap-2 min-w-0">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="mr-1 flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-700" />
                </button>
              )}
              <Avatar name={headerTitle} />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-800 truncate">
                  {headerTitle}
                </div>
                <div className="text-[11px] text-gray-500 truncate">
                  {memberCount > 0 ? `${memberCount} thành viên` : "Nhóm chat"}{" "}
                  • <Badge type="waiting">Đang trao đổi</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {showSearch && (
                <input
                  ref={searchInputRef}
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm tin nhắn"
                  className={`w-40 ${inputCls} transition-all`}
                />
              )}
              <IconButton
                className="rounded-full bg-white"
                label={showSearch ? "Đóng tìm kiếm" : "Tìm kiếm trong chat"}
                onClick={() => setShowSearch(!showSearch)}
                icon={<Search className="h-4 w-4 text-brand-600" />}
              />
              <button
                type="button"
                onClick={onOpenMobileMenu}
                className="ml-1 flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
              >
                <MoreVertical className="h-4 w-4 text-gray-700" />
              </button>
            </div>
          </>
        ) : (
          <>
            {/* HEADER DESKTOP (giữ logic cũ) */}
            <div className="flex items-center gap-3">
              <Avatar name={headerTitle} />
              <div>
                <div className="text-sm font-semibold text-gray-800">
                  {headerTitle}
                </div>
                <div className="text-xs text-gray-500">
                  {memberCount > 0
                    ? `${memberCount} thành viên`
                    : "Nhóm chat"}{" "}
                  • 2 người đang xem •{" "}
                  <Badge type="waiting">Chờ phản hồi</Badge>
                </div>
                {/* WorkType segmented control (nếu có) */}
                {selectedGroup?.workTypes &&
                  selectedGroup.workTypes.length > 0 && (
                    <div className="mt-2">
                      <LinearTabs
                        tabs={selectedGroup.workTypes.map((w) => ({
                          key: w.id,
                          label: w.name,
                        }))}
                        active={
                          selectedWorkTypeId ??
                          currentWorkTypeId ??
                          selectedGroup.workTypes[0]?.id
                        }
                        onChange={(id) => onChangeWorkType?.(id)}
                        textClass="text-xs"
                        noWrap
                      />
                    </div>
                  )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {showSearch && (
                <input
                  ref={searchInputRef}
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm tin nhắn trong hội thoại"
                  className={`w-72 ${inputCls} transition-all`}
                />
              )}
              <IconButton
                className="rounded-full bg-white"
                label={showSearch ? "Đóng tìm kiếm" : "Tìm kiếm trong chat"}
                onClick={() => setShowSearch(!showSearch)}
                icon={<Search className="h-4 w-4 text-brand-600" />}
              />
              <IconButton
                className="rounded-full bg-white"
                label={showRight ? "Ẩn panel phải" : "Hiện panel phải"}
                onClick={() => setShowRight(!showRight)}
                icon={
                  showRight ? (
                    <PanelRightClose className="h-4 w-4 text-brand-600" />
                  ) : (
                    <PanelRightOpen className="h-4 w-4 text-brand-600" />
                  )
                }
              />
            </div>
          </>
        )}
      </div>

      {/* WorkType tabs riêng cho mobile (nếu có) */}
      {isMobileLayout &&
        selectedGroup?.workTypes &&
        selectedGroup.workTypes.length > 0 && (
          <div className="border-b px-3 pb-2">
            <LinearTabs
              tabs={selectedGroup.workTypes.map((w) => ({
                key: w.id,
                label: w.name,
              }))}
              active={
                selectedWorkTypeId ??
                currentWorkTypeId ??
                selectedGroup.workTypes[0]?.id
              }
              onChange={(id) => onChangeWorkType?.(id)}
              textClass="text-xs"
              noWrap
            />
          </div>
        )}

      {/* Message list */}
      <div
        className={`flex-1 overflow-y-auto space-y-1 min-h-0 bg-green-900/15 ${isMobileLayout ? "p-2" : "p-4"
          }`}
      >
        {messages.map((msg, i) => {
          const infoForMsg = receivedInfos?.find(i => i.messageId === msg.id);
          const isReceived = !!infoForMsg;
          const receivedLabel = infoForMsg
            ? `Đã tiếp nhận bởi ${currentUserName} lúc ${formatTime(infoForMsg.createdAt)}`
            : undefined;
          return (
            <MessageBubble
              key={msg.id}
              data={msg}
              prev={i > 0 ? messages[i - 1] : null}
              next={i < messages.length - 1 ? messages[i + 1] : null}
              onReply={(m) => {
                const quote = m.type === "text" ? m.content : `[${m.type}]`;
                setInputValue(prev => (prev ? prev + "\n" : "") + `> ${quote}\n`);
              }}
              onOpenTaskLog={(taskId) =>
                onOpenTaskLog?.(taskId) // callback bubble -> ChatMain -> PortalWireframes
              }
              taskLogs={taskLogs}
              currentUserId={currentUserId} 
              onPin={handlePinToggle}
              onOpenFile={handleOpenFile}
              onOpenImage={handleOpenImage}
              onReceiveInfo={handleReceiveFromBubble}
              isReceived={isReceived}
              receivedLabel={receivedLabel}
              onAssignFromMessage={onAssignFromMessage}
              viewMode={viewMode}
            />
          );
        })
        }
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="border-t p-3 shrink-0">
        <div className="flex items-center gap-2">
          <input
            className={`flex-1 ${inputCls}`}
            placeholder="Nhập tin nhắn…"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button title="Tin nhắn mẫu" className="rounded-lg border border-brand-200 bg-white px-2 py-2 text-brand-600 hover:bg-brand-50">
            <MessageSquareText size={18} />
          </button>
          <button
            onClick={handleSend}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
          >
            <SendHorizonal className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 flex items-center gap-4 text-gray-600">
          <IconButton label="Đính kèm" icon={<Paperclip className="h-4 w-4" />} />
          {/* <IconButton label="Hình ảnh" icon={<ImageIcon className="h-4 w-4" />} />
          <IconButton label="Nhắc giờ" icon={<AlarmClock className="h-4 w-4" />} /> */}
          <IconButton label="Định dạng" icon={<Type className="h-4 w-4" />} />
        </div>
      </div>
    </main>
  );
};
