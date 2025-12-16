# 05 - Mobile UI Components (Thành phần giao diện)

## Mục đích (Purpose)

**Tiếng Việt**: Tài liệu này mô tả chi tiết các thành phần giao diện nhỏ được sử dụng trong ứng dụng mobile, bao gồm avatar, badge, chip, bubble, và các UI elements khác.

**English**: This document details the small UI components used in the mobile application, including avatars, badges, chips, bubbles, and other UI elements.

---

## Vị trí trong source code (Location)

- **Avatar**: `src/features/portal/components/Avatar.tsx`
- **Badge**: `src/features/portal/components/Badge.tsx`
- **Chip**: `src/features/portal/components/Chip.tsx`
- **MessageBubble**: `src/features/portal/components/MessageBubble.tsx`
- **HintBubble**: `src/features/portal/components/HintBubble.tsx`
- **HintBanner**: `src/features/portal/components/HintBanner.tsx`

---

## 1. Avatar Component

### Mục đích (Purpose)

Hiển thị ảnh đại diện người dùng với fallback là initial chữ cái đầu tên, dùng gradient background khi không có ảnh.

Display user profile picture with fallback to name initial using gradient background when no image available.

---

### Usage

```tsx
import { Avatar } from "@/features/portal/components/Avatar";

// With image
<Avatar
  src="/images/user-avatar.jpg"
  alt="Nguyễn Văn A"
  size="md"
  online
/>

// Without image (fallback to initial)
<Avatar
  name="Nguyễn Văn A"
  size="sm"
/>
```

---

### Props Interface

```typescript
interface AvatarProps {
  src?: string; // Image URL
  alt?: string; // Alt text for image
  name?: string; // Name for fallback initial
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  online?: boolean; // Show online indicator
  className?: string;
}
```

---

### Size Variants

```typescript
const sizeClasses = {
  xs: "w-6 h-6 text-[10px]", // 24×24px, 10px text
  sm: "w-8 h-8 text-xs", // 32×32px, 12px text
  md: "w-10 h-10 text-sm", // 40×40px, 14px text
  lg: "w-12 h-12 text-base", // 48×48px, 16px text
  xl: "w-16 h-16 text-lg", // 64×64px, 18px text
};
```

---

### Kiểu dáng (Styling)

#### With Image

```tsx
<div className={`relative ${sizeClasses[size]}`}>
  <img
    src={src}
    alt={alt}
    className="w-full h-full rounded-full object-cover"
  />
  {online && (
    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
  )}
</div>
```

**CSS**:

```css
.avatar-container {
  position: relative;
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 9999px; /* rounded-full */
  object-fit: cover;
}

.online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 0.625rem; /* w-2.5 = 10px */
  height: 0.625rem;
  background: rgb(34, 197, 94); /* green-500 */
  border-radius: 9999px;
  border: 2px solid white;
}
```

---

#### Without Image (Gradient Fallback)

```tsx
<div
  className={`
  ${sizeClasses[size]}
  rounded-full
  bg-gradient-to-br from-sky-400 to-blue-500
  flex items-center justify-center
  text-white font-semibold
`}
>
  {getInitial(name)}
</div>
```

**Helper Function**:

```typescript
function getInitial(name?: string): string {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
}
```

**CSS**:

```css
.avatar-fallback {
  border-radius: 9999px;
  background: linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
}
```

---

### Gradient Variations

**Rotating gradients for multiple users**:

```typescript
const gradients = [
  "from-sky-400 to-blue-500", // Sky blue
  "from-violet-400 to-purple-500", // Purple
  "from-emerald-400 to-green-500", // Green
  "from-amber-400 to-orange-500", // Orange
  "from-rose-400 to-pink-500", // Pink
  "from-cyan-400 to-teal-500", // Teal
];

function getGradientByUserId(userId: string): string {
  const hash = userId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}

// Usage
<div
  className={`
  ${sizeClasses[size]}
  rounded-full
  bg-gradient-to-br ${getGradientByUserId(userId)}
  flex items-center justify-center
  text-white font-semibold
`}
>
  {getInitial(name)}
</div>;
```

---

## 2. Badge Component

### Mục đích (Purpose)

Hiển thị số lượng thông báo chưa đọc, trạng thái, hoặc labels ngắn.

Display unread count, status, or short labels.

---

### Usage

