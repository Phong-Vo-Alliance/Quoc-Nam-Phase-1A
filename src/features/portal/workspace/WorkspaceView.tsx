import React from "react";
import { LeftSidebar } from "./LeftSidebar";
import { ChatMain } from "./ChatMain";
import { RightPanel } from "./RightPanel";
import { PinnedMessagesPanel } from "../components/PinnedMessagesPanel";

import type {
  Task,
  FileAttachment,
  PinnedMessage,
  GroupChat,
  Message,
  ReceivedInfo,
  ChecklistItem,
  ChecklistTemplateItem,
  ChecklistTemplateMap,
  TaskLogMessage,  
} from "../types";
import {
  MessageSquareIcon,
  ClipboardListIcon,
  UserIcon,
} from "lucide-react";

type ChatTarget = { type: "group" | "dm"; id: string };

interface WorkspaceViewProps {
  groups: GroupChat[];
  selectedGroup?: GroupChat;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onSelectGroup: (groupId: string) => void;

  contacts: Array<{
    id: string;
    name: string;
    role: "Leader" | "Member";
    online: boolean;
    lastMessage?: string;
    lastTime?: string;
    unreadCount?: number;
  }>;
  onSelectChat: (t: ChatTarget) => void;

  leftTab: "contacts" | "messages";
  setLeftTab: (v: "contacts" | "messages") => void;

  available: Task[];
  myWork: Task[];
  members: string[];

  showAvail: boolean;
  setShowAvail: (v: boolean) => void;

  showMyWork: boolean;
  setShowMyWork: (v: boolean) => void;

  handleClaim: (task: Task) => void;
  handleTransfer: (id: string, newOwner: string, title?: string) => void;

  openCloseModalFor: (id: string) => void;

  showRight: boolean;
  setShowRight: (v: boolean) => void;

  showSearch: boolean;
  setShowSearch: (v: boolean) => void;

  q: string;
  setQ: (v: string) => void;

  searchInputRef: React.RefObject<HTMLInputElement | null>;

  openPreview: (file: FileAttachment) => void;

  tab: "info" | "order" | "tasks";
  setTab: (v: "info" | "order" | "tasks") => void;
  tasks: Task[];
  groupMembers: Array<{ id: string; name: string; role?: "Leader" | "Member" }>;
  // onChangeTaskStatus: (id: string, nextStatus: Task["status"]) => void;
  // onToggleChecklist: (taskId: string, itemId: string, done: boolean) => void;
  // onUpdateTaskChecklist: (taskId: string, next: ChecklistItem[]) => void;
  applyTemplateToTasks?: (workTypeId: string, template: ChecklistTemplateItem[]) => void;
  // checklistTemplates: Record<string, Record<string, ChecklistTemplateItem[]>>;
  setChecklistTemplates: React.Dispatch<React.SetStateAction<Record<string, Record<string, ChecklistTemplateItem[]>>>>;

  workspaceMode: "default" | "pinned";
  setWorkspaceMode: (v: "default" | "pinned") => void;
  pinnedMessages?: PinnedMessage[];
  onClosePinned?: () => void;
  onOpenPinnedMessage?: (pin: PinnedMessage) => void;
  setPinnedMessages: React.Dispatch<React.SetStateAction<PinnedMessage[]>>;
  onUnpinMessage: (id: string) => void;
  onShowPinnedToast: () => void;

  viewMode: "lead" | "staff";

  workTypes: Array<{ id: string; name: string }>;
  selectedWorkTypeId: string;
  onChangeWorkType: (id: string) => void;

  currentUserId: string;
  currentUserName: string;
  currentUserDepartment?: string;
  onLogout?: () => void;
  selectedChat: ChatTarget | null;
  onClearSelectedChat?: () => void;

  onReceiveInfo?: (message: Message) => void;
  receivedInfos?: ReceivedInfo[];
  onTransferInfo?: (infoId: string, departmentId: string) => void;
  onAssignInfo?: (info: ReceivedInfo) => void;
  onAssignFromMessage?: (msg: Message) => void;
  openTransferSheet?: (info: ReceivedInfo) => void;
  onOpenTaskLog?: (taskId: string) => void;
  taskLogs?: Record<string, TaskLogMessage[]>;
  onOpenSourceMessage?: (messageId: string) => void;

