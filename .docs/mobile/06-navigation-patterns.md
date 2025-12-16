# 06 - Mobile Navigation Patterns (Mẫu điều hướng)

## Mục đích (Purpose)

**Tiếng Việt**: Tài liệu này mô tả chi tiết các mẫu điều hướng trong ứng dụng mobile, bao gồm bottom navigation, back button, modal/sheet transitions, và deep linking patterns.

**English**: This document details navigation patterns in the mobile application, including bottom navigation, back button, modal/sheet transitions, and deep linking patterns.

---

## Navigation Architecture (Kiến trúc điều hướng)

### Overview

```
App Entry (/mobile)
    ↓
WorkspaceView
    ↓
┌────────────────────────────────────────┐
│         Bottom Navigation              │
│   [Tin nhắn] [Công việc] [Cá nhân]    │
└────────────────────────────────────────┘
         ↓          ↓           ↓
    Messages      Work       Profile
    Screen        Screen     Screen
         ↓
   Chat Screen
    (overlay)
```

---

## 1. Bottom Tab Navigation

### Implementation

**State Management**:

```typescript
// WorkspaceView.tsx
const [mobileTab, setMobileTab] = useState<"messages" | "work" | "profile">(
  "messages"
);

const bottomItems = [
  {
    key: "messages",
    label: "Tin nhắn",
    icon: <MessageSquareIcon className="w-5 h-5" />,
  },
  {
    key: "work",
    label: "Công việc",
    icon: <ClipboardListIcon className="w-5 h-5" />,
  },
  {
    key: "profile",
    label: "Cá nhân",
    icon: <UserIcon className="w-5 h-5" />,
  },
];
```

---

### Tab Structure

```tsx
<div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white">
  <div className="flex h-16 items-center justify-around px-4">
    {bottomItems.map((item) => (
      <button
        key={item.key}
        onClick={() => setMobileTab(item.key)}
        className={cn(
          "flex min-w-[64px] flex-col items-center gap-1 rounded-lg px-3 py-2 transition-all duration-150",
          mobileTab === item.key ? "bg-sky-50 text-brand-600" : "text-gray-600"
        )}
      >
        {item.icon}
        <span className="text-xs font-medium">{item.label}</span>
      </button>
    ))}
  </div>
</div>
```

---

### Conditional Display

**Hide bottom nav when chat is open**:

```typescript
// WorkspaceView.tsx
{
  !(mobileTab === "messages" && !!selectedChat) && (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t">
      <nav className="grid grid-cols-3">{/* Bottom tab buttons */}</nav>
    </div>
  );
}
```

**Logic**:

- Bottom nav visible: Khi đang ở conversation list, work panel, hoặc profile
- Bottom nav hidden: Khi đang xem chat conversation (để maximize chat area)

---

### Active State Styling

```css
/* Active tab */
.tab-button.active {
  background: rgb(240, 249, 255); /* sky-50 */
  color: rgb(2, 132, 199); /* brand-600 */
}

/* Inactive tab */
.tab-button {
  color: rgb(75, 85, 99); /* gray-600 */
  transition: all 0.15s;
}

/* Hover state (desktop) */
.tab-button:hover {
  background: rgb(249, 250, 251); /* gray-50 */
}

/* Active tap state (mobile) */
.tab-button:active {
  transform: scale(0.96);
}
```

---

### Animation

**Tab switch animation**:

```typescript
const variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

<motion.div
  key={mobileTab}
  variants={variants}
  initial="initial"
  animate="animate"
  exit="exit"
  transition={{ duration: 0.2 }}
>
  {/* Tab content */}
</motion.div>;
```

---

## 2. Back Navigation Pattern

### From Chat to Conversation List

**Implementation**:

```typescript
// WorkspaceView.tsx
const handleMobileSelectChat = (target: ChatTarget) => {
  onSelectChat(target);
  // Stay on "messages" tab, just show chat overlay
  if (isMobile) {
    setMobileTab("messages");
  }
};

// ChatMain.tsx
<button
  onClick={onBack}
  className="p-2 hover:bg-gray-100 rounded-lg transition"
>
  <ChevronLeftIcon className="w-5 h-5" />
</button>;
```