```tsx
import { Badge } from "@/features/portal/components/Badge";

// Count badge
<Badge variant="count" value={5} />

// Status badge
<Badge variant="status" status="success" label="Hoàn thành" />

// Dot badge
<Badge variant="dot" color="red" />
```

---

### Props Interface

```typescript
interface BadgeProps {
  variant: "count" | "status" | "dot" | "label";

  // For count variant
  value?: number;
  max?: number; // Max value to display (e.g., 99+)

  // For status variant
  status?: "success" | "warning" | "error" | "info" | "pending";
  label?: string;

  // For dot variant
  color?: "red" | "green" | "blue" | "yellow" | "gray";

  // For label variant
  text?: string;

  className?: string;
}
```

---

### Variants

#### 1. Count Badge

```tsx
<span
  className="
  inline-flex items-center justify-center
  min-w-[20px] h-5 px-1.5
  bg-red-500 text-white
  text-[11px] font-semibold
  rounded-full
"
>
  {value > max ? `${max}+` : value}
</span>
```

**CSS**:

```css
.badge-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 1.25rem; /* h-5 */
  padding: 0 0.375rem; /* px-1.5 */
  background: rgb(239, 68, 68); /* red-500 */
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9999px;
}
```

**Example**:

- Unread message count: `5`
- Large count: `99+`

---

#### 2. Status Badge

```tsx
const statusColors = {
  success: "bg-green-100 text-green-700 border-green-200",
  warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
  error: "bg-red-100 text-red-700 border-red-200",
  info: "bg-blue-100 text-blue-700 border-blue-200",
  pending: "bg-gray-100 text-gray-700 border-gray-200",
};

<span
  className={`
  inline-flex items-center gap-1
  px-2 py-0.5
  text-xs font-medium
  border rounded-full
  ${statusColors[status]}
`}
>
  <div className="w-1.5 h-1.5 rounded-full bg-current" />
  {label}
</span>;
```

**CSS**:

```css
.badge-status {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem; /* py-0.5 px-2 */
  font-size: 0.75rem; /* text-xs */
  font-weight: 500;
  border: 1px solid;
  border-radius: 9999px;
}

.badge-status.success {
  background: rgb(220, 252, 231); /* green-100 */
  color: rgb(21, 128, 61); /* green-700 */
  border-color: rgb(187, 247, 208); /* green-200 */
}

.badge-status.warning {
  background: rgb(254, 249, 195); /* yellow-100 */
  color: rgb(161, 98, 7); /* yellow-700 */
  border-color: rgb(254, 240, 138); /* yellow-200 */
}

/* ... other status colors */

.status-dot {
  width: 0.375rem; /* w-1.5 */
  height: 0.375rem;
  border-radius: 9999px;
  background: currentColor;
}
```

**Examples**:

- ✅ `Hoàn thành` (success, green)
- ⚠️ `Chờ duyệt` (warning, yellow)
- ❌ `Quá hạn` (error, red)
- ℹ️ `Mới` (info, blue)
- ⏳ `Đang xử lý` (pending, gray)

---

#### 3. Dot Badge

```tsx
const dotColors = {
  red: "bg-red-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
  yellow: "bg-yellow-500",
  gray: "bg-gray-400",
};

<div className={`w-2 h-2 rounded-full ${dotColors[color]}`} />;
```

**CSS**:

```css
.badge-dot {
  width: 0.5rem; /* w-2 = 8px */
  height: 0.5rem;
  border-radius: 9999px;
}

.badge-dot.red {
  background: rgb(239, 68, 68); /* red-500 */
}

.badge-dot.green {
  background: rgb(34, 197, 94); /* green-500 */
}

/* ... other colors */
```

**Usage**: Online status indicators, notification dots

---

#### 4. Label Badge

```tsx
<span
  className="
  inline-block
  px-2 py-1
  bg-gray-100 text-gray-700
  text-xs font-medium
  rounded
"
>
  {text}
</span>
```

**CSS**:

```css
.badge-label {
  display: inline-block;
  padding: 0.25rem 0.5rem; /* py-1 px-2 */
  background: rgb(243, 244, 246); /* gray-100 */
  color: rgb(55, 65, 81); /* gray-700 */
  font-size: 0.75rem; /* text-xs */
  font-weight: 500;
  border-radius: 0.25rem; /* rounded */
}
```

**Examples**:

- `VIP`
- `Ưu tiên`
- `Khẩn cấp`

---

## 3. Chip Component

### Mục đích (Purpose)

Hiển thị tags có thể xóa được, filters, hoặc selected items.

Display removable tags, filters, or selected items.

---

### Usage

```tsx
import { Chip } from "@/features/portal/components/Chip";

<Chip
  label="React"
  onRemove={() => handleRemove("react")}
/>

<Chip
  label="TypeScript"
  color="blue"
  icon={<CodeIcon />}
/>
```

---

### Props Interface

```typescript
interface ChipProps {
  label: string;
  color?: "gray" | "blue" | "green" | "red" | "yellow";
  icon?: React.ReactNode;
  onRemove?: () => void;
  className?: string;
}
```

---

### Kiểu dáng (Styling)

```tsx
const colorClasses = {
  gray: "bg-gray-100 text-gray-700 border-gray-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  green: "bg-green-100 text-green-700 border-green-200",
  red: "bg-red-100 text-red-700 border-red-200",
  yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

<div
  className={`
  inline-flex items-center gap-1
  px-2 py-1
  border rounded-full
  text-xs font-medium
  ${colorClasses[color]}
`}
>
  {icon && <span className="w-3.5 h-3.5">{icon}</span>}
  <span>{label}</span>
  {onRemove && (
    <button
      onClick={onRemove}
      className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition"
    >
      <X className="w-3 h-3" />
    </button>
  )}
</div>;
```

**CSS**:

```css
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem; /* gap-1 */
  padding: 0.25rem 0.5rem; /* py-1 px-2 */
  border: 1px solid;
  border-radius: 9999px;
  font-size: 0.75rem; /* text-xs */
  font-weight: 500;
}

.chip-icon {
  width: 0.875rem; /* w-3.5 = 14px */
  height: 0.875rem;
}

.chip-remove-btn {
  margin-left: 0.25rem;
  padding: 0.125rem; /* p-0.5 */
  border-radius: 9999px;
  transition: background 0.15s;
}

.chip-remove-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.chip-remove-icon {
  width: 0.75rem; /* w-3 = 12px */
  height: 0.75rem;
}
```

---

## 4. MessageBubble Component

### Mục đích (Purpose)

Hiển thị tin nhắn trong chat với các loại: text, image, file, system message.

Display chat messages with types: text, image, file, system message.

---

### Usage

```tsx
import { MessageBubble } from "@/features/portal/components/MessageBubble";

<MessageBubble
  message={{
    id: "msg_1",
    type: "text",
    content: "Xin chào!",
    sender: "Nguyễn Văn A",
    senderId: "user_1",
    createdAt: "2024-12-16T10:30:00",
  }}
  isMe={false}
  onPreview={(file) => handlePreview(file)}
  onPin={() => handlePin(message)}
/>;
```

---

### Props Interface

```typescript
interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  onPreview?: (file: FileAttachment) => void;
  onPin?: () => void;
  onReply?: () => void;
  highlightId?: string; // Highlight specific message
  className?: string;
}

interface Message {
  id: string;
  type: "text" | "image" | "file" | "system" | "received_info";
  content?: string;
  sender: string;
  senderId: string;
  createdAt: string;
  files?: FileAttachment[];
  fileInfo?: FileAttachment;
  isPinned?: boolean;
  replyTo?: {
    id: string;
    sender: string;
    content: string;
  };
}
```

---

### Message Types

#### 1. Text Message

```tsx
<div className={`flex gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
  {!isMe && <Avatar name={message.sender} size="sm" />}

  <div
    className={`flex flex-col gap-0.5 max-w-[80%] ${
      isMe ? "items-end" : "items-start"
    }`}
  >
    {!isMe && (
      <span className="text-xs font-medium text-gray-700 px-2">
        {message.sender}
      </span>
    )}

    {/* Reply-to indicator */}
    {message.replyTo && (
      <div className="px-3 py-1.5 bg-gray-100 border-l-2 border-gray-300 text-xs text-gray-600 rounded">
        <div className="font-medium">{message.replyTo.sender}</div>
        <div className="truncate">{message.replyTo.content}</div>
      </div>
    )}

    {/* Message bubble */}
    <div
      className={`
      px-3 py-2 rounded-lg text-sm
      ${
        isMe
          ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-br-sm"
          : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm"
      }
    `}
    >
      {message.content}
    </div>

    {/* Timestamp */}
    <span className="text-[10px] text-gray-400 px-1">
      {formatTime(message.createdAt)}
    </span>
  </div>
