# 03 - Mobile Right Panel Screen

## Màn hình Panel Công việc (Mobile)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Screen Structure](#screen-structure)
3. [Tab Navigation](#tab-navigation)
4. [Info Tab](#info-tab)
5. [Order Tab](#order-tab)
6. [Tasks Tab](#tasks-tab)
7. [Task Management](#task-management)
8. [Styling Details](#styling-details)
9. [Interactions](#interactions)
10. [Navigation](#navigation)
11. [Testing Checklist](#testing-checklist)

---

## 1. Overview

### Purpose (Mục đích)

**Vietnamese**: Màn hình panel bên phải (công việc) cho phép người dùng xem thông tin nhóm, danh sách thông tin nhận được, và quản lý công việc được giao.

**English**: Right panel (work) screen allows users to view group information, received info list, and manage assigned tasks.

### Component Location

- **File**: `src/features/portal/workspace/RightPanel.tsx`
- **Component**: `RightPanel`
- **Props**: `isMobile={true}`

### Display Conditions

- **Route**: `/mobile`
- **Mobile Tab**: `mobileTab === "work"` (selected via bottom navigation)
- **Visibility**: Always visible when work tab selected
- **Hidden**: When messages or profile tab selected

---

## 2. Screen Structure

```
┌─────────────────────────────────┐
│ [Thông tin] [Order] [Công việc] │ ← Tab Switcher
├─────────────────────────────────┤
│                                 │
│  ╔════════════════════════════╗ │
│  ║ GROUP INFORMATION          ║ │
│  ║ Members, Settings, etc.    ║ │
│  ╚════════════════════════════╝ │
│              or                 │
│  ┌──────────────────────────┐  │
│  │ 📄 Info Title            │  │ ← Received Info Card
│  │ Description text...      │  │
│  │ [👤 Assign] [📋 Detail]  │  │
│  └──────────────────────────┘  │
│              or                 │
│  ┌──────────────────────────┐  │
│  │ ✅ Task Title  [Đang làm] │  │ ← Task Card
│  │ Progress: ████░░ 60%     │  │   (with floating badge)
│  │ Deadline: 25/12/2024     │  │
│  │ [Start] [View Details]   │  │
│  └──────────────────────────┘  │
│                                 │ ← Scrollable Content
│            ...                  │
│                                 │
└─────────────────────────────────┘
```

---

## 3. Tab Navigation

### 3.1 Toggle Group Tabs

**Structure**:

```tsx
<div className="sticky top-0 z-10 bg-white border-b border-gray-200">
  <ToggleGroup
    type="single"
    value={activeTab}
    onValueChange={(value) => value && setActiveTab(value)}
    className="w-full flex"
  >
    <ToggleGroupItem
      value="info"
      className="flex-1 px-4 py-2.5 text-sm font-medium
                 data-[state=on]:border-b-2 data-[state=on]:border-brand-500 data-[state=on]:text-brand-600
                 data-[state=off]:text-gray-600 data-[state=off]:border-b-2 data-[state=off]:border-transparent
                 transition-all duration-200"
    >
      Thông tin
    </ToggleGroupItem>
    <ToggleGroupItem
      value="order"
      className="flex-1 px-4 py-2.5 text-sm font-medium
                 data-[state=on]:border-b-2 data-[state=on]:border-brand-500 data-[state=on]:text-brand-600
                 data-[state=off]:text-gray-600 data-[state=off]:border-b-2 data-[state=off]:border-transparent
                 transition-all duration-200"
    >
      Order
    </ToggleGroupItem>
    <ToggleGroupItem
      value="tasks"
      className="flex-1 px-4 py-2.5 text-sm font-medium
                 data-[state=on]:border-b-2 data-[state=on]:border-brand-500 data-[state=on]:text-brand-600
                 data-[state=off]:text-gray-600 data-[state=off]:border-b-2 data-[state=off]:border-transparent
                 transition-all duration-200"
    >
      Công việc
    </ToggleGroupItem>
  </ToggleGroup>
</div>
```

**Styling Details**:

**Container**:

- Position: Sticky top
- Z-Index: 10 (above content)
- Background: White
- Border: 1px solid #E5E7EB (bottom)

**Tab Items**:

- **Layout**:

  - Flex: Grow equally (`flex-1`)
  - Padding: 16px horizontal, 10px vertical
  - Font: 14px (`text-sm`), medium weight
  - Width: ~33% each (equal)

- **Active State** (`data-[state=on]`):

  - Border Bottom: 2px solid Brand-500 (#3B82F6)
  - Text Color: Brand-600 (#2563EB)
  - Indicator line animates in

- **Inactive State** (`data-[state=off]`):
  - Border Bottom: 2px transparent (for layout stability)
  - Text Color: Gray-600 (#4B5563)
  - No indicator line

**Animation**:

- Duration: 200ms
- Properties: Border color, text color
- Easing: Ease-in-out

**Tab Labels**:

- "Thông tin" (Information)
- "Order" (Order management)
- "Công việc" (Tasks)

---

## 4. Info Tab

### 4.1 Group Information Section

**Structure** (if group selected):

```tsx
<div className="px-3 py-4 space-y-4">
  {/* Group Avatar & Name */}
  <div className="flex items-center gap-3">
    <Avatar size="lg" name={group.name} />
    <div>
      <h2 className="text-base font-semibold text-gray-900">{group.name}</h2>
      <p className="text-sm text-gray-500">{group.memberCount} thành viên</p>
    </div>
  </div>

  {/* Quick Actions */}
  <div className="flex gap-2">
    <button
      className="flex-1 px-3 py-2 text-sm font-medium text-brand-600 bg-brand-50
                       hover:bg-brand-100 rounded-lg transition-colors"
    >
      <Settings className="w-4 h-4 mx-auto mb-1" />
      Cài đặt
    </button>
    <button
      className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100
                       hover:bg-gray-200 rounded-lg transition-colors"
    >
      <Users className="w-4 h-4 mx-auto mb-1" />
      Thành viên
    </button>
    <button
      className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100
                       hover:bg-gray-200 rounded-lg transition-colors"
    >
      <FileText className="w-4 h-4 mx-auto mb-1" />
      File
    </button>
  </div>

  {/* Members List */}
  <div className="space-y-2">
    <h3 className="text-sm font-medium text-gray-700">Thành viên</h3>
    {group.members.map((member) => (
      <div key={member.id} className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <Avatar size="sm" name={member.name} />
          <div>
            <p className="text-sm font-medium text-gray-900">{member.name}</p>
            <p className="text-xs text-gray-500">{member.role}</p>
          </div>
        </div>
        {member.isOnline && (
          <span className="w-2 h-2 bg-green-500 rounded-full" />
        )}
      </div>
    ))}
  </div>
</div>
```

**Styling Details**:

**Container**: `px-3 py-4` (12px horizontal, 16px vertical)

**Group Header**:

- Avatar: Large (48×48px)
- Name: 16px (`text-base`), semibold, gray-900
- Member Count: 14px, gray-500

**Quick Actions**:

- Display: Flex with 8px gap (`gap-2`)
- Each Button:
  - Flex: Grow equally
  - Padding: 12px horizontal, 8px vertical
  - Font: 14px, medium weight
  - Icon: 16×16px, centered, 4px margin bottom
  - Border Radius: 8px
  - Primary: Brand-600 text, Brand-50 background
  - Secondary: Gray-700 text, Gray-100 background

**Members List**:

- Header: 14px, medium weight, gray-700
- Items: Flex with space-between, 8px vertical padding
- Avatar: Small (32×32px)
- Name: 14px, medium weight, gray-900
- Role: 12px, gray-500
- Online Dot: 8×8px (`w-2 h-2`), green-500

### 4.2 Received Info Section

**Structure**:

```tsx
<ScrollArea className="flex-1">
  <div className="px-3 py-4 space-y-3">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-medium text-gray-700">Thông tin nhận được</h3>
      <button className="text-xs text-brand-600 hover:text-brand-700">
        Xem tất cả
      </button>
    </div>

    {receivedInfos.map((info) => (
      <ReceivedInfoCard key={info.id} info={info} />
    ))}
  </div>
</ScrollArea>
```

**Received Info Card**:

```tsx
<div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
  {/* Header */}
  <div className="flex items-start justify-between">
    <div className="flex items-center gap-2">
      <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
      <h4 className="text-sm font-medium text-gray-900 truncate">
        {info.title}
      </h4>
    </div>
    <Chip label={info.workType} variant="blue" size="sm" />
  </div>

  {/* Description */}
  <p className="text-sm text-gray-600 line-clamp-2">{info.description}</p>

  {/* Meta */}
  <div className="flex items-center gap-2 text-xs text-gray-500">
    <span>Từ: {info.senderName}</span>
    <span>•</span>
    <span>{formatDate(info.receivedAt)}</span>
  </div>

  {/* Actions */}
  <div className="flex gap-2 pt-2 border-t border-gray-100">
    <button
      onClick={() => handleAssignTask(info)}
      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5
                 text-sm font-medium text-brand-600 bg-brand-50
                 hover:bg-brand-100 rounded-lg transition-colors"
    >
      <UserPlus className="w-3.5 h-3.5" />
      <span>Giao việc</span>
    </button>
    <button
      onClick={() => handleViewDetail(info)}
      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5
                 text-sm font-medium text-gray-700 bg-gray-100
                 hover:bg-gray-200 rounded-lg transition-colors"
    >
      <Eye className="w-3.5 h-3.5" />
      <span>Chi tiết</span>
    </button>
  </div>
</div>
```

**Styling Details**:

**Card Container**:

- Background: White
- Border: 1px solid #E5E7EB
- Border Radius: 8px
- Padding: 12px
- Gap: 8px between elements (`space-y-2`)

**Header**:

- Display: Flex with space-between
- Icon: FileText, 16×16px, blue-500
- Title: 14px, medium weight, gray-900, truncate
- Chip: Small size, blue variant

**Description**:

- Font: 14px
- Color: Gray-600
- Lines: Max 2 lines (`line-clamp-2`)

**Meta Row**:

- Font: 12px
- Color: Gray-500
- Separator: Bullet (•)

**Actions**:

- Border Top: 1px solid #F3F4F6
- Padding Top: 8px
- Buttons:
  - Flex: Grow equally
  - Padding: 12px horizontal, 6px vertical
  - Font: 14px, medium weight
  - Icon: 14×14px (`w-3.5 h-3.5`)
  - Gap: 4px
  - Primary: Brand colors
  - Secondary: Gray colors

---

## 5. Order Tab

### 5.1 Order List

**Structure** (similar to Received Info but with order-specific fields):

```tsx
<ScrollArea className="flex-1">
  <div className="px-3 py-4 space-y-3">
    {orders.map((order) => (
      <OrderCard key={order.id} order={order} />
    ))}
  </div>
</ScrollArea>
```

**Order Card**:

```tsx
<div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
  {/* Header with Order Number */}
  <div className="flex items-start justify-between">
    <div className="flex items-center gap-2">
      <ShoppingBag className="w-4 h-4 text-green-500" />
      <h4 className="text-sm font-medium text-gray-900">
        #{order.orderNumber}
      </h4>
    </div>
    <StatusBadge status={order.status} />
  </div>

  {/* Customer Info */}
  <div className="text-sm text-gray-600">
    <p>Khách hàng: {order.customerName}</p>
    <p>Sản phẩm: {order.productName}</p>
    <p>Số lượng: {order.quantity}</p>
  </div>

  {/* Price */}
  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
    <span className="text-sm text-gray-600">Tổng tiền:</span>
    <span className="text-base font-semibold text-gray-900">
      {formatCurrency(order.total)}
    </span>
  </div>

  {/* Actions */}
  <div className="flex gap-2">
    <button className="flex-1 btn-secondary">Xem chi tiết</button>
    <button className="flex-1 btn-primary">Xử lý</button>
  </div>
</div>
```

**Styling**: Similar to Received Info Card

**Status Badge Colors**:

- Pending: Yellow (#EAB308)
- Processing: Blue (#3B82F6)
- Completed: Green (#22C55E)
- Cancelled: Red (#EF4444)

---

## 6. Tasks Tab

### 6.1 Task Filter Tabs

**Structure** (sub-tabs within Tasks tab):

```tsx
<div className="px-3 py-2 border-b border-gray-200">
  <ToggleGroup
    type="single"
    value={taskFilter}
    onValueChange={(value) => value && setTaskFilter(value)}
    className="inline-flex gap-1"
  >
    <ToggleGroupItem value="all" className="task-filter-tab">
      Tất cả ({tasks.length})
    </ToggleGroupItem>
    <ToggleGroupItem value="pending" className="task-filter-tab">
      Chờ làm ({pendingTasks.length})
    </ToggleGroupItem>
    <ToggleGroupItem value="in-progress" className="task-filter-tab">
      Đang làm ({inProgressTasks.length})
    </ToggleGroupItem>
    <ToggleGroupItem value="completed" className="task-filter-tab">
      Hoàn tất ({completedTasks.length})
    </ToggleGroupItem>
  </ToggleGroup>
</div>
```

**Tab Styling**:

```css
.task-filter-tab {
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  transition: all 200ms;
}

[data-state="on"].task-filter-tab {
  background: #eff6ff; /* brand-50 */
  color: #2563eb; /* brand-600 */
}

[data-state="off"].task-filter-tab {
  background: transparent;
  color: #6b7280; /* gray-500 */
}
```

### 6.2 Task Card

**Structure**:

```tsx
<div className="relative bg-white border border-gray-200 rounded-lg p-3 space-y-3">
  {/* Floating Status Badge */}
  <div className="absolute top-3 right-3">
    <StatusBadge status={task.status} size="sm" />
  </div>

  {/* Title & Checkbox */}
  <div className="flex items-start gap-2 pr-20">
    <input
      type="checkbox"
      checked={task.isCompleted}
      onChange={() => handleToggleTask(task.id)}
      className="mt-0.5 w-4 h-4 rounded border-gray-300 text-brand-600
                 focus:ring-2 focus:ring-brand-500 focus:ring-offset-0"
    />
    <h4
      className={cn(
        "text-sm font-medium",
        task.isCompleted ? "line-through text-gray-400" : "text-gray-900"
      )}
    >
      {task.title}
    </h4>
  </div>

  {/* Checklist Progress */}
  {task.checklistItems && (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">Checklist</span>
        <span className="text-gray-500">
          {task.completedItems}/{task.totalItems}
        </span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-500 transition-all duration-300"
          style={{ width: `${(task.completedItems / task.totalItems) * 100}%` }}
        />
      </div>
    </div>
  )}

  {/* Meta Row */}
  <div className="flex items-center gap-3 text-xs text-gray-500">
    <div className="flex items-center gap-1">
      <Calendar className="w-3 h-3" />
      <span>{formatDate(task.deadline)}</span>
    </div>
    <div className="flex items-center gap-1">
      <User className="w-3 h-3" />
      <span>{task.assigneeName}</span>
    </div>
  </div>

  {/* Actions */}
  <div className="flex gap-2 pt-2 border-t border-gray-100">
    {task.status === "pending" && (
      <button
        onClick={() => handleStartTask(task)}
        className="flex-1 btn-primary-sm"
      >
        Bắt đầu
      </button>
    )}

    {task.status === "in-progress" && (
      <>
        <button
          onClick={() => handleRequestApproval(task)}
          className="flex-1 btn-primary-sm"
        >
          Chờ duyệt
        </button>
        <button
          onClick={() => handleViewChecklist(task)}
          className="flex-1 btn-secondary-sm"
        >
          Checklist
        </button>
      </>
    )}

    {task.status === "pending-approval" && currentUserIsLeader && (
      <>
        <button
          onClick={() => handleApproveTask(task)}
          className="flex-1 btn-success-sm"
        >
          Duyệt
        </button>
        <button
          onClick={() => handleRejectTask(task)}
          className="flex-1 btn-danger-sm"
        >
          Từ chối
        </button>
      </>
    )}

    <button
      onClick={() => handleOpenTaskLog(task)}
      className="px-2 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <MessageSquare className="w-4 h-4" />
    </button>
  </div>
</div>
```

**Styling Details**:

**Card Container**:

- Position: Relative (for floating badge)
- Background: White
- Border: 1px solid #E5E7EB
- Border Radius: 8px
- Padding: 12px
- Gap: 12px (`space-y-3`)

**Floating Status Badge**:

- Position: Absolute, top-right
- Top: 12px, Right: 12px
- Size: Small
- Colors: Dynamic based on status

**Title Row**:

- Display: Flex with 8px gap
- Padding Right: 80px (for badge space)
- Checkbox: 16×16px, rounded, brand-600
- Title: 14px, medium weight
- Strikethrough: If completed

**Progress Bar**:

- Container:
  - Height: 6px (`h-1.5`)
  - Background: Gray-200
  - Border Radius: Full
  - Overflow: Hidden
- Fill:
  - Height: 100%
  - Background: Brand-500
  - Width: Percentage of completion
  - Transition: Width, 300ms

**Meta Row**:

- Display: Flex with 12px gap
- Font: 12px
- Color: Gray-500
- Icons: 12×12px (`w-3 h-3`)

**Action Buttons**:

- Border Top: 1px solid #F3F4F6
- Padding Top: 8px
- Button Variants:
  - **Primary**: Brand background, white text
  - **Secondary**: Gray background, gray text
  - **Success**: Green background, white text
  - **Danger**: Red background, white text
  - **Icon-only**: Gray text, hover gray background

**Button Sizes**:

```css
.btn-primary-sm {
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 500;
  background: #3b82f6;
  color: white;
  border-radius: 8px;
}

.btn-secondary-sm {
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 500;
  background: #f3f4f6;
  color: #374151;
  border-radius: 8px;
}

.btn-success-sm {
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 500;
  background: #22c55e;
  color: white;
  border-radius: 8px;
}

.btn-danger-sm {
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 500;
  background: #ef4444;
  color: white;
  border-radius: 8px;
}
```

---

## 7. Task Management

### 7.1 Status Badge Component

**Structure**:

```tsx
type StatusVariant =
  | "pending"
  | "in-progress"
  | "pending-approval"
  | "completed"
  | "rejected";

interface StatusBadgeProps {
  status: StatusVariant;
  size?: "sm" | "md";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md" }) => {
  const config = {
    pending: {
      label: "Chờ làm",
      color: "bg-yellow-100 text-yellow-700",
      icon: Clock,
    },
    "in-progress": {
      label: "Đang làm",
      color: "bg-blue-100 text-blue-700",
      icon: PlayCircle,
    },
    "pending-approval": {
      label: "Chờ duyệt",
      color: "bg-purple-100 text-purple-700",
      icon: AlertCircle,
    },
    completed: {
      label: "Hoàn tất",
      color: "bg-green-100 text-green-700",
      icon: CheckCircle2,
    },
    rejected: {
      label: "Từ chối",
      color: "bg-red-100 text-red-700",
      icon: XCircle,
    },
  };

  const { label, color, icon: Icon } = config[status];
  const sizeClass =
    size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        color,
        sizeClass
      )}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      {label}
    </span>
  );
};
```

**Status Colors**:

- **Chờ làm** (Pending): Yellow-100 bg, Yellow-700 text (#FEF9C3 / #A16207)
- **Đang làm** (In Progress): Blue-100 bg, Blue-700 text (#DBEAFE / #1D4ED8)
- **Chờ duyệt** (Pending Approval): Purple-100 bg, Purple-700 text (#F3E8FF / #7E22CE)
- **Hoàn tất** (Completed): Green-100 bg, Green-700 text (#DCFCE7 / #15803D)
- **Từ chối** (Rejected): Red-100 bg, Red-700 text (#FEE2E2 / #B91C1C)

### 7.2 Task State Transitions

**Flow**:

```
     Chờ làm (Pending)
           ↓ [Bắt đầu]
    Đang làm (In Progress)
           ↓ [Chờ duyệt]
   Chờ duyệt (Pending Approval)
          ↙     ↘
    [Duyệt]    [Từ chối]
        ↓          ↓
   Hoàn tất    Đang làm
  (Completed) (Back to In Progress)
```

**Code**:

```tsx
const handleStartTask = async (task: Task) => {
  try {
    await updateTaskStatus(task.id, "in-progress");
    toast.success("Đã bắt đầu công việc");
  } catch (error) {
    toast.error("Không thể bắt đầu công việc");
  }
};

const handleRequestApproval = async (task: Task) => {
  if (task.completedItems < task.totalItems) {
    toast.error("Vui lòng hoàn thành checklist trước");
    return;
  }

  try {
    await updateTaskStatus(task.id, "pending-approval");
    toast.success("Đã gửi yêu cầu duyệt");
  } catch (error) {
    toast.error("Không thể gửi yêu cầu");
  }
};

const handleApproveTask = async (task: Task) => {
  try {
    await updateTaskStatus(task.id, "completed");
    toast.success("Đã duyệt công việc");
  } catch (error) {
    toast.error("Không thể duyệt công việc");
  }
};

const handleRejectTask = async (task: Task) => {
  const reason = prompt("Lý do từ chối:");
  if (!reason) return;

  try {
    await updateTaskStatus(task.id, "in-progress", { rejectionReason: reason });
    toast.success("Đã từ chối công việc");
  } catch (error) {
    toast.error("Không thể từ chối công việc");
  }
};
```

### 7.3 Checklist Management

**Structure** (in ChecklistSlideOver or sheet):

```tsx
<div className="space-y-3">
  <div className="flex items-center justify-between">
    <h3 className="text-sm font-medium text-gray-900">Checklist công việc</h3>
    <span className="text-xs text-gray-500">
      {completedItems}/{totalItems}
    </span>
  </div>

  {checklistItems.map((item) => (
    <div
      key={item.id}
      className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
    >
      <input
        type="checkbox"
        checked={item.isCompleted}
        onChange={() => handleToggleChecklistItem(item.id)}
        disabled={!canEdit}
        className="mt-0.5 w-4 h-4 rounded border-gray-300 text-brand-600
                   focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
      />
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm",
            item.isCompleted ? "line-through text-gray-400" : "text-gray-900"
          )}
        >
          {item.title}
        </p>
        {item.description && (
          <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
        )}
      </div>
    </div>
  ))}
</div>
```

**Styling**:

- Item Padding: 8px
- Hover: Light gray background
- Checkbox: 16×16px, brand colors
- Title: 14px, strikethrough if completed
- Description: 12px, gray-500

### 7.4 Task Log Thread

**Trigger**: Tap MessageSquare icon on task card

**Opens**: TaskLogThreadSheet (full-screen sheet)

**Related**: [04-bottom-sheets.md](./04-bottom-sheets.md#tasklogthreadsheet)

**Code**:

```tsx
const handleOpenTaskLog = (task: Task) => {
  setSelectedTaskForLog(task);
  setShowTaskLogSheet(true);
};
```

---

## 8. Styling Details

### 8.1 Colors

**Tab Navigation**:

- Active: Brand-500 border (#3B82F6), Brand-600 text (#2563EB)
- Inactive: Transparent border, Gray-600 text (#4B5563)

**Cards**:

- Background: White
- Border: Gray-200 (#E5E7EB)

**Status Colors**:

- Pending: Yellow (#EAB308 / #FEF9C3)
- In Progress: Blue (#3B82F6 / #DBEAFE)
- Pending Approval: Purple (#7E22CE / #F3E8FF)
- Completed: Green (#22C55E / #DCFCE7)
- Rejected: Red (#EF4444 / #FEE2E2)

**Buttons**:

- Primary: Brand-500 (#3B82F6)
- Secondary: Gray-100 (#F3F4F6)
- Success: Green-500 (#22C55E)
- Danger: Red-500 (#EF4444)

### 8.2 Typography

**Font Sizes**:

- Extra Small: 12px (`text-xs`) - Meta, badges, counts
- Small: 14px (`text-sm`) - Most text, buttons
- Base: 16px (`text-base`) - Group name, prices
- Large: 18px - Not used

**Font Weights**:

- Regular: 400 (default)
- Medium: 500 - Titles, buttons, badges
- Semibold: 600 - Group name, prices

### 8.3 Spacing

**Padding**:

- Container: 12px horizontal, 16px vertical
- Cards: 12px all sides
- Buttons: 12px horizontal, 6-8px vertical
- Tabs: 16px horizontal, 10px vertical
- Task Filter: 12px horizontal, 6px vertical

**Gaps**:

- Card elements: 8-12px vertical (`space-y-2`, `space-y-3`)
- Button groups: 8px (`gap-2`)
- Icon to text: 4-8px
- Tab items: 4px

**Margins**:

- Section headers: 8px bottom

### 8.4 Borders & Shadows

**Border Radius**:

- Cards: 8px (`rounded-lg`)
- Buttons: 8px (`rounded-lg`)
- Badges: Full rounded (`rounded-full`)
- Progress bar: Full rounded

**Borders**:

- Cards: 1px solid #E5E7EB
- Tabs: 2px bottom (active)
- Dividers: 1px solid #F3F4F6

**Shadows**:

- None by default (mobile uses borders)

### 8.5 Animations

**Transitions**:

- Tab switch: Border, text, 200ms
- Button hover: Background, smooth
- Progress bar: Width, 300ms
- Status badge: None (instant)

**Progress Bar Animation**:

```tsx
style={{ width: `${progress}%` }}
className="transition-all duration-300"
```

---

## 9. Interactions

### 9.1 Tab Switching

**Interaction**:

1. User taps tab (Thông tin, Order, Công việc)
2. Active tab indicator animates to new position
3. Content area updates to show tab content
4. Previous tab content unmounts

**Code**:

```tsx
const [activeTab, setActiveTab] = useState<"info" | "order" | "tasks">("info");

const renderTabContent = () => {
  switch (activeTab) {
    case "info":
      return <InfoTab />;
    case "order":
      return <OrderTab />;
    case "tasks":
      return <TasksTab />;
  }
};
```

### 9.2 Task Actions

**Start Task**:

1. User taps "Bắt đầu"
2. Status updates to "Đang làm"
3. Badge color changes to blue
4. Button changes to "Chờ duyệt" + "Checklist"
5. Toast confirmation

**Request Approval**:

1. User taps "Chờ duyệt"
2. System checks if checklist complete
3. If incomplete, shows error toast
4. If complete, status updates to "Chờ duyệt"
5. Badge color changes to purple
6. Buttons change to "Duyệt" + "Từ chối" (for leader)
7. Toast confirmation

**Approve Task** (Leader only):

1. User taps "Duyệt"
2. Status updates to "Hoàn tất"
3. Badge color changes to green
4. Task moves to completed filter
5. Toast confirmation

**Reject Task** (Leader only):

1. User taps "Từ chối"
2. Prompt for rejection reason
3. Status reverts to "Đang làm"
4. Badge color back to blue
5. Assignee notified with reason
6. Toast confirmation

### 9.3 Checklist Interaction

**Interaction**:

1. User taps "Checklist" button
2. ChecklistSlideOver opens
3. User toggles checklist items
4. Progress bar updates in real-time
5. Count updates (e.g., "3/5")
6. If all complete, "Chờ duyệt" button enables

**Code**:

```tsx
const handleToggleChecklistItem = async (itemId: string) => {
  try {
    await toggleChecklistItem(taskId, itemId);
    // Progress bar auto-updates via state
  } catch (error) {
    toast.error("Không thể cập nhật checklist");
  }
};
```

### 9.4 Assign Task from Received Info

**Interaction**:

1. User taps "Giao việc" on info card
2. AssignTaskSheet opens
3. User selects assignee
4. User selects checklist variant (optional)
5. Task title auto-filled from info title
6. User confirms
7. Task created and appears in assignee's task list
8. Info card marked as processed
9. Toast confirmation

**Related**: [04-bottom-sheets.md](./04-bottom-sheets.md#assigntasksheet)

### 9.5 Task Log

**Interaction**:

1. User taps MessageSquare icon
2. TaskLogThreadSheet opens (full-screen)
3. Shows conversation thread for this task
4. User can send messages
5. Messages visible to task creator and assignee
6. Sheet closes, returns to task list

**Related**: [04-bottom-sheets.md](./04-bottom-sheets.md#tasklogthreadsheet)

---

## 10. Navigation

### 10.1 To Bottom Sheets

**From Received Info**:

- "Giao việc" → AssignTaskSheet
- "Chi tiết" → Info detail modal

**From Tasks**:

- "Checklist" → ChecklistSlideOver or inline expansion
- MessageSquare icon → TaskLogThreadSheet

**Flow**:

```
Right Panel Screen
        ↓ (tap action)
    Bottom Sheet
        ↓ (complete or close)
Right Panel Screen
```

**Related**: [04-bottom-sheets.md](./04-bottom-sheets.md)

### 10.2 To Chat

**Trigger**: Tap "Chi tiết" on info that has source message

**Flow**:

```
Right Panel Screen
        ↓ (tap detail)
   Chat Main Screen
        ↓ (auto-scroll to message)
  Highlighted Message
```

**Code**:

```tsx
const handleViewDetail = (info: ReceivedInfo) => {
  if (info.sourceMessageId) {
    // Switch to messages tab
    setMobileTab("messages");
    // Select chat
    setSelectedChat(info.chat);
    // Scroll to message
    scrollToMessage(info.sourceMessageId);
  }
};
```

**Related**: [02-mobile-chat-main.md](./02-mobile-chat-main.md)

### 10.3 From Other Tabs

**Trigger**: Tap "Công việc" in bottom navigation

**Flow**:

```
Other Tab (Messages/Profile)
            ↓ (tap bottom nav)
      Right Panel Screen
            ↓ (default to Info tab)
         Info Tab Content
```

**Related**: [06-navigation-patterns.md](./06-navigation-patterns.md#bottom-navigation)

---

## 11. Testing Checklist

### 11.1 Visual Testing

- [ ] Tab navigation displays correctly
- [ ] Active tab has bottom border indicator
- [ ] Tab animation smooth (200ms)
- [ ] Group info section displays properly
- [ ] Quick action buttons aligned
- [ ] Member list renders correctly
- [ ] Received info cards display properly
- [ ] Order cards display properly
- [ ] Task cards display properly
- [ ] Floating status badges positioned correctly
- [ ] Progress bars render correctly
- [ ] Progress percentage accurate
- [ ] Action buttons properly styled
- [ ] Icons display correctly
- [ ] Spacing and padding consistent

### 11.2 Interaction Testing

- [ ] Tab switching works
- [ ] Tab content updates correctly
- [ ] Task filter tabs work
- [ ] Task counts update correctly
- [ ] Start task button works
- [ ] Request approval button works
- [ ] Approve task button works (leader)
- [ ] Reject task button works (leader)
- [ ] Checklist toggle works
- [ ] Progress bar updates on checklist change
- [ ] Assign task from info works
- [ ] Task log opens correctly
- [ ] All buttons have tap targets (44×44px)
- [ ] Hover states work (if applicable)
- [ ] Disabled states display correctly

### 11.3 State Testing

- [ ] Empty state for each tab
- [ ] Loading state while fetching
- [ ] No info received state
- [ ] No orders state
- [ ] No tasks state
- [ ] Task status updates correctly
- [ ] Status badge colors correct
- [ ] Checklist completion persists
- [ ] Progress bar accurate
- [ ] Leader-only actions shown/hidden
- [ ] Task assignee validation

### 11.4 Navigation Testing

- [ ] Tab persistence when switching mobile tabs
- [ ] Deep link to specific task works
- [ ] Navigate to chat from info detail
- [ ] Bottom sheets open correctly
- [ ] Sheets close properly
- [ ] Back navigation from sheets
- [ ] State persists after navigation

### 11.5 Responsive Testing

- [ ] Works on 320px width
- [ ] Works on 414px width
- [ ] Works on tablets
- [ ] Cards adapt to screen width
- [ ] Text truncates properly
- [ ] Buttons don't overflow
- [ ] Safe area insets respected
- [ ] Scrolling smooth

### 11.6 Performance Testing

- [ ] Smooth scroll at 60fps
- [ ] Large task lists perform well
- [ ] Progress bars animate smoothly
- [ ] No lag on checklist toggle
- [ ] Efficient re-renders
- [ ] No memory leaks
- [ ] Fast tab switching

### 11.7 Accessibility Testing

- [ ] Tab buttons have tap targets
- [ ] All buttons have tap targets (44×44px)
- [ ] Checkboxes have proper targets
- [ ] Focus visible on keyboard navigation
- [ ] Screen reader support
- [ ] Color contrast meets WCAG AA
- [ ] Status conveyed not just by color

### 11.8 Edge Cases

- [ ] Very long task titles truncate
- [ ] Very long info descriptions truncate
- [ ] Many checklist items scroll
- [ ] 0% progress bar displays
- [ ] 100% progress bar displays
- [ ] Empty checklist handling
- [ ] Deadline in past (overdue)
- [ ] No assignee scenario
- [ ] Task with no deadline
- [ ] Rejection reason validation
- [ ] Network error handling

---

## Summary

The **Mobile Right Panel Screen** provides comprehensive work and task management. Key features include:

- **Three-tab navigation** (Info, Order, Tasks) with smooth animations
- **Group information** with members, settings, and file access
- **Received info cards** with assign and detail actions
- **Task cards** with floating status badges and progress bars
- **Dynamic action buttons** based on task status and user role
- **Status management** with complete workflow (pending → in-progress → approval → completed)
- **Checklist integration** with real-time progress tracking
- **Task log threading** for task-specific communication

All styling uses Tailwind CSS with role-based access control and mobile-optimized interactions.

---

**Related Documentation**:

- [01 - Conversation List Screen](./01-mobile-conversation-list.md)
- [02 - Chat Main Screen](./02-mobile-chat-main.md)
- [04 - Bottom Sheets](./04-bottom-sheets.md)
- [05 - Mobile UI Components](./05-mobile-ui-components.md)
- [06 - Navigation Patterns](./06-navigation-patterns.md)
