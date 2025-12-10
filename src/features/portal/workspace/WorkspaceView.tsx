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
  TaskLogMessage,
} from "../types";
// function scrollToMessage(id: number | string) {
//   const el = document.getElementById(`msg-${id}`);
//   if (el) {
//     // Cuộn đến giữa màn hình
//     el.scrollIntoView({ behavior: "smooth", block: "center" });

//     // Thêm lớp highlight
//     el.classList.add("pinned-highlight");

//     // Gỡ lớp highlight sau 2 giây
//     setTimeout(() => {
//       el.classList.remove("pinned-highlight");
//     }, 2000);
//   }
// }

type ChatTarget = { type: "group" | "dm"; id: string };

interface WorkspaceViewProps {
  // NEW: dữ liệu & chọn hội thoại
  groups: GroupChat[];

  // selectedGroup: {
  //   id: string;
  //   name: string;
  //   lastSender?: string;
  //   lastMessage?: string;
  //   lastTime?: string;
  //   unreadCount?: number;
  // } | null;
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
  // selectedChat: ChatTarget | null;
  onSelectChat: (t: ChatTarget) => void;

  // Giữ nguyên các prop cũ để không vỡ layout/logic hiện tại
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
  onChangeTaskStatus: (id: string, nextStatus: Task["status"]) => void;
  onToggleChecklist: (taskId: string, itemId: string, done: boolean) => void;
  onUpdateTaskChecklist: (taskId: string, next: ChecklistItem[]) => void;
  applyTemplateToTasks?: (workTypeId: string, template: ChecklistTemplateItem[]) => void;
  checklistTemplates: Record<string, Record<string, ChecklistTemplateItem[]>>; // workTypeId -> variantId -> template
  setChecklistTemplates: React.Dispatch<React.SetStateAction<Record<string, Record<string, ChecklistTemplateItem[]>>>>;

  // mode: "CSKH" | "THUMUA";
  // setMode: (v: "CSKH" | "THUMUA") => void;

  workspaceMode: "default" | "pinned";
  setWorkspaceMode: (v: "default" | "pinned") => void;
  pinnedMessages?: PinnedMessage[];
  onClosePinned?: () => void;
  onOpenPinnedMessage?: (pin: PinnedMessage) => void;
  setPinnedMessages: React.Dispatch<React.SetStateAction<PinnedMessage[]>>;  
  onUnpinMessage: (id: string) => void;
  onShowPinnedToast: () => void;

  viewMode: "lead" | "staff";

  // WorkType segmented control
  workTypes: Array<{ id: string; name: string }>;
  selectedWorkTypeId: string;
  onChangeWorkType: (id: string) => void;

  // NEW: current user + selected chat
  currentUserId: string;
  currentUserName: string;
  selectedChat: ChatTarget | null;

  onReceiveInfo?: (message: Message) => void;
  receivedInfos?: ReceivedInfo[];
  onTransferInfo?: (infoId: string, departmentId: string) => void;
  onAssignInfo?: (info: ReceivedInfo) => void;
  onAssignFromMessage?: (msg: Message) => void;
  openTransferSheet?: (info: ReceivedInfo) => void;
  onOpenTaskLog?: (taskId: string) => void;
  taskLogs?: Record<string, TaskLogMessage[]>;
  onOpenSourceMessage?: (messageId: string) => void;

  // layout: desktop mặc định, mobile dùng cho /mobile
  layoutMode?: "desktop" | "mobile";
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
    onChangeTaskStatus,
    onToggleChecklist,
    onUpdateTaskChecklist,
    applyTemplateToTasks,
    checklistTemplates,
    setChecklistTemplates, 