**Flow**:

1. User tại conversation list
2. Tap vào conversation → `handleMobileSelectChat` called
3. `selectedChat` state được set
4. ChatMain hiển thị với back button
5. Tap back button → `onClearSelectedChat()` → Quay lại conversation list

---

### Gestures

**Swipe right to go back** (recommended but not implemented):

```typescript
const { ref, x } = useSwipeable({
  onSwipedRight: (eventData) => {
    if (eventData.deltaX > 100) {
      onBack();
    }
  },
});

<div ref={ref} className="h-full">
  {/* Chat content */}
</div>;
```

---

## 3. Modal & Sheet Navigation

### Bottom Sheet Triggers

**From message menu**:

```typescript
// ChatMain.tsx
const handleAssignTask = (msg: Message) => {
  onAssignFromMessage?.(msg);
  // This opens AssignTaskSheet in parent
};
```

**From received info card**:

```typescript
// RightPanel.tsx
<Button onClick={() => onAssignInfo?.(info)}>Giao Task</Button>
```

---

### Sheet Stack Management

**Multiple sheets can be open**:

```typescript
// PortalWireframes.tsx
<>
  {/* Base sheet */}
  <AssignTaskSheet
    open={assignSheet.open}
    onClose={() => setAssignSheet({ ...assignSheet, open: false })}
  />

  {/* Can open on top of base sheet */}
  <GroupTransferSheet
    open={groupTransferSheet.open}
    onClose={() => setGroupTransferSheet({ open: false })}
  />
</>
```

**Z-index hierarchy**:

```css
.bottom-nav {
  z-index: 40;
}
.sheet-overlay {
  z-index: 50;
}
.sheet-content {
  z-index: 50;
}
.task-log-overlay {
  z-index: 999;
} /* Highest */
```

---

### Close Behaviors

**Multiple ways to close**:

1. **Overlay tap**:

```tsx
<Sheet open={open} onOpenChange={onClose}>
  {/* Radix UI handles overlay tap */}
</Sheet>
```

2. **X button**:

```tsx
<button onClick={onClose}>
  <X className="w-4 h-4" />
</button>
```

3. **Cancel button**:

```tsx
<Button variant="outline" onClick={onClose}>
  Huỷ
</Button>
```

4. **Submit success**:

```typescript
const handleSubmit = () => {
  onCreateTask(payload);
  onClose(); // Auto-close after success
};
```

5. **Escape key**:

```typescript
// Handled by Radix UI automatically
```

---

## 4. State Preservation

### Scroll Position

**Preserve scroll when navigating back**:

```typescript
// LeftSidebar.tsx
const scrollContainerRef = useRef<HTMLDivElement>(null);
const scrollPosition = useRef(0);

// Save scroll position before navigating away
const handleSelectChat = (chatId: string) => {
  scrollPosition.current = scrollContainerRef.current?.scrollTop ?? 0;
  onSelectChat({ type: "group", id: chatId });
};

// Restore scroll position when returning
useEffect(() => {
  if (selectedChat === null && scrollContainerRef.current) {
    scrollContainerRef.current.scrollTop = scrollPosition.current;
  }
}, [selectedChat]);
```

---

### Form State

**Preserve input when sheet closes without submit**:

```typescript
// AssignTaskSheet.tsx
const [draft, setDraft] = useState<{
  title: string;
  assignee: string;
} | null>(null);

// Save draft when closing without submit
const handleClose = () => {
  if (title.trim() || assignee) {
    setDraft({ title, assignee });
  }
  onClose();
};

// Restore draft when reopening
useEffect(() => {
  if (open && draft) {
    setTitle(draft.title);
    setAssignee(draft.assignee);
  }
}, [open, draft]);
```

---

## 5. Deep Linking Patterns

### URL Structure (Future)