  layoutMode?: "desktop" | "mobile";

  onOpenQuickMsg?: () => void;
  onOpenPinned?: () => void;
  onOpenTodoList?: () => void;

  checklistVariants?: { id: string; name: string; isDefault?: boolean }[];
  defaultChecklistVariantId?: string;
  onCreateTaskFromMessage?: (payload: {title: string; }) => void;

  // Task management
  onChangeTaskStatus: (id: string, nextStatus: Task["status"]) => void;
  onReassignTask?: (id: string, assigneeId: string) => void;
  onToggleChecklist: (taskId: string, itemId: string, done: boolean) => void;
  onUpdateTaskChecklist: (taskId: string, next: ChecklistItem[]) => void;

  // Checklist templates
  checklistTemplates: Record<string, Record<string, ChecklistTemplateItem[]>>;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = (props) => {
  const {
    groups,
    selectedGroup,
    messages,
    setMessages,
    onSelectGroup,
    contacts,
    selectedChat,
    onSelectChat,

    showRight,
    setShowRight,
    showSearch,
    setShowSearch,
    q,
    setQ,
    searchInputRef,
    openPreview,
    tab,
    setTab,
    tasks,
    groupMembers,
    // onChangeTaskStatus,
    // onToggleChecklist,
    // onUpdateTaskChecklist,
    applyTemplateToTasks,
    // checklistTemplates,
    setChecklistTemplates,

    viewMode,
    workTypes,
    selectedWorkTypeId,
    onChangeWorkType,
    currentUserId,
    currentUserName,
    currentUserDepartment,
    onLogout,
    onClearSelectedChat,

    workspaceMode,
    pinnedMessages,
    onClosePinned,
    onOpenPinnedMessage,
    setPinnedMessages,
    onUnpinMessage,
    onShowPinnedToast,

    onReceiveInfo,
    receivedInfos,
    onTransferInfo,
    onAssignInfo,
    onAssignFromMessage,
    openTransferSheet,
    onOpenTaskLog,
    taskLogs,
    onOpenSourceMessage,
    layoutMode = "desktop",
    onOpenQuickMsg,
    onOpenPinned,
    onOpenTodoList,

    checklistVariants,
    defaultChecklistVariantId,
    onCreateTaskFromMessage,

    onChangeTaskStatus,
    onReassignTask,
    onToggleChecklist,
    onUpdateTaskChecklist,
    checklistTemplates,
  } = props;

  const isMobile = layoutMode === "mobile";
  const bottomItems = [
    { key: "messages", label: "Tin nhắn", icon: <MessageSquareIcon className="w-5 h-5" /> },
    // { key: "work", label: "Công việc", icon: <ClipboardListIcon className="w-5 h-5" /> },
    { key: "profile", label: "Cá nhân", icon: <UserIcon className="w-5 h-5" /> },
  ];

  const [mobileTab, setMobileTab] = React.useState<"messages" | "work" | "profile">("messages");

  // Header expand toggle (still available)
  const [rightExpanded, setRightExpanded] = React.useState(false);

  // Desktop resizable RightPanel
  const containerRef = React.useRef<HTMLDivElement | null>(null);  

  // Constants
  const LEFT_WIDTH = 360;       // px
  const MIN_RIGHT_WIDTH = 360;  // px
  const DIVIDER_WIDTH = 8;      // px (w-2)
  const MIN_LEFT_TOTAL = 600;   // px — lock when the whole left side (Left + Chat + Divider) would be < 500

  // State
  const [rightPanelWidth, setRightPanelWidth] = React.useState<number>(360);

  // Drag refs
  const draggingRef = React.useRef(false);
  const startXRef = React.useRef(0);
  const startRightRef = React.useRef(0);

  // Measure content box width (exclude paddings)
  const readContentWidth = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) {
      // Mobile hoặc chưa mount → fallback an toàn
      return window.innerWidth;
    }