</div>
```

**CSS**:

```css
.message-row {
  display: flex;
  gap: 0.5rem; /* gap-2 */
  margin-bottom: 0.5rem;
}

.message-row.me {
  justify-content: flex-end;
}

.message-row.other {
  justify-content: flex-start;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem; /* gap-0.5 */
  max-width: 80%;
}

.sender-name {
  font-size: 0.75rem; /* text-xs */
  font-weight: 500;
  color: rgb(55, 65, 81); /* gray-700 */
  padding: 0 0.5rem;
}

.reply-indicator {
  padding: 0.375rem 0.75rem; /* py-1.5 px-3 */
  background: rgb(243, 244, 246); /* gray-100 */
  border-left: 2px solid rgb(209, 213, 219); /* gray-300 */
  font-size: 0.75rem;
  color: rgb(75, 85, 99); /* gray-600 */
  border-radius: 0.25rem;
}

.message-bubble {
  padding: 0.5rem 0.75rem; /* py-2 px-3 */
  border-radius: 0.5rem; /* rounded-lg */
  font-size: 0.875rem; /* text-sm */
  line-height: 1.5;
}

.message-bubble.me {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  color: white;
  border-bottom-right-radius: 0.125rem; /* rounded-br-sm */
}

.message-bubble.other {
  background: white;
  border: 1px solid rgb(229, 231, 235); /* gray-200 */
  color: rgb(17, 24, 39); /* gray-900 */
  border-bottom-left-radius: 0.125rem; /* rounded-bl-sm */
}

