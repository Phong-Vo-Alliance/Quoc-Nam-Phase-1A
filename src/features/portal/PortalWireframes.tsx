import React, { useEffect, useRef, useState } from 'react';
import { ToastContainer, CloseNoteModal, FilePreviewModal } from './components';
import type { LeadThread, Task, TaskStatus, ToastKind, ToastMsg, FileAttachment, PinnedMessage, GroupChat, Message, ReceivedInfo, WorkType, ChecklistItem, TaskLogMessage } from './types';
import { WorkspaceView } from './workspace/WorkspaceView';
import { TeamMonitorView } from './lead/TeamMonitorView';
import { MainSidebar } from "./components/MainSidebar";
import { ViewModeSwitcher } from "@/features/portal/components/ViewModeSwitcher";
import { mockGroups as sidebarGroups, mockContacts } from "@/data/mockSidebar";
import { mockGroup_VH_Kho, mockGroup_VH_TaiXe, mockDepartments, mockChecklistTemplatesByVariant } from "@/data/mockOrg";
import { mockTasks } from "@/data/mockTasks";
import { mockMessagesByWorkType } from "@/data/mockMessages";
import { DepartmentTransferSheet } from '@/components/sheet/DepartmentTransferSheet';
import { AssignTaskSheet } from '@/components/sheet/AssignTaskSheet';
import { GroupTransferSheet } from "@/components/sheet/GroupTransferSheet";
import type { ChecklistTemplateMap, ChecklistTemplateItem } from './types';
import { TaskLogThreadSheet } from "./workspace/TaskLogThreadSheet";
import { WorkTypeManagerDialog } from './components/WorkTypeManagerDialog';

type PortalMode = "desktop" | "mobile";

interface PortalWireframesProps {
  portalMode?: PortalMode;
}