```
/mobile                        → Messages tab
/mobile/work                   → Work tab
/mobile/profile                → Profile tab
/mobile/chat/:chatId           → Open specific chat
/mobile/task/:taskId           → Open task log
/mobile/assign/:messageId      → Open assign sheet for message
```

---

### Implementation Example

```typescript
import { useParams, useNavigate } from "react-router-dom";

const WorkspaceView = () => {
  const { chatId, taskId } = useParams();
  const navigate = useNavigate();

  // Open chat from URL
  useEffect(() => {
    if (chatId) {
      onSelectChat({ type: "group", id: chatId });
    }
  }, [chatId]);

  // Open task log from URL
  useEffect(() => {
    if (taskId) {
      setTaskLogSheet({ open: true, taskId });
    }
  }, [taskId]);

  // Update URL when chat changes
  useEffect(() => {
    if (selectedChat) {
      navigate(`/mobile/chat/${selectedChat.id}`, { replace: true });
    } else {
      navigate("/mobile", { replace: true });
    }
  }, [selectedChat]);
};
```

---

### Push Notification Navigation

**Handle notification tap**:

```typescript
// notification-handler.ts
interface NotificationPayload {
  type: "message" | "task" | "received_info";
  chatId?: string;
  taskId?: string;
  messageId?: string;
}

const handleNotificationTap = (payload: NotificationPayload) => {
  switch (payload.type) {
    case "message":
      // Navigate to chat
      window.location.href = `/mobile/chat/${payload.chatId}`;
      break;

    case "task":
      // Navigate to task log
      window.location.href = `/mobile/task/${payload.taskId}`;
      break;

    case "received_info":
      // Navigate to work tab
      window.location.href = `/mobile/work`;
      break;
  }
};
```

---

## 6. Transition Animations

### Page Transitions

**Slide animations between tabs**:

```css
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-out-left {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
}

.page-enter {
  animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.page-exit {
  animation: slide-out-left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

### Sheet Transitions

**Slide up from bottom**:

```css
@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.sheet-enter {
  animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.sheet-exit {
  animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse;
}
```

---

### Overlay Fade

```css
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.overlay-enter {
  animation: fade-in 0.2s ease-out;
}

.overlay-exit {
  animation: fade-in 0.2s ease-out reverse;
}
```

---

## 7. Navigation Guards

### Prevent Navigation with Unsaved Changes

```typescript
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

const handleTabChange = (newTab: string) => {
  if (hasUnsavedChanges) {
    // Show confirmation dialog
    if (
      window.confirm("Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời khỏi?")
    ) {
      setHasUnsavedChanges(false);
      setMobileTab(newTab);
    }
  } else {
    setMobileTab(newTab);
  }
};
```

---

### Block Back Button on Critical Actions

```typescript
useEffect(() => {
  if (isProcessingPayment) {
    // Prevent back navigation
    const handleBackButton = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }
}, [isProcessingPayment]);
```

---

## 8. Breadcrumb Navigation

### Visual Breadcrumbs

**Show navigation path in header**:

```tsx
<div className="flex items-center gap-2 text-sm text-gray-600">
  <button onClick={() => navigate("/mobile")}>
    <HomeIcon className="w-4 h-4" />
  </button>
  <ChevronRightIcon className="w-3 h-3" />
  <span className="font-medium text-gray-900">{currentScreen}</span>
</div>
```

---

### Navigation History Stack

```typescript
const [navHistory, setNavHistory] = useState<string[]>(["/mobile"]);

const navigate = (path: string) => {
  setNavHistory((prev) => [...prev, path]);
  // Navigate to path
};

const goBack = () => {
  if (navHistory.length > 1) {
    const newHistory = [...navHistory];
    newHistory.pop();
    setNavHistory(newHistory);

    // Navigate to previous path
    const previousPath = newHistory[newHistory.length - 1];
    window.location.href = previousPath;
  }
};
```

---

## 9. Tab Badge Notifications

### Unread Counts on Tabs

```typescript
const getTabBadge = (tabKey: string): number | undefined => {
  switch (tabKey) {
    case "messages":
      // Count unread messages across all conversations
      return conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

    case "work":
      // Count pending received infos + overdue tasks
      return (
        receivedInfos.filter((i) => i.status === "pending").length +
        tasks.filter((t) => t.status === "overdue").length
      );

    case "profile":
      return undefined; // No badge for profile

    default:
      return undefined;
  }
};

<button className="tab-button">
  {item.icon}
  <span>{item.label}</span>
  {getTabBadge(item.key) && (
    <Badge variant="count" value={getTabBadge(item.key)!} />
  )}
</button>;
```

---

## 10. Gesture Navigation

### Swipe Gestures

**Swipe between tabs**:

```typescript
import { useSwipeable } from "react-swipeable";

const handlers = useSwipeable({
  onSwipedLeft: () => {
    // Navigate to next tab
    const currentIndex = bottomItems.findIndex(
      (item) => item.key === mobileTab
    );
    const nextIndex = (currentIndex + 1) % bottomItems.length;
    setMobileTab(bottomItems[nextIndex].key);
  },
  onSwipedRight: () => {
    // Navigate to previous tab
    const currentIndex = bottomItems.findIndex(
      (item) => item.key === mobileTab
    );
    const prevIndex =
      (currentIndex - 1 + bottomItems.length) % bottomItems.length;
    setMobileTab(bottomItems[prevIndex].key);
  },
  trackMouse: false, // Only for touch
});

<div {...handlers} className="h-full">
  {/* Tab content */}
</div>;
```

---

### Pull to Refresh

```typescript
import { usePullToRefresh } from "react-use-pull-to-refresh";

const { isRefreshing, pullPosition } = usePullToRefresh({
  onRefresh: async () => {
    await refetchData();
  },
  maximumPullLength: 100,
  refreshingContent: <Spinner />,
});

<div
  style={{
    transform: `translateY(${pullPosition}px)`,
    transition: isRefreshing ? "transform 0.2s" : "none",
  }}
>
  {/* Content */}
</div>;
```

---

## 11. Loading States During Navigation

### Skeleton Screens

```tsx
const [isNavigating, setIsNavigating] = useState(false);

const handleNavigate = async (target: string) => {
  setIsNavigating(true);

  // Prefetch data for target screen
  await prefetchScreenData(target);

  setMobileTab(target);
  setIsNavigating(false);
};

{
  isNavigating ? <SkeletonLoader /> : <ActualContent />;
}
```

---

### Progress Indicators

```tsx
import NProgress from "nprogress";

const handleNavigate = (target: string) => {
  NProgress.start();

  // Perform navigation
  setMobileTab(target);

  setTimeout(() => {
    NProgress.done();
  }, 300);
};
```

---

## 12. Accessibility

### Keyboard Navigation

```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  switch (e.key) {
    case "ArrowLeft":
      // Navigate to previous tab
      navigateToPreviousTab();
      break;

    case "ArrowRight":
      // Navigate to next tab
      navigateToNextTab();
      break;

    case "Escape":
      // Close sheet/modal or go back
      handleBack();
      break;
  }
};

<div onKeyDown={handleKeyDown} tabIndex={0}>
  {/* Content */}
</div>;
```

---

### Screen Reader Announcements

```tsx
import { announceToScreenReader } from "@/utils/accessibility";

const handleTabChange = (newTab: string) => {
  setMobileTab(newTab);

  // Announce navigation to screen reader
  const tabLabel = bottomItems.find((item) => item.key === newTab)?.label;
  announceToScreenReader(`Đã chuyển sang tab ${tabLabel}`);
};
```

---

### Focus Management

```typescript
const focusFirstElement = (containerRef: React.RefObject<HTMLDivElement>) => {
  const focusable = containerRef.current?.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  if (focusable && focusable.length > 0) {
    (focusable[0] as HTMLElement).focus();
  }
};