.message-timestamp {
  font-size: 10px;
  color: rgb(156, 163, 175); /* gray-400 */
  padding: 0 0.25rem;
}
```

---

#### 2. Image Message

```tsx
<div className={`flex gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
  {!isMe && <Avatar name={message.sender} size="sm" />}

  <div className="flex flex-col gap-0.5 max-w-[280px]">
    {!isMe && (
      <span className="text-xs font-medium text-gray-700 px-2">
        {message.sender}
      </span>
    )}

    <div
      onClick={() => onPreview?.(message.fileInfo!)}
      className="
        relative overflow-hidden rounded-lg cursor-pointer
        border border-gray-200 hover:border-brand-400
        transition-all duration-200
        group
      "
    >
      <img
        src={message.fileInfo?.url}
        alt={message.fileInfo?.name}
        className="w-full h-auto max-h-[320px] object-cover"
      />

      {/* Overlay on hover */}
      <div
        className="
        absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100
        flex items-center justify-center
        transition-opacity duration-200
      "
      >
        <div className="text-white text-sm font-medium">Xem ảnh</div>
      </div>
    </div>

    <span className="text-[10px] text-gray-400 px-1">
      {formatTime(message.createdAt)}
    </span>
  </div>
</div>
```

**CSS**:

```css
.image-message-wrapper {
  max-width: 280px;
}

.image-preview-container {
  position: relative;
  overflow: hidden;
  border-radius: 0.5rem;
  border: 1px solid rgb(229, 231, 235);
  cursor: pointer;
  transition: all 0.2s;
}

.image-preview-container:hover {
  border-color: rgb(96, 165, 250); /* brand-400 */
}

.image-preview {
  width: 100%;
  height: auto;
  max-height: 320px;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-preview-container:hover .image-overlay {
  opacity: 1;
}

.image-overlay-text {
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
}
```

---

#### 3. File Message

```tsx
<div className={`flex gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
  {!isMe && <Avatar name={message.sender} size="sm" />}

  <div className="flex flex-col gap-0.5 max-w-[280px]">
    {!isMe && (
      <span className="text-xs font-medium text-gray-700 px-2">
        {message.sender}
      </span>
    )}

    <div
      onClick={() => onPreview?.(message.fileInfo!)}
      className="
        flex items-center gap-3 p-3
        bg-white border border-gray-200 rounded-lg
        hover:border-brand-400 hover:shadow-sm
        cursor-pointer transition-all duration-200
      "
    >
      {/* File icon */}
      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
        <FileIcon className="w-5 h-5 text-gray-600" />
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">
          {message.fileInfo?.name}
        </div>
        <div className="text-xs text-gray-500">
          {formatFileSize(message.fileInfo?.size)}
        </div>
      </div>

      {/* Download icon */}
      <DownloadIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
    </div>

    <span className="text-[10px] text-gray-400 px-1">
      {formatTime(message.createdAt)}
    </span>
  </div>
</div>
```

**Helpers**:

```typescript
function formatFileSize(bytes?: number): string {
  if (!bytes) return "0 B";

  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}
```

**CSS**:

```css
.file-message-card {
  display: flex;
  align-items: center;
  gap: 0.75rem; /* gap-3 */
  padding: 0.75rem; /* p-3 */
  background: white;
  border: 1px solid rgb(229, 231, 235);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.file-message-card:hover {
  border-color: rgb(96, 165, 250);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.file-icon-wrapper {
  width: 2.5rem; /* w-10 */
  height: 2.5rem;
  border-radius: 0.25rem;
  background: rgb(243, 244, 246); /* gray-100 */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 0.875rem; /* text-sm */
  font-weight: 500;
  color: rgb(17, 24, 39);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 0.75rem; /* text-xs */
  color: rgb(107, 114, 128); /* gray-500 */
}
```

---

#### 4. System Message

```tsx
<div className="flex justify-center my-2">
  <div
    className="
    px-3 py-1.5
    bg-gray-100 text-gray-600
    text-xs text-center
    rounded-full
    max-w-[80%]
  "
  >
    {message.content}
  </div>
</div>
```

**Examples**:

- "Nguyễn Văn A đã tiếp nhận thông tin"
- "Trần Thị B đã được giao công việc"
- "Task #123 đã chuyển sang trạng thái Hoàn thành"

**CSS**:

```css
.system-message {
  display: flex;
  justify-content: center;
  margin: 0.5rem 0; /* my-2 */
}

.system-message-bubble {
  padding: 0.375rem 0.75rem; /* py-1.5 px-3 */
  background: rgb(243, 244, 246); /* gray-100 */
  color: rgb(75, 85, 99); /* gray-600 */
  font-size: 0.75rem; /* text-xs */
  text-align: center;
  border-radius: 9999px;
  max-width: 80%;
}
```

---

### Interaction States

#### Pinned Message

```tsx
{
  message.isPinned && (
    <div className="absolute top-1 right-1">
      <PinIcon className="w-3 h-3 text-brand-500" />
    </div>
  );
}
```

---

#### Highlighted Message

```tsx
<div className={`
  ${highlightId === message.id ? "animate-pulse-highlight" : ""}
`}>
  {/* Message content */}
</div>

// CSS animation
@keyframes pulse-highlight {
  0%, 100% {
    background-color: rgba(14, 165, 233, 0.1);
  }
  50% {
    background-color: rgba(14, 165, 233, 0.25);
  }
}

.animate-pulse-highlight {
  animation: pulse-highlight 2s ease-in-out;
}
```

---

## 5. HintBubble Component

### Mục đích (Purpose)

Hiển thị tooltip hoặc hint ngắn khi hover/tap vào một element.

Display tooltip or short hint when hovering/tapping an element.

---

### Usage

```tsx
import { HintBubble } from "@/features/portal/components/HintBubble";

<HintBubble content="Nhấn để ghim tin nhắn" position="top">
  <button>
    <PinIcon />
  </button>
</HintBubble>;
```

---

### Props Interface

```typescript
interface HintBubbleProps {
  content: string | React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
  delay?: number; // Delay before showing (ms)
  className?: string;
}
```

---

### Kiểu dáng (Styling)

```tsx
const [show, setShow] = React.useState(false);
const timeoutRef = React.useRef<NodeJS.Timeout>();

const handleMouseEnter = () => {
  timeoutRef.current = setTimeout(() => setShow(true), delay);
};

const handleMouseLeave = () => {
  if (timeoutRef.current) clearTimeout(timeoutRef.current);
  setShow(false);
};

<div className="relative inline-block">
  <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
    {children}
  </div>

  {show && (
    <div
      className={`
      absolute z-50
      px-2 py-1
      bg-gray-900 text-white
      text-xs rounded
      whitespace-nowrap
      shadow-lg
      ${positionClasses[position]}
    `}
    >
      {content}

      {/* Arrow */}
      <div
        className={`
        absolute
        w-2 h-2
        bg-gray-900
        transform rotate-45
        ${arrowPositionClasses[position]}
      `}
      />
    </div>
  )}
</div>;
```

**Position Classes**:

```typescript
const positionClasses = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const arrowPositionClasses = {
  top: "top-full left-1/2 -translate-x-1/2 -mt-1",
  bottom: "bottom-full left-1/2 -translate-x-1/2 -mb-1",
  left: "left-full top-1/2 -translate-y-1/2 -ml-1",
  right: "right-full top-1/2 -translate-y-1/2 -mr-1",
};
```

---

## 6. HintBanner Component

### Mục đích (Purpose)

Hiển thị thông báo/hướng dẫn dạng banner có thể đóng được.

Display dismissible notification/instruction banner.

---

### Usage

```tsx
import { HintBanner } from "@/features/portal/components/HintBanner";

<HintBanner
  variant="info"
  message="Bạn có 3 tin nhắn chưa đọc"
  onDismiss={() => handleDismiss()}
/>;
```

---

### Props Interface

```typescript
interface HintBannerProps {
  variant: "info" | "success" | "warning" | "error";
  message: string | React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  className?: string;
}
```

---

### Variants

```typescript
const variantClasses = {
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    icon: <InfoIcon className="w-5 h-5 text-blue-600" />,
  },
  success: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800",
    icon: <CheckCircleIcon className="w-5 h-5 text-green-600" />,
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-800",
    icon: <AlertTriangleIcon className="w-5 h-5 text-yellow-600" />,
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    icon: <XCircleIcon className="w-5 h-5 text-red-600" />,
  },
};

<div
  className={`
  flex items-center gap-3 p-3
  border rounded-lg
  ${variantClasses[variant].bg}
  ${variantClasses[variant].border}
  ${variantClasses[variant].text}
`}
>
  {variantClasses[variant].icon}

  <div className="flex-1 text-sm font-medium">{message}</div>

  {action && (
    <button
      onClick={action.onClick}
      className="text-sm font-semibold underline hover:no-underline"
    >
      {action.label}
    </button>
  )}

  {onDismiss && (
    <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600">
      <X className="w-4 h-4" />
    </button>
  )}
</div>;
```

---

## Animation & Transitions (Hiệu ứng)

### Fade In

```css
@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
```

---

### Slide In

```css
@keyframes slide-in-up {
  from {
    transform: translateY(8px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-in-up {
  animation: slide-in-up 0.2s ease-out;
}
```

---

### Pulse Highlight

```css
@keyframes pulse-highlight {
  0%,
  100% {
    background-color: rgba(14, 165, 233, 0.1);
  }
  50% {
    background-color: rgba(14, 165, 233, 0.25);
  }
}

.animate-pulse-highlight {
  animation: pulse-highlight 2s ease-in-out;
}
```

---

## Testing Checklist (Danh sách kiểm tra)

### Avatar

- [ ] Displays image when src provided
- [ ] Shows initial fallback when no image
- [ ] Online indicator appears when online=true
- [ ] All size variants work correctly
- [ ] Gradient rotates by user ID

### Badge

- [ ] Count badge displays correctly
- [ ] Count shows "99+" when value > 99
- [ ] Status badges show correct colors
- [ ] Dot badges render at correct size
- [ ] Label badges wrap long text

### Chip

- [ ] Displays with correct color variant
- [ ] Icon shows when provided
- [ ] Remove button works
- [ ] Hover state visible
- [ ] Remove animation smooth

### MessageBubble

- [ ] Text messages align correctly (me vs other)
- [ ] Image messages preview on tap
- [ ] File messages download on tap
- [ ] System messages centered
- [ ] Reply indicator shows correctly
- [ ] Pinned icon displays
- [ ] Highlight animation works
- [ ] Timestamps format correctly

### HintBubble

- [ ] Shows after delay
- [ ] Positions correctly (all 4 positions)
- [ ] Arrow points to target
- [ ] Hides on mouse leave
- [ ] Doesn't overflow screen edges

### HintBanner

- [ ] All variants display correct colors
- [ ] Action button works
- [ ] Dismiss button works
- [ ] Icon displays correctly
- [ ] Long messages wrap properly

---

_Tài liệu này mô tả chi tiết các UI components nhỏ trong ứng dụng mobile Portal._

_Cập nhật lần cuối: 16/12/2024_
