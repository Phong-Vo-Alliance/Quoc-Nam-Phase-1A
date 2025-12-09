// ===== Common =====
type ID = string;
type ISODate = string; // ISO 8601

// Định nghĩa tất cả type & interface
export type BadgeType = 'processing' | 'waiting' | 'done' | 'danger' | 'neutral';
export type ToastKind = 'success' | 'info' | 'warning' | 'error';
export type UserRole = "admin" | "leader" | "staff";

export interface ToastMsg {
  id: string;
  kind: ToastKind;
  msg: string;
}

// ===== Tasks & Checklist =====
export type TaskStatus =
  | "todo"             // Chưa xử lý
  | "in_progress"      // Đang xử lý
  | "awaiting_review"  // Chờ duyệt (review của leader)
  | "done";            // Hoàn thành

export interface ChecklistItem {
  id: ID;
  label: string;
  done: boolean;
  doneAt?: ISODate;
  doneById?: ID;
}

export interface ChecklistTemplate {
  id: ID;
  name: string;
  workTypeId?: ID;  // template có thể gắn theo work type
  items: string[];  // labels
  createdById: ID;
  createdAt: ISODate;
}

export interface TaskEvent {
  at: ISODate;
  byId: ID;
  type: "status_change" | "assignee_change" | "checklist_update" | "comment";
  payload?: any;
}

export interface Task {
  id: ID;
  groupId: ID;
  workTypeId: ID;
  workTypeName?: string;
  checklistVariantId?: string;
  checklistVariantName?: string;
  progressText?: string;

  sourceMessageId: ID;       // message gốc dùng để tạo task
  title: string;
  description?: string;

  assigneeId: ID;            // người được giao (staff)
  assignedById: ID;          // leader giao
  status: TaskStatus;

  priority?: "low" | "normal" | "high" | "urgent";
  dueAt?: ISODate;

  // pending: staff muốn để sau 2-3 ngày
  isPending?: boolean;
  pendingUntil?: ISODate;

  checklist?: ChecklistItem[];   // copy từ template, cho phép check
  history?: TaskEvent[];         // log thay đổi

  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface LeadThread {
  id: string;
  t: string;
  type: 'Nội bộ' | 'POS';
  owner: string;
  st: 'Đang xử lý' | 'Chờ phản hồi' | 'Đã chốt';
  at: string;
}

// Dùng chung cho mọi loại file đính kèm (ảnh, pdf, excel, word, v.v.)
export type AttachmentType = "pdf" | "excel" | "word" | "image" | "other";

export interface FileAttachment {
  name: string;
  url: string;
  type: AttachmentType;
  size?: string;
}


/* ---------------- Message Types ---------------- */
export interface Message {
  /** Mã định danh duy nhất */
  id: string;
  groupId: ID;
  senderId: ID;

  /** Kiểu tin nhắn */
  type: "text" | "image" | "file" | "system";

  /** Người gửi */
  sender: string;

  /** Nội dung chính (text hoặc caption) */
  content?: string;

  /** Thời gian gửi (hiển thị UI) */
  time: string;

  /** Có phải là tin nhắn của user hiện tại không */
  isMine?: boolean;

  files?: FileAttachment[];
  
  /** vẫn giữ fileInfo cũ để backward-compatible **/
  fileInfo?: FileAttachment;

  /** Tin nhắn gốc nếu đây là reply */
  replyTo?: {
    id: string;
    type: "text" | "file" | "image";
    sender: string;
    content?: string;
    files?: {
      name: string;
      url: string;
      type: "image";
    }[];
    fileInfo?: FileAttachment;
  };

  /** Đánh dấu tin nhắn */
  isPinned?: boolean;

  /** Cờ hệ thống: phân cách ngày, sự kiện */
  isSystem?: boolean;

  createdAt: ISODate;

  // liên kết loại việc nếu tin nhắn được chuyển thành task
  workTypeId?: ID;

  // liên kết nhiệm vụ nếu tin nhắn được chuyển thành task
  taskId?: ID;
}

/**
 * Message trong thread Nhật ký công việc của Task
 * 1 Task <-> 1 thread, nên taskId cũng là threadId
 */
export interface TaskLogMessage {
  /** Mã định danh message trong thread */
  id: string;

  /** Task / thread mà message này thuộc về */
  taskId: ID;

  /** Người gửi */
  senderId: ID;
  sender: string;

  /** Kiểu tin nhắn (text / image / file / system) */
  type: "text" | "image" | "file" | "system";

  /** Nội dung chính (text hoặc caption) */
  content?: string;

  /** Thời gian gửi (ISO string, dùng cho hiển thị) */
  time: string;
  createdAt: ISODate;

  /** Có phải tin của current user không (phục vụ align bên phải) */
  isMine?: boolean;

