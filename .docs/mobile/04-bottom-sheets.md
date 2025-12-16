# 04 - Bottom Sheets (Bảng trượt từ dưới lên)

## Mục đích (Purpose)

**Tiếng Việt**: Bottom sheets là các bảng trượt từ dưới lên hoặc từ bên phải (mobile), dùng để thực hiện các hành động phụ như giao task, chuyển thông tin, xem nhật ký công việc mà không làm gián đoạn ngữ cảnh chính.

**English**: Bottom sheets are slide-up panels (or right-side on mobile) used for secondary actions like assigning tasks, transferring info, viewing task logs without disrupting the main context.

---

## Vị trí trong source code (Location)

- **AssignTaskSheet**: `src/components/sheet/AssignTaskSheet.tsx` (170 dòng)
- **GroupTransferSheet**: `src/components/sheet/GroupTransferSheet.tsx` (145 dòng)
- **DepartmentTransferSheet**: `src/components/sheet/DepartmentTransferSheet.tsx` (100 dòng)
- **TaskLogThreadSheet**: `src/features/portal/workspace/TaskLogThreadSheet.tsx` (274 dòng)

**Base component**: `src/components/ui/sheet.tsx` (Radix UI Sheet)

---

## Khi nào hiển thị (Display Conditions)

### 1. AssignTaskSheet

**Trigger**:

- Tap "Giao Task" từ message menu (Leader only)
- Tap "Giao Task" từ received info card (Leader only)

**Conditions**:

```tsx
// From ChatMain message menu
const canAssign = viewMode === "lead";

<button onClick={() => onAssignFromMessage?.(msg)}>
  Giao Task
</button>

// From RightPanel received info
<Button onClick={() => onAssignInfo?.(info)}>
  Giao Task
</Button>
```

**State**:

```tsx
const [assignSheet, setAssignSheet] = useState({
  open: false,
  source: undefined as "message" | "receivedInfo" | undefined,
  message: undefined as Message | undefined,
  info: undefined as ReceivedInfo | undefined,
});
```

---

### 2. GroupTransferSheet

**Trigger**:

- Tap "Chuyển nhóm" từ received info card

**Conditions**:

```tsx
<Button onClick={() => openTransferSheet?.(info)}>Chuyển nhóm</Button>
```

**State**:

```tsx
const [groupTransferSheet, setGroupTransferSheet] = useState({
  open: false,
  info: undefined as ReceivedInfo | undefined,
});
```

---

### 3. DepartmentTransferSheet

**Trigger**:

- Tap "Chuyển phòng" từ received info card (alternative to group transfer)

**State**:

```tsx
const [transferSheet, setTransferSheet] = useState({
  open: false,
  info: undefined as ReceivedInfo | undefined,
});
```

---

### 4. TaskLogThreadSheet

**Trigger**:

- Tap "Nhật ký" button trên task card

**Conditions**:

```tsx
<Button onClick={() => onOpenTaskLog?.(task.id)}>Nhật ký</Button>
```

**State**:

```tsx
const [taskLogSheet, setTaskLogSheet] = useState({
  open: false,
  taskId: undefined as string | undefined,
});
```

---

## 1. AssignTaskSheet - Giao Công Việc

### Cấu trúc (Structure)

```
┌─────────────────────────────────────┐
│ [X] Giao Công Việc                  │ ← Header
│     Tạo công việc mới cho thành viên│
├─────────────────────────────────────┤
│                                     │
│ Tên công việc                       │
│ ┌─────────────────────────────────┐ │
│ │ [Loaded from message/info]      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Giao cho                            │
│ ┌─────────────────────────────────┐ │
│ │ Chọn nhân viên...        [▼]    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Dạng checklist                      │
│ ┌─────────────────────────────────┐ │
│ │ Chọn dạng checklist...   [▼]    │ │
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│              [Huỷ]  [Tạo]          │ ← Footer
└─────────────────────────────────────┘
```

---

### Props Interface

```typescript
interface AssignTaskSheetProps {
  open: boolean;
  source?: "message" | "receivedInfo";
  message?: Message;
  info?: ReceivedInfo;

  members: Array<{ id: string; name: string }>;

  selectedWorkTypeId?: string;

  // Danh sách dạng checklist của work type (nếu có)
  checklistVariants?: { id: string; name: string; isDefault?: boolean }[];

  // ID dạng checklist mặc định
  defaultChecklistVariantId?: string;

  onClose: () => void;
  onCreateTask: (payload: {
    title: string;
    sourceMessageId: string;
    assigneeId: string;
    checklistVariantId?: string;
    checklistVariantName?: string;
  }) => void;
}
```

---

### Kiểu dáng chi tiết (Detailed Styling)

#### Container

```css
/* Radix Sheet overlay */
.sheet-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.5);
  animation: fade-in 0.2s ease-out;
}

/* Sheet content container */
.sheet-content {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 380px;
  max-width: 100%;
  background: white;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
  animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 50;
}

@keyframes slide-in-right {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
```

