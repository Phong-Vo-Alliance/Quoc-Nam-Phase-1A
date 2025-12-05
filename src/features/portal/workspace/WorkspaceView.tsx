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
    onReceiveInfo,
    receivedInfos,
    onTransferInfo,
    onAssignInfo,
    onAssignFromMessage,
    openTransferSheet,
    onOpenTaskLog,
    taskLogs,
    onOpenSourceMessage,
  } = props;

  

  // 🔎 Tạo title cho ChatMain từ selectedChat
  const chatTitle =
    selectedChat?.type === "group"
      ? groups.find((g) => g.id === selectedChat.id)?.name ?? "Nhóm"
      : selectedChat?.type === "dm"
      ? contacts.find((c) => c.id === selectedChat.id)?.name ?? "Trò chuyện"
      : "Trò chuyện";

  return (
    <div
      className={`grid h-full min-h-0 gap-3 p-3 transition-all duration-300 ${showRight
          ? "grid-cols-[260px,1fr,360px]" // có panel phải
          : "grid-cols-[260px,1fr]"       // ẩn panel phải -> chỉ còn 2 cột
        }`}
    >

      {/* CỘT TRÁI */}
      <div className="h-full min-h-0 rounded-2xl border border-gray-300 overflow-y-auto">
        {/* LeftSidebar mới: chỉ hiển thị nhóm / liên hệ */}
        {workspaceMode === "pinned" ? (
          <PinnedMessagesPanel
            messages={pinnedMessages ?? []}
            onClose={onClosePinned || (() => props.setWorkspaceMode("default"))}
            onOpenChat={(pin) => onOpenPinnedMessage?.(pin)}
            onUnpin={(id) => {/* TODO: remove from pinned store nếu cần */ }}
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
          onTogglePin={() => { }}

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
