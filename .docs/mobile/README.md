# Mobile Application Documentation

## Tổng quan (Overview)

Tài liệu này mô tả chi tiết giao diện mobile của ứng dụng Portal, bao gồm tất cả các màn hình, kiểu dáng, tương tác và điều hướng trên thiết bị di động.

This documentation describes in detail the mobile interface of the Portal application, including all screens, styling, interactions and navigation on mobile devices.

---

## Cấu trúc tài liệu (Documentation Structure)

### Main Screens (Màn hình chính)

1. **[01 - Conversation List Screen](./01-mobile-conversation-list.md)** - Màn hình danh sách tin nhắn
2. **[02 - Chat Main Screen](./02-mobile-chat-main.md)** - Màn hình chat
3. **[03 - Right Panel Screen](./03-mobile-right-panel.md)** - Màn hình panel công việc

### Components & Patterns (Thành phần & Mẫu)

4. **[04 - Bottom Sheets](./04-bottom-sheets.md)** - Các bảng trượt từ dưới lên
5. **[05 - Mobile UI Components](./05-mobile-ui-components.md)** - Thành phần giao diện nhỏ
6. **[06 - Navigation Patterns](./06-navigation-patterns.md)** - Mẫu điều hướng

---

## Cấu trúc ứng dụng Mobile (Mobile App Structure)

### Điểm truy cập (Entry Point)

**Route**: `/mobile`

**Component**: `App.tsx`

**Code**:

```tsx
const isMobileRoute = location.pathname.startsWith("/mobile");

if (isMobileRoute) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <div
        className="relative h-[720px] w-[414px] max-w-full 
                      rounded-[32px] bg-black shadow-2xl"
      >
        <div
          className="absolute inset-[10px] overflow-hidden 
                        rounded-[24px] bg-gray-50"
        >
          <PortalWireframes portalMode="mobile" />
        </div>
      </div>
    </div>
  );
}
```

**Đặc điểm (Characteristics)**:

- **Viewport**: 414×720 pixels (iPhone-like dimensions)
- **Frame**: Simulated phone bezel with rounded corners
- **Background**: Dark slate (#0F172A)
- **Inner display**: 10px padding, rounded 24px

---

### Thanh điều hướng dưới (Bottom Navigation)

**Vị trí**: Cố định ở cuối màn hình (fixed bottom)

**Các tab**:

| Icon | Label     | Key        | Screen                   |
| ---- | --------- | ---------- | ------------------------ |
| 💬   | Tin nhắn  | `messages` | Conversation List / Chat |
| 📋   | Công việc | `work`     | Work Panel               |
| 👤   | Cá nhân   | `profile`  | Profile (Future)         |

**Code**:

```tsx
const bottomItems = [
  {
    key: "messages",
    label: "Tin nhắn",
    icon: <MessageSquareIcon className="w-5 h-5" />
  },
  {
    key: "work",
    label: "Công việc",
    icon: <ClipboardListIcon className="w-5 h-5" />
  },
  {
    key: "profile",
    label: "Cá nhân",
    icon: <UserIcon className="w-5 h-5" />
  },
];

<div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white">
  <div className="flex h-16 items-center justify-around px-4">
    {bottomItems.map((item) => (
      <button
        key={item.key}
        onClick={() => setMobileTab(item.key)}
        className={cn(
          "flex min-w-[64px] flex-col items-center gap-1
           rounded-lg px-3 py-2 transition-all duration-150",
          mobileTab === item.key
            ? "bg-sky-50 text-brand-600"
            : "text-gray-600"
        )}
      >
        {item.icon}
        <span className="text-xs font-medium">{item.label}</span>
      </button>
    ))}
  </div>
</div>
```

**Kiểu dáng (Styling)**:

- **Chiều cao**: `h-16` (64px)
- **Background**: Trắng
- **Viền trên**: `border-t` (1px gray-200)
- **Z-index**: `z-40` (luôn ở trên)
- **Active state**:
  - Background: `bg-sky-50` (#F0F9FF)
  - Text color: `text-brand-600` (#0284C7)
- **Inactive state**:
  - Text color: `text-gray-600` (#4B5563)
- **Icon size**: `w-5 h-5` (20×20px)
- **Font**: `text-xs font-medium` (12px, weight 500)

---

## Danh sách màn hình (Screen List)

### 1. Màn hình Danh sách Tin nhắn (Conversation List Screen)

**File tài liệu**: [01-mobile-conversation-list.md](./01-mobile-conversation-list.md)

**Component**: `LeftSidebar.tsx` với prop `isMobile={true}`

**Nội dung**:

- Ô tìm kiếm với icon
- Tab chuyển đổi Nhóm/Cá nhân (gradient pill style)
- Danh sách nhóm chat
- Danh sách tin nhắn cá nhân
- Menu công cụ (3 chấm):
  - Tin nhắn nhanh
  - Tin đánh dấu
  - Việc cần làm

**Tương tác chính**:

- Tap vào cuộc trò chuyện → Mở màn hình chat
- Tap menu công cụ → Mở các tính năng bổ sung
- Tìm kiếm real-time theo tên/nội dung

**Navigation**:

- **From**: Bottom tab "Tin nhắn"
- **To**: Chat screen (khi chọn cuộc trò chuyện)

---

### 2. Màn hình Chat (Chat Conversation Screen)

**File tài liệu**: [02-mobile-chat-main.md](./02-mobile-chat-main.md)

**Component**: `ChatMain.tsx` với prop `isMobile={true}`

**Nội dung**:

- Header với nút back, avatar, tên nhóm
- Tab loại công việc (nếu có)
- Danh sách tin nhắn có thể cuộn
- MessageBubble cho mỗi tin nhắn:
  - Tin của tôi: Căn phải, màu xanh brand
  - Tin người khác: Căn trái, màu trắng, có avatar
- Composer với input và nút gửi
- Công cụ: Đính kèm, Định dạng

**Tương tác chính**:

- Nút back → Quay lại danh sách
- Gửi tin nhắn (Enter hoặc tap nút)
- Ghim tin nhắn (long-press hoặc menu)
- Tiếp nhận thông tin → Chuyển sang tab Công việc
- Giao task từ tin nhắn (Leader only)
- Xem task log
- Tìm kiếm trong chat

**Navigation**:

- **From**: Conversation list
- **To**:
  - Back to conversation list
  - Work panel (khi tiếp nhận/giao task)
  - Pinned messages panel
  - Bottom sheets (giao task, log)

---

### 3. Màn hình Panel Công việc (Work Panel Screen)

**File tài liệu**: [03-mobile-right-panel.md](./03-mobile-right-panel.md)

**Component**: `RightPanel.tsx` với prop `isMobile={true}`

**Nội dung**:

- Tab switcher: Thông tin | Công việc | Nhiệm vụ
- **Tab Thông tin**:
  - Group header với work type badge
  - Accordion thành viên
  - File manager (Ảnh/Video, Tài liệu)
- **Tab Công việc**:
  - Danh sách thông tin đã tiếp nhận
  - Badge số lượng chờ xử lý
  - Actions: Giao Task, Chuyển nhóm
- **Tab Nhiệm vụ**:
  - Task cards grouped by status
  - Checklist với progress bar
  - Actions: Bắt đầu, Chờ duyệt, Hoàn tất, Nhật ký

**Tương tác chính**:

- Chuyển đổi tab
- Giao task từ received info
- Chuyển thông tin sang nhóm khác
- Thay đổi trạng thái task
- Toggle checklist items
- Xem task log

**Navigation**:

- **From**: Bottom tab "Công việc"
- **To**:
  - Bottom sheets (giao task, chuyển nhóm, log)

---

## Kiểu dáng chung (Common Styling)

### Typography (Kiểu chữ)

**Font sizes** (Mobile-optimized):

```css
.text-xs-mobile {
  font-size: 0.75rem;
} /* 12px */
.text-sm-mobile {
  font-size: 0.875rem;
} /* 14px */
.text-base-mobile {
  font-size: 1rem;
} /* 16px (iOS không zoom) */
.text-lg-mobile {
  font-size: 1.125rem;
} /* 18px */
.text-xl-mobile {
  font-size: 1.25rem;
} /* 20px */
```

**Font weights**:

```css
.font-normal {
  font-weight: 400;
}
.font-medium {
  font-weight: 500;
}
.font-semibold {
  font-weight: 600;
}
.font-bold {
  font-weight: 700;
}
```

**Line heights**:

```css
.leading-tight {
  line-height: 1.25;
}
.leading-snug {
  line-height: 1.375;
}
.leading-normal {
  line-height: 1.5;
}
.leading-relaxed {
  line-height: 1.625;
}
```

---

### Colors (Màu sắc)

**Brand colors**:

```css
--brand-50: #f0f9ff; /* Sky-50 */
--brand-100: #e0f2fe; /* Sky-100 */
--brand-200: #bae6fd; /* Sky-200 */
--brand-600: #0284c7; /* Sky-600 */
--brand-700: #0369a1; /* Sky-700 */
```

**Functional colors**:

```css
--success: #10b981; /* Emerald-500 */
--warning: #f59e0b; /* Amber-500 */
--error: #ef4444; /* Red-500 */
--info: #3b82f6; /* Blue-500 */
```

**Neutral colors**:

```css
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

---

### Spacing (Khoảng cách)

**Padding/Margin scale**:

```css
.p-1 {
  padding: 0.25rem;
} /* 4px */
.p-2 {
  padding: 0.5rem;
} /* 8px */
.p-3 {
  padding: 0.75rem;
} /* 12px */
.p-4 {
  padding: 1rem;
} /* 16px */
.p-6 {
  padding: 1.5rem;
} /* 24px */
.p-8 {
  padding: 2rem;
} /* 32px */
```

**Gap scale**:

```css
.gap-1 {
  gap: 0.25rem;
} /* 4px */
.gap-2 {
  gap: 0.5rem;
} /* 8px */
.gap-3 {
  gap: 0.75rem;
} /* 12px */
.gap-4 {
  gap: 1rem;
} /* 16px */
```

---

### Border Radius (Bo tròn)

```css
.rounded-sm {
  border-radius: 0.125rem;
} /* 2px */
.rounded {
  border-radius: 0.25rem;
} /* 4px */
.rounded-md {
  border-radius: 0.375rem;
} /* 6px */
.rounded-lg {
  border-radius: 0.5rem;
} /* 8px */
.rounded-xl {
  border-radius: 0.75rem;
} /* 12px */
.rounded-2xl {
  border-radius: 1rem;
} /* 16px */
.rounded-full {
  border-radius: 9999px;
} /* Circle/Pill */
```

---

### Shadows (Bóng)

```css
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
.shadow {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}
.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
```

---

## Touch Target Guidelines (Hướng dẫn vùng chạm)

### Kích thước tối thiểu (Minimum Sizes)

- **Button/Tappable**: 44×44px (Apple HIG standard)
- **Icon button**: 32×32px icon + padding → 44×44px total
- **List item**: Height tối thiểu 56px
- **Text input**: Height tối thiểu 44px

### Khoảng cách (Spacing)

- **Giữa các touch targets**: Tối thiểu 8px
- **Trong dense layouts**: Tối thiểu 4px
- **Cho comfort**: 12-16px

### Visual Feedback

```css
.touchable {
  -webkit-tap-highlight-color: rgba(59, 130, 246, 0.1);
  transition: background 0.15s, transform 0.1s;
}

.touchable:active {
  background: rgba(59, 130, 246, 0.05);
  transform: scale(0.98);
}
```

---

## Animation Guidelines (Hướng dẫn hiệu ứng)

### Timing Functions

```css
/* Ease functions */
.transition-ease {
  transition-timing-function: ease;
}
.transition-ease-in {
  transition-timing-function: ease-in;
}
.transition-ease-out {
  transition-timing-function: ease-out;
}
.transition-ease-in-out {
  transition-timing-function: ease-in-out;
}
```

### Duration

```css
.duration-75 {
  transition-duration: 75ms;
} /* Micro */
.duration-150 {
  transition-duration: 150ms;
} /* Quick */
.duration-200 {
  transition-duration: 200ms;
} /* Standard */
.duration-300 {
  transition-duration: 300ms;
} /* Moderate */
.duration-500 {
  transition-duration: 500ms;
} /* Slow */
```

### Common Animations

**Fade in**:

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
  animation: fade-in 0.18s ease-out;
}
```

**Slide up**:

```css
@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
```

**Pulse highlight**:

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

## Component Patterns (Mẫu thành phần)

### Button Styles

**Primary button**:

```css
.btn-primary {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  border: none;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.15s;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(2, 132, 199, 0.3);
}

.btn-primary:active {
  transform: scale(0.98);
}
```

**Outline button**:

```css
.btn-outline {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(3, 105, 161);
  background: white;
  border: 1px solid rgb(186, 230, 253);
  border-radius: 0.5rem;
  transition: all 0.15s;
}

.btn-outline:hover {
  background: rgb(240, 249, 255);
}
```

---

### Card Styles

**Basic card**:

```css
.card {
  padding: 0.75rem;
  background: white;
  border: 1px solid rgb(229, 231, 235);
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.15s;
}

.card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

**Elevated card**:

```css
.card-elevated {
  padding: 1rem;
  background: white;
  border: none;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
```

---

### Input Styles

**Text input**:

```css
.input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 1rem; /* 16px để tránh zoom trên iOS */
  color: rgb(31, 41, 55);
  background: white;
  border: 1px solid rgb(209, 213, 219);
  border-radius: 0.5rem;
  transition: all 0.15s;
}

.input:focus {
  outline: none;
  border-color: rgb(14, 165, 233);
  ring: 2px solid rgba(14, 165, 233, 0.2);
}

.input::placeholder {
  color: rgb(156, 163, 175);
}
```

---

## Performance Best Practices (Tối ưu hiệu suất)

### 1. Use Hardware Acceleration

```css
/* Trigger GPU rendering */
.animated-element {
  will-change: transform;
  transform: translateZ(0);
}
```

### 2. Optimize Images

- Sử dụng WebP format khi có thể
- Lazy load images: `loading="lazy"`
- Responsive images với srcset
- Compress images (< 100KB ideal)

### 3. Minimize Reflows

```typescript
// Bad: Alternating reads and writes
elements.forEach((el) => {
  const height = el.offsetHeight; // Read
  el.style.height = `${height + 10}px`; // Write
});

// Good: Batch reads, then batch writes
const heights = elements.map((el) => el.offsetHeight);
elements.forEach((el, i) => {
  el.style.height = `${heights[i] + 10}px`;
});
```

### 4. Passive Event Listeners

```typescript
// For scroll performance
element.addEventListener("touchstart", handler, { passive: true });
element.addEventListener("touchmove", handler, { passive: true });
```

### 5. Debounce Input Events

```typescript
import { debounce } from "lodash";

const debouncedSearch = debounce((query: string) => {
  performSearch(query);
}, 300);
```

---

## Testing Checklist (Danh sách kiểm tra)

### Functional Tests (Kiểm thử chức năng)

- [ ] Bottom navigation switches tabs correctly
- [ ] Conversation list loads and displays
- [ ] Tap conversation opens chat
- [ ] Send message works (text input)
- [ ] Pin/unpin messages
- [ ] Receive info creates system message
- [ ] Assign task from message (Leader)
- [ ] Start/complete tasks (Staff)
- [ ] Toggle checklist items
- [ ] View task logs
- [ ] Search within conversations
- [ ] Menu tools open/close

### Visual Tests (Kiểm thử giao diện)

- [ ] Text is readable (min 14px body)
- [ ] Touch targets are 44×44px min
- [ ] Colors have sufficient contrast
- [ ] Icons are clear and recognizable
- [ ] Gradients display smoothly
- [ ] Shadows are subtle and appropriate
- [ ] Border radius consistent
- [ ] Spacing feels comfortable

### Performance Tests (Kiểm thử hiệu suất)

- [ ] Smooth scrolling (60fps)
- [ ] Fast navigation between tabs
- [ ] No lag when typing
- [ ] Animations are smooth
- [ ] Images load progressively
- [ ] No jank during interactions

### Accessibility Tests (Kiểm thử khả năng tiếp cận)

- [ ] Screen reader announces elements correctly
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] Text scales with system settings
- [ ] Touch targets adequate size
- [ ] No reliance on color alone

---

## Troubleshooting (Xử lý sự cố)

### Issue: iOS Safari auto-zoom on input focus

**Solution**: Use 16px font size

```css
input {
  font-size: 1rem; /* 16px minimum */
}
```

### Issue: Scroll không mượt trên iOS

**Solution**: Enable momentum scrolling

```css
.scrollable {
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;
}
```

### Issue: Tap delay trên mobile

**Solution**: Remove tap delay

```css
* {
  touch-action: manipulation;
}
```

### Issue: Text selection không mong muốn

**Solution**: Disable user select

```css
.no-select {
  -webkit-user-select: none;
  user-select: none;
}
```

---

## Resources (Tài nguyên)

### Design Guidelines

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design (Android)](https://material.io/design)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Testing Tools

- Chrome DevTools Device Mode
- Safari Responsive Design Mode
- BrowserStack (Real device testing)
- Lighthouse (Performance audits)

### Libraries Used

- React 18
- TypeScript
- Tailwind CSS
- Lucide Icons
- Radix UI

---

## Quick Navigation

### By Feature

- **Messaging**: [Conversation List](./01-mobile-conversation-list.md) → [Chat](./02-mobile-chat-main.md)
- **Task Management**: [Work Panel](./03-mobile-right-panel.md) → [Bottom Sheets](./04-bottom-sheets.md)
- **UI Components**: [Components](./05-mobile-ui-components.md)
- **Navigation**: [Patterns](./06-navigation-patterns.md)

### By Role

- **All Users**: Screens 01, 02, 03 + Components + Navigation
- **Leaders**: All docs (especially AssignTaskSheet in doc 04)
- **Staff**: All docs (except assign/transfer sheets)
- **Designers**: All docs (especially Typography, Colors, Components)
- **Developers**: All docs (especially code examples and interactions)

---

_Tài liệu này cung cấp tổng quan đầy đủ về giao diện mobile của ứng dụng Portal._

_Cập nhật lần cuối: 16/12/2024_
