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
import { MessageSquareIcon, ClipboardListIcon, UserIcon } from "lucide-react";
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

  // layout: desktop mặc định, mobile dùng cho /mobile
  layoutMode?: "desktop" | "mobile";

  // Tool actions from mobile header
  onOpenQuickMsg?: () => void;
  onOpenPinned?: () => void;
  onOpenTodoList?: () => void;
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
  } = props;
  
  const isMobile = layoutMode === "mobile";
  const bottomItems = [
    { key: "messages", label: "Tin nhắn", icon: <MessageSquareIcon className="w-5 h-5" /> },
    { key: "work", label: "Công việc", icon: <ClipboardListIcon className="w-5 h-5" /> },
    { key: "profile", label: "Cá nhân", icon: <UserIcon className="w-5 h-5" /> },
  ];

  const [mobileTab, setMobileTab] = React.useState<"messages" | "work" | "profile">(
    "messages"
  );

  // Khi chọn chat từ danh sách tin nhắn, giữ nguyên tab "messages" và hiển thị nội dung chat trong vùng nội dung chính
  const handleMobileSelectChat = (target: ChatTarget) => {
    onSelectChat(target);
    // Không chuyển tab nữa; vẫn ở "messages"
    if (isMobile) {
      setMobileTab("messages");
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
      <div className={`relative flex h-full flex-col bg-gray-50 ${mobileTab === "messages" && selectedChat ? "pb-0" : "pb-12"}`}>
        {/* Content theo tab */}
        <div className="flex-1 min-h-0">
          {/* TAB 1: messages = LeftSidebar / Pinned */}
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
                // Full-screen ChatMain khi đã chọn chat
                <div className="h-full min-h-0">
                  <ChatMain
                    selectedGroup={selectedGroup as any}
                    isMobile={true}
                    onBack={() => {
                      // Trả về danh sách Tin nhắn
                      onClearSelectedChat?.();
                      setMobileTab("messages");
                    }}
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
                    onOpenCloseModalFor={() => { }}
                    openPreview={openPreview}
                    // Pin message
                    onTogglePin={(msg) => {
                      setPinnedMessages((prev) => {
                        const exists = prev.some((p) => p.id === msg.id);
                        if (exists) return prev.filter((p) => p.id !== msg.id);

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
                              selectedGroup?.workTypes?.find(
                                (w) => w.id === selectedWorkTypeId
                              )?.name ?? "",
                            sender: msg.sender,
                            type: pinnedType,
                            content: msg.type === "text" ? msg.content : undefined,
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
            </div>
          )}

          {/* TAB 2: CHAT */}
          {/* {mobileTab === "chat" && (
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
                onOpenCloseModalFor={() => { }}
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
          )} */}

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

        {/* Bottom nav */}
        {!(mobileTab === "messages" && !!selectedChat) && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t">
          <nav className="grid grid-cols-3">
            {bottomItems.map((item) => (
              <button
                key={item.key}
                className={`flex flex-col items-center justify-center py-2 text-xs ${mobileTab === item.key ? "text-brand-600" : "text-gray-400"
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