// Focus first element when screen appears
useEffect(() => {
  if (mobileTab === "messages") {
    focusFirstElement(messagesContainerRef);
  }
}, [mobileTab]);
```

---

## Navigation Flow Diagrams

### Complete Navigation Map

```
┌─────────────────────────────────────────────────┐
│                  App Entry                      │
│                  (/mobile)                      │
└──────────────────┬──────────────────────────────┘
                   ↓
┌──────────────────────────────────────────────────┐
│              WorkspaceView                       │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │      Bottom Navigation (Tabs)            │  │
│  │  [Messages]  [Work]  [Profile]           │  │
│  └──────┬───────────┬───────────┬───────────┘  │
│         ↓           ↓           ↓               │
│    Messages      Work        Profile            │
│    Screen        Screen      Screen             │
│         │            │           │              │
│         ↓            │           │              │
│    ┌────────┐       │           │              │
│    │  Chat  │       │           │              │
│    │ Screen │       │           │              │
│    └────┬───┘       │           │              │
│         │           │           │              │
│         ↓           ↓           │              │
│    ┌────────────────────┐      │              │
│    │  Bottom Sheets:    │      │              │
│    │  - AssignTask      │←─────┘              │
│    │  - GroupTransfer   │                     │
│    │  - TaskLog         │                     │
│    └────────────────────┘                     │
└──────────────────────────────────────────────────┘
```

---

## Best Practices (Thực hành tốt nhất)

### 1. Always Provide Back Navigation

Mọi màn hình sâu (not a main tab) phải có cách quay lại:

- Back button trong header
- Swipe right gesture
- Hardware back button (Android)

---

### 2. Preserve State When Switching Tabs

Không unmount tab content khi switch:

```typescript
<div style={{ display: mobileTab === "messages" ? "block" : "none" }}>
  <MessagesScreen />
</div>
<div style={{ display: mobileTab === "work" ? "block" : "none" }}>
  <WorkScreen />
</div>
```

---

### 3. Use Appropriate Transition Durations

- **Fast transitions** (150-200ms): Tab switches, tooltips
- **Standard transitions** (250-300ms): Sheets, modals
- **Slow transitions** (400-500ms): Page transitions, large content

---

### 4. Prevent Accidental Navigation

- Confirmation dialogs for unsaved changes
- Disable navigation during critical operations
- Double-tap protection on important actions

---

### 5. Provide Visual Feedback

- Active tab highlighting
- Loading indicators during navigation
- Skeleton screens for content loading
- Toast notifications for completed actions

---

## Testing Checklist (Danh sách kiểm tra)

### Bottom Navigation

- [ ] Tap each tab switches screen correctly
- [ ] Active tab highlighted
- [ ] Tab badge shows correct count
- [ ] Bottom nav hides when chat open
- [ ] Bottom nav shows when back to list
- [ ] Transition animations smooth

### Back Navigation

- [ ] Back button in chat works
- [ ] Swipe right goes back (if implemented)
- [ ] Hardware back button works (Android)
- [ ] State preserved when going back
- [ ] Scroll position restored

### Sheet Navigation

- [ ] Sheets open from correct triggers
- [ ] Multiple sheets can stack
- [ ] Close on overlay tap
- [ ] Close on X button
- [ ] Close on cancel
- [ ] Auto-close after submit
- [ ] Escape key closes

### State Management

- [ ] Scroll position preserved
- [ ] Form state preserved (if needed)
- [ ] Tab content not unmounted on switch
- [ ] Deep links work correctly
- [ ] Push notifications navigate correctly

### Gestures

- [ ] Swipe between tabs (if implemented)
- [ ] Pull to refresh (if implemented)
- [ ] Swipe to go back (if implemented)

### Accessibility

- [ ] Keyboard navigation works
- [ ] Screen reader announces navigation
- [ ] Focus management correct
- [ ] ARIA labels present

---

_Tài liệu này mô tả chi tiết các mẫu điều hướng trong ứng dụng mobile Portal._

_Cập nhật lần cuối: 16/12/2024_