#### Header

```tsx
<SheetHeader className="pb-3 border-b border-gray-100">
  <SheetTitle className="text-base font-semibold text-gray-900">
    Giao Công Việc
  </SheetTitle>
  <p className="text-[12px] text-gray-500 mt-0.5">
    Tạo công việc mới cho thành viên trong nhóm
  </p>
</SheetHeader>
```

**CSS**:

```css
.sheet-header {
  padding-bottom: 0.75rem; /* pb-3 */
  border-bottom: 1px solid;
  border-color: rgb(243, 244, 246); /* gray-100 */
}

.sheet-title {
  font-size: 1rem; /* text-base */
  font-weight: 600; /* font-semibold */
  color: rgb(17, 24, 39); /* gray-900 */
}

.sheet-subtitle {
  font-size: 12px;
  color: rgb(107, 114, 128); /* gray-500 */
  margin-top: 0.125rem;
}
```

#### Input Fields

**Tên công việc**:

```tsx
<div>
  <Label className="text-xs font-medium text-gray-700">Tên công việc</Label>
  <input
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    className="mt-1 w-full rounded border px-3 py-2 text-sm"
  />
</div>
```

**CSS**:

```css
.input-field {
  margin-top: 0.25rem; /* mt-1 */
  width: 100%;
  padding: 0.5rem 0.75rem; /* px-3 py-2 */
  font-size: 0.875rem; /* text-sm */
  border: 1px solid rgb(209, 213, 219); /* gray-300 */
  border-radius: 0.25rem; /* rounded */
  transition: all 0.15s;
}

.input-field:focus {
  outline: none;
  border-color: rgb(14, 165, 233); /* sky-500 */
  ring: 2px solid rgba(14, 165, 233, 0.2);
}
```

#### Select Dropdown

**Giao cho**:

```tsx
<Select value={assignee} onValueChange={setAssignee}>
  <SelectTrigger className="mt-1">
    <SelectValue placeholder="Chọn nhân viên..." />
  </SelectTrigger>
  <SelectContent>
    {members.map((m) => (
      <SelectItem key={m.id} value={m.id}>
        {m.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**CSS**:

```css
.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border: 1px solid rgb(209, 213, 219);
  border-radius: 0.25rem;
  background: white;
  cursor: pointer;
  transition: all 0.15s;
}

.select-trigger:hover {
  background: rgb(249, 250, 251); /* gray-50 */
}

.select-trigger:focus {
  outline: none;
  border-color: rgb(14, 165, 233);
  ring: 2px solid rgba(14, 165, 233, 0.2);
}

.select-content {
  position: absolute;
  z-index: 50;
  max-height: 256px;
  overflow-y: auto;
  background: white;
  border: 1px solid rgb(229, 231, 235);
  border-radius: 0.375rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  animation: fade-in 0.15s ease-out;
}

.select-item {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.1s;
}

.select-item:hover {
  background: rgb(240, 249, 255); /* sky-50 */
}

.select-item[data-state="checked"] {
  background: rgb(224, 242, 254); /* sky-100 */
  font-weight: 500;
}
```

#### Footer Buttons

```tsx
<SheetFooter className="mt-6 flex gap-2">
  <Button variant="outline" onClick={onClose}>
    Huỷ
  </Button>
  <Button disabled={!assignee || !title.trim()} onClick={handleSubmit}>
    Tạo
  </Button>
</SheetFooter>
```

**CSS**:

```css
.sheet-footer {
  margin-top: 1.5rem; /* mt-6 */
  display: flex;
  gap: 0.5rem; /* gap-2 */
  padding-top: 1rem;
  border-top: 1px solid rgb(243, 244, 246);
}

/* Outline button */
.btn-outline {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(55, 65, 81); /* gray-700 */
  background: white;
  border: 1px solid rgb(209, 213, 219);
  border-radius: 0.375rem;
  transition: all 0.15s;
}

.btn-outline:hover {
  background: rgb(249, 250, 251); /* gray-50 */
}