export default function PortalWireframes({ portalMode = "desktop" }: PortalWireframesProps) {
  // ---------- shared UI state ----------
  const [tab, setTab] = useState<'info' | 'order' | 'tasks'>('info');
  const [mode, setMode] = useState<'CSKH' | 'THUMUA'>('CSKH');
  const [leftTab, setLeftTab] = useState<'contacts' | 'messages'>('messages');
  const [showAvail, setShowAvail] = useState(false);
  const [showMyWork, setShowMyWork] = useState(false);
  const [view, setView] = useState<'workspace' | 'lead'>('workspace');
  const [workspaceMode, setWorkspaceMode] = useState<"default" | "pinned">("default");
  const [showRight, setShowRight] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [q, setQ] = useState('');
  // const [showPinned, setShowPinned] = useState(false);
  const [viewMode, setViewMode] = React.useState<"lead" | "staff">("lead");

  const [receivedInfos, setReceivedInfos] = useState<ReceivedInfo[]>([]);

  const [transferSheet, setTransferSheet] = useState({
    open: false,
    info: undefined as ReceivedInfo | undefined
  });

  const [groupTransferSheet, setGroupTransferSheet] = useState<{
    open: boolean;
    info?: ReceivedInfo;
  }>({
    open: false,
  });

  // WorkType Manager state
  const [showWorkTypeManager, setShowWorkTypeManager] = useState(false);
 

  // sẽ tính workTypes theo selectedGroup bên dưới
  // const workTypesFull = mockGroup_VH_Kho.workTypes ?? [];
  // const workTypes = workTypesFull.map(w => ({ id: w.id, name: w.name })); 

  // const [selectedWorkTypeId, setSelectedWorkTypeId] = React.useState<string>(
  //   mockGroup_VH_Kho.defaultWorkTypeId || workTypesFull[0]?.id
  // );

  // const defaultWorkTypeId =
  //   mockGroup_VH_Kho.defaultWorkTypeId ?? workTypesFull[0]?.id ?? "wt_default";

  // const mockGroups = [mockGroup_VH_Kho, mockGroup_VH_TaiXe];

  // const [selectedGroup, setSelectedGroup] = React.useState(mockGroup_VH_Kho);
   // hợp nhất 2 nguồn: UI metadata (sidebar)  cấu hình workTypes (org)
  const groupsMerged: GroupChat[] = React.useMemo(() => {
    const orgMap = new Map(
      [mockGroup_VH_Kho, mockGroup_VH_TaiXe].map(g => [g.id, g])
    );
    
    return sidebarGroups
    .map(sg => {
      const org = orgMap.get(sg.id);
      if (!org) return sg as GroupChat; // fallback nếu chưa có trong org
      return {
        ...org,         // ⚠️ giữ nguyên cấu trúc chuẩn GroupChat
        lastSender: sg.lastSender,
        lastMessage: sg.lastMessage,
        lastTime: sg.lastTime,
        unreadCount: sg.unreadCount,
      };
    })
    .filter(Boolean) as GroupChat[];
  }, []);

  const [selectedGroup, setSelectedGroup] = React.useState(groupsMerged[0]);
  const [selectedWorkTypeId, setSelectedWorkTypeId] = React.useState<string>(
    selectedGroup?.defaultWorkTypeId ?? selectedGroup?.workTypes?.[0]?.id ?? "wt_default"
  );

  // Danh sách "dạng checklist" (sub work type) của work type được chọn
  const checklistVariants =
    selectedGroup?.workTypes?.find((w) => w.id === selectedWorkTypeId)
      ?.checklistVariants ?? [];

  const defaultChecklistVariantId =
    checklistVariants.find((v) => v.isDefault)?.id ||
    checklistVariants[0]?.id ||
    undefined;

  /// --- Import mock message data ---
  // Lấy ra workTypeKey tương ứng từ id (mapping thủ công hoặc từ group)
  const getWorkTypeKey = (workTypeId?: string) => {
    switch (workTypeId) {
      case "wt_nhan_hang":
        return "nhanHang";
      case "wt_doi_tra":
        return "doiTra";
      case "wt_lich_boc_hang":
        return "lichBocHang";
      case "wt_don_boc_hang":
        return "donBocHang";
      default:
        return "nhanHang";
    }
  };

  const [messages, setMessages] = React.useState<Message[]>([]);

  React.useEffect(() => {
    if (!selectedGroup || !selectedWorkTypeId) return;

    const key = getWorkTypeKey(selectedWorkTypeId);
    const all = mockMessagesByWorkType[key] || [];

    const filtered = all.filter(
      (m) => m.groupId?.toLowerCase() === selectedGroup.id?.toLowerCase()
    );

    console.log("🔍 loadMessages", {
      selectedGroup: selectedGroup.id,
      selectedWorkTypeId,
      found: filtered.length,
    });

    setMessages(filtered);
  }, [selectedGroup?.id, selectedWorkTypeId]);

  // const [selectedWorkTypeId, setSelectedWorkTypeId] =
  //   React.useState<string>(defaultWorkTypeId);

  

  // (1) mock data cho sidebar
  const [groups] = React.useState(groupsMerged);
  const [contacts] = React.useState(mockContacts);

  // --- keyboard refs & shortcuts ---
  const searchInputRef = useRef<HTMLInputElement | null>(null);


  // --- Toast store ---
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  // --- Task log (nhật ký công việc) ---
  const [taskLogSheet, setTaskLogSheet] = useState<{
    open: boolean;
    taskId?: string;
  }>({ open: false });

  const [taskLogs, setTaskLogs] = useState<Record<string, TaskLogMessage[]>>({});
  const pushToast = (msg: string, kind: ToastKind = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, kind, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500);
  };
  const removeToast = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));

  // const filteredMessages = React.useMemo(
  //   () => messages.filter(m => !selectedWorkTypeId || m.workTypeId === selectedWorkTypeId),
  //   [messages, selectedWorkTypeId]
  // );

  // ---------- mock data & wiring ----------

  const [selectedChat, setSelectedChat] = React.useState<{ type: "group" | "dm"; id: string } | null>({
    type: "group",
    id: "grp_vh_kho", // mặc định mở nhóm “Vận hành - Kho Hàng”
  });

  const onClearSelectedChat = () => setSelectedChat(null);  

  // Checklist Template theo WorkType + Variant
  const [checklistTemplates, setChecklistTemplates] = React.useState<ChecklistTemplateMap>(mockChecklistTemplatesByVariant);

  // Thêm task dành cho leader để test
  const testLeaderTask: Task = {
    id: "task_leader_test_001",
    groupId: "grp_vh_kho",
    workTypeId: "wt_nhan_hang",
    sourceMessageId: "msg_test",
    title: "Kiểm tra báo cáo kho tháng 11",
    description: "Admin yêu cầu leader review báo cáo tổng hợp",
    assigneeId: "u_thanh_truc", // ✅ Assigned to leader
    assignedById: "u_admin",
    status: "todo",
    priority: "high",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    checklist: [
      { id: "chk_l1", label: "Xem báo cáo Excel", done: false },
      { id: "chk_l2", label: "So sánh với tháng trước", done: false },
      { id: "chk_l3", label: "Gửi feedback cho Admin", done: false },
    ],
    history: [],
  };

  // Add to tasks state
  const [tasks, setTasks] = React.useState(() =>
    structuredClone([...mockTasks, testLeaderTask])
  );

  // Dynamic user based on viewMode
  const currentUser = viewMode === 'lead' ? 'Thanh Trúc' : 'Diễm Chi';
  const currentUserId = viewMode === 'lead' ? 'u_thanh_truc' : 'u_diem_chi';
  const currentUserDepartment = viewMode === 'lead' ? 'Quản lý vận hành' : 'Nhân viên kho';

  const members = ['Thu An', 'Lệ Bình', 'Diễm Chi'];
  //const now = new Date().toISOString();
  const nowIso = () => new Date().toISOString();

  const [available, setAvailable] = useState<Task[]>([
    {
      id: "task-001",
      groupId: "grp-vanhanh-kho",
      workTypeId: "wt_nhan_hang",
      sourceMessageId: "msg-001",
      title: "PO#1246 – Nhận hàng tại kho HCM",
      description: "Nhận hàng lô số 1246 cần kiểm tra số lượng và tình trạng.",
      assigneeId: "u_thu_an",
      assignedById: "u_thanh_truc",
      status: "todo",
      priority: "normal",
      dueAt: new Date(Date.now() + 3 * 86400000).toISOString(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      checklist: [
        { id: "chk1", label: "Kiểm đếm số lượng", done: false },
        { id: "chk2", label: "Xác nhận phiếu nhập kho", done: false },
      ],
      history: [],
    },
  ]);

  // const [available, setAvailable] = useState<Task[]>([
  //   { id: 'PO1246', title: 'PO#1246 – Nhận hàng', status: 'waiting', createdAt: '15’ trước' },
  //   { id: 'PO1247', title: 'PO#1247 – Trả hàng', status: 'waiting', createdAt: '10’ trước' },
  //   { id: 'CSKH002', title: 'Vựa', status: 'waiting', createdAt: '8’ trước' },
  // ]);

  const [myWork, setMyWork] = useState<Task[]>([
    {
      id: "task-002",
      groupId: "grp-vanhanh-kho",
      workTypeId: "doi_tra",
      sourceMessageId: "msg-002",
      title: "Xử lý đổi trả đơn hàng #5689",
      description: "Khách yêu cầu đổi do sai kích thước.",
      assigneeId: "u_diem_chi",
      assignedById: "u_thanh_truc",
      status: "in_progress",
      priority: "high",
      dueAt: new Date(Date.now() + 2 * 86400000).toISOString(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      checklist: [
        { id: "chk3", label: "Kiểm tra tình trạng hàng", done: true },
        { id: "chk4", label: "Tạo phiếu đổi trả", done: false },
      ],
      history: [],
    },
  ]);
  // const [myWork, setMyWork] = useState<Task[]>([
  //   { id: 'PO1245', title: 'PO#1245 – Nhận hàng', status: 'processing', updatedAt: '2 phút trước' },
  //   { id: 'CSKH001', title: 'CSKH – Lên đơn', status: 'waiting', updatedAt: '15 phút trước' },
  // ]);


  const [leadThreads, setLeadThreads] = useState<LeadThread[]>([
    { id: 'PO1245', t: 'PO#1245 – Nhận hàng', type: 'Nội bộ', owner: 'Lê Chi', st: 'Đang xử lý', at: '2 phút trước' },
    { id: 'CSKH001', t: 'CSKH – Lên đơn', type: 'POS', owner: 'Nguyễn An', st: 'Chờ phản hồi', at: '10 phút trước' },
    { id: 'TEL302', t: 'Vận Hành Kho - Đổi Trả #302', type: 'Nội bộ', owner: 'Trần Bình', st: 'Đã chốt', at: '1 phút trước' },
  ]);


  const [assignOpenId, setAssignOpenId] = useState<string | null>(null);


  // --- Close note modal state ---
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeNote, setCloseNote] = useState('');
  const [closeTargetId, setCloseTargetId] = useState<string | null>(null);


  // --- File preview modal state ---
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileAttachment | null>(null);


  // -- Pinned messages (mock) ---  
  const [showPinnedToast, setShowPinnedToast] = useState(false);

  const onShowPinnedToast = () => {
    setShowPinnedToast(true);
    setTimeout(() => setShowPinnedToast(false), 2000);
  };

  const [pinnedMessages, setPinnedMessages] = React.useState<PinnedMessage[]>([
    {
      // dùng luôn id của message gốc trong mockMessages.ts
      id: "msg_0008",
      chatId: "grp_vh_kho",
      groupName: "Vận hành – Kho Hàng",
      workTypeName: "Nhận hàng",
      sender: "Thu An",
      type: "text",
      content: "Đã nhận đủ hàng PO-2025-002, không chênh lệch.",
      preview: "Đã nhận đủ hàng PO-2025-002, không chênh lệch.",
      time: new Date().toISOString(),
    },
    {
      id: "msg_0012",
      chatId: "grp_vh_kho",
      groupName: "Vận hành – Kho Hàng",
      workTypeName: "Nhận hàng",
      sender: "Diễm Chi",
      type: "image",
      preview: "[Hình ảnh] kiện hàng số 12",
      time: new Date().toISOString(),
      fileInfo: {
        name: "kien_hang_12.jpg",
        type: "image",
        url: "/mock/img/kien_hang_12.jpg",
      },
    },
  ]);
  // Xử lý mở tin nhắn đã ghim


  const [scrollToMessageId, setScrollToMessageId] = React.useState<string | undefined>(undefined);

  const handleUnpinMessage = (id: string) => {
    setPinnedMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const handleOpenPinnedMessage = (pin: PinnedMessage) => {
    // 1) mở đúng hội thoại (group/private) theo chatId
    setSelectedChat({ type: "group", id: pin.chatId }); // nếu có chat cá nhân thì phân nhánh ở đây

    // 2) đóng panel pin
    setWorkspaceMode("default");

    // 3) xác định messageId để ChatMain cuộn tới
    // tuỳ cấu trúc replyTo của bạn; dùng fallback an toàn:
    const targetId = pin.id;
    //   (pin.replyTo as any)?.id ||
    //   (pin.replyTo as any)?.messageId ||
    //   undefined;
    if (targetId) setScrollToMessageId(targetId);
  };

// Dùng chung cho các nơi muốn "xem tin nhắn gốc"
// (pinned message, xem từ tab Thông tin, v.v.)
const handleOpenSourceMessage = React.useCallback(
  (messageId: string) => {
    setScrollToMessageId(messageId);
  },
  []
);

  // Khi scrollToMessageId thay đổi -> cuộn tới tin nhắn tương ứng
  React.useEffect(() => {
    if (!scrollToMessageId) return;

    const el = document.getElementById(`msg-${scrollToMessageId}`);
    if (el) {
      // Cuộn vào giữa màn hình
      el.scrollIntoView({ behavior: "smooth", block: "center" });

      // Thêm highlight giống pinned
      el.classList.add("pinned-highlight");
      window.setTimeout(() => {
        el.classList.remove("pinned-highlight");
      }, 2000);
    }

    // reset để lần sau click lại vẫn trigger được
    setScrollToMessageId(undefined);
  }, [scrollToMessageId]);

  // helpers
  const setThreadOwner = (id: string, owner: string) =>
    setLeadThreads((rows) => rows.map((r) => (r.id === id ? { ...r, owner, at: 'vừa xong' } : r)));
  const setThreadStatus = (id: string, label: LeadThread['st']) =>
    setLeadThreads((rows) => rows.map((r) => (r.id === id ? { ...r, st: label, at: 'vừa xong' } : r)));

  function enrichTasks(tasks: Task[], workTypes: WorkType[]) {
    return tasks.map(t => {
      const wt = workTypes.find(w => w.id === t.workTypeId);
      return {
        ...t,
        workTypeName: wt?.name ?? t.workTypeId,  // fallback ID
        progressText: t.checklist?.length
          ? `${t.checklist.filter(c => c.done).length}/${t.checklist.length} mục`
          : "Không có checklist"
      };
    });
  }

  // React.useEffect(() => {
  //   setTasks(prev => enrichTasks(prev, selectedGroup?.workTypes ?? []));
  // }, [selectedGroup]);

  React.useEffect(() => {
    setTasks(prev =>
      prev.map(t => {
        const wt = selectedGroup?.workTypes?.find(w => w.id === t.workTypeId);
        return {
          ...t,
          workTypeName: wt?.name ?? t.workTypeId,
          progressText: t.checklist?.length
            ? `${t.checklist.filter(c => c.done).length}/${t.checklist.length} mục`
            : "Không có checklist",
        };
      })
    );
  }, [selectedGroup]);

  const groupMembers: { id: string; name: string; role?: "Leader" | "Member" | undefined; }[] = [
    { id: "u_thanh_truc", name: "Thanh Trúc", role: "Leader" },
    { id: "u_thu_an", name: "Thu An" },
    { id: "u_diem_chi", name: "Diễm Chi" },
    { id: "u_le_binh", name: "Lệ Bình" },
  ];

  const createMockTask = (
    id: string,
    title: string,
    status: TaskStatus,
    currentUser: string,
    newOwner?: string
  ): Task => ({
    id,
    groupId: "grp-vanhanh-kho",
    workTypeId: "wt_nhan_hang",
    sourceMessageId: id,
    title,
    description: "",
    assigneeId: newOwner || currentUser,
    assignedById: currentUser,
    status,
    priority: "normal",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    checklist: [],
    history: [],
  });

  // Handlers cập nhật Task (status & checklist)
  const handleChangeTaskStatus = (id: string, next: "todo"|"in_progress"|"awaiting_review"|"done") => {
    setTasks(prev =>
      prev.map(t => t.id === id
        ? { ...t, status: next, updatedAt: new Date().toISOString() }
        : t
      )
    );
  };

  const handleToggleChecklist = (taskId: string, itemId: string, done: boolean) => {
    setTasks(prev =>
      prev.map(t => t.id === taskId
        ? {
          ...t,
          checklist: t.checklist?.map(c => c.id === itemId ? { ...c, done } : c),
          updatedAt: new Date().toISOString(),
        }
        : t
      )
    );
  };

  const handleUpdateTaskChecklist = (taskId: string, next: ChecklistItem[]) => {
    setTasks(prev => {
      return prev.map(t => {
        if (t.id !== taskId) return t;

        const updated = {
          ...t,
          checklist: [...next],
          updatedAt: new Date().toISOString(),
        };

        // enrich progressText ngay lập tức
        const wt = selectedGroup?.workTypes?.find(w => w.id === updated.workTypeId);
        return {
          ...updated,
          workTypeName: wt?.name ?? updated.workTypeId,
          progressText: updated.checklist.length
            ? `${updated.checklist.filter(c => c.done).length}/${updated.checklist.length} mục`
            : "Không có checklist",
        };
      });
    });
  };


  // Áp dụng template mới cho tất cả Task.todo thuộc workType
  const applyTemplateToTasks = (workTypeId: string, tpl: ChecklistTemplateItem[]) => {
    setTasks(prev =>
      prev.map(t =>
        t.workTypeId === workTypeId && t.status === "todo"
          ? {
            ...t,
            checklist: tpl.map(it => ({
              id: "chk_" + Math.random().toString(36).slice(2),
              label: it.label,
              done: false,
            })),
          }
          : t
      )
    );
  };


  const handleClaim = (task: Task) => {
    const updated: Task = {
      ...task,
      status: "in_progress",
      updatedAt: new Date().toISOString(),
      history: [
        ...(task.history ?? []),
        { at: new Date().toISOString(), byId: "staff-an", type: "status_change", payload: { from: task.status, to: "in_progress" } },
      ],
    };
    setMyWork((prev) => [...prev, updated]);
    setAvailable((prev) => prev.filter((t) => t.id !== task.id));    
    pushToast(`Đã nhận: ${task.title}`, 'success');
  };

  const handleTransfer = (id: string, newOwner: string, title?: string) => {    
    setThreadOwner(id, newOwner);
    if (newOwner !== currentUser) {
      // chuyển đi
      setMyWork((prev) => prev.filter((x) => x.id !== id));
      setAvailable((prev) =>
        prev.some((x) => x.id === id)
          ? prev
          : [
            ...prev,
            createMockTask(id, title || id, "todo", currentUser, newOwner),
          ]
      );
      pushToast(`Đã chuyển ${title || id} → ${newOwner}`, "info");
    } else {
      // nhận lại
      setMyWork((prev) =>
        prev.some((x) => x.id === id)
          ? prev
          : [
            createMockTask(id, title || id, "in_progress", currentUser),
            ...prev,
          ]
      );
      setAvailable((prev) => prev.filter((x) => x.id !== id));
      pushToast(`Đã nhận lại ${title || id}`, "success");
    }
  };


  const handleClose = (id: string) => {
    setMyWork((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: "done", updatedAt: new Date().toISOString() } : t
      )
    );
    pushToast(`Đã đóng: ${id}`, 'success');
  };


  const handleLeadAssign = (id: string, newOwner: string, title?: string) => {    
    setThreadOwner(id, newOwner);
    setAssignOpenId(null);

    if (newOwner === currentUser) {
      // leader tự assign cho mình
      setMyWork((prev) =>
        prev.some((x) => x.id === id)
          ? prev
          : [
            createMockTask(id, title || id, "todo", currentUser),
            ...prev,
          ]
      );
      setAvailable((prev) => prev.filter((x) => x.id !== id));
    } else {
      // assign cho staff khác
      setMyWork((prev) => prev.filter((x) => x.id !== id));
      setAvailable((prev) =>
        prev.some((x) => x.id === id)
          ? prev
          : [
            ...prev,
            createMockTask(id, title || id, "todo", currentUser, newOwner),
          ]
      );
    }

    pushToast(`Assign ${title || id} → ${newOwner}`, "info");
  };

  // const handleSelectGroup = (groupId: string) => {
  //   const g = mockGroups.find((x) => x.id === groupId);
  //   if (g) setSelectedGroup(g);
  // };
  const handleSelectGroup = (groupId: string) => {
    const g = groups.find((x) => x.id === groupId);
    if (!g) return;
    setSelectedGroup(g);
    setSelectedChat({ type: "group", id: g.id });
    setSelectedWorkTypeId(
      g.defaultWorkTypeId ?? g.workTypes?.[0]?.id ?? selectedWorkTypeId
    );
  };

  React.useEffect(() => {
    const saved = localStorage.getItem("viewMode");
    if (saved === "staff" || saved === "lead") setViewMode(saved);
  }, []);

  React.useEffect(() => {
    localStorage.setItem("viewMode", viewMode);
  }, [viewMode]);

//   React.useEffect(() => {
//   if (selectedChat?.type === "group" && selectedChat.id === mockGroup_VH_Kho.id) {
//     setSelectedWorkTypeId(mockGroup_VH_Kho.defaultWorkTypeId);
//   }
// }, [selectedChat]);

  // React.useEffect(() => {
  //   if (selectedChat?.type === "group" && selectedChat.id === mockGroup_VH_Kho.id) {
  //     setSelectedWorkTypeId(
  //       mockGroup_VH_Kho.defaultWorkTypeId ?? workTypesFull[0]?.id ?? defaultWorkTypeId
  //     );
  //   }
  // }, [selectedChat, workTypesFull, defaultWorkTypeId]);


  // --- Keyboard shortcuts ---
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setShowSearch(true);
        requestAnimationFrame(() => searchInputRef.current?.focus());
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        // focus message input — để simple: bật search (tùy bạn gắn ref input chat sau)
        setShowSearch(false);
      }
      if (e.key === 'Escape') {
        setShowCloseModal(false);
        setShowPreview(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // --- Close modal handlers ---
  const openCloseModalFor = (id: string) => {
    setCloseTargetId(id);
    setShowCloseModal(true);
  };
  const confirmClose = () => {
    if (closeTargetId) {
      handleClose(closeTargetId);
      if (closeNote.trim()) console.log('[close-note]', closeTargetId, closeNote);
    }
    setCloseNote('');
    setCloseTargetId(null);
    setShowCloseModal(false);
  };


  // --- Preview handlers ---
  const openPreview = (file: FileAttachment) => {
    setPreviewFile(file);
    setShowPreview(true);
  };

  const handleSelectChat = (target: { type: "group" | "dm"; id: string }) => {
    setSelectedChat(target);
    // TODO: nếu muốn: load messages theo group/dm tại đây
    // setMessages(messagesByTarget[target.type][target.id] ?? []);
  }; 

  // Hàm xử lý khi Leader nhấn “Tiếp nhận thông tin”
  const handleReceiveInfo = (message: Message) => {
    const nowIso = new Date().toISOString();

    // ĐÃ TIẾP NHẬN RỒI THÌ THÔI
    const existed = receivedInfos.some(info => info.messageId === message.id);
    if (existed) {
      pushToast("Tin nhắn này đã được tiếp nhận trước đó.", "info");
      return;
    }

    // 1) Create ReceivedInfo item
    const info: ReceivedInfo = {
      id: "info_" + message.id,
      messageId: message.id,
      groupId: message.groupId,
      title: (message.content ?? "").slice(0, 60),
      sender: message.sender,
      createdAt: nowIso,
      status: "waiting",
    };

    setReceivedInfos(prev => [...prev, info]);

    // 2) Add system message
    const excerpt =
      (message.content ?? "").length > 40
        ? (message.content ?? "").slice(0, 40) + "…"
        : (message.content ?? "");

    const systemMsg: Message = {
      id: "sys_" + Date.now(),
      type: "system",
      content: `${excerpt} được tiếp nhận bởi ${currentUser} lúc ${new Date(nowIso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }`,
      sender: "system",
      senderId: "system",
      groupId: message.groupId,
      time: nowIso,
      createdAt: nowIso,
      isMine: false,
      isPinned: false,
      isSystem: true,
    };

    setMessages(prev => [...prev, systemMsg]);

    // 3) Auto open RightPanel + switch tab
    setShowRight(true);
    setTab("order"); // tab Công việc

    pushToast("Đã tiếp nhận thông tin.", "success");
  };

  // Handler onAssignInfo, mở cùng Action Sheet assign task đang dùng
  const [assignSheet, setAssignSheet] = useState<{
    open: boolean;
    source?: "message" | "receivedInfo";
    message?: Message;
    info?: ReceivedInfo;
  }>({
    open: false,
  });

  const onAssignInfo = (info: ReceivedInfo) => {
    setAssignSheet({
      open: true,
      source: "receivedInfo",
      info,
      message: undefined, // vì assign từ info, không phải từ message
    });
  };

  const onAssignFromMessage = (msg: Message) => {
    setAssignSheet({
      open: true,
      source: "message",
      message: msg,
      info: undefined,
    });
  };

  const openTransferSheet = (info: ReceivedInfo) => {
    setGroupTransferSheet({ open: true, info });
  };

  const handleTransferInfo = (infoId: string, departmentId: string) => {
    setReceivedInfos(prev =>
      prev.map(i =>
        i.id === infoId ? { ...i, status: "transferred", transferredTo: departmentId } : i
      )
    );

    pushToast("Đã chuyển thông tin sang phòng ban.", 'success');
  };

  const handleCreateTask = ({
    title,
    sourceMessageId,
    assigneeId,
    checklistVariantId,
    checklistVariantName,
  }: {
    title: string;
    sourceMessageId?: string;
    assigneeId?: string;
    checklistVariantId?: string;
    checklistVariantName?: string;
  }): void => {        
        
    // Xác định WorkType & variant (ưu tiên variant được chọn từ AssignTaskSheet)
    const wt = selectedGroup?.workTypes?.find((w) => w.id === selectedWorkTypeId);

    let variantId = checklistVariantId;
    let variantName = checklistVariantName;

    if (!variantId) {
      const defaultVariant =
        wt?.checklistVariants?.find((v) => v.isDefault) ?? wt?.checklistVariants?.[0];

      variantId = defaultVariant?.id;
      variantName = defaultVariant?.name;
    }

    const tplItems =
      variantId && checklistTemplates[selectedWorkTypeId]?.[variantId]
        ? checklistTemplates[selectedWorkTypeId][variantId]
        : [];

    const newTask: Task = {
      id: "task_" + Date.now(),
      title,
      description: title,
      groupId: selectedGroup?.id ?? "",
      sourceMessageId: sourceMessageId ?? "",
      assigneeId: assigneeId ?? currentUserId, // nếu không có thì giao cho currentUser
      assignedById: currentUser,
      workTypeId: selectedWorkTypeId,
      workTypeName: wt?.name,
      checklistVariantId: variantId,
      checklistVariantName: variantName,
      status: "todo",
      checklist: tplItems.map((it) => ({
        id: "chk_" + Math.random().toString(36).slice(2),
        label: it.label,
        done: false,
      })),

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };


    setTasks((prev) => [...prev, newTask]);
    setTab("tasks");
    setShowRight(true);

    setTaskLogs((prev) => ({
      ...prev,
      [newTask.id]: [],
    }));

    // Liên kết task mới với message gốc (nếu có)    
    if (sourceMessageId) {      
      setMessages(prev =>
        prev.map(m =>
          m.id === sourceMessageId
            ? { ...m, taskId: newTask.id }
            : m
        )
      );
    }

    // Nếu assign từ ReceivedInfo → đổi trạng thái
    if (assignSheet.source === "receivedInfo" && assignSheet.info) {
      setReceivedInfos((prev) =>
        prev.map((i) =>
          i.id === assignSheet.info!.id
            ? { ...i, status: "assigned" }
            : i
        )
      );
    }
    
    pushToast("Đã giao công việc.", 'success');
  };

  // Handler:  Update group's workTypes
  const handleUpdateGroupWorkTypes = (groupId: string, updatedWorkTypes: WorkType[]) => {
    // 1. Update groups array
    const newGroups = groups.map((g) =>
      g.id === groupId ? { ...g, workTypes: updatedWorkTypes } : g
    );

    // Note: Since groups is const from useState, we need to update via parent
    // For now, we'll update local selectedGroup if it matches
    if (selectedGroup?.id === groupId) {
      setSelectedGroup({
        ...selectedGroup,
        workTypes: updatedWorkTypes,
      });

      // If current workType no longer exists, switch to first available or default
      const currentWorkTypeStillExists = updatedWorkTypes.some(
        (wt) => wt.id === selectedWorkTypeId
      );

      if (!currentWorkTypeStillExists) {
        const newDefaultId =
          updatedWorkTypes.find((wt) => wt.id === selectedGroup.defaultWorkTypeId)?.id ??
          updatedWorkTypes[0]?.id;

        if (newDefaultId) {
          setSelectedWorkTypeId(newDefaultId);
        }
      }
    }

    pushToast("Đã cập nhật loại việc.", "success");
  };

  const handleGroupTransferConfirm = ({
    infoId,
    toGroupId,
    workTypeId,
    assigneeId,
    toGroupName,
    toWorkTypeName,
  }: {
    infoId: string;
    toGroupId: string;
    workTypeId: string;
    assigneeId: string;
    toGroupName: string;
    toWorkTypeName: string;
  }) => {
    setReceivedInfos((prev) =>
      prev.map((inf) =>
        inf.id === infoId
          ? { ...inf, status: "transferred", transferredTo: toGroupId, transferredToGroupName: toGroupName, transferredWorkTypeName: toWorkTypeName }
          : inf
      )
    );

    pushToast("Đã chuyển thông tin sang nhóm mới.", "success");
  };

    const handleSendTaskLogMessage = ({
    content,
    replyToId,
  }: {
    content: string;
    replyToId?: string;
  }) => {
    if (!taskLogSheet.taskId) return;
    const taskId = taskLogSheet.taskId;
    const now = new Date();

    const existing = taskLogs[taskId] ?? [];

    let replyTo: TaskLogMessage["replyTo"] | undefined;
    if (replyToId) {
      const original = existing.find(m => m.id === replyToId);
      if (original) {
        const type =
          original.type === "text" || original.type === "file" || original.type === "image"
            ? original.type
            : "text";
        replyTo = {
          id: original.id,
          type,
          sender: original.sender,
          content: original.content,
          // nếu sau này hỗ trợ ảnh/file trong log thì map thêm tại đây
          fileInfo: original.fileInfo,
        };
      }
    }

    const newMsg: TaskLogMessage = {
      id: "tlog_" + now.getTime().toString(36) + "_" + Math.random().toString(36).slice(2, 6),
      taskId,
      senderId: currentUserId,
      sender: currentUser,
      type: "text",
      content,
      time: now.toISOString(),
      createdAt: now.toISOString(),
      isMine: true,
      files: [],
      fileInfo: undefined,
      replyTo,
    };

    setTaskLogs(prev => ({
      ...prev,
      [taskId]: [...(prev[taskId] ?? []), newMsg],
    }));
  };

  // Helper:  Get groups where user is Leader
  const leaderGroups = React.useMemo(() => {    
    return groups.filter((g) =>
      g.members?.some((m) => m.userId === currentUserId && m.role === "leader")
    );
  }, [groups, currentUserId]);

  //DEBUG:
  // const leaderGroups = React.useMemo(() => {
  //   console.log("🔍 DEBUG leaderGroups:", {
  //     currentUserId,
  //     totalGroups: groups.length,
  //     groupsWithMembers: groups.filter(g => g.members && g.members.length > 0).length,
  //     sampleGroup: groups[0],
  //   });

  //   const filtered = groups.filter((g) => {
  //     const hasLeader = g.members?.some((m) => {
  //       console.log("  Checking member:", m, "against userId:", currentUserId);
  //       return m.userId === currentUserId && m.role === "leader";
  //     });

  //     console.log(`  Group "${g.name}": hasLeader=${hasLeader}`);
  //     return hasLeader;
  //   });

  //   console.log("✅ Filtered leaderGroups:", filtered.length, filtered);
  //   return filtered;
  // }, [groups, currentUserId]);

  // --- Task log sheet: task + message gốc + danh sách log ---
  const activeTaskLogTask = React.useMemo(
    () => (taskLogSheet.taskId ? tasks.find(t => t.id === taskLogSheet.taskId) : undefined),
    [tasks, taskLogSheet.taskId]
  );

  const activeTaskLogSourceMessage = React.useMemo(() => {
    if (!activeTaskLogTask?.sourceMessageId) return undefined;
    return messages.find(m => m.id === activeTaskLogTask.sourceMessageId);
  }, [messages, activeTaskLogTask?.sourceMessageId]);

  const activeTaskLogMessages: TaskLogMessage[] =
    taskLogSheet.taskId && taskLogs[taskLogSheet.taskId]
      ? taskLogs[taskLogSheet.taskId]
      : [];

  return (
    
    <div
      className={`${
        portalMode === "mobile" ? "w-full h-full" : "w-screen h-screen"
      } flex overflow-hidden bg-gray-50 text-gray-800`}
    >
      {/* MainSidebar */}
      {portalMode !== "mobile" && (
        <MainSidebar
          activeView={view}
          viewMode={viewMode}
          workspaceMode={workspaceMode}
          onSelect={(key) => {
            if (key === "logout") {
              console.log("Logging out...");
              return;
            }
            if (key === "pinned") {
              // bật chế độ pinned trong workspace
              setView("workspace");
              setWorkspaceMode("pinned");
              // setShowPinned(true);
              return;
            }

            // Nếu user chọn workspace khi đang ở pinned → quay lại default
            if (key === "workspace") {
              setWorkspaceMode("default");
              setView("workspace");
              return;
            }

            setView(key); // 'lead'
          }}
          pendingTasks={[
            {
              id: "task_po1246_sapxep",
              title: "PO#1246 – Sắp xếp vị trí & nhập kho",
              workTypeName: "Nhận hàng",
              pendingUntil: "2025-11-13T09:00:00Z",
            },
            {
              id: "task_demo2",
              title: "Đổi trả – kiểm phiếu kho",
              workTypeName: "Đổi Trả",
              pendingUntil: "2025-11-14T17:00:00Z",
            },
          ]}

          showPinnedToast={showPinnedToast}
          currentUserName={currentUser}
          onOpenWorkTypeManager={() => setShowWorkTypeManager(true)}
        />
      )}
      
      {/* Nội dung chính */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {view === 'workspace' ? (
          <WorkspaceView
            layoutMode={portalMode === "mobile" ? "mobile" : "desktop"}
            groups={groupsMerged}
            selectedGroup={selectedGroup}
            messages={messages}
            setMessages={setMessages}
            onSelectGroup={handleSelectGroup}
            contacts={contacts}
            selectedChat={selectedChat}
            onSelectChat={handleSelectChat}
            onClearSelectedChat={onClearSelectedChat}
            leftTab={leftTab}
            setLeftTab={setLeftTab}
            available={available}
            myWork={myWork}
            members={members}
            showAvail={showAvail}
            setShowAvail={setShowAvail}
            showMyWork={showMyWork}
            setShowMyWork={setShowMyWork}
            handleClaim={handleClaim}
            handleTransfer={handleTransfer}
            openCloseModalFor={openCloseModalFor}
            showRight={showRight}
            setShowRight={setShowRight}
            showSearch={showSearch}
            setShowSearch={setShowSearch}
            q={q}
            setQ={setQ}
            searchInputRef={searchInputRef}
            openPreview={openPreview}
            tab={tab}
            setTab={setTab}
            
            // showPinned={showPinned}
            // setShowPinned={setShowPinned}
            workspaceMode={workspaceMode}
            setWorkspaceMode={setWorkspaceMode}
            viewMode={viewMode}
            pinnedMessages={pinnedMessages}
            onClosePinned={() => setWorkspaceMode("default")}
            setPinnedMessages={setPinnedMessages}
            onUnpinMessage={handleUnpinMessage}
            onOpenPinnedMessage={handleOpenPinnedMessage}
            onShowPinnedToast={onShowPinnedToast}

            workTypes={(selectedGroup?.workTypes ?? []).map(w => ({ id: w.id, name: w.name }))}
            selectedWorkTypeId={selectedWorkTypeId}
            onChangeWorkType={setSelectedWorkTypeId}
            currentUserId={currentUserId}
            currentUserName={currentUser}

            // Tasks & callbacks để RightPanel dùng thật
            tasks={tasks}
            onChangeTaskStatus={handleChangeTaskStatus}
            onToggleChecklist={handleToggleChecklist}
            onUpdateTaskChecklist={handleUpdateTaskChecklist}
            groupMembers={groupMembers}
            applyTemplateToTasks={applyTemplateToTasks}
            checklistTemplates={checklistTemplates}
            setChecklistTemplates={setChecklistTemplates}

            // Tiếp nhận thông tin
            onReceiveInfo={handleReceiveInfo}
            onTransferInfo={handleTransferInfo}
            receivedInfos={receivedInfos}
            onAssignInfo={onAssignInfo}
            onAssignFromMessage={onAssignFromMessage}
            openTransferSheet={openTransferSheet}

            onOpenTaskLog={(taskId) => {
              setTaskLogSheet({ open: true, taskId });
            }}
            taskLogs={taskLogs}
            onOpenSourceMessage={handleOpenSourceMessage}
            onOpenQuickMsg={() => {
              // Mobile: tạm hiển thị toast, có thể thay bằng mở QuickMessageManager khi bạn muốn mount ở mobile
              pushToast("Tin nhắn nhanh: tính năng đang phát triển cho mobile.", "info");
            }}
            onOpenPinned={() => {
              setWorkspaceMode("pinned");
            }}
            onOpenTodoList={() => {
              pushToast("Việc cần làm: tính năng đang phát triển cho mobile.", "info");
            }}

            checklistVariants={checklistVariants}
            defaultChecklistVariantId={defaultChecklistVariantId}
            onCreateTaskFromMessage={handleCreateTask}
            
            onReassignTask={undefined}  // hoặc implement nếu cần
            
            onOpenWorkTypeManager={() => setShowWorkTypeManager(true)}            
          />          
        ) : (
          <TeamMonitorView
            leadThreads={leadThreads}
            assignOpenId={assignOpenId}
            setAssignOpenId={setAssignOpenId}
            members={members}
            onAssign={handleLeadAssign}
          />
        )}

        <ViewModeSwitcher viewMode={viewMode} setViewMode={setViewMode} />

        {/* Modals */}
        <CloseNoteModal
          open={showCloseModal}
          note={closeNote}
          setNote={setCloseNote}
          onConfirm={confirmClose}
          onOpenChange={setShowCloseModal}
        />
        <FilePreviewModal open={showPreview} file={previewFile} onOpenChange={setShowPreview} />

        <AssignTaskSheet
          open={assignSheet.open}
          source={assignSheet.source}
          message={assignSheet.message}
          info={assignSheet.info}
          members={groupMembers}
          checklistVariants={checklistVariants}
          defaultChecklistVariantId={defaultChecklistVariantId}
          onClose={() => setAssignSheet({ open: false })}
          onCreateTask={handleCreateTask}
        />

        <GroupTransferSheet
          open={groupTransferSheet.open}
          info={groupTransferSheet.info}
          groups={groups}
          currentUserId={currentUserId}
          currentUserName={currentUser}
          members={groupMembers}
          onClose={() => setGroupTransferSheet({ open: false })}
          onConfirm={handleGroupTransferConfirm}
        />

        <TaskLogThreadSheet
          open={taskLogSheet.open}
          onClose={() => setTaskLogSheet({ open: false })}
          task={activeTaskLogTask}
          sourceMessage={activeTaskLogSourceMessage}
          messages={activeTaskLogMessages}
          currentUserId={currentUserId}
          members={groupMembers}
          onSend={handleSendTaskLogMessage}
        />


        {/* Toasts */}
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>


      {/* WorkType Manager Dialog (Desktop only) */}
      {portalMode !== "mobile" && (
        <WorkTypeManagerDialog
          open={showWorkTypeManager}
          onOpenChange={setShowWorkTypeManager}
          groups={leaderGroups}
          onSave={handleUpdateGroupWorkTypes}
        />
      )}
    </div>
  );

}