    const cs = window.getComputedStyle(el);
    const pl = parseFloat(cs.paddingLeft || "0");
    const pr = parseFloat(cs.paddingRight || "0");
    return el.clientWidth - pl - pr;
  }, []);

  // Clamp: allow dragging until (Left + Chat + Divider) reaches 500px
  const clampRightWidth = React.useCallback((candidate: number) => {
    const contentWidth = readContentWidth();
    // grid columns when showRight: 360px | 1fr | 8px | rightPanelWidth
    // leftTotal = contentWidth - rightPanelWidth
    const maxRight = contentWidth - MIN_LEFT_TOTAL; // stop when leftTotal == 500
    const minRight = MIN_RIGHT_WIDTH;
    return Math.max(minRight, Math.min(candidate, Math.max(minRight, maxRight)));
  }, [readContentWidth]);

  // Keep width valid on resize/toggles
  React.useEffect(() => {
    if (!showRight) return;
    setRightPanelWidth((prev) => clampRightWidth(prev));
  }, [showRight, clampRightWidth]);

  React.useEffect(() => {
    const onResize = () => setRightPanelWidth((prev) => clampRightWidth(prev));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clampRightWidth]);

  // Divider drag handlers
  const onDividerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!showRight || !containerRef.current) return;
    draggingRef.current = true;
    startXRef.current = e.clientX;
    startRightRef.current = rightPanelWidth;    
    window.addEventListener("mousemove", onWindowMouseMove);
    window.addEventListener("mouseup", onWindowMouseUp);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  };

  const onWindowMouseMove = (e: MouseEvent) => {
    if (!draggingRef.current) return;
    const delta = startXRef.current - e.clientX; // >0 when moving left (grow RightPanel), <0 when moving right (shrink RightPanel)
    const candidate = startRightRef.current + delta;
    setRightPanelWidth(clampRightWidth(candidate));
  };

  const onWindowMouseUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;    
    window.removeEventListener("mousemove", onWindowMouseMove);
    window.removeEventListener("mouseup", onWindowMouseUp);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
    setRightPanelWidth((v) => clampRightWidth(v)); // final clamp
  };

  // Expand by header button: keep Chat at 360, give the rest to Right
  const handleToggleRightExpand = React.useCallback(() => {
    if (!containerRef.current) {
      setRightExpanded((v) => !v);
      return;
    }
    const contentWidth = readContentWidth();
    const targetLeftTotal = LEFT_WIDTH + 360 + DIVIDER_WIDTH;
    const targetRight = contentWidth - targetLeftTotal;
    setRightPanelWidth(clampRightWidth(targetRight));
    setRightExpanded((v) => !v);
    setShowRight(true);
  }, [readContentWidth, clampRightWidth, setShowRight]);

  // Basic desktop select handlers (unchanged)
  const handleSelectGroupDesktop = (id: string) => {
    onSelectGroup(id);
    onSelectChat({ type: "group", id });
  };

  // Mobile handlers
  const handleMobileSelectChat = (target: ChatTarget) => {
    onSelectChat(target);
    if (isMobile) setMobileTab("messages");
  };

  const chatTitle =
    selectedChat?.type === "group"
      ? groups.find((g) => g.id === selectedChat.id)?.name ?? "Nhóm"
      : selectedChat?.type === "dm"
      ? contacts.find((c) => c.id === selectedChat.id)?.name ?? "Trò chuyện"
      : "Trò chuyện";

  const resolvePinnedTime = (msg: Message) => {
    if (msg.createdAt && !isNaN(Date.parse(msg.createdAt))) return msg.createdAt;
    if (typeof msg.time === "string" && /^\d{2}:\d{2}$/.test(msg.time)) {
      const [hh, mm] = msg.time.split(":").map(Number);
      const d = new Date();
      d.setHours(hh, mm, 0, 0);
      return d.toISOString();
    }
    return new Date().toISOString();
  };

  if (isMobile) {
    return (
      <div className={`relative flex h-full flex-col bg-gray-50 ${mobileTab === "messages" && selectedChat ? "pb-0" : "pb-12"}`}>
        <div className="flex-1 min-h-0">
          {mobileTab === "messages" && (
            <div className="h-full min-h-0 overflow-hidden flex flex-col">
              {workspaceMode === "pinned" ? (
                <PinnedMessagesPanel
                  messages={pinnedMessages ?? []}
                  onClose={onClosePinned || (() => props.setWorkspaceMode("default"))}
                  onOpenChat={(pin) => {
                    handleMobileSelectChat({ type: "group", id: pin.chatId });
                    onOpenSourceMessage?.(pin.id);
                  }}
                  onUnpin={onUnpinMessage}
                  onPreview={(file) => openPreview?.(file as any)}
                />
              ) : !selectedChat ? (
                <div className="h-full min-h-0 overflow-y-auto">
                  <LeftSidebar
                    currentUserId={"u_diem_chi"}
                    groups={groups}
                    selectedGroup={selectedGroup as any}
                    onSelectGroup={(id) => {
                      onSelectGroup(id);
                      handleMobileSelectChat({ type: "group", id });
                    }}
                    contacts={contacts}
                    onSelectChat={handleMobileSelectChat}
                    isMobile={true}
                    onOpenQuickMsg={onOpenQuickMsg}
                    onOpenPinned={onOpenPinned}
                    onOpenTodoList={onOpenTodoList}
                  />
                </div>
              ) : (
                <div className="h-full min-h-0">
                  <ChatMain
                    selectedGroup={selectedGroup as any}
                    isMobile={true}
                    onBack={() => {
                      onClearSelectedChat?.();
                      setMobileTab("messages");
                    }}
                    messages={messages}
                    setMessages={setMessages}
                    myWork={[]}
                    showRight={showRight}
                    setShowRight={setShowRight}
                    showSearch={showSearch}
                    setShowSearch={setShowSearch}
                    q={q}
                    setQ={setQ}
                    searchInputRef={searchInputRef}
                    onOpenCloseModalFor={() => {}}
                    openPreview={openPreview}
                    onTogglePin={(msg) => {
                      setPinnedMessages((prev) => {
                        const exists = prev.some((p) => p.id === msg.id);
                        if (exists) return prev.filter((p) => p.id !== msg.id);
                        const isImage = msg.fileInfo?.type === "image" || msg.files?.[0]?.type === "image";
                        const pinnedType: "text" | "image" | "file" =
                          isImage ? "image" : (msg.fileInfo?.type || msg.files?.[0]?.type) ? "file" : "text";
                        return [
                          ...prev,
                          {
                            id: msg.id,
                            chatId: msg.groupId,
                            groupName: selectedGroup?.name ?? "",
                            workTypeName:
                              selectedGroup?.workTypes?.find((w) => w.id === selectedWorkTypeId)?.name ?? "",
                            sender: msg.sender,
                            type: pinnedType,
                            content: msg.type === "text" ? msg.content : undefined,
                            preview: msg.type === "text" ? msg.content?.slice(0, 100) : "[Đính kèm]",
                            fileInfo: msg.fileInfo ?? msg.files?.[0] ?? undefined,
                            time: resolvePinnedTime(msg),
                          },
                        ];
                      });
                    }}
                    title={chatTitle}
                    currentWorkTypeId={selectedWorkTypeId}
                    workTypes={workTypes}
                    onChangeWorkType={onChangeWorkType}
                    currentUserId={currentUserId}
                    currentUserName={currentUserName}
                    selectedChat={selectedChat}
                    onReceiveInfo={onReceiveInfo}
                    onAssignFromMessage={onAssignFromMessage}
                    setTab={setTab}                    
                    receivedInfos={receivedInfos}
                    viewMode={viewMode}
                    tasks={tasks}
                    onOpenTaskLog={onOpenTaskLog}
                    taskLogs={taskLogs}

                    // mobile assign data
                    mobileMembers={groupMembers}
                    mobileChecklistVariants={checklistVariants}
                    defaultChecklistVariantId={defaultChecklistVariantId}
                    onCreateTaskFromMessage={onCreateTaskFromMessage}

                    // Mobile Task callbacks
                    onChangeTaskStatus={onChangeTaskStatus}
                    onReassignTask={onReassignTask}
                    onToggleChecklist={onToggleChecklist}
                    onUpdateTaskChecklist={onUpdateTaskChecklist}

                    checklistTemplates={checklistTemplates}
                    setChecklistTemplates={setChecklistTemplates}
                  />
                </div>
              )}
            </div>
          )}

          {mobileTab === "work" && (
            <div className="h-full min-h-0 overflow-hidden flex flex-col">
              <RightPanel
                tab={tab}
                setTab={setTab}
                groupId={selectedGroup?.id}
                groupName={
                  selectedChat?.type === "group"
                    ? groups.find((g) => g.id === selectedChat.id)?.name ?? "Nhóm"
                    : "Trò chuyện"
                }
                workTypeName={workTypes?.find((w) => w.id === selectedWorkTypeId)?.name ?? "—"}
                checklistVariants={
                  selectedGroup?.workTypes?.find((w) => w.id === selectedWorkTypeId)?.checklistVariants
                }
                viewMode={viewMode}
                selectedWorkTypeId={selectedWorkTypeId}
                currentUserId={currentUserId}
                tasks={tasks}
                members={groupMembers}
                onChangeTaskStatus={onChangeTaskStatus}
                onReassignTask={undefined}
                onToggleChecklist={onToggleChecklist}
                onUpdateTaskChecklist={onUpdateTaskChecklist}
                checklistTemplates={checklistTemplates}
                setChecklistTemplates={setChecklistTemplates}
                receivedInfos={receivedInfos}
                onTransferInfo={onTransferInfo}
                onAssignInfo={onAssignInfo}
                onOpenGroupTransfer={openTransferSheet}
                applyTemplateToTasks={applyTemplateToTasks}
                taskLogs={taskLogs}
                onOpenTaskLog={onOpenTaskLog}
                onOpenSourceMessage={onOpenSourceMessage}
              />
            </div>
          )}

          {mobileTab === "profile" && (
            <div className="p-4 space-y-4 text-sm">
              <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                <div className="font-medium text-gray-900">Thông tin cá nhân</div>
                <div className="mt-2 text-gray-700">
                  <div>Họ và tên: {currentUserName}</div>
                  <div>Phòng ban: {currentUserDepartment ?? "—"} </div>
                </div>
              </div>

              <button
                className="w-full rounded-lg bg-red-500 px-3 py-2 text-white text-sm active:opacity-90"
                onClick={onLogout}
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>

        {!(
          mobileTab === "messages" && !!selectedChat
        ) && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t">
            <nav className="grid grid-cols-2">
              {bottomItems.map((item) => (
                <button
                  key={item.key}
                  className={`flex flex-col items-center justify-center py-2 text-xs ${
                    mobileTab === item.key ? "text-brand-600" : "text-gray-400"
                  }`}
                  onClick={() => setMobileTab(item.key as typeof mobileTab)}
                >
                  {React.cloneElement(item.icon, { className: "w-5 h-5" })}
                  <span className="mt-1">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    );
  }

  // Desktop layout: grid with draggable divider controlling RightPanel width
  return (
    <div
      ref={containerRef}
      style={
        showRight
          ? { gridTemplateColumns: `360px 1fr ${DIVIDER_WIDTH}px ${rightPanelWidth}px` }
          : { gridTemplateColumns: `360px 1fr` }
      }
      className="grid h-full"
    >
      {/* Left */}
      <div className="h-full min-h-0 rounded-2xl border border-gray-300 overflow-y-auto">
        {workspaceMode === "pinned" ? (
          <PinnedMessagesPanel
            messages={pinnedMessages ?? []}
            onClose={onClosePinned || (() => props.setWorkspaceMode("default"))}
            onOpenChat={(pin) => {
              onSelectChat({ type: "group", id: pin.chatId });
              onOpenSourceMessage?.(pin.id);
            }}
            onUnpin={onUnpinMessage}
            onPreview={(file) => openPreview?.(file as any)}
          />
        ) : (
          <LeftSidebar
            currentUserId={"u_diem_chi"}
            groups={groups}
            selectedGroup={selectedGroup as any}
            onSelectGroup={(id) => {
              onSelectGroup(id);
              onSelectChat({ type: "group", id });
            }}
            contacts={contacts}
            onSelectChat={onSelectChat}
          />
        )}
      </div>

      {/* Center (ChatMain) — IMPORTANT: allow shrinking by setting min-w-0 */}
      <div className="h-full min-h-0 min-w-0">
        <ChatMain
          selectedGroup={selectedGroup as any}
          isMobile={false}
          messages={messages}
          setMessages={setMessages}
          myWork={[]}
          showRight={showRight}
          setShowRight={setShowRight}
          showSearch={showSearch}
          setShowSearch={setShowSearch}
          q={q}
          setQ={setQ}
          searchInputRef={searchInputRef}
          onOpenCloseModalFor={() => {}}
          openPreview={openPreview}
          onTogglePin={(msg) => {
            setPinnedMessages((prev) => {
              const exists = prev.some((p) => p.id === msg.id);
              if (exists) return prev.filter((p) => p.id !== msg.id);
              onShowPinnedToast();
              const isImage =
                msg.fileInfo?.type === "image" || msg.files?.[0]?.type === "image";
              const pinnedType: "text" | "image" | "file" =
                isImage
                  ? "image"
                  : (msg.fileInfo?.type || msg.files?.[0]?.type)
                    ? "file"
                    : "text";
              return [
                ...prev,
                {
                  id: msg.id,
                  chatId: msg.groupId,
                  groupName: selectedGroup?.name ?? "",
                  workTypeName:
                    selectedGroup?.workTypes?.find((w) => w.id === selectedWorkTypeId)?.name ?? "",
                  sender: msg.sender,
                  type: pinnedType,
                  content: msg.type === "text" ? msg.content : undefined,
                  preview:
                    msg.type === "text" ? msg.content?.slice(0, 100) : "[Đính kèm]",
                  fileInfo: msg.fileInfo ?? msg.files?.[0] ?? undefined,
                  time: resolvePinnedTime(msg),
                },
              ];
            });
          }}
          currentWorkTypeId={selectedWorkTypeId}
          title={chatTitle}
          workTypes={selectedGroup?.workTypes ?? []}
          selectedWorkTypeId={selectedWorkTypeId}
          onChangeWorkType={onChangeWorkType}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          selectedChat={selectedChat}
          onReceiveInfo={onReceiveInfo}
          onAssignFromMessage={onAssignFromMessage}
          setTab={setTab}
          receivedInfos={receivedInfos}
          viewMode={viewMode}
          tasks={tasks}
          onOpenTaskLog={onOpenTaskLog}
          taskLogs={taskLogs}
          rightExpanded={rightExpanded}
          onToggleRightExpand={handleToggleRightExpand}

          // Mobile Task callbacks
          onChangeTaskStatus={onChangeTaskStatus}
          onReassignTask={onReassignTask}
          onToggleChecklist={onToggleChecklist}
          onUpdateTaskChecklist={onUpdateTaskChecklist}

          checklistTemplates={checklistTemplates}
          setChecklistTemplates={setChecklistTemplates}
        />
      </div>

      {/* Divider (draggable) */}
      {showRight && (
        <div className="relative h-full">
          <div
            className="absolute left-1/2 top-1/2
               -translate-x-1/2 -translate-y-1/2
               w-2 h-32 rounded-full
               cursor-col-resize
               bg-brand-100 hover:bg-brand-200 active:bg-brand-400"
            onMouseDown={onDividerMouseDown}
            title="Kéo để thay đổi độ rộng panel phải"
          />
        </div>
      )}

      {/* Right */}
      {showRight && (
        <div className="h-full min-h-0 min-w-0 overflow-hidden flex flex-col rounded-2xl border border-gray-300 bg-white">
          <RightPanel
            tab={tab}
            setTab={setTab}
            groupId={selectedGroup?.id}
            groupName={
              selectedChat?.type === "group"
                ? (groups.find((g) => g.id === selectedChat.id)?.name ?? "Nhóm")
                : "Trò chuyện"
            }
            workTypeName={
              (workTypes?.find((w) => w.id === selectedWorkTypeId)?.name) ?? "—"
            }
            checklistVariants={
              selectedGroup?.workTypes?.find((w) => w.id === selectedWorkTypeId)?.checklistVariants
            }
            viewMode={viewMode}
            selectedWorkTypeId={selectedWorkTypeId}
            currentUserId={currentUserId}
            tasks={tasks}
            members={groupMembers}
            onChangeTaskStatus={onChangeTaskStatus}
            onReassignTask={undefined}
            onToggleChecklist={onToggleChecklist}
            onUpdateTaskChecklist={onUpdateTaskChecklist}
            checklistTemplates={checklistTemplates}
            setChecklistTemplates={setChecklistTemplates}
            receivedInfos={receivedInfos}
            onTransferInfo={onTransferInfo}
            onAssignInfo={onAssignInfo}
            onOpenGroupTransfer={openTransferSheet}
            applyTemplateToTasks={applyTemplateToTasks}
            taskLogs={taskLogs}
            onOpenTaskLog={onOpenTaskLog}
            onOpenSourceMessage={onOpenSourceMessage}
          />
        </div>
      )}
    </div>
  );
};