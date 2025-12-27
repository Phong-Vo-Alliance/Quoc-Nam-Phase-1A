import React from "react";
import { RightAccordion } from "../components";
import { SegmentedTabs } from "../components/SegmentedTabs";
import type { Task, ReceivedInfo, ChecklistItem, ChecklistTemplateMap, ChecklistTemplateItem, TaskLogMessage, ChecklistVariant } from "../types";
import {ChecklistTemplatePanel} from "../components/ChecklistTemplatePanel";
import {TaskChecklistEditor, TaskChecklistViewer} from "../components/TaskChecklist";
import {ChecklistTemplateSlideOver} from "../components/ChecklistTemplateSlideOver";

import {
  Users,
  FolderPlus,
  Plus,
  Folder as FolderIcon,
  FileText,
  Image as ImageIcon,
  MoveRight,
  Edit2, Trash2, ArrowLeft,
  ChevronDown, ChevronRight, Check,
  ClipboardList, SquarePen, ListTodo, UserIcon,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

import { Button } from "@/components/ui/button";
import { HintBubble } from "../components/HintBubble";
import { FileNode }  from "../components/FileManager";
import { FileManagerPhase1A } from "../components/FileManagerPhase1A";
import { group } from "console";

export const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const btn = (active = false) =>
  `rounded-lg border px-3 py-1 transition ${
    active
      ? "bg-brand-600 text-white border-brand-600 shadow-sm"
      : "bg-white text-brand-700 border-brand-200 hover:bg-brand-50"
  }`;

/* =============== Types =============== */
type ViewMode = "lead" | "staff";

type MinimalMember = { id: string; name: string; role?: "Leader" | "Member" };

type FolderAttribute = {
  id: string;
  key: string;     // tên thuộc tính
  value: string;   // giá trị thuộc tính
};

const FileIcon: React.FC<{ n: FileNode }> = ({ n }) => {
  if (n.type === "folder") return <FolderIcon className="h-5 w-5 text-gray-600" />;
  if (n.ext === "pdf") return <FileText className="h-5 w-5 text-rose-600" />;
  if (n.ext === "jpg" || n.ext === "png") return <ImageIcon className="h-5 w-5 text-sky-600" />;
  return <FileText className="h-5 w-5 text-gray-600" />;
};

/* =============== Helpers =============== */
const StatusBadge: React.FC<{ s: Task["status"] }> = ({ s }) => {
  const m: Record<Task["status"], { label: string; cls: string }> = {
    todo: {
      label: "Chưa xử lý",
      cls: "bg-amber-200 text-brand-700 border-gray-200",
    },
    in_progress: {
      label: "Đang xử lý",
      cls: "bg-sky-50 text-sky-700 border-sky-200",
    },
    awaiting_review: {
      label: "Chờ duyệt",
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    },
    done: {
      label: "Hoàn thành",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  } as any;
  const x = m[s] ?? m["todo"];

  return (
    <span
      className={`
        inline-flex items-center
        rounded-md px-2 py-0.5 text-[10px] font-medium
        border border-gray-200 bg-gray-50 text-gray-600
        shadow-sm
        ${x.cls}
      `}
    >
      {x.label}
    </span>
  );
};


const truncateMessageTitle = (t?: string) =>
  (t || "").length > 80 ? (t || "").slice(0, 77) + "…" : t || "";

/* =============== Components =============== */
const TaskCard: React.FC<{
  t: Task;
  members: MinimalMember[];
  viewMode: ViewMode;
  isLeaderOwnTask?: boolean; // Flag when leader is task owner
  onChangeStatus?: (id: string, next: Task["status"]) => void;
  onReassign?: (id:  string, assigneeId: string) => void;
  onToggleChecklist?: (taskId: string, itemId: string, done:  boolean) => void;
  onUpdateTaskChecklist?: (taskId: string, next: ChecklistItem[]) => void;
  taskLogs?: Record<string, TaskLogMessage[]>;
  onOpenTaskLog?: (taskId: string) => void;
}> = ({ 
  t, 
  members, 
  viewMode, 
  isLeaderOwnTask = false,
  onChangeStatus, 
  onReassign, 
  onToggleChecklist, 
  onUpdateTaskChecklist, 
  taskLogs, 
  onOpenTaskLog 
}) => {
  const [open, setOpen] = React.useState(false);
  const assigneeName = members.find((m) => m.id === t.assigneeId)?.name ?? t.assigneeId;
  const [editingItem, setEditingItem] = React.useState<ChecklistItem | null>(null);
  const [newLabel, setNewLabel] = React.useState("");

  const total = t.checklist?.length ?? 0;
  const doneCount = t.checklist?.filter((c) => c.done).length ?? 0;
  const progress =
    total > 0 ? Math.round((doneCount / total) * 100) : 0;

  const workTypeLabel = t.workTypeName ?? t.workTypeId;
  const displayWorkTypeLabel = t.checklistVariantName
    ? `${workTypeLabel} · ${t.checklistVariantName}`
    : workTypeLabel;

  const progressText =
    t.progressText ??
    (total ? `${doneCount}/${total} mục` : "Không có checklist");

  const [editChecklist, setEditChecklist] = React.useState(false);
  const canEditStructure = viewMode === "lead" && t.status === "todo";

  return (
    <>
      {/* Checklist Edit Dialog */}
      {
        editingItem && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-4 w-[300px] shadow-xl">
              <div className="text-sm font-semibold mb-2">
                {editingItem?.id === "new" ? "Thêm mục" : "Chỉnh sửa mục"}
              </div>

              <input
                className="w-full rounded border px-2 py-1 text-sm"
                value={newLabel}
                autoFocus
                onChange={(e) => setNewLabel(e.target.value)}
              />

              <div className="flex justify-end gap-2 mt-3">
                <button
                  className="text-xs px-2 py-1 rounded bg-gray-100"
                  onClick={() => setEditingItem(null)}
                >
                  Huỷ
                </button>
                <button
                  className="text-xs px-3 py-1 rounded bg-emerald-600 text-white"
                  onClick={() => {
                    let updated;

                    if (editingItem.id === "new") {
                      updated = [...(t.checklist ?? []), {
                        id: "chk_" + Math.random().toString(36).slice(2),
                        label: newLabel,
                        done: false,
                      }];
                    } else {
                      updated = (t.checklist ?? []).map((i) =>
                        i.id === editingItem.id ? { ...i, label: newLabel } : i
                      );
                    }

                    onUpdateTaskChecklist?.(t.id, updated);
                    setEditingItem(null);
                  }}
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        )
      }

      <div
        className="
          relative
          rounded-xl
          bg-white/80
          border border-emerald-100
          p-4
          shadow-[0_2px_3px_rgba(15,23,42,0.10)]
          hover:shadow-[0_6px_8px_rgba(15,23,42,0.16)]
          transition-all
          duration-200
          hover:-translate-y-[1px]
        "
      >

        {/* Floating status badge góc phải trên */}
        <div className="absolute -top-3 right-2">
          <StatusBadge s={t.status} />
        </div>

        <div className="flex flex-col gap-3">
          <div className="min-w-0 flex-1">
            {/* Title */}
            <div className="text-[13px] font-semibold leading-snug truncate">
              {truncateMessageTitle(t.title || t.description)}
            </div>

            {/* Meta: loại việc, progress, assignee */}
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-500">
              <span className="inline-flex items-center gap-1">
                <span>Loại việc:</span>

                {/* WorkType name */}
                <span className="font-medium text-gray-700">{workTypeLabel}</span>

                {/* CHIP variant */}
                {t.checklistVariantName && (
                  <span
                    className="
                      inline-flex items-center px-1.5 py-0.5
                      rounded-md text-[10px] font-semibold
                      bg-emerald-50 text-emerald-700 border border-emerald-200
                      shadow-sm
                    "
                  >
                    {t.checklistVariantName}
                  </span>
                )}
              </span>

              {/* {total > 0 && (
                <>
                  <span>•</span>
                  <span>
                    Checklist:{" "}
                    <span className="font-medium text-gray-700">
                      {progressText}
                    </span>
                  </span>
                </>
              )} */}

              {viewMode === "lead" && (
                <>
                  <span>•</span>
                  <span>
                    Giao cho:{" "}
                    <span className="font-medium text-gray-700">
                      <select
                        className="mt-1 rounded-md border px-2 py-0.5 text-[11px] bg-white"
                        value={t.assigneeId}
                        onChange={(e) => onReassign?.(t.id, e.target.value)}
                      >
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>

                    </span>
                  </span>
                </>
              )}
            </div>

            {/* Progress bar */}
            {total > 0 && (
              <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="
                    h-full rounded-full
                    bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600
                    transition-all duration-300
                  "
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Checklist */}
            {t.checklist?.length ? (
              <div className="mt-2">
                {/* Toggle */}
                <div className="flex items-center justify-between pr-1">
                  {/* Checklist toggle */}
                  <div
                    className="
                    inline-flex items-center gap-1 
                    text-[11px] font-medium 
                    text-emerald-700 
                    cursor-pointer 
                    hover:text-emerald-800 hover:underline
                    select-none
                  "
                    onClick={() => setOpen((v) => !v)}
                  >
                    {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    Checklist ({doneCount}/{total})
                  </div>

                  {/* + Thêm (only when lead + todo) */}
                  {canEditStructure && (
                    <span
                      className="
                      text-[11px] text-emerald-700 
                      cursor-pointer hover:underline select-none
                    "
                      // onClick={() => {
                      //   const newItem = {
                      //     id: "chk_" + Math.random().toString(36).slice(2),
                      //     label: "",
                      //     done: false,
                      //   };
                      //   onUpdateTaskChecklist?.(t.id, [...(t.checklist ?? []), newItem]);
                      //   setOpen(true);
                      // }}
                      onClick={() => {
                        setEditingItem({ id: "new", label: "", done: false });
                        setNewLabel("");
                        setOpen(true);
                      }}
                    >
                      + Thêm
                    </span>
                  )}
                </div>

                {/* Items */}
                {open && (
                  <ul className="mt-2 space-y-1">
                    {t.checklist.map((c) => (
                      <li
                        key={c.id}
                        className="group flex items-center gap-2 text-[12px] leading-snug rounded-md px-2 py-1 hover:bg-gray-50 transition-all"
                      >
                        {/* Checkbox */}
                        {c.done ? (
                          <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                            <Check className="w-3 h-3" />
                          </div>
                        ) : (
                          <button
                            type="button"
                            className=" checklist-btn
                            h-4 w-4 shrink-0 rounded-full
                            border-[1px] border-emerald-300
                            bg-white
                            hover:shadow-[0_0_4px_rgba(16,185,129,0.35)]
                            transition flex items-center justify-center
                          "
                            onClick={() => onToggleChecklist?.(t.id, c.id, true)}
                          />
                        )}

                        {/* Label */}
                        <span className={c.done ? "text-gray-400 line-through flex-1" : "text-gray-700 flex-1"}>
                          {c.label}
                        </span>

                        {/* Actions when editable */}
                        {canEditStructure && (
                          <div className="flex gap-1 ml-auto opacity-0 group-hover:opacity-100 transition">
                            {/* Edit */}
                            <Edit2
                              className="w-3.5 h-3.5 text-gray-500 cursor-pointer hover:text-emerald-600"
                              onClick={() => {
                                setEditingItem(c);
                                setNewLabel(c.label);
                              }}
                            />

                            {/* Delete */}
                            <Trash2
                              className="w-3.5 h-3.5 text-rose-500 cursor-pointer hover:text-rose-600"
                              onClick={() => {
                                const updated = (t.checklist ?? []).filter((i) => i.id !== c.id);
                                onUpdateTaskChecklist?.(t.id, updated);
                              }}
                            />
                          </div>
                        )}
                      </li>
                    ))}

                  </ul>

                )}
              </div>
            ) : (
              <div className="mt-2 text-[11px] text-gray-400">
                Không có checklist.
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            {/* BÊN TRÁI: thời gian tạo task dd/MM HH:mm */}
            <div className="text-[11px] text-gray-400 whitespace-nowrap">
              {t.createdAt && (
                <>
                  {new Date(t.createdAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                  })}{" "}
                  {formatTime(t.createdAt)}
                </>
              )}
            </div>

            {/* BÊN PHẢI:  action buttons */}
            <div className="flex items-center gap-2">
              {/* NÚT NHẬT KÝ – luôn enable */}
              <button
                onClick={() => onOpenTaskLog?.(t.id)}
                className="
                  px-2 py-1 rounded-md border text-[11px]
                  border-emerald-300 text-emerald-700 hover: bg-emerald-50
                "
              >
                Nhật ký
              </button>

              {/* ============================================
                  STAFF VIEW (unchanged)
                  ============================================ */}
              {viewMode === "staff" && (
                <>
                  {t.status === "todo" && (
                    <button
                      onClick={() => onChangeStatus?.(t.id, "in_progress")}
                      className="rounded-md border px-2 py-0.5 text-[11px] hover:bg-emerald-50"
                    >
                      Bắt đầu
                    </button>
                  )}

                  {t.status === "in_progress" && (
                    <button
                      onClick={() => onChangeStatus?.(t.id, "awaiting_review")}
                      className="rounded-md border px-2 py-0.5 text-[11px] hover: bg-amber-50"
                    >
                      Chờ duyệt
                    </button>
                  )}

                  {/* Staff không có button cho awaiting_review */}
                </>
              )}

              {/* ============================================
                  LEADER VIEW - OWN TASK (NEW FLOW)
                  ============================================ */}
              {viewMode === "lead" && isLeaderOwnTask && (
                <>
                  {t.status === "todo" && (
                    <button
                      onClick={() => onChangeStatus?.(t.id, "in_progress")}
                      className="rounded-md border px-2 py-0.5 text-[11px] hover:bg-emerald-50"
                    >
                      Bắt đầu
                    </button>
                  )}

                  {t.status === "in_progress" && (
                    <button
                      onClick={() => onChangeStatus?.(t.id, "done")}
                      className="
                      rounded-md px-2 py-0.5 text-[11px]
                      bg-emerald-600 text-white
                      hover:bg-emerald-700
                      shadow-sm
                    "
                    >
                      Hoàn tất
                    </button>
                  )}

                  {/* Không có "Chờ duyệt" cho leader own tasks */}
                </>
              )}

              {/* ============================================
                  LEADER VIEW - TEAM TASK (unchanged)
                  ============================================ */}
              {viewMode === "lead" && !isLeaderOwnTask && (
                <>
                  {["todo", "in_progress", "awaiting_review"].includes(t.status) && (
                    <button
                      onClick={() => onChangeStatus?.(t.id, "done")}
                      className="rounded-md border px-2 py-0.5 text-[11px] hover:bg-emerald-50"
                    >
                      Hoàn tất
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.18s ease-out;
        }
      `}
      </style>   
    </>
  );
};

/* ===============================
   RECEIVED INFO SECTION (NEW)
   =============================== */
const ReceivedInfoSection: React.FC<{
  items: ReceivedInfo[];
  onAssignInfo?: (info: ReceivedInfo) => void;
  //onTransferInfo?: (infoId: string, dept: string) => void;
  onOpenGroupTransfer?: (info: ReceivedInfo) => void;
}> = ({ items, onAssignInfo, onOpenGroupTransfer }) => {
  if (!items || items.length === 0) return null;

  return (    
    <div className="premium-accordion-wrapper">
      <RightAccordion
        icon={<ListTodo className="h-4 w-4 text-amber-500" />}
        title={
          <div className="flex items-center gap-2">
            <span>Thông tin đã tiếp nhận</span>

            {/* BADGE — số lượng "waiting" */}
            {items.filter((i) => i.status === "waiting").length > 0 && (
              <span className="inline-flex items-center justify-center text-[10px] px-2 py-0.5 
                         rounded-full bg-amber-100 text-amber-700 font-bold border border-amber-300">
                {items.filter((i) => i.status === "waiting").length}
              </span>
            )}
          </div>
        }
      >
        <div className="space-y-3">
          {items.map((info) => {
            const isTransferred = info.status === "transferred";
            const isAssigned = info.status === "assigned";

            return (
              <div
                key={info.id}
                className="rounded-lg border px-3 py-2 shadow-sm hover:shadow-md transition bg-white"
              >
                <div className="font-medium text-sm truncate">{info.title}</div>

                <div className="text-xs text-gray-500 mt-0.5">
                  Từ: <span className="font-semibold">{info.sender}</span> • Tiếp nhận lúc: {formatTime(info.createdAt)}
                </div>

                {/* Status */}
                {isTransferred && (
                  <div className="text-[11px] text-amber-700 mt-1">
                    ➜ Đã chuyển sang nhóm:{" "}
                    <span className="font-semibold">{info.transferredToGroupName}</span>
                    {info.transferredWorkTypeName && (
                      <>
                        {" "}• Loại việc: <span className="font-semibold">{info.transferredWorkTypeName}</span>
                      </>
                    )}
                  </div>
                )}

                {isAssigned && (
                  <div className="text-[11px] text-emerald-700 mt-1">
                    ✓ Đã giao task
                  </div>
                )}

                {/* Buttons */}
                {info.status === "waiting" && (
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      onClick={() => onAssignInfo?.(info)}
                    >
                      Giao Task
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenGroupTransfer?.(info)}
                    >
                      Chuyển nhóm
                    </Button>
                  </div>
                )}
              </div>
            );
          })}

        </div>        

      </RightAccordion>
    </div>      
    
  );
};

/* =============== RightPanel =============== */
export const RightPanel: React.FC<{
  // Tabs
  tab: "info" | "order" | "tasks";
  setTab: (v: "info" | "order" | "tasks") => void;

  // Context
  viewMode?: ViewMode; // 'lead' | 'staff'
  groupId?: string;
  groupName?: string;
  workTypeName?: string;

  // Members (for "Thành viên" accordion)
  members?: MinimalMember[];
  onAddMember?: () => void;  

  // Tasks
  tasks?: Task[];
  selectedWorkTypeId?: string;
  currentUserId?: string;
  onChangeTaskStatus?: (id: string, next: Task["status"]) => void;
  onReassignTask?: (id: string, assigneeId: string) => void;
  onToggleChecklist?: (taskId: string, itemId: string, done: boolean) => void;
  receivedInfos?: ReceivedInfo[];
  onTransferInfo?: (infoId: string, departmentId: string) => void;
  onAssignInfo?: (info: ReceivedInfo) => void;
  onOpenGroupTransfer?: (info: ReceivedInfo) => void;
  onUpdateTaskChecklist?: (taskId: string, next: ChecklistItem[]) => void;
  checklistTemplates?: ChecklistTemplateMap;
  setChecklistTemplates?: React.Dispatch<React.SetStateAction<ChecklistTemplateMap>>;
  applyTemplateToTasks?: (workTypeId: string, template: ChecklistTemplateItem[]) => void;
  taskLogs?: Record<string, TaskLogMessage[]>;
  onOpenTaskLog?: (taskId: string) => void;
  onOpenSourceMessage?: (messageId: string) => void;
  checklistVariants?: ChecklistVariant[];
}> = ({
  tab,
  setTab,
  viewMode = "staff",
  groupId,
  groupName = "Nhóm",
  workTypeName = "—",
  members = [],
  onAddMember,
  tasks = [],
  selectedWorkTypeId,
  currentUserId,
  onChangeTaskStatus,
  onReassignTask,
  onToggleChecklist,
  receivedInfos = [],
  onTransferInfo,
  onAssignInfo,
  onOpenGroupTransfer,
  onUpdateTaskChecklist,  
  checklistTemplates = {},
  setChecklistTemplates,
  applyTemplateToTasks,
  taskLogs,
  onOpenTaskLog,
  onOpenSourceMessage,
  checklistVariants,
}) => {
  // Helper: kiểm tra task có phải của ngày hôm nay không
  const isToday = (iso?: string) => {
    if (!iso) return false;
    const d = new Date(iso);
    const t = new Date();
    return (
      d.getFullYear() === t.getFullYear() &&
      d.getMonth() === t.getMonth() &&
      d.getDate() === t.getDate()
    );
  };

  // Leader mode toggle state
  const [leaderMode, setLeaderMode] = React.useState<"team" | "mine">("team");

  // Collapse states for leader own tasks
  const [showLeaderOwnTodo, setShowLeaderOwnTodo] = React.useState(true);
  const [showLeaderOwnInProgress, setShowLeaderOwnInProgress] = React.useState(true);
  const [showLeaderOwnDone, setShowLeaderOwnDone] = React.useState(true);

  // Modal for completed tasks history
  const [showLeaderOwnCompletedAll, setShowLeaderOwnCompletedAll] = React.useState(false);

  // Toggle cho từng nhóm task ở chế độ lead
  const [showLeadAwaiting, setShowLeadAwaiting] = React.useState(true);
  const [showLeadTodo, setShowLeadTodo] = React.useState(false);
  const [showLeadInProgress, setShowLeadInProgress] = React.useState(false);
  const [showLeadDone, setShowLeadDone] = React.useState(false);

  // Set highlight cho các nhóm task ở chế độ lead
  const awaitingOpenedRef = React.useRef(false);
  // const todoOpenedRef = React.useRef(false);
  // const inProgressOpenedRef = React.useRef(false);

  const [highlightAwaiting, setHighlightAwaiting] = React.useState(false);
  // const [highlightTodo, setHighlightTodo] = React.useState(false);
  // const [highlightInProgress, setHighlightInProgress] = React.useState(false);

  const isTasksTab = tab === "order" || tab === "tasks";
 
  const [templateOpen, setTemplateOpen] = React.useState(false);

    // Variant hiện tại đang chỉnh trong "Checklist mặc định"
  const [templateVariantId, setTemplateVariantId] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (checklistVariants && checklistVariants.length > 0) {
      const def = checklistVariants.find((v) => v.isDefault) ?? checklistVariants[0];
      // Nếu state hiện tại không hợp lệ, reset về default
      setTemplateVariantId((prev) =>
        prev && checklistVariants.some((v) => v.id === prev) ? prev : def?.id
      );
    } else {
      setTemplateVariantId(undefined);
    }
  }, [checklistVariants, selectedWorkTypeId]);


  // ====== Files state - Phase 1A ======
  // Tạm thời không dùng FileManager (folder) trong tab Thông tin.
  // FileManagerPhase1A sẽ tự có mock data riêng cho Ảnh/Video & Tài liệu.

  // const initialMediaItems: FileNode[] = [
  //   { id: "fd_img_1", type: "folder", name: "Biên bản" },
  //   { id: "img_1", type: "file", name: "tem_1.jpg", ext: "jpg" },
  //   { id: "img_2", type: "file", name: "kien_2.jpg", ext: "jpg" },
  // ];

  // const initialDocItems: FileNode[] = [
  //   { id: "fd_doc_1", type: "folder", name: "PO_1246" },
  //   { id: "pdf_1", type: "file", name: "Phieu_Nhap_PO1246.pdf", ext: "pdf" },
  //   { id: "xlsx_2", type: "file", name: "Xuat_Kho.xlsx", ext: "xlsx" },
  //   { id: "w_2", type: "file", name: "Khach_Doi.docx", ext: "docx" },
  // ];

  // // Default attributes for leader view - Sau này nên load từ API theo từng leader
  // const [leaderDefaultAttrs, setLeaderDefaultAttrs] = React.useState<FolderAttribute[]>([
  //   { id: "att_name", key: "Tên sản phẩm", value: "" },
  //   { id: "att_brand", key: "Thương hiệu", value: "" },
  //   { id: "att_nsx", key: "NSX", value: "" },
  //   { id: "att_exp", key: "Hạn dùng", value: "" },
  //   { id: "att_supplier", key: "NCC", value: "" },
  // ]);
 

  // ====== Tasks derived ======
  // const tasksByWork = React.useMemo(
  //   () => tasks.filter((t) => !selectedWorkTypeId || t.workTypeId === selectedWorkTypeId),
  //   [tasks, selectedWorkTypeId]
  // );
  // Lọc theo workType trước
  const tasksByWorkRaw = React.useMemo(
    () => tasks.filter((t) => !selectedWorkTypeId || t.workTypeId === selectedWorkTypeId),
    [tasks, selectedWorkTypeId]
  );

  // Leader thấy toàn bộ task của hôm nay
  // Staff chỉ thấy task của mình trong hôm nay
  const tasksToday = React.useMemo(() => {
    if (viewMode === "lead") {
      return tasksByWorkRaw.filter(t => isToday(t.createdAt));
    }
    if (viewMode === "staff") {
      return tasksByWorkRaw.filter(
        t => t.assigneeId === currentUserId && isToday(t.createdAt)
      );
    }
    return tasksByWorkRaw;
  }, [tasksByWorkRaw, viewMode, currentUserId]);

  // Filter leader's own tasks
  const leaderOwnTasks = React.useMemo(() => {
    if (viewMode !== "lead" || !currentUserId) return [];

    return tasksToday.filter(t => t.assigneeId === currentUserId);
  }, [tasksToday, viewMode, currentUserId]);

  // Group leader own tasks by status
  const leaderOwnBuckets = React.useMemo(() => ({
    todo: leaderOwnTasks.filter(t => t.status === "todo"),
    inProgress: leaderOwnTasks.filter(t => t.status === "in_progress"),
    // Done TODAY only (for inline display)
    doneToday: leaderOwnTasks.filter(t =>
      t.status === "done" && isToday(t.updatedAt || t.createdAt)
    ),
  }), [leaderOwnTasks]);

  // All completed tasks (any date) for modal
  const leaderOwnAllCompleted = React.useMemo(() => {
    if (viewMode !== "lead" || !currentUserId) return [];

    return tasksByWorkRaw
      .filter(t =>
        t.assigneeId === currentUserId &&
        t.status === "done" &&
        (!selectedWorkTypeId || t.workTypeId === selectedWorkTypeId)
      )
      .sort((a, b) => {
        const da = new Date(a.updatedAt || a.createdAt || "");
        const db = new Date(b.updatedAt || b.createdAt || "");
        return db.getTime() - da.getTime(); // Newest first
      });
  }, [tasksByWorkRaw, viewMode, currentUserId, selectedWorkTypeId]);

  const myTasks = tasksToday;
  // const myTasks = React.useMemo(
  //   () => (currentUserId ? tasksByWork.filter((t) => t.assigneeId === currentUserId) : tasksByWork),
  //   [tasksByWork, currentUserId]
  // );

  const splitByStatus = (list: Task[]) => ({
    todo: list.filter((t) => t.status === "todo"),
    inProgress: list.filter((t) => t.status === "in_progress"),
    awaiting: list.filter((t) => t.status === "awaiting_review"),
    done: list.filter((t) => t.status === "done"),
  });
  const staffBuckets = splitByStatus(myTasks);
  const [assigneeFilter, setAssigneeFilter] = React.useState<string>("all");
  // const leadBuckets = React.useMemo(() => {
  //   const base = assigneeFilter === "all" ? tasksByWork : tasksByWork.filter((t) => t.assigneeId === assigneeFilter);
  //   return splitByStatus(base);
  // }, [assigneeFilter, tasksByWork]);
  const leadBuckets = React.useMemo(() => {
    const base = assigneeFilter === "all"
      ? tasksToday
      : tasksToday.filter(t => t.assigneeId === assigneeFilter);
    return splitByStatus(base);
  }, [assigneeFilter, tasksToday]);

  // Toàn bộ task đã hoàn thành (không chỉ hôm nay) cho Leader (lọc theo assigneeFilter + workType)
  const allLeadDoneTasks = React.useMemo(() => {
    const base =
      assigneeFilter === "all"
        ? tasksByWorkRaw
        : tasksByWorkRaw.filter((t) => t.assigneeId === assigneeFilter);

    return base.filter((t) => t.status === "done");
  }, [assigneeFilter, tasksByWorkRaw]);

  const [showCompleted, setShowCompleted] = React.useState(false);
  const [showLeadCompletedAll, setShowLeadCompletedAll] = React.useState(false);

  // Checklist template panel
  const [showTemplate, setShowTemplate] = React.useState(false);

  const workTypeKey = selectedWorkTypeId ?? "__default__";
  const activeVariantId =
    templateVariantId ??
    checklistVariants?.find((v) => v.isDefault)?.id ??
    checklistVariants?.[0]?.id ??
    "__default__";

  const workTypeTemplate =
    checklistTemplates?.[workTypeKey]?.[activeVariantId] ?? [];

  return (
    <aside className="bg-white shadow-sm flex flex-col min-h-0">
      {/* Header: chỉ còn Tabs, bỏ dropdown CSKH/THU MUA */}
      <div className="flex items-center gap-3 border border-gray-300
        border-b-[2px] border-b-[#38AE3C] rounded-tl-2xl rounded-tr-2xl bg-white p-3 sticky top-0 z-10">

        <SegmentedTabs
          tabs={[
            { key: "info", label: "Thông Tin" },
            { key: "order", label: "Công Việc" },
          ]}
          active={isTasksTab ? "order" : "info"}
          onChange={(v) => setTab(v as any)}
        />
      </div>

      {/* CONTENT — SCROLLABLE */}
      <div className="flex-1 min-h-0 overflow-y-auto px-0 pt-3">
        {/* INFO TAB */}
        {!isTasksTab ? (
          <div className="space-y-4 min-h-0">
            {/* Group + WorkType */}
            <div className="rounded-xl border p-6 bg-gradient-to-r from-brand-50 via-emerald-50 to-cyan-50">
              <div className="flex flex-col items-center text-center gap-1">
                <div className="text-sm font-semibold">{groupName}</div>
                <div className="text-xs text-gray-700">
                  Đang xem thông tin cho <span className="font-medium text-brand-600">Loại việc: {workTypeName}</span>
                </div>
              </div>
            </div>

            {/* Ảnh / Video (GRID) */}
            <div className="premium-accordion-wrapper">
              <div className="premium-light-bar" />
              <RightAccordion title="Ảnh / Video">
                <FileManagerPhase1A
                  mode="media"
                  groupId={groupId}
                  selectedWorkTypeId={selectedWorkTypeId}
                  onOpenSourceMessage={onOpenSourceMessage}
                />
              </RightAccordion>
            </div>

            {/* Tài liệu (LIST) - Phase 1A (list file từ chat, không thư mục) */}
            <div className="premium-accordion-wrapper">
              <div className="premium-light-bar" />
              <RightAccordion title="Tài liệu">
                <FileManagerPhase1A
                  mode="docs"
                  groupId={groupId}
                  selectedWorkTypeId={selectedWorkTypeId}
                  onOpenSourceMessage={onOpenSourceMessage}
                />
              </RightAccordion>
            </div>


            {/* Thành viên (Leader only) */}
            {viewMode === "lead" && (
              <div className="premium-accordion-wrapper">
                <div className="premium-light-bar" />
                <RightAccordion title="Thành viên">
                  <div className="flex items-center justify-between rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-600" />
                      <div className="text-sm">
                        {/* <div className="font-medium">Thành viên</div> */}
                        <div className="text-xs text-gray-500">{members.length} thành viên</div>
                      </div>
                    </div>
                    <button
                      onClick={onAddMember}
                      className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs hover:bg-brand-50"
                    >
                      <Plus className="h-3.5 w-3.5" /> Thêm
                    </button>
                  </div>
                </RightAccordion>
              </div>
            )}
          </div>
        ) : (
          /* TASKS TAB */
          <div className="space-y-4 min-h-0">
            {viewMode === "lead" && (
              <>
                {isTasksTab && (
                  <HintBubble
                    storageKey="hint-received-info-bubble"
                    title="Cách hiển thị Thông tin được tiếp nhận"
                    content={<>Chỉ hiển thị thông tin được tiếp nhận chưa giao task/chuyển nhóm. Các thông tin đã bàn giao chỉ hiển thị trong ngày.</>}
                    show={(receivedInfos?.length ?? 0) > 0}   // 👈 CHỈ HIỂN THỊ KHI CÓ RECEIVED INFO
                    autoCloseMs={9000}
                  />
                )}

                {/* Received Info — thông tin tiếp nhận từ tin nhắn */}
                < ReceivedInfoSection
                  items={receivedInfos}
                  onAssignInfo={(info) => onAssignInfo?.(info)}
                  //onTransferInfo={(id, dept) => onTransferInfo?.(id, dept)}
                  onOpenGroupTransfer={onOpenGroupTransfer}
                />
              </>
            )}

            {viewMode === "staff" ? (
              <>
                {/* Primary: Chưa xử lý + Đang xử lý */}
                <div className="premium-accordion-wrapper">
                  <RightAccordion icon={<ClipboardList className="h-4 w-4 text-brand-600" />}
                    title="Công Việc Của Tôi">
                    <div className="grid grid-cols-1 gap-3">
                      {(staffBuckets.todo.length + staffBuckets.inProgress.length === 0) && (
                        <div className="rounded border p-3 text-xs text-gray-500">Không có việc cần làm.</div>
                      )}
                      {staffBuckets.todo.map((t) => (
                        <TaskCard
                          key={t.id}
                          t={t}
                          members={members}
                          viewMode="staff"
                          onChangeStatus={onChangeTaskStatus}
                          onReassign={onReassignTask}
                          onToggleChecklist={onToggleChecklist}
                          onUpdateTaskChecklist={(taskId, next) => {
                            onUpdateTaskChecklist?.(taskId, next)
                          }}
                          taskLogs={taskLogs}
                          onOpenTaskLog={onOpenTaskLog}
                        />
                      ))}
                      {staffBuckets.inProgress.map((t) => (
                        <TaskCard
                          key={t.id}
                          t={t}
                          members={members}
                          viewMode="staff"
                          onChangeStatus={onChangeTaskStatus}
                          onReassign={onReassignTask}
                          onToggleChecklist={onToggleChecklist}
                          onUpdateTaskChecklist={(taskId, next) => {
                            onUpdateTaskChecklist?.(taskId, next)
                          }}
                          taskLogs={taskLogs}
                          onOpenTaskLog={onOpenTaskLog}
                        />
                      ))}
                    </div>
                  </RightAccordion>

                </div>

                {/* Secondary: Chờ duyệt */}
                <div className="premium-accordion-wrapper">
                  <RightAccordion icon={<SquarePen className="h-4 w-4 text-gray-400" />}
                    title="Chờ Duyệt">
                    <div className="grid grid-cols-1 gap-3">
                      {staffBuckets.awaiting.length === 0 && (
                        <div className="rounded border p-3 text-xs text-gray-500">Không có việc chờ duyệt.</div>
                      )}
                      {staffBuckets.awaiting.map((t) => (
                        <TaskCard
                          key={t.id}
                          t={t}
                          members={members}
                          viewMode="staff"
                          onChangeStatus={onChangeTaskStatus}
                          onReassign={onReassignTask}
                          onToggleChecklist={onToggleChecklist}
                          taskLogs={taskLogs}
                          onOpenTaskLog={onOpenTaskLog}
                        />
                      ))}
                    </div>
                    <div className="mt-2 text-right">
                      <button
                        className="text-xs text-brand-700 hover:underline"
                        onClick={() => setShowCompleted(true)}
                      >
                        Xem tất cả công việc đã hoàn thành
                      </button>
                    </div>

                  </RightAccordion>

                </div>
                  {showCompleted && (
                    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
                      <div className="rounded-xl bg-white shadow-2xl w-full max-w-[560px] max-h-[80vh] overflow-hidden flex flex-col">
                        {/* ============================================
                            HEADER (consistent với leader modal)
                            ============================================ */}
                        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-brand-50 to-emerald-50">
                          <div className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-brand-600" />
                            <h3 className="text-sm font-semibold text-gray-900">
                              Công Việc Đã Hoàn Thành
                            </h3>
                          </div>
                          <button
                            onClick={() => setShowCompleted(false)}
                            className="text-gray-400 hover:text-gray-600 transition"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        {/* ============================================
                            CONTENT (scrollable với consistent styling)
                            ============================================ */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                          {(() => {
                            // Lọc toàn bộ task đã hoàn thành của user hiện tại, theo workType
                            const completed = tasks
                              .filter(
                                (t) =>
                                  t.status === "done" &&
                                  t.assigneeId === currentUserId &&
                                  (!selectedWorkTypeId || t.workTypeId === selectedWorkTypeId)
                              )
                              .slice()
                              .sort((a, b) => {
                                const da = new Date(a.updatedAt || a.createdAt || "");
                                const db = new Date(b.updatedAt || b.createdAt || "");
                                return db.getTime() - da.getTime(); // Newest first
                              });

                            if (completed.length === 0) {
                              return (
                                <div className="text-center py-12 text-sm text-gray-400">
                                  Chưa có công việc nào hoàn thành
                                </div>
                              );
                            }

                            // Group theo ngày (dd/MM/yyyy format)
                            const grouped: Record<string, typeof completed> = {};

                            completed.forEach((t) => {
                              const dateStr = t.updatedAt || t.createdAt;
                              if (!dateStr) return;

                              const date = new Date(dateStr);
                              const key = date.toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              });

                              if (!grouped[key]) grouped[key] = [];
                              grouped[key].push(t);
                            });

                            const today = new Date().toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            });

                            return (
                              <div className="space-y-5">
                                {Object.entries(grouped).map(([dateKey, tasks]) => {
                                  const isToday = dateKey === today;

                                  return (
                                    <div key={dateKey}>
                                      {/* ============================================
                                          DATE HEADER (consistent với leader)
                                          ============================================ */}
                                      <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs font-semibold text-gray-600">
                                          📅 {isToday ? `Hôm nay - ${dateKey}` : dateKey}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                          ({tasks.length})
                                        </span>
                                      </div>

                                      {/* ============================================
                                          TASK CARDS (enhanced styling)
                                          ============================================ */}
                                      <div className="space-y-2 ml-4">
                                        {tasks.map((t) => (
                                          <div
                                            key={t.id}
                                            className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 shadow-sm hover:shadow-md transition-shadow"
                                          >
                                            {/* Title */}
                                            <div className="text-sm font-medium text-gray-800 leading-snug mb-1">
                                              {truncateMessageTitle(t.title || t.description)}
                                            </div>

                                            {/* Meta:  Time + Checklist */}
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                              <span>
                                                Hoàn tất lúc{" "}
                                                <span className="font-medium text-gray-700">
                                                  {t.updatedAt
                                                    ? new Date(t.updatedAt).toLocaleTimeString("vi-VN", {
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                    })
                                                    : "--:--"}
                                                </span>
                                              </span>

                                              {/* Checklist progress (if any) */}
                                              {t.checklist && t.checklist.length > 0 && (
                                                <span className="text-emerald-600 text-[10px]">
                                                  ✓ {t.checklist.filter(c => c.done).length}/{t.checklist.length} mục
                                                </span>
                                              )}
                                            </div>

                                            {/* WorkType + Variant chips */}
                                            {(t.workTypeName || t.checklistVariantName) && (
                                              <div className="mt-1.5 flex items-center gap-1.5 text-[10px]">
                                                {t.workTypeName && (
                                                  <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                                                    {t.workTypeName}
                                                  </span>
                                                )}
                                                {t.checklistVariantName && (
                                                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    {t.checklistVariantName}
                                                  </span>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>

                        {/* ============================================
                            FOOTER (consistent với leader)
                            ============================================ */}
                        <div className="px-6 py-3 border-t bg-gray-50 text-center">
                          <button
                            onClick={() => setShowCompleted(false)}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Đóng
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
              </>
            ) : (
              <>
                {/* Toggle between Team and Mine */}
                <div className="mb-4 px-2">
                  <ToggleGroup
                    type="single"
                    value={leaderMode}
                    onValueChange={(v) => v && setLeaderMode(v as "team" | "mine")}
                    className="grid w-full grid-cols-2 gap-2"
                  >
                    <ToggleGroupItem
                      value="team"
                      className="
                        flex items-center justify-center gap-2
                        data-[state=on]:bg-brand-600 data-[state=on]:text-white
                        data-[state=off]:bg-white data-[state=off]:text-gray-700
                        border border-brand-200
                        rounded-lg px-3 py-2 text-sm font-medium
                        transition-all
                      "
                    >
                      <Users className="h-4 w-4" />
                      Team
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="mine"
                      className="
                        flex items-center justify-center gap-2
                        data-[state=on]:bg-brand-600 data-[state=on]:text-white
                        data-[state=off]:bg-white data-[state=off]:text-gray-700
                        border border-brand-200
                        rounded-lg px-3 py-2 text-sm font-medium
                        transition-all
                      "
                    >
                      <UserIcon className="h-4 w-4" />
                      Của tôi
                      {leaderOwnTasks.filter(t => t.status !== "done").length > 0 && (
                        <span className="
                          ml-1 inline-flex min-w-[18px] h-[18px]
                          items-center justify-center
                          rounded-full bg-amber-500 text-white
                          text-[10px] font-bold px-1
                        ">
                          {leaderOwnTasks.filter(t => t.status !== "done").length}
                        </span>
                      )}
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                {/* ============================================
                    TEAM MODE (existing logic)
                    ============================================ */}
                {leaderMode === "team" && (
                  <>
                    {/* Lead: lọc theo assignee */}
                    <div className="rounded-xl border bg-white p-4 shadow-sm mb-3">
                      <div className="flex flex-col gap-1">
                        {/* Title + Group + WorkType */}
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <Users className="h-4 w-4 text-brand-600" />
                          <span className="text-sm font-semibold">
                            Công Việc Của Nhóm <span className="text-brand-500"> {groupName}</span>
                          </span>
                          <span className="text-xs text-gray-500">
                            • Loại việc: <span className="font-medium text-gray-700">{workTypeName}</span>
                          </span>
                        </div>

                        {/* Filter - Select nhân viên */}
                        <div className="flex justify-start mt-2">
                          <div className="flex items-center gap-2 text-xs">
                            <span>Nhân viên:</span>
                            <select
                              className="rounded-lg border border-brand-200 px-2 py-1 bg-white"
                              value={assigneeFilter}
                              onChange={(e) => setAssigneeFilter(e.target.value)}
                            >
                              <option value="all">Tất cả</option>
                              {members.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <span
                            className="ml-auto mt-2 text-[12px] text-emerald-700 cursor-pointer hover:underline select-none"
                            onClick={() => setTemplateOpen(true)}
                          >
                            Checklist mặc định
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 text-[11px] text-gray-400">
                        Đang xem{" "}
                        <span className="font-semibold text-gray-600">
                          {leadBuckets.todo.length + leadBuckets.inProgress.length + leadBuckets.awaiting.length}
                        </span>{" "}
                        công việc •{" "}
                        <span>{leadBuckets.todo.length} chưa xử lý</span> •{" "}
                        <span>{leadBuckets.inProgress.length} đang xử lý</span> •{" "}
                        <span className="text-amber-600 font-semibold">{leadBuckets.awaiting.length} chờ duyệt</span>
                      </div>
                    </div>

                    {/* Grouped tasks theo trạng thái */}
                    {leadBuckets.todo.length + leadBuckets.inProgress.length + leadBuckets.awaiting.length === 0 ? (
                      <div className="rounded-xl border border-dashed bg-white/60 p-4 text-xs text-gray-500 text-center">
                        Không có công việc nào trong nhóm với bộ lọc hiện tại.
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* AWAITING REVIEW */}
                        {leadBuckets.awaiting.length > 0 && (
                          <section>
                            <div
                              className="mb-1 flex items-center gap-2 text-xs font-semibold text-gray-600 cursor-pointer select-none"
                              onClick={() => {
                                setShowLeadAwaiting((prev) => {
                                  const next = !prev;
                                  if (next && !awaitingOpenedRef.current) {
                                    awaitingOpenedRef.current = true;
                                    setHighlightAwaiting(true);
                                    setTimeout(() => setHighlightAwaiting(false), 700);
                                  }
                                  return next;
                                });
                              }}
                            >
                              <span className="inline-flex h-2 w-2 rounded-full bg-amber-500" />
                              <span>Chờ duyệt ({leadBuckets.awaiting.length}) {showLeadAwaiting ? " ▲" : " ▼"}</span>
                            </div>
                            {showLeadAwaiting && (
                              <div className={`space-y-3 transition-colors duration-300 ${highlightAwaiting ? "bg-amber-50/80 rounded-lg -mx-2 px-2 py-1" : ""}`}>
                                {leadBuckets.awaiting.map((t) => (
                                  <TaskCard
                                    key={t.id}
                                    t={t}
                                    members={members}
                                    viewMode="lead"
                                    isLeaderOwnTask={false} // ✅ Team task
                                    onChangeStatus={onChangeTaskStatus}
                                    onReassign={onReassignTask}
                                    onToggleChecklist={onToggleChecklist}
                                    taskLogs={taskLogs}
                                    onOpenTaskLog={onOpenTaskLog}
                                  />
                                ))}
                              </div>
                            )}
                          </section>
                        )}

                        {/* TODO */}
                        {leadBuckets.todo.length > 0 && (
                          <section>
                            <div
                              className="mb-1 flex items-center gap-2 text-xs font-semibold text-gray-600 cursor-pointer select-none"
                              onClick={() => setShowLeadTodo(v => !v)}
                            >
                              <span className="inline-flex h-2 w-2 rounded-full bg-amber-400" />
                              <span>Chưa xử lý ({leadBuckets.todo.length}) {showLeadTodo ? " ▲" : " ▼"}</span>
                            </div>
                            {showLeadTodo && (
                              <div className="space-y-3">
                                {leadBuckets.todo.map((t) => (
                                  <TaskCard
                                    key={t.id}
                                    t={t}
                                    members={members}
                                    viewMode="lead"
                                    isLeaderOwnTask={false} // ✅ Team task
                                    onChangeStatus={onChangeTaskStatus}
                                    onReassign={onReassignTask}
                                    onToggleChecklist={onToggleChecklist}
                                    onUpdateTaskChecklist={onUpdateTaskChecklist}
                                    taskLogs={taskLogs}
                                    onOpenTaskLog={onOpenTaskLog}
                                  />
                                ))}
                              </div>
                            )}
                          </section>
                        )}

                        {/* IN PROGRESS */}
                        {leadBuckets.inProgress.length > 0 && (
                          <section>
                            <div
                              className="mb-1 flex items-center gap-2 text-xs font-semibold text-gray-600 cursor-pointer select-none"
                              onClick={() => setShowLeadInProgress(v => !v)}
                            >
                              <span className="inline-flex h-2 w-2 rounded-full bg-sky-400" />
                              <span>
                                Đang xử lý ({leadBuckets.inProgress.length})
                                {showLeadInProgress ? " ▲" : " ▼"}
                              </span>
                            </div>

                            {showLeadInProgress && (
                              <div className="space-y-3">
                                {leadBuckets.inProgress.map((t) => (
                                  <TaskCard
                                    key={t.id}
                                    t={t}
                                    members={members}
                                    viewMode="lead"
                                    isLeaderOwnTask={false} // Team task
                                    onChangeStatus={onChangeTaskStatus}
                                    onReassign={onReassignTask}
                                    onToggleChecklist={onToggleChecklist}
                                    taskLogs={taskLogs}
                                    onOpenTaskLog={onOpenTaskLog}
                                  />
                                ))}
                              </div>
                            )}
                          </section>
                        )}

                        {/* DONE TODAY */}
                        {leadBuckets.done.length > 0 && (
                          <section>
                            <div
                              className="mb-1 flex items-center gap-2 text-xs font-semibold text-gray-600 cursor-pointer select-none"
                              onClick={() => setShowLeadDone((v) => !v)}
                            >
                              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                              <span>
                                Hoàn thành ({leadBuckets.done.length}) {showLeadDone ? " ▲" : " ▼"}
                              </span>
                            </div>

                            {showLeadDone && (
                              <div className="space-y-3">
                                {leadBuckets.done.map((t) => (
                                  <TaskCard
                                    key={t.id}
                                    t={t}
                                    members={members}
                                    viewMode="lead"
                                    isLeaderOwnTask={false} // ✅ Team task
                                    onChangeStatus={onChangeTaskStatus}
                                    onReassign={onReassignTask}
                                    onToggleChecklist={onToggleChecklist}
                                    taskLogs={taskLogs}
                                    onOpenTaskLog={onOpenTaskLog}
                                  />
                                ))}
                              </div>
                            )}

                            <div className="mt-2 text-right">
                              <button
                                className="text-xs text-brand-700 hover:underline"
                                onClick={() => setShowLeadCompletedAll(true)}
                              >
                                Xem tất cả công việc đã hoàn thành
                              </button>
                            </div>
                          </section>
                        )}
                      </div>
                    )}

                    {/* Modal:  All completed tasks */}
                    {showLeadCompletedAll && (
                      <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
                        <div className="rounded-xl bg-white shadow-2xl w-full max-w-[560px] max-h-[80vh] overflow-hidden flex flex-col">
                          {/* Header */}
                          <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-brand-50 to-emerald-50">
                            <div className="flex items-center gap-2">
                              <Users className="h-5 w-5 text-brand-600" />
                              <h3 className="text-sm font-semibold text-gray-900">
                                Công Việc Đã Hoàn Thành (Team)
                              </h3>
                            </div>
                            <button
                              onClick={() => setShowLeadCompletedAll(false)}
                              className="text-gray-400 hover:text-gray-600 transition"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          {/* Content */}
                          <div className="flex-1 overflow-y-auto px-6 py-4">
                            {allLeadDoneTasks.length === 0 ? (
                              <div className="text-center py-12 text-sm text-gray-400">
                                Chưa có công việc nào hoàn thành
                              </div>
                            ) : (
                              <div className="space-y-5">
                                {(() => {
                                  // Group by date
                                  const grouped: Record<string, typeof allLeadDoneTasks> = {};

                                  allLeadDoneTasks.forEach(t => {
                                    const dateStr = t.updatedAt || t.createdAt;
                                    if (!dateStr) return;

                                    const date = new Date(dateStr);
                                    const key = date.toLocaleDateString("vi-VN", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    });

                                    if (!grouped[key]) grouped[key] = [];
                                    grouped[key].push(t);
                                  });

                                  const today = new Date().toLocaleDateString("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  });

                                  return Object.entries(grouped).map(([dateKey, tasks]) => {
                                    const isToday = dateKey === today;

                                    return (
                                      <div key={dateKey}>
                                        <div className="flex items-center gap-2 mb-3">
                                          <span className="text-xs font-semibold text-gray-600">
                                            📅 {isToday ? `Hôm nay - ${dateKey}` : dateKey}
                                          </span>
                                          <span className="text-xs text-gray-400">({tasks.length})</span>
                                        </div>

                                        <div className="space-y-2 ml-4">
                                          {tasks.map(t => (
                                            <div
                                              key={t.id}
                                              className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 shadow-sm hover:shadow-md transition-shadow"
                                            >
                                              <div className="text-sm font-medium text-gray-800 leading-snug mb-1">
                                                {truncateMessageTitle(t.title || t.description)}
                                              </div>

                                              <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>
                                                  Hoàn tất lúc{" "}
                                                  <span className="font-medium text-gray-700">
                                                    {t.updatedAt
                                                      ? new Date(t.updatedAt).toLocaleTimeString("vi-VN", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                      })
                                                      : "--:--"}
                                                  </span>
                                                </span>

                                                {/* Assignee name */}
                                                <span>
                                                  <span className="font-medium text-gray-700">
                                                    {members.find(m => m.id === t.assigneeId)?.name ?? t.assigneeId}
                                                  </span>
                                                </span>
                                              </div>

                                              {t.checklist && t.checklist.length > 0 && (
                                                <div className="mt-1 text-[10px] text-emerald-600">
                                                  ✓ {t.checklist.filter(c => c.done).length}/{t.checklist.length} mục
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="px-6 py-3 border-t bg-gray-50 text-center">
                            <button
                              onClick={() => setShowLeadCompletedAll(false)}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              Đóng
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ============================================
                    MINE MODE (NEW)
                    ============================================ */}
                    {leaderMode === "mine" && (
                      <div className="space-y-4">
                        {/* Summary card */}
                        <div className="rounded-xl border bg-gradient-to-r from-brand-50 via-emerald-50 to-cyan-50 p-4 shadow-sm">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <UserIcon className="h-5 w-5 text-brand-600" />
                            <span className="text-sm font-semibold text-gray-900">
                              Công Việc Của Tôi
                            </span>
                          </div>

                          <div className="text-center text-xs text-gray-600">
                            {leaderOwnTasks.filter(t => t.status !== "done").length > 0 ? (
                              <>
                                <span className="font-semibold text-brand-700">
                                  {leaderOwnTasks.filter(t => t.status !== "done").length}
                                </span>{" "}
                                công việc đang thực hiện •{" "}
                                <span>{leaderOwnBuckets.todo.length} chưa xử lý</span> •{" "}
                                <span>{leaderOwnBuckets.inProgress.length} đang xử lý</span>
                                {leaderOwnBuckets.doneToday.length > 0 && (
                                  <>
                                    {" "}• <span className="text-emerald-600">{leaderOwnBuckets.doneToday.length} hoàn thành hôm nay</span>
                                  </>
                                )}
                              </>
                            ) : (
                              <span className="text-emerald-600">✓ Đã hoàn thành hết công việc hôm nay</span>
                            )}
                          </div>
                        </div>

                        {/* Empty state */}
                        {leaderOwnTasks.filter(t => t.status !== "done").length === 0 &&
                          leaderOwnBuckets.doneToday.length === 0 && (
                            <div className="rounded-xl border border-dashed bg-white/60 p-8 text-center">
                              <UserIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                              <p className="text-sm text-gray-500 font-medium mb-1">
                                Bạn chưa có công việc nào cần làm
                              </p>
                              <p className="text-xs text-gray-400">
                                Các công việc được giao sẽ xuất hiện ở đây
                              </p>
                            </div>
                          )}

                        {/* ============================================
                            TODO SECTION (Collapsible)
                            ============================================ */}
                        {leaderOwnBuckets.todo.length > 0 && (
                          <section>
                            <div
                              className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none hover:text-brand-700 transition-colors"
                              onClick={() => setShowLeaderOwnTodo(v => !v)}
                            >
                              <span className="inline-flex h-2 w-2 rounded-full bg-amber-400" />
                              <span>Chưa xử lý ({leaderOwnBuckets.todo.length})</span>
                              <span className="ml-1 text-gray-400">
                                {showLeaderOwnTodo ? "▲" : "▼"}
                              </span>
                            </div>

                            {showLeaderOwnTodo && (
                              <div className={`
                                    space-y-3
                                    transition-all duration-300 ease-out
                                    overflow-hidden
                                    ${showLeaderOwnTodo ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
                                  `}>
                                {leaderOwnBuckets.todo.map(t => (
                                  <TaskCard
                                    key={t.id}
                                    t={t}
                                    members={members}
                                    viewMode="lead"
                                    isLeaderOwnTask={true}
                                    onChangeStatus={onChangeTaskStatus}
                                    onReassign={onReassignTask}
                                    onToggleChecklist={onToggleChecklist}
                                    onUpdateTaskChecklist={onUpdateTaskChecklist}
                                    taskLogs={taskLogs}
                                    onOpenTaskLog={onOpenTaskLog}
                                  />
                                ))}
                              </div>
                            )}
                          </section>
                        )}

                        {/* ============================================
                            IN_PROGRESS SECTION (Collapsible)
                            ============================================ */}
                        {leaderOwnBuckets.inProgress.length > 0 && (
                          <section>
                            <div
                              className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none hover:text-brand-700 transition-colors"
                              onClick={() => setShowLeaderOwnInProgress(v => !v)}
                            >
                              <span className="inline-flex h-2 w-2 rounded-full bg-sky-400" />
                              <span>Đang xử lý ({leaderOwnBuckets.inProgress.length})</span>
                              <span className="ml-1 text-gray-400">
                                {showLeaderOwnInProgress ? "▲" : "▼"}
                              </span>
                            </div>

                            {showLeaderOwnInProgress && (
                              <div className="space-y-3">
                                {leaderOwnBuckets.inProgress.map(t => (
                                  <TaskCard
                                    key={t.id}
                                    t={t}
                                    members={members}
                                    viewMode="lead"
                                    isLeaderOwnTask={true}
                                    onChangeStatus={onChangeTaskStatus}
                                    onReassign={onReassignTask}
                                    onToggleChecklist={onToggleChecklist}
                                    onUpdateTaskChecklist={onUpdateTaskChecklist}
                                    taskLogs={taskLogs}
                                    onOpenTaskLog={onOpenTaskLog}
                                  />
                                ))}
                              </div>
                            )}
                          </section>
                        )}

                        {/* ============================================
                            DONE TODAY SECTION (Collapsible)
                            ============================================ */}
                        {leaderOwnBuckets.doneToday.length > 0 && (
                          <section>
                            <div
                              className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none hover:text-brand-700 transition-colors"
                              onClick={() => setShowLeaderOwnDone(v => !v)}
                            >
                              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                              <span>Hoàn thành hôm nay ({leaderOwnBuckets.doneToday.length})</span>
                              <span className="ml-1 text-gray-400">
                                {showLeaderOwnDone ? "▲" : "▼"}
                              </span>
                            </div>

                            {showLeaderOwnDone && (
                              <div className="space-y-3">
                                {leaderOwnBuckets.doneToday.map(t => (
                                  <TaskCard
                                    key={t.id}
                                    t={t}
                                    members={members}
                                    viewMode="lead"
                                    isLeaderOwnTask={true}
                                    onChangeStatus={onChangeTaskStatus}
                                    onReassign={onReassignTask}
                                    onToggleChecklist={onToggleChecklist}
                                    onUpdateTaskChecklist={onUpdateTaskChecklist}
                                    taskLogs={taskLogs}
                                    onOpenTaskLog={onOpenTaskLog}
                                  />
                                ))}
                              </div>
                            )}
                          </section>
                        )}

                        {/* ============================================
                            LINK TO ALL COMPLETED TASKS
                            ============================================ */}
                        {leaderOwnAllCompleted.length > 0 && (
                          <div className="text-center pt-2">
                            <button
                              className="text-xs text-brand-700 hover:text-brand-800 hover:underline font-medium"
                              onClick={() => setShowLeaderOwnCompletedAll(true)}
                            >
                              Xem tất cả công việc đã hoàn thành ({leaderOwnAllCompleted.length}) →
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ============================================
                        MODAL:  All Completed Tasks (Leader Own)
                        ============================================ */}
                    {showLeaderOwnCompletedAll && (
                      <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
                        <div className="rounded-xl bg-white shadow-2xl w-full max-w-[560px] max-h-[80vh] overflow-hidden flex flex-col">
                          {/* Header */}
                          <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-brand-50 to-emerald-50">
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-5 w-5 text-brand-600" />
                              <h3 className="text-sm font-semibold text-gray-900">
                                Công Việc Đã Hoàn Thành
                              </h3>
                            </div>
                            <button
                              onClick={() => setShowLeaderOwnCompletedAll(false)}
                              className="text-gray-400 hover:text-gray-600 transition"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          {/* Content */}
                          <div className="flex-1 overflow-y-auto px-6 py-4">
                            {leaderOwnAllCompleted.length === 0 ? (
                              <div className="text-center py-12 text-sm text-gray-400">
                                Chưa có công việc nào hoàn thành
                              </div>
                            ) : (
                              <div className="space-y-5">
                                {(() => {
                                  // Group by date
                                  const grouped: Record<string, typeof leaderOwnAllCompleted> = {};

                                  leaderOwnAllCompleted.forEach(t => {
                                    const dateStr = t.updatedAt || t.createdAt;
                                    if (!dateStr) return;

                                    const date = new Date(dateStr);
                                    const key = date.toLocaleDateString("vi-VN", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    });

                                    if (!grouped[key]) grouped[key] = [];
                                    grouped[key].push(t);
                                  });

                                  const today = new Date().toLocaleDateString("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  });

                                  return Object.entries(grouped).map(([dateKey, tasks]) => {
                                    const isToday = dateKey === today;

                                    return (
                                      <div key={dateKey}>
                                        {/* Date header */}
                                        <div className="flex items-center gap-2 mb-3">
                                          <span className="text-xs font-semibold text-gray-600">
                                            📅 {isToday ? `Hôm nay - ${dateKey}` : dateKey}
                                          </span>
                                          <span className="text-xs text-gray-400">
                                            ({tasks.length})
                                          </span>
                                        </div>

                                        {/* Tasks */}
                                        <div className="space-y-2 ml-4">
                                          {tasks.map(t => (
                                            <div
                                              key={t.id}
                                              className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 shadow-sm hover:shadow-md transition-shadow"
                                            >
                                              {/* Title */}
                                              <div className="text-sm font-medium text-gray-800 leading-snug mb-1">
                                                {truncateMessageTitle(t.title || t.description)}
                                              </div>

                                              {/* Meta */}
                                              <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>
                                                  Hoàn tất lúc{" "}
                                                  <span className="font-medium text-gray-700">
                                                    {t.updatedAt
                                                      ? new Date(t.updatedAt).toLocaleTimeString("vi-VN", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                      })
                                                      : "--:--"}
                                                  </span>
                                                </span>

                                                {/* Checklist progress (if any) */}
                                                {t.checklist && t.checklist.length > 0 && (
                                                  <span className="text-emerald-600 text-[10px]">
                                                    ✓ {t.checklist.filter(c => c.done).length}/{t.checklist.length} mục
                                                  </span>
                                                )}
                                              </div>

                                              {/* WorkType + Variant */}
                                              {(t.workTypeName || t.checklistVariantName) && (
                                                <div className="mt-1.5 flex items-center gap-1.5 text-[10px]">
                                                  {t.workTypeName && (
                                                    <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                                                      {t.workTypeName}
                                                    </span>
                                                  )}
                                                  {t.checklistVariantName && (
                                                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                      {t.checklistVariantName}
                                                    </span>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="px-6 py-3 border-t bg-gray-50 text-center">
                            <button
                              onClick={() => setShowLeaderOwnCompletedAll(false)}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              Đóng
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
              </>
            )}
          </div>
        )}

        <ChecklistTemplateSlideOver
          open={templateOpen}
          onClose={() => setTemplateOpen(false)}
          workTypeName={workTypeName}
          template={workTypeTemplate}
          checklistVariants={checklistVariants}
          activeVariantId={activeVariantId !== "__default__" ? activeVariantId : undefined}
          onChangeVariant={(variantId) => {
            setTemplateVariantId(variantId);
          }}
          onChange={(next) => {
            setChecklistTemplates?.((prev) => ({
              ...prev,
              [workTypeKey]: {
                ...(prev[workTypeKey] ?? {}),
                [activeVariantId]: next,
              },
            }));
          }}
        />
      </div>
      <style>{`
  /* Smooth collapse animation */
  @keyframes slideDown {
    from {
      opacity: 0;
      max-height: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      max-height: 2000px;
      transform: translateY(0);
    }
  }

  @keyframes slideUp {
    from {
      opacity: 1;
      max-height: 2000px;
    }
    to {
      opacity: 0;
      max-height: 0;
    }
  }

  /* Apply to task sections */
  section > div. space-y-3 {
    animation: slideDown 0.3s ease-out;
  }
    
  .task-section-enter {
    max-height: 0;
    overflow: hidden;
    transition:  max-height 0.3s ease-out;
  }
  . task-section-enter-active {
    max-height:  2000px;
  }
`}</style>
    </aside>

    
  );
};