/* Primary button */
.btn-primary {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  border: none;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.15s;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(2, 132, 199, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
```

---

### Tương tác (Interactions)

#### 1. Auto-fill Title

```typescript
React.useEffect(() => {
  if (!open) return;

  // Load title from source
  if (source === "message" && message) {
    setTitle(message.content || "");
  } else if (source === "receivedInfo" && info) {
    setTitle(info.title);
  }

  // Set default assignee
  setAssignee(members[0]?.id ?? "");

  // Set default checklist variant
  if (checklistVariants && checklistVariants.length > 0) {
    const defaultId =
      defaultChecklistVariantId ??
      checklistVariants.find((v) => v.isDefault)?.id ??
      checklistVariants[0]?.id ??
      "";

    setChecklistVariantId(defaultId);
  }
}, [open, source, message, info, members, checklistVariants]);
```

**Behavior**:

- Title tự động load từ message content hoặc received info title
- Assignee mặc định là member đầu tiên
- Checklist variant mặc định theo `isDefault` flag hoặc phần tử đầu

---

#### 2. Validation

```typescript
const handleSubmit = () => {
  // Require assignee and non-empty title
  if (!assignee || !title.trim()) return;

  const trimmedTitle = title.trim();
  const variant = checklistVariantId;
  const selectedVariant = checklistVariants?.find((v) => v.id === variant);

  onCreateTask({
    title: trimmedTitle,
    sourceMessageId:
      (source === "message" ? message?.id : info?.messageId) || "",
    assigneeId: assignee,
    checklistVariantId: variant || undefined,
    checklistVariantName: selectedVariant?.name,
  });

  onClose();
};
```

**Rules**:

- Assignee phải được chọn
- Title không được rỗng (sau khi trim)
- Submit button disabled khi validation fail

---

#### 3. Close Behaviors

**Tap overlay**:

```tsx
<Sheet open={open} onOpenChange={onClose}>
```

**Tap X button**:

```tsx
<button onClick={onClose}>
  <X className="w-4 h-4" />
</button>
```

**Tap "Huỷ" button**:

```tsx
<Button variant="outline" onClick={onClose}>
  Huỷ
</Button>
```

**After submit**:

```typescript
onCreateTask({
  /* payload */
});
onClose(); // Auto-close after success
```

---

## 2. GroupTransferSheet - Chuyển Nhóm Xử Lý

### Cấu trúc (Structure)

```
┌─────────────────────────────────────┐
│ [X] Chuyển nhóm xử lý               │ ← Header
├─────────────────────────────────────┤
│                                     │
│ Nhóm đích                           │
│ ┌─────────────────────────────────┐ │
│ │ Chọn nhóm...             [▼]    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Loại việc                           │
│ ┌─────────────────────────────────┐ │
│ │ Chọn loại việc...        [▼]    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Người phụ trách                     │
│ ┌─────────────────────────────────┐ │
│ │ Chọn nhân viên...        [▼]    │ │
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│              [Huỷ]  [Chuyển]       │ ← Footer
└─────────────────────────────────────┘
```

---

### Props Interface

```typescript
interface GroupTransferSheetProps {
  open: boolean;
  info?: ReceivedInfo;

  groups: GroupChat[]; // Tất cả nhóm có thể chuyển
  currentUserId: string; // Default assignee
  currentUserName: string;
  members: Array<{ id: string; name: string }>;

  onClose: () => void;
  onConfirm: (payload: {
    infoId: string;
    toGroupId: string;
    workTypeId: string;
    assigneeId: string;
    toGroupName: string;
    toWorkTypeName: string;
  }) => void;
}
```

---

### Kiểu dáng chi tiết (Detailed Styling)

#### Container và Header

```tsx
<SheetContent side="right" className="w-[380px]">
  <SheetHeader>
    <SheetTitle>Chuyển nhóm xử lý</SheetTitle>
  </SheetHeader>
</SheetContent>
```

**CSS**: Tương tự AssignTaskSheet

---

#### Cascading Selects (Chọn liên kết)

**Step 1: Chọn nhóm**

```tsx
<Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
  <SelectTrigger className="mt-1">
    <SelectValue placeholder="Chọn nhóm..." />
  </SelectTrigger>
  <SelectContent>
    {groups.map((g) => (
      <SelectItem key={g.id} value={g.id}>
        {g.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Step 2: Chọn work type (hiển thị sau khi chọn nhóm)**

```tsx
{
  group && (
    <div>
      <Label>Loại việc</Label>
      <Select value={selectedWorkTypeId} onValueChange={setSelectedWorkTypeId}>
        <SelectTrigger className="mt-1">
          <SelectValue placeholder="Chọn loại việc..." />
        </SelectTrigger>
        <SelectContent>
          {group.workTypes?.map((wt) => (
            <SelectItem key={wt.id} value={wt.id}>
              {wt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

**Step 3: Chọn người phụ trách**

```tsx
<Select value={assignee} onValueChange={setAssignee}>
  <SelectTrigger className="mt-1">
    <SelectValue placeholder="Chọn nhân viên..." />
  </SelectTrigger>
  <SelectContent>
    {members.map((m) => (
      <SelectItem key={m.id} value={m.id}>
        {m.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

---

### Tương tác (Interactions)

#### 1. Reset on Open

```typescript
React.useEffect(() => {
  if (!open || !info) return;

  setSelectedGroupId("");
  setSelectedWorkTypeId("");
  setAssignee(currentUserId);
}, [open, info, currentUserId]);
```

**Behavior**: Mỗi lần mở sheet, reset tất cả selections về trạng thái ban đầu

---

#### 2. Cascading Dependency

```typescript
const group = groups.find((g) => g.id === selectedGroupId);

// Work type select chỉ hiển thị sau khi chọn nhóm
{
  group && <div>{/* Work type select */}</div>;
}
```

**Logic**:

1. User chọn nhóm → `selectedGroupId` được set
2. Component tìm nhóm theo ID → `group` object
3. Work type dropdown hiển thị với `group.workTypes` làm options
4. User chọn work type → `selectedWorkTypeId` được set
5. User chọn assignee → `assignee` được set
6. Submit button enabled khi cả 3 đều có giá trị

---

#### 3. Submit

```typescript
const handleSubmit = () => {
  if (!info || !selectedGroupId || !selectedWorkTypeId || !assignee) return;

  const wt = group?.workTypes?.find((w) => w.id === selectedWorkTypeId);

  onConfirm({
    infoId: info.id,
    toGroupId: selectedGroupId,
    workTypeId: selectedWorkTypeId,
    assigneeId: assignee,
    toGroupName: group?.name || "",
    toWorkTypeName: wt?.name || "",
  });

  onClose();
};
```

**Validation**: Tất cả 3 selects phải có giá trị

---

## 3. DepartmentTransferSheet - Chuyển Phòng Ban Xử Lý

### Cấu trúc (Structure)

```
┌─────────────────────────────────────┐
│ [X] Chuyển phòng ban xử lý          │ ← Header
├─────────────────────────────────────┤
│                                     │
│ Nội dung tiếp nhận                  │
│ ┌─────────────────────────────────┐ │
│ │ [Info title readonly]           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Chọn phòng ban                      │
│ ┌─────────────────────────────────┐ │
│ │ Chọn phòng ban...        [▼]    │ │
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│              [Huỷ]  [Chuyển]       │ ← Footer
└─────────────────────────────────────┘
```

---

### Props Interface

```typescript
interface DepartmentTransferSheetProps {
  open: boolean;
  info?: ReceivedInfo;
  departments: { id: string; name: string }[];
  onClose: () => void;
  onConfirm: (infoId: string, departmentId: string) => void;
}
```

---

### Kiểu dáng chi tiết (Detailed Styling)

#### Readonly Info Display

```tsx
<div>
  <Label className="text-sm text-gray-600">Nội dung tiếp nhận</Label>
  <div className="mt-1 p-2 rounded-md bg-gray-50 border text-sm">
    {info?.title}
  </div>
</div>
```

**CSS**:

```css
.info-display {
  margin-top: 0.25rem; /* mt-1 */
  padding: 0.5rem; /* p-2 */
  border-radius: 0.375rem; /* rounded-md */
  background: rgb(249, 250, 251); /* gray-50 */
  border: 1px solid rgb(229, 231, 235); /* gray-200 */
  font-size: 0.875rem; /* text-sm */
  color: rgb(55, 65, 81); /* gray-700 */
}
```

---

### Tương tác (Interactions)

#### Reset on Open

```typescript
React.useEffect(() => {
  if (open) setTargetDept("");
}, [open]);
```

#### Submit

```typescript
<Button
  disabled={!targetDept}
  onClick={() => info && onConfirm(info.id, targetDept)}
>
  Chuyển
</Button>
```

**Validation**: Target department phải được chọn

---

## 4. TaskLogThreadSheet - Nhật Ký Công Việc

### Cấu trúc (Structure)

```
┌─────────────────────────────────────────┐
│ [X] NHẬT KÝ CÔNG VIỆC                   │ ← Header
│     [Title from source message/task]    │
│     Trạng thái: Đang xử lý              │
│     Giao cho: Nguyễn Văn A              │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  [User avatar] Nguyễn Văn A        │ │ ← Thread messages
│ │  Đã bắt đầu xử lý công việc         │ │
│ │  10:30                              │ │
│ │                                     │ │
│ │         [Reply to: "..."]           │ │
│ │         Hoàn thành bước 1    [Me]   │ │
│ │         11:45                       │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ Đang trả lời: "Đã bắt đầu xử lý..."    │ ← Reply indicator
│ [x]                                    │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │ ← Composer
│ │ Nhập nội dung...                    │ │
│ └─────────────────────────────────────┘ │
│ [📎] [🖼️]                    [Gửi] │
└─────────────────────────────────────────┘
```

---

### Props Interface

```typescript
interface TaskLogThreadSheetProps {
  open: boolean;
  onClose: () => void;

  task?: Task; // Task metadata
  sourceMessage?: Message; // Source message to derive title

  messages: TaskLogMessage[]; // Thread messages
  currentUserId: string;

  members: { id: string; name: string; avatar?: string }[];

  onSend: (payload: { content: string; replyToId?: string }) => void;
}
```

---

### Kiểu dáng chi tiết (Detailed Styling)

#### Full-Screen Overlay

```tsx
<div className="fixed inset-0 z-[999] flex justify-end bg-black/30">
  <div className="h-full w-full max-w-[520px] bg-white shadow-2xl border-l border-gray-200 flex flex-col">
    {/* Content */}
  </div>
</div>
```

**CSS**:

```css
.task-log-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  justify-content: flex-end;
  background: rgba(0, 0, 0, 0.3);
}

.task-log-sheet {
  height: 100%;
  width: 100%;
  max-width: 520px;
  background: white;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.2);
  border-left: 1px solid rgb(229, 231, 235);
  display: flex;
  flex-direction: column;
}
```

---

#### Header với Task Info

```tsx
<div className="px-4 pt-4 pb-3 border-b border-gray-200 bg-white shadow-sm">
  <div className="flex items-center justify-between gap-3">
    <div className="min-w-0">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Nhật ký công việc
      </div>
      <div className="mt-0.5 text-sm font-semibold text-gray-900 truncate">
        {title}
      </div>
      {task && (
        <div className="mt-0.5 text-[11px] text-gray-500 flex flex-wrap gap-2">
          <span>
            Trạng thái:{" "}
            <span className="font-medium">{/* Status label */}</span>
          </span>
          <span>
            Giao cho: <span className="font-medium">{/* Assignee name */}</span>
          </span>
          {task.dueAt && (
            <span>
              • Hạn xử lý:{" "}
              {new Date(task.dueAt).toLocaleString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
              })}
            </span>
          )}
        </div>
      )}
    </div>
    <button onClick={onClose}>
      <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
    </button>
  </div>
</div>
```

**CSS**:

```css
.task-log-header {
  padding: 1rem 1rem 0.75rem; /* px-4 pt-4 pb-3 */
  border-bottom: 1px solid rgb(229, 231, 235);
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.task-log-label {
  font-size: 0.75rem; /* text-xs */
  font-weight: 600; /* font-semibold */
  color: rgb(107, 114, 128); /* gray-500 */
  text-transform: uppercase;
  letter-spacing: 0.05em; /* tracking-wide */
}

.task-log-title {
  margin-top: 0.125rem;
  font-size: 0.875rem; /* text-sm */
  font-weight: 600;
  color: rgb(17, 24, 39); /* gray-900 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-log-meta {
  margin-top: 0.125rem;
  font-size: 11px;
  color: rgb(107, 114, 128);
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
```

---

#### Thread Messages Area

```tsx
<div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
  {messages.map((msg) => {
    const isMe = msg.senderId === currentUserId;
    const member = members.find((m) => m.id === msg.senderId);

    return (
      <div
        key={msg.id}
        className={`flex gap-2 ${isMe ? "justify-end" : "justify-start"}`}
      >
        {/* Avatar cho tin người khác */}
        {!isMe && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {member?.name[0] ?? "?"}
          </div>
        )}

        <div
          className={`max-w-[70%] ${
            isMe ? "items-end" : "items-start"
          } flex flex-col gap-0.5`}
        >
          {/* Reply-to indicator */}
          {msg.replyToId && (
            <div className="text-[10px] text-gray-400 px-2">
              <Reply className="w-3 h-3 inline mr-1" />
              Trả lời: "{messages
                .find((m) => m.id === msg.replyToId)
                ?.content?.slice(0, 20) ?? "..."}..."
            </div>
          )}

          {/* Message bubble */}
          <div
            className={`
            px-3 py-2 rounded-lg text-sm
            ${
              isMe
                ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white"
                : "bg-white border border-gray-200 text-gray-900"
            }
          `}
          >
            {msg.content}
          </div>

          {/* Timestamp */}
          <div className="text-[10px] text-gray-400 px-1">
            {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    );
  })}
  <div ref={bottomRef} />
</div>
```

**CSS**:

```css
.thread-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem; /* p-4 */
  background: rgb(248, 250, 252); /* slate-50 */
}

.message-row {
  display: flex;
  gap: 0.5rem; /* gap-2 */
  margin-bottom: 0.75rem;
}

.message-row.me {
  justify-content: flex-end;
}

.message-avatar {
  width: 2rem; /* w-8 */
  height: 2rem; /* h-8 */
  border-radius: 9999px;
  background: linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.message-content-wrapper {
  max-width: 70%;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.message-bubble {
  padding: 0.5rem 0.75rem; /* px-3 py-2 */
  border-radius: 0.5rem; /* rounded-lg */
  font-size: 0.875rem; /* text-sm */
  line-height: 1.5;
}

.message-bubble.me {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  color: white;
}

.message-bubble.other {
  background: white;
  border: 1px solid rgb(229, 231, 235);
  color: rgb(17, 24, 39);
}

.message-timestamp {
  font-size: 10px;
  color: rgb(156, 163, 175); /* gray-400 */
  padding: 0 0.25rem;
}
```

---

#### Reply Indicator

```tsx
{
  replyTo && (
    <div className="px-4 py-2 bg-sky-50 border-t border-sky-100 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <Reply className="w-4 h-4 text-sky-600 flex-shrink-0" />
        <div className="text-xs text-sky-700 truncate">
          Đang trả lời: "{replyTo.content?.slice(0, 30) ?? "..."}..."
        </div>
      </div>
      <button
        onClick={() => setReplyTo(null)}
        className="text-sky-600 hover:text-sky-800"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
```

**CSS**:

```css
.reply-indicator {
  padding: 0.5rem 1rem; /* px-4 py-2 */
  background: rgb(240, 249, 255); /* sky-50 */
  border-top: 1px solid rgb(224, 242, 254); /* sky-100 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.reply-indicator-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  flex: 1;
}

.reply-indicator-text {
  font-size: 0.75rem; /* text-xs */
  color: rgb(3, 105, 161); /* sky-700 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reply-indicator-close {
  color: rgb(2, 132, 199); /* sky-600 */
  cursor: pointer;
  flex-shrink: 0;
}

.reply-indicator-close:hover {
  color: rgb(7, 89, 133); /* sky-800 */
}
```

---

#### Composer

```tsx
<div className="border-t border-gray-200 bg-white p-3">
  <div className="flex items-end gap-2">
    {/* Attachment buttons */}
    <div className="flex gap-1 mb-1">
      <button className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded transition">
        <Paperclip className="w-5 h-5" />
      </button>
      <button className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded transition">
        <ImageIcon className="w-5 h-5" />
      </button>
    </div>

    {/* Textarea */}
    <textarea
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Nhập nội dung..."
      rows={1}
      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-500"
    />

    {/* Send button */}
    <button
      onClick={handleSend}
      disabled={!inputValue.trim()}
      className="p-2 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-lg hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      <SendHorizonal className="w-5 h-5" />
    </button>
  </div>
</div>
```

**CSS**:

```css
.composer {
  border-top: 1px solid rgb(229, 231, 235);
  background: white;
  padding: 0.75rem; /* p-3 */
}

.composer-row {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem; /* gap-2 */
}

.composer-tools {
  display: flex;
  gap: 0.25rem; /* gap-1 */
  margin-bottom: 0.25rem;
}

.composer-tool-btn {
  padding: 0.5rem; /* p-2 */
  color: rgb(156, 163, 175); /* gray-400 */
  border-radius: 0.25rem;
  transition: all 0.15s;
}

.composer-tool-btn:hover {
  color: rgb(14, 165, 233); /* sky-600 */
  background: rgb(240, 249, 255); /* sky-50 */
}

.composer-textarea {
  flex: 1;
  padding: 0.5rem 0.75rem; /* px-3 py-2 */
  border: 1px solid rgb(209, 213, 219);
  border-radius: 0.5rem; /* rounded-lg */
  font-size: 0.875rem; /* text-sm */
  resize: none;
  transition: all 0.15s;
}

.composer-textarea:focus {
  outline: none;
  ring: 2px solid rgb(14, 165, 233);
}

.composer-send-btn {
  padding: 0.5rem; /* p-2 */
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  transition: all 0.15s;
}

.composer-send-btn:hover {
  box-shadow: 0 4px 6px rgba(14, 165, 233, 0.3);
}

.composer-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

### Tương tác (Interactions)

#### 1. Auto-Scroll to Bottom

```typescript
const bottomRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  if (!open) return;
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [open, messages.length]);
```

**Behavior**:

- Khi mở sheet → scroll xuống cuối
- Khi có message mới → scroll xuống cuối
- Smooth scrolling animation

---

#### 2. Reply to Message

```typescript
const [replyTo, setReplyTo] = useState<TaskLogMessage | null>(null);

// Long-press or right-click to set replyTo
const handleReply = (msg: TaskLogMessage) => {
  setReplyTo(msg);
};

// Send with replyToId
const handleSend = () => {
  const content = inputValue.trim();
  if (!content) return;

  onSend({
    content,
    replyToId: replyTo?.id,
  });

  setInputValue("");
  setReplyTo(null);
};
```

**Behavior**:

- User long-press message → Set as reply target
- Reply indicator hiển thị phía trên composer
- Tap X trên reply indicator → Clear reply target
- Send message bao gồm `replyToId`

---

#### 3. Enter to Send

```typescript
const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
};
```

**Behavior**:

- Enter → Send message
- Shift+Enter → New line in textarea

---

#### 4. Title Generation

```typescript
function getTaskLogTitle(task?: Task, sourceMsg?: Message): string {
  // 1. Ưu tiên text content từ source message
  if (sourceMsg?.type === "text" && sourceMsg.content) {
    const raw = sourceMsg.content.trim();
    return raw.length > 80 ? raw.slice(0, 77) + "…" : raw;
  }

  // 2. Nếu là image
  if (sourceMsg?.type === "image") {
    const fileName =
      sourceMsg.files?.[0]?.name || sourceMsg.fileInfo?.name || "";
    if (fileName) return `[Hình ảnh] ${fileName}`;
    return `[Hình ảnh] từ ${sourceMsg.sender}`;
  }

  // 3. Nếu là file
  if (sourceMsg?.type === "file") {
    const fileName =
      sourceMsg.files?.[0]?.name || sourceMsg.fileInfo?.name || "";
    if (fileName) return `[Tập tin] ${fileName}`;
    return `[Tập tin] từ ${sourceMsg.sender}`;
  }

  // 4. Fallback: Task title hoặc label chung
  if (task?.title) return task.title;
  return "Nhật ký công việc";
}
```

---

## Navigation & Integration (Điều hướng & Tích hợp)

### Trigger Points Summary

| Sheet                       | Trigger từ đâu                 | Role Required | Code Location  |
| --------------------------- | ------------------------------ | ------------- | -------------- |
| **AssignTaskSheet**         | Message menu → "Giao Task"     | Leader        | ChatMain.tsx   |
|                             | Received info → "Giao Task"    | Leader        | RightPanel.tsx |
| **GroupTransferSheet**      | Received info → "Chuyển nhóm"  | Any           | RightPanel.tsx |
| **DepartmentTransferSheet** | Received info → "Chuyển phòng" | Any           | RightPanel.tsx |
| **TaskLogThreadSheet**      | Task card → "Nhật ký"          | Any           | RightPanel.tsx |

---

### State Management

**PortalWireframes.tsx** (Parent component):

```typescript
// AssignTaskSheet state
const [assignSheet, setAssignSheet] = useState({
  open: false,
  source: undefined as "message" | "receivedInfo" | undefined,
  message: undefined as Message | undefined,
  info: undefined as ReceivedInfo | undefined,
});

const openAssignFromMessage = (msg: Message) => {
  setAssignSheet({
    open: true,
    source: "message",
    message: msg,
    info: undefined,
  });
};

const openAssignFromInfo = (info: ReceivedInfo) => {
  setAssignSheet({
    open: true,
    source: "receivedInfo",
    message: undefined,
    info,
  });
};

// GroupTransferSheet state
const [groupTransferSheet, setGroupTransferSheet] = useState({
  open: false,
  info: undefined as ReceivedInfo | undefined,
});

const openGroupTransfer = (info: ReceivedInfo) => {
  setGroupTransferSheet({ open: true, info });
};

// TaskLogThreadSheet state
const [taskLogSheet, setTaskLogSheet] = useState({
  open: false,
  taskId: undefined as string | undefined,
});

const openTaskLog = (taskId: string) => {
  setTaskLogSheet({ open: true, taskId });
};
```

---

### Render in Component Tree

```tsx
<PortalWireframes>
  <WorkspaceView
    onAssignFromMessage={openAssignFromMessage}
    onAssignInfo={openAssignFromInfo}
    openTransferSheet={openGroupTransfer}
    onOpenTaskLog={openTaskLog}
  />

  {/* Bottom Sheets */}
  <AssignTaskSheet
    open={assignSheet.open}
    source={assignSheet.source}
    message={assignSheet.message}
    info={assignSheet.info}
    members={groupMembers}
    checklistVariants={checklistVariants}
    defaultChecklistVariantId={defaultChecklistVariantId}
    onClose={() =>
      setAssignSheet({
        open: false,
        source: undefined,
        message: undefined,
        info: undefined,
      })
    }
    onCreateTask={handleCreateTask}
  />

  <GroupTransferSheet
    open={groupTransferSheet.open}
    info={groupTransferSheet.info}
    groups={groupsMerged}
    currentUserId={currentUserId}
    currentUserName={currentUserName}
    members={groupMembers}
    onClose={() => setGroupTransferSheet({ open: false, info: undefined })}
    onConfirm={handleGroupTransfer}
  />

  <DepartmentTransferSheet
    open={transferSheet.open}
    info={transferSheet.info}
    departments={mockDepartments}
    onClose={() => setTransferSheet({ open: false, info: undefined })}
    onConfirm={handleDeptTransfer}
  />

  <TaskLogThreadSheet
    open={taskLogSheet.open}
    task={tasks.find((t) => t.id === taskLogSheet.taskId)}
    sourceMessage={messages.find(
      (m) =>
        m.id ===
        tasks.find((t) => t.id === taskLogSheet.taskId)?.sourceMessageId
    )}
    messages={taskLogs[taskLogSheet.taskId ?? ""] ?? []}
    currentUserId={currentUserId}
    members={groupMembers}
    onSend={(payload) => handleTaskLogSend(taskLogSheet.taskId!, payload)}
    onClose={() => setTaskLogSheet({ open: false, taskId: undefined })}
  />
</PortalWireframes>
```

---

## Mobile-Specific Behaviors (Hành vi trên Mobile)

### 1. Full-Screen on Small Screens

**Responsive Width**:

```css
.sheet-content {
  width: 380px;
  max-width: 100%; /* Full-width trên mobile */
}

@media (max-width: 640px) {
  .sheet-content {
    width: 100%;
    max-width: 100%;
  }
}
```

---

### 2. Touch-Friendly Targets

**All buttons và interactive elements**:

- Minimum 44×44px tap target
- Adequate spacing between elements (min 8px)

---

### 3. Prevent Body Scroll

```css
/* Khi sheet mở, lock body scroll */
body.sheet-open {
  overflow: hidden;
}
```

```typescript
useEffect(() => {
  if (open) {
    document.body.classList.add("sheet-open");
  } else {
    document.body.classList.remove("sheet-open");
  }

  return () => {
    document.body.classList.remove("sheet-open");
  };
}, [open]);
```

---

### 4. Swipe to Close (Optional)

**Not currently implemented, but recommended**:

```typescript
const handleTouchStart = (e: React.TouchEvent) => {
  const touch = e.touches[0];
  setTouchStart(touch.clientX);
};

const handleTouchMove = (e: React.TouchEvent) => {
  if (!touchStart) return;

  const touch = e.touches[0];
  const diff = touch.clientX - touchStart;

  // Swipe right > 100px → close
  if (diff > 100) {
    onClose();
  }
};
```

---

## Testing Checklist (Danh sách kiểm tra)

### AssignTaskSheet

- [ ] Opens from message menu (Leader only)
- [ ] Opens from received info (Leader only)
- [ ] Title auto-fills from source
- [ ] Assignee defaults to first member
- [ ] Checklist variant defaults correctly
- [ ] Submit button disabled when invalid
- [ ] Creates task successfully
- [ ] Closes after submit
- [ ] Closes on overlay tap
- [ ] Closes on X button
- [ ] Closes on "Huỷ" button

### GroupTransferSheet

- [ ] Opens from received info "Chuyển nhóm"
- [ ] Resets selections on open
- [ ] Group select shows all groups
- [ ] Work type select appears after group selection
- [ ] Work type options match selected group
- [ ] Assignee defaults to current user
- [ ] Submit button disabled when incomplete
- [ ] Transfers successfully
- [ ] Closes after submit

### DepartmentTransferSheet

- [ ] Opens from received info "Chuyển phòng"
- [ ] Shows info title (readonly)
- [ ] Department select shows all departments
- [ ] Submit button disabled when no selection
- [ ] Transfers successfully
- [ ] Closes after submit

### TaskLogThreadSheet

- [ ] Opens from task card "Nhật ký"
- [ ] Shows correct task title
- [ ] Shows task status and assignee
- [ ] Loads existing messages
- [ ] Auto-scrolls to bottom on open
- [ ] Auto-scrolls on new message
- [ ] Reply indicator works
- [ ] Enter to send
- [ ] Shift+Enter for new line
- [ ] Send button disabled when empty
- [ ] Message bubbles align correctly (me vs other)
- [ ] Timestamps display correctly
- [ ] Avatars display for other users
- [ ] Closes on overlay tap
- [ ] Closes on X button

---

## Performance Considerations (Tối ưu hiệu suất)

### 1. Lazy Mounting

```typescript
// Don't render sheet content until open
{
  open && <SheetContent>{/* Content */}</SheetContent>;
}
```

---

### 2. Memoize Expensive Computations

```typescript
const title = useMemo(
  () => getTaskLogTitle(task, sourceMessage),
  [task, sourceMessage]
);
```

---

### 3. Virtualize Long Lists

For TaskLogThreadSheet with 100+ messages:

```typescript
import { FixedSizeList } from "react-window";

<FixedSizeList
  height={600}
  itemCount={messages.length}
  itemSize={80}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <MessageBubble message={messages[index]} />
    </div>
  )}
</FixedSizeList>;
```

---

### 4. Debounce Input

```typescript
import { debounce } from "lodash";

const debouncedSetInput = debounce((value: string) => {
  setInputValue(value);
}, 150);
```

---

## Accessibility (Khả năng tiếp cận)

### 1. Keyboard Navigation

```tsx
<Sheet open={open} onOpenChange={onClose}>
  {/* Escape key auto-closes via Radix UI */}
</Sheet>
```

---

### 2. Focus Management

```typescript
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  if (open) {
    // Auto-focus first input when sheet opens
    setTimeout(() => inputRef.current?.focus(), 100);
  }
}, [open]);
```

---

### 3. Screen Reader Labels

```tsx
<Label htmlFor="assignee-select">
  Giao cho
</Label>
<Select id="assignee-select" ...>
```

---

### 4. ARIA Attributes

```tsx
<button aria-label="Đóng" onClick={onClose}>
  <X className="w-4 h-4" />
</button>
```

---

_Tài liệu này mô tả chi tiết tất cả bottom sheets trong ứng dụng mobile Portal._

_Cập nhật lần cuối: 16/12/2024_