    viewMode,
    workTypes,
    selectedWorkTypeId,
    onChangeWorkType,
    currentUserId,
    currentUserName,

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
  } = props;
  
  const isMobile = layoutMode === "mobile";

  const [mobileTab, setMobileTab] = React.useState<"home" | "chat" | "work">(
    "home"
  );

  const handleMobileSelectChat = (target: ChatTarget) => {
    onSelectChat(target);
    if (isMobile) {
      setMobileTab("chat");
    }
  };

  // Tạo title cho ChatMain từ selectedChat
  const chatTitle =
    selectedChat?.type === "group"
      ? groups.find((g) => g.id === selectedChat.id)?.name ?? "Nhóm"
      : selectedChat?.type === "dm"
      ? contacts.find((c) => c.id === selectedChat.id)?.name ?? "Trò chuyện"
      : "Trò chuyện";

  const resolvePinnedTime = (msg: Message) => {
    // Nếu message có createdAt chuẩn → dùng luôn
    if (msg.createdAt && !isNaN(Date.parse(msg.createdAt))) {
      return msg.createdAt;
    }

    // Nếu msg.time đang là "HH:mm"
    if (typeof msg.time === "string" && /^\d{2}:\d{2}$/.test(msg.time)) {
      const [hh, mm] = msg.time.split(":").map(Number);
      const date = new Date();
      date.setHours(hh);
      date.setMinutes(mm);
      date.setSeconds(0);
      date.setMilliseconds(0);
      return date.toISOString();
    }

    // fallback
    return new Date().toISOString();
  };

    if (isMobile) {
    return (
      <div className="flex h-full flex-col bg-gray-50">
        {/* Content theo tab */}
        <div className="flex-1 min-h-0">
          {/* TAB 1: HOME = LeftSidebar / Pinned */}
          {mobileTab === "home" && (
            <div className="h-full min-h-0 overflow-y-auto">
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
              ) : (
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
                />
              )}
            </div>
          )}

          {/* TAB 2: CHAT */}
          {mobileTab === "chat" && (
            <div className="h-full min-h-0">
              <ChatMain
                selectedGroup={selectedGroup as any}                
                isMobile={true}
                onBack={() => setMobileTab("home")}
                // messages & state
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
                // Pin message → dùng chung logic đang có
                onTogglePin={(msg) => {
                  setPinnedMessages((prev) => {
                    const exists = prev.some((p) => p.id === msg.id);

                    // Nếu đã pin → bỏ pin
                    if (exists) {
                      return prev.filter((p) => p.id !== msg.id);
                    }

                    // Nếu chưa pin → thêm mới
                    const pinnedType =
                      msg.type === "image" || msg.files?.[0]?.type === "image"
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
                          selectedGroup?.workTypes?.find(
                            (w) => w.id === selectedWorkTypeId
                          )?.name ?? "",
                        sender: msg.sender,
                        type: pinnedType,
                        content:
                          msg.type === "text" ? msg.content : undefined,
                        preview:
                          msg.type === "text"
                            ? msg.content?.slice(0, 100)
                            : "[Đính kèm]",
                        fileInfo: msg.fileInfo ?? msg.files?.[0] ?? undefined,
                        time: resolvePinnedTime(msg),
                      },
                    ];
                  });
                }}
                // tiêu đề / context
                title={chatTitle}
                currentWorkTypeId={selectedWorkTypeId}
                workTypes={workTypes}
                onChangeWorkType={onChangeWorkType}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                selectedChat={selectedChat}
                // info / task log
                onReceiveInfo={onReceiveInfo}
                onAssignFromMessage={onAssignFromMessage}
                setTab={setTab}
                receivedInfos={receivedInfos}
                viewMode={viewMode}
                onOpenTaskLog={onOpenTaskLog}
                taskLogs={taskLogs}
              />
            </div>
          )}

          {/* TAB 3: WORK = RightPanel full screen */}
          {mobileTab === "work" && (
            <div className="h-full min-h-0 overflow-hidden flex flex-col">
              <RightPanel
                tab={tab}
                setTab={setTab}
                groupId={selectedGroup?.id}
                groupName={
                  selectedChat?.type === "group"
                    ? groups.find((g) => g.id === selectedChat.id)?.name ??
                      "Nhóm"
                    : "Trò chuyện"
                }
                workTypeName={
                  workTypes?.find((w) => w.id === selectedWorkTypeId)?.name ??
                  "—"
                }
                checklistVariants={
                  selectedGroup?.workTypes?.find(
                    (w) => w.id === selectedWorkTypeId
                  )?.checklistVariants
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

        {/* Bottom nav */}
        <nav className="flex h-14 border-t bg-white">
          <button
            type="button"
            onClick={() => setMobileTab("home")}
            className={`flex-1 flex flex-col items-center justify-center text-xs font-medium ${
              mobileTab === "home" ? "text-brand-600" : "text-gray-500"
            }`}
          >
            <span>Home</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("chat")}
            className={`flex-1 flex flex-col items-center justify-center text-xs font-medium ${
              mobileTab === "chat" ? "text-brand-600" : "text-gray-500"
            }`}
          >
            <span>Chat</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("work")}
            className={`flex-1 flex flex-col items-center justify-center text-xs font-medium ${
              mobileTab === "work" ? "text-brand-600" : "text-gray-500"
            }`}
          >
            <span>Công việc</span>
          </button>
        </nav>
      </div>
    );
  }

  return (
    <div
      className={`grid h-full min-h-0 gap-3 p-3 transition-all duration-300 ${showRight
          ? "grid-cols-[360px,1fr,360px]" // có panel phải
          : "grid-cols-[360px,1fr]"       // ẩn panel phải -> chỉ còn 2 cột
        }`}
    >

      {/* CỘT TRÁI */}
      <div className="h-full min-h-0 rounded-2xl border border-gray-300 overflow-y-auto">
        {/* LeftSidebar mới: chỉ hiển thị nhóm / liên hệ */}
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

      {/* CỘT GIỮA (ChatMain) */}
      <div className="h-full min-h-0">
        {/* ChatMain: truyền title động theo selectedChat */}
        <ChatMain
          selectedGroup={selectedGroup as any}
          isMobile={false}
          // các prop ChatMain hiện có:
          messages={messages}            // TODO: bạn sẽ nối messages theo selectedChat ở bước tiếp theo
          setMessages={setMessages}   // TODO: idem
          myWork={[]}              // nếu ChatMain cần, bạn có thể truyền myWork thật
          showRight={showRight}
          setShowRight={setShowRight}
          showSearch={showSearch}
          setShowSearch={setShowSearch}
          q={q}
          setQ={setQ}
          searchInputRef={searchInputRef}
          onOpenCloseModalFor={() => { }}
          openPreview={openPreview}
          onTogglePin={(msg) => {
            setPinnedMessages(prev => {
              const exists = prev.some(p => p.id === msg.id);

              // Nếu đã tồn tại → unpin
              if (exists) {
                return prev.filter(p => p.id !== msg.id);
              }

              // Nếu chưa có → thêm mới + SHOW TOAST
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
                    selectedGroup?.workTypes?.find(w => w.id === selectedWorkTypeId)?.name ?? "",
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


          // NEW:
          //currentUserId={"u_diem_chi"}  // hoặc lấy từ context đăng nhập
          //currentUserName={"Diễm Chi"}
          //selectedChat={selectedChat}
          currentWorkTypeId={selectedWorkTypeId}
          title={chatTitle}

          workTypes={selectedGroup?.workTypes ?? []}
          selectedWorkTypeId={selectedWorkTypeId}
          onChangeWorkType={onChangeWorkType}

          /* current user + selected chat (ChatMain cần để gửi tin đúng schema) */
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          selectedChat={selectedChat}

          onReceiveInfo={onReceiveInfo}
          onAssignFromMessage={onAssignFromMessage}
          setTab={setTab}
          receivedInfos={receivedInfos}
          viewMode={viewMode}

          onOpenTaskLog={onOpenTaskLog}
          taskLogs={taskLogs}
        />
      </div>

      {/* RightPanel giữ nguyên */}
      {showRight && (
        <div className="h-full min-h-0 overflow-hidden flex flex-col">
          <RightPanel
            tab={tab}
            setTab={setTab}
            groupId={selectedGroup?.id}
            // Truyền đúng ngữ cảnh cho tab "Thông tin"
            groupName={
              selectedChat?.type === "group"
                ? (groups.find(g => g.id === selectedChat.id)?.name ?? "Nhóm")
                : "Trò chuyện"
            }
            workTypeName={
              // nếu bạn đã có mảng workTypes [{id,name}]
              (workTypes?.find(w => w.id === selectedWorkTypeId)?.name) ?? "—"
            }

            checklistVariants={
              selectedGroup?.workTypes?.find(w => w.id === selectedWorkTypeId)
                ?.checklistVariants
            }

            /* Context người dùng + workType */
            viewMode={viewMode}                 // 'lead' | 'staff'
            selectedWorkTypeId={selectedWorkTypeId}
            currentUserId={currentUserId}

            /* Task */
            tasks={tasks}                        // mảng Task của group hiện tại (nếu có)            
            members={groupMembers}
            onChangeTaskStatus={onChangeTaskStatus}
            onReassignTask={undefined}
            onToggleChecklist={onToggleChecklist}
            onUpdateTaskChecklist={onUpdateTaskChecklist}
            checklistTemplates={checklistTemplates}
            setChecklistTemplates={setChecklistTemplates}

            /* Received Info */
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
