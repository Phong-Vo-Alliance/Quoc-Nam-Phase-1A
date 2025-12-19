import React from 'react';
import { useCallback, useEffect, useRef } from 'react';
import {
  Search,
  PanelRightClose,
  PanelRightOpen,
  MessageSquareText,
  Paperclip,
  Type,
  SendHorizonal,
  ChevronLeft,
  MoreVertical,
  ArrowLeftRight,
  PlusCircle,
  Folder,
  Images,
  ImageUp,
  MapPin,
} from 'lucide-react';
import { IconButton } from '@/components/ui/icon-button';
import { Avatar, Badge } from '../components';
import type {
  Message,
  Task,
  FileAttachment,
  GroupChat,
  ReceivedInfo,
  TaskLogMessage,
} from '../types';
import { MessageBubble } from '@/features/portal/components/MessageBubble';
import { LinearTabs } from '../components/LinearTabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';

type ViewMode = 'lead' | 'staff';

export const ChatMain: React.FC<{
  selectedGroup?: GroupChat;
  currentUserId: string;
  currentUserName: string;
  selectedChat: { type: 'group' | 'dm'; id: string } | null;
  currentWorkTypeId?: string;
  title?: string;

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
  workTypes?: Array<{ id: string; name: string }>;
  selectedWorkTypeId?: string;
  onChangeWorkType?: (id: string) => void;
  scrollToMessageId?: string;
  onReceiveInfo?: (message: Message) => void;
  receivedInfos?: ReceivedInfo[];
  onAssignFromMessage?: (msg: Message) => void;
  setTab: (v: 'info' | 'order' | 'tasks') => void;
  viewMode?: ViewMode;
  onOpenTaskLog?: (taskId: string) => void;
  taskLogs?: Record<string, TaskLogMessage[]>;
  rightExpanded?: boolean;
  onToggleRightExpand?: () => void;

  // NEW: data + callback for mobile assign
  mobileMembers?: Array<{ id: string; name: string }>;
  mobileChecklistVariants?: { id: string; name: string; isDefault?: boolean }[];
  defaultChecklistVariantId?: string;
  onCreateTaskFromMessage?: (payload: {
    title: string;
    sourceMessageId: string;
    assigneeId: string;
    checklistVariantId?: string;
    checklistVariantName?: string;
  }) => void;
}> = ({
  selectedGroup,
  currentUserId,
  currentUserName,
  selectedChat,
  currentWorkTypeId,
  title = 'Trò chuyện',

  isMobile = false,
  onBack,
  onOpenMobileMenu,

  messages,
  setMessages,
  myWork,
  showRight,
  setShowRight,
  showSearch,
  setShowSearch,
  q,
  setQ,
  searchInputRef,
  onOpenCloseModalFor,
  openPreview,
  onTogglePin,
  workTypes = [],
  selectedWorkTypeId,
  onChangeWorkType,
  scrollToMessageId,
  onReceiveInfo,
  receivedInfos,
  onAssignFromMessage,
  setTab,
  viewMode = 'staff',
  onOpenTaskLog,
  taskLogs = {},
  rightExpanded = false,
  onToggleRightExpand,

  // mobile assign
  mobileMembers = [],
  mobileChecklistVariants = [],
  defaultChecklistVariantId,
  onCreateTaskFromMessage,
}) => {
  const [inputValue, setInputValue] = React.useState('');
  const [inlineToast, setInlineToast] = React.useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const composerRef = React.useRef<HTMLDivElement | null>(null);
  const [sheetBottom, setSheetBottom] = React.useState<number>(130);

  React.useLayoutEffect(() => {
    const measure = () => {
      const h = composerRef.current?.getBoundingClientRect().height ?? 100;
      setSheetBottom(Math.round(h + 8));
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
    };
  }, []);

  const [openActions, setOpenActions] = React.useState(false);
  const imageInputRef = React.useRef<HTMLInputElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const isMobileLayout = isMobile;
  const memberCount = selectedGroup?.members?.length ?? 0;
  const headerTitle = selectedGroup?.name ?? title;

  const mainContainerCls = isMobileLayout ? 'flex flex-col w-full h-full min-h-0 bg-white' : 'flex flex-col w-full rounded-2xl border border-gray-300 bg-white shadow-sm h-full min-h-0';
  const headerPaddingCls = isMobileLayout ? 'px-0 py-1' : 'pt-4 pr-4 pl-4';

  const handlePinToggle = useCallback(
    (msg: Message) => {
      onTogglePin(msg);
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, isPinned: !m.isPinned } : m)));
    },
    [onTogglePin, setMessages]
  );

  const handleOpenFile = useCallback((msg: Message) => { if (msg.fileInfo) openPreview(msg.fileInfo); }, [openPreview]);
  const handleOpenImage = handleOpenFile;

  const resolveThreadId = () => {
    if (!selectedChat) return 'unknown';
    if (selectedChat.type === 'group') return selectedChat.id;
    return `dm:${currentUserId}:${selectedChat.id}`;
  };

  const sendMessage = (content: string) => {
    const nowIso = new Date().toISOString();
    const threadId = resolveThreadId();
    const newMsg: Message = {
      id: Date.now().toString(),
      type: 'text',
      sender: currentUserName,
      content,
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
  };

  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue.trim());
    setInputValue('');
  }, [inputValue]);

  const handleReceiveFromBubble = useCallback((msg: Message) => { onReceiveInfo?.(msg); setTab('order'); }, [onReceiveInfo, setTab]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  React.useEffect(() => {
    if (!scrollToMessageId) return;
    const el = document.getElementById(`msg-${scrollToMessageId}`);
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      el.classList.add('ring-2', 'ring-brand-500', 'pinned-highlight');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-brand-500', 'pinned-highlight');
      }, 2000);
    }
  }, [scrollToMessageId]);

  const handlePickImage = () => imageInputRef.current?.click();
  const handlePickFile = () => fileInputRef.current?.click();
  const handleQuickMessage = () => setInputValue((prev) => (prev ? prev + '\n' : '') + 'Em sẽ xử lý yêu cầu này ngay bây giờ.\nCảm ơn anh/chị đã thông tin!');
  const handleFormat = () => setInputValue((prev) => (prev ? prev + '\n' : '') + '> Trích dẫn\n');

  const handleShareLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const link = `https://maps.google.com/?q=${latitude},${longitude}`;
        sendMessage(`Vị trí hiện tại: ${link}`);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Inline toast helper
  const showInlineToast = (msg: string) => {
    setInlineToast(msg);
    setTimeout(() => setInlineToast(null), 2200);
  };

  return (
    <main className={mainContainerCls}>
      {/* Header */}
      <div className={`flex items-center justify-between border-b shrink-0 ${headerPaddingCls}`}>
        {isMobileLayout ? (
          <>
            <div className="flex items-center gap-2 min-w-0">
              {onBack && <IconButton className="rounded-full bg-white" onClick={onBack} icon={<ChevronLeft className="h-5 w-5 text-brand-600" />} />}
              <Avatar name={headerTitle} />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-800 truncate">{headerTitle}</div>
                <div className="text-[11px] text-gray-500 truncate">
                  {memberCount > 0 ? `${memberCount} thành viên` : 'Nhóm chat'} • <Badge type="waiting">Đang trao đổi</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {showSearch && (
                <input ref={searchInputRef} autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm tin nhắn" className="w-40 rounded-lg border px-3 py-2 text-sm border-brand-200" />
              )}
              <IconButton className="rounded-full bg-white" label={showSearch ? 'Đóng tìm kiếm' : 'Tìm kiếm trong chat'} onClick={() => setShowSearch(!showSearch)} icon={<Search className="h-4 w-4 text-brand-600" />} />
              <IconButton className="rounded-full bg-white" onClick={onOpenMobileMenu} icon={<MoreVertical className="h-4 w-4 text-brand-600" />} />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <Avatar name={headerTitle} />
              <div>
                <div className="text-sm font-semibold text-gray-800">{headerTitle}</div>
                <div className="text-xs text-gray-500">
                  {memberCount > 0 ? `${memberCount} thành viên` : 'Nhóm chat'} • 2 người đang xem • <Badge type="waiting">Chờ phản hồi</Badge>
                </div>
                {selectedGroup?.workTypes && selectedGroup.workTypes.length > 0 && (
                  <div className="mt-2">
                      <LinearTabs
                        tabs={selectedGroup.workTypes.map((w, idx) => {
                          const unread = idx === 1 ? 3 : 0; // ví dụ: tab 2 có 3 tin mới

                          return {
                            key: w.id,
                            label: (
                              <div className="relative inline-flex items-center gap-1">
                                <span>{w.name}</span>
                                {unread > 0 && (
                                  <span className="ml-1 inline-flex min-w-[16px] h-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-medium text-white">
                                    {unread}
                                  </span>
                                )}
                              </div>
                            ),
                          };
                        })}
                        active={selectedWorkTypeId ?? currentWorkTypeId ?? selectedGroup.workTypes[0]?.id}
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
                <input ref={searchInputRef} autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm tin nhắn trong hội thoại" className="w-72 rounded-lg border px-3 py-2 text-sm border-brand-200" />
              )}
              <IconButton className="rounded-full bg-white" label={showSearch ? 'Đóng tìm kiếm' : 'Tìm kiếm trong chat'} onClick={() => setShowSearch(!showSearch)} icon={<Search className="h-4 w-4 text-brand-600" />} />
              <IconButton className="rounded-full bg-white" label={rightExpanded ? 'Thu nhỏ panel phải' : 'Mở rộng panel phải'} onClick={onToggleRightExpand} icon={<ArrowLeftRight className="h-4 w-4 text-brand-600" />} />
              <IconButton className="rounded-full bg-white" label={showRight ? 'Ẩn panel phải' : 'Hiện panel phải'} onClick={() => setShowRight(!showRight)} icon={showRight ? <PanelRightClose className="h-4 w-4 text-brand-600" /> : <PanelRightOpen className="h-4 w-4 text-brand-600" />} />
            </div>
          </>
        )}
      </div>

      {/* WorkType tabs (mobile) */}
      {isMobileLayout && selectedGroup?.workTypes && selectedGroup.workTypes.length > 0 && (
        <div className="border-b px-2 pb-0 mt-2">
          <LinearTabs
            tabs={selectedGroup.workTypes.map((w, idx) => {
              const unread = idx === 1 ? 3 : 0; // ví dụ: tab 2 có 3 tin mới

              return {
                key: w.id,
                label: (
                  <div className="relative inline-flex items-center gap-1">
                    <span>{w.name}</span>
                    {unread > 0 && (
                      <span className="ml-1 inline-flex min-w-[16px] h-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-medium text-white">
                        {unread}
                      </span>
                    )}
                  </div>
                ),
              };
            })}
            
            active={selectedWorkTypeId ?? currentWorkTypeId ?? selectedGroup.workTypes[0]?.id}
            onChange={(id) => onChangeWorkType?.(id)}
            textClass="text-xs"
            noWrap
          />
        </div>
      )}

      {/* Inline toast (mobile, below header) */}
      {isMobileLayout && inlineToast && (
        <div className="px-3 py-2 text-xs bg-emerald-50 text-emerald-700 border-b border-emerald-200">
          {inlineToast}
        </div>
      )}

      {/* Message list */}
      <div className={`flex-1 overflow-y-auto space-y-1 min-h-0 bg-green-900/15 ${isMobileLayout ? 'p-2' : 'p-4'}`}>
        {messages.map((msg, i) => {
          const infoForMsg = receivedInfos?.find((x) => x.messageId === msg.id);
          const isReceived = !!infoForMsg;
          const receivedLabel = infoForMsg ? `Đã tiếp nhận bởi ${currentUserName}` : undefined;
          return (
            <MessageBubble
              key={msg.id}
              data={msg}
              prev={i > 0 ? messages[i - 1] : null}
              next={i < messages.length - 1 ? messages[i + 1] : null}
              onReply={(m) => setInputValue((prev) => (prev ? prev + '\n' : '') + `> ${m.type === 'text' ? m.content : '[Đính kèm]'}\n`)}
              onOpenTaskLog={(taskId) => onOpenTaskLog?.(taskId)}
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
              isMobileLayout={isMobileLayout}
              // mobile assign data + toast hook
              mobileMembers={mobileMembers}
              checklistVariants={mobileChecklistVariants}
              defaultChecklistVariantId={defaultChecklistVariantId}
              onCreateTaskFromMessage={(payload) => {
                onCreateTaskFromMessage?.(payload);
                const assigneeName =
                  mobileMembers.find((m) => m.id === payload.assigneeId)?.name || "nhân viên";
                showInlineToast(`Đã giao việc cho ${assigneeName}`);
              }}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer — mobile style */}
      {isMobileLayout ? (
        <div ref={composerRef} className="border-t p-2 shrink-0 pb-[calc(0.5rem+env(safe-area-inset-bottom,0))]">
          <div className="flex items-center justify-between">
            <Sheet open={openActions} onOpenChange={setOpenActions}>
              <SheetTrigger asChild>
                <IconButton className="bg-white" icon={<PlusCircle className="h-6 w-6 text-brand-600" />} />
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="rounded-t-2xl p-4 shadow-2xl w-[90%] max-w-[390px] left-1/2 -translate-x-1/2 right-auto top-auto"
                style={{ bottom: sheetBottom }}
              >
                <SheetHeader className="px-1">
                  <SheetTitle className="text-sm text-gray-700">Chọn hành động</SheetTitle>
                  <SheetDescription className="text-xs text-gray-500">Thêm nội dung hoặc đính kèm vào tin nhắn</SheetDescription>
                </SheetHeader>
                <div className="mt-3 space-y-2">
                  <button className="w-full flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-brand-50 transition" onClick={() => { setOpenActions(false); handlePickImage(); }}>
                    <Images className="h-5 w-5 text-emerald-600" /><span className="text-sm text-gray-800">Ảnh</span>
                  </button>
                  <button className="w-full flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-brand-50 transition" onClick={() => { setOpenActions(false); handlePickFile(); }}>
                    <Folder className="h-5 w-5 text-green-600" /><span className="text-sm text-gray-800">Tệp tin</span>
                  </button>
                  <button className="w-full flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-brand-50 transition" onClick={() => { setOpenActions(false); handleShareLocation(); }}>
                    <MapPin className="h-5 w-5 text-teal-600" /><span className="text-sm text-gray-800">Vị trí</span>
                  </button>
                  <button className="w-full flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-brand-50 transition" onClick={() => { setOpenActions(false); handleQuickMessage(); }}>
                    <MessageSquareText className="h-5 w-5 text-lime-600" /><span className="text-sm text-gray-800">Tin nhắn mẫu</span>
                  </button>
                  <button className="w-full flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-brand-50 transition" onClick={() => { setOpenActions(false); handleFormat(); }}>
                    <Type className="h-5 w-5 text-emerald-700" /><span className="text-sm text-gray-800">Định dạng</span>
                  </button>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex-1">
              <input
                className="w-full h-11 rounded-full border border-gray-300 px-4 text-sm placeholder-pink-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-sky-300"
                placeholder="Nhập tin nhắn…"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              />
            </div>

            <IconButton onClick={handlePickImage} className="bg-white" icon={<ImageUp className="h-6 w-6 text-brand-600" />} />
          </div>

          {/* Hidden inputs */}
          <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; onOpenCloseModalFor?.('attach-image'); e.currentTarget.value = ''; }} />
          <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; onOpenCloseModalFor?.('attach-file'); e.currentTarget.value = ''; }} />
        </div>
      ) : (
        <div className="border-t p-3 shrink-0">
          <div className="flex items-center gap-2">
            <input className="flex-1 rounded-lg border px-3 py-2 text-sm border-brand-200" placeholder="Nhập tin nhắn…" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} />
            <IconButton label="Tin nhắn mẫu" className="rounded-lg border border-brand-200 bg-white px-2 py-2 text-brand-600 hover:bg-brand-50" onClick={handleQuickMessage} icon={<MessageSquareText size={18} />} />
            <button onClick={handleSend} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700">
              <SendHorizonal className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-4 text-gray-600">
            <IconButton label="Đính kèm" icon={<Paperclip className="h-4 w-4" />} onClick={handlePickFile} />
            <IconButton label="Định dạng" icon={<Type className="h-4 w-4" />} onClick={handleFormat} />
          </div>
          <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; onOpenCloseModalFor?.('attach-image'); e.currentTarget.value = ''; }} />
          <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; onOpenCloseModalFor?.('attach-file'); e.currentTarget.value = ''; }} />
        </div>
      )}
    </main>
  );
};