  /** File / ảnh đính kèm nếu có */
  files?: FileAttachment[];
  fileInfo?: FileAttachment;

  /** Reply tới một message khác trong cùng thread */
  replyTo?: Message["replyTo"];
}

/* ---------------- User Types ---------------- */
export interface User {
  id: ID;
  displayName: string;
  email: string;

  roles: UserRole[];          // quyền toàn cục (admin portal, v.v.)
  departmentIds: ID[];        // có thể 1 hoặc nhiều (tuỳ doanh nghiệp)
  primaryDepartmentId?: ID;   // dùng cho Staff trải nghiệm tốt hơn
  active: boolean;
  createdAt: ISODate;  
}

export interface Department {
  id: ID;
  name: string;
  leaderId: ID;         // đúng 1 leader/phòng
  memberIds: ID[];      // gồm cả leader
  createdAt: ISODate;
}

export interface ChecklistVariant {
  id: string;            // ví dụ: "nhanHang_kiemDem"
  name: string;          // ví dụ: "Kiểm đếm"
  description?: string;  // mô tả thêm nếu cần
  isDefault?: boolean;   // variant mặc định cho workType
}

// ===== Group & Work Types =====
export interface WorkType {
  id: ID;
  key: string;         // "nhan_hang" | "doi_tra" | ...
  name: string;        // "Nhận hàng", "Đổi trả", ...
  icon?: string;       // lucide icon name
  color?: string;      // brand subcolor cho chip/badge

  /** Danh sách các dạng checklist con (Kiểm đếm / Lưu trữ / Thanh toán / ...) */
  checklistVariants?: ChecklistVariant[];
}

export interface GroupMember {
  userId: ID;
  role: "leader" | "staff";
  isAutoJoined?: boolean; // true nếu là leader của phòng ban liên kết
  joinedAt: ISODate;
  addedById?: ID;         // ai thêm vào (admin/leader), nếu không auto
}

export interface GroupChat {
  id: ID;
  name: string;               // "Vận Hành - Kho"
  description?: string;
  departmentIds: ID[];        // 2-3 phòng ban
  members: GroupMember[];     // leaders auto + staff do leader assign
  workTypes: WorkType[];      // loại việc được cấu hình riêng cho group
  defaultWorkTypeId?: ID;     // filter mặc định khi vào group
  lastSender?: string;   // "Huyền"
  lastMessage?: string;  // text | "[hình ảnh]" | "[pdf]"
  lastTime?: string;     // "09:45"
  unreadCount?: number;  // 0 | 1 | 2...
  createdAt: ISODate;
}


/* ---------------- Work Types ---------------- */
// export interface WorkItem {
//   id: string;
//   title: string;
//   status: "open" | "done" | "in-progress";
//   assignedTo: string;
// }

export interface PinnedMessage {
  id: string;                     // id của pinned entry
  chatId: string;                 // group id nơi message xuất hiện
  groupName: string;              // tên nhóm chat
  workTypeName?: string;          // tên loại việc (nếu có)

  sender: string;                 // tên người gửi
  type: "text" | "image" | "file";

  content?: string;               // nội dung text (nếu là text)
  preview?: string;               // preview rút gọn để hiển thị list

  fileInfo?: FileAttachment;      // thumbnail hoặc file info (image/pdf/etc)

  time: string;                   // thời gian gửi tin nhắn (ISO), dùng để group
}


// ===== Preferences (per user per group) =====
export interface GroupUserPreference {
  userId: ID;
  groupId: ID;
  defaultWorkTypeId?: ID;  // nhớ filter mặc định của user trong group
  createdAt: ISODate;
  updatedAt: ISODate;
}

// ===== Permission gợi ý (nếu cần mock chi tiết) =====
export type Permission =
  | "view_group"
  | "assign_staff_to_group"
  | "view_all_tasks_in_group"
  | "change_any_task_status"
  | "convert_message_to_task"
  | "create_checklist_template"
  | "change_own_task_status"
  | "mark_task_pending";

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

// ===== Tiếp nhận thông tin =====
export interface ReceivedInfo {
  id: string;
  messageId: string;
  groupId: string;
  title: string;
  sender: string;
  createdAt: string;
  status: "waiting" | "assigned" | "transferred";
  transferredTo?: string;  // departmentId
  transferredToGroupName?: string;
  transferredWorkTypeName?: string;
}

// ===== Checklist task Template Item =====
export type ChecklistTemplateItem = {
  id: string;        // id template
  label: string;     // tên checklist mặc định
};

export type ChecklistTemplateMap = Record<
  string,               // workTypeId
  Record<
    string,             // checklistVariantId
    ChecklistTemplateItem[]
  >
>;