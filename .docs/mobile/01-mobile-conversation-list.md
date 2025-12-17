# 01 - Mobile Conversation List Screen

## Màn hình Danh sách Tin nhắn (Mobile)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Screen Structure](#screen-structure)
3. [Header Section](#header-section)
4. [Tab Switcher](#tab-switcher)
5. [Conversation List](#conversation-list)
6. [Styling Details](#styling-details)
7. [Interactions](#interactions)
8. [Navigation](#navigation)
9. [Testing Checklist](#testing-checklist)

---

## 1. Overview

### Purpose (Mục đích)

**Vietnamese**: Màn hình danh sách tin nhắn cho phép người dùng xem và chọn các cuộc hội thoại (nhóm hoặc cá nhân), tìm kiếm tin nhắn, và truy cập các công cụ nhanh.

**English**: Conversation list screen allows users to view and select conversations (group or personal), search messages, and access quick tools.

### Component Location

- **File**: `src/features/portal/workspace/LeftSidebar.tsx`
- **Component**: `LeftSidebar`
- **Props**: `isMobile={true}`

### Display Conditions

- **Route**: `/mobile`
- **Mobile Tab**: `mobileTab === "messages"`
- **Visibility**: Shown when no chat is selected (`selectedChat === null`)
- **Hidden**: When a chat is opened on mobile

---

## 2. Screen Structure

```
┌─────────────────────────────────┐
│ [🔍 Search Box]                 │ ← Search
├─────────────────────────────────┤
│ Tin nhắn               [⋮ Menu] │ ← Header (Title + Menu)
├─────────────────────────────────┤
│ [ Nhóm ]  [ Cá nhân ]           │ ← Tab Switcher
├─────────────────────────────────┤
│                                 │
│  ┌──────────────────────────┐  │
│  │ 👤 Name         [Badge]  │  │
│  │ Last message...          │  │
│  │ 10:30 AM                 │  │
│  └──────────────────────────┘  │
│                                 │
│  ┌──────────────────────────┐  │ ← Conversation List
│  │ 👥 Group Name   [Badge]  │  │   (Scrollable)
│  │ Last message...          │  │
│  │ Yesterday                │  │
│  └──────────────────────────┘  │
│                                 │
│            ...                  │
│                                 │
└─────────────────────────────────┘
```

---

## 3. Header Section

### 3.1 Search Box

**Structure**:

```tsx
<div className="px-3 py-2.5 border-b border-gray-200">
  <div className="relative">
    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    <input
      type="text"
      placeholder="Tìm kiếm"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg 
                 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                 placeholder:text-gray-400"
    />
  </div>
</div>
```

**Styling Details**:

- **Container**: `px-3 py-2.5 border-b border-gray-200`

  - Padding: 12px horizontal, 10px vertical
  - Bottom border: 1px solid #E5E7EB

- **Input Field**:

  - Width: 100% (full width)
  - Padding: `pl-8` (32px left for icon), `pr-3` (12px right), `py-1.5` (6px vertical)
  - Font: 14px (`text-sm`)
  - Border: 1px solid #E5E7EB
  - Border Radius: 8px (`rounded-lg`)
  - Focus: 2px ring, brand color (#3B82F6)

- **Search Icon**:
  - Position: Absolute, left 10px (`left-2.5`)
  - Size: 16×16px (`w-4 h-4`)
  - Color: #9CA3AF (`text-gray-400`)
  - Vertical align: Centered with `-translate-y-1/2`

**Placeholder Text**: "Tìm kiếm" (gray-400)

### 3.2 Title and Menu

**Structure**:

```tsx
<div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
  <h1 className="text-lg font-semibold text-gray-900">Tin nhắn</h1>
  <Popover>
    <PopoverTrigger asChild>
      <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>
    </PopoverTrigger>
    <PopoverContent align="end" className="w-56 p-2">
      {/* Menu items */}
    </PopoverContent>
  </Popover>
</div>
```

**Styling Details**:

- **Container**: `flex items-center justify-between px-4 py-3 border-b border-gray-200`

  - Display: Flex with space-between
  - Padding: 16px horizontal, 12px vertical
  - Bottom border: 1px solid #E5E7EB
  - Alignment: Vertically centered

- **Title**:

  - Text: "Tin nhắn" (Messages)
  - Font: 18px (`text-lg`), semibold weight
  - Color: Gray-900 (#111827)

- **Menu Button**:
  - Padding: 6px (`p-1.5`)
  - Hover: Light gray background (#F3F4F6)
  - Border Radius: 8px
  - Icon: 20×20px, gray-600 color

### 3.3 Tools Menu (Popover)

**Popover Menu Items Structure**:

```tsx
<PopoverContent align="end" className="w-56 p-2">
  <div className="space-y-1">
    <button
      onClick={() => setActiveSheet("quick-message")}
      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left
                 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <Zap className="w-4 h-4 text-yellow-500" />
      <span className="text-gray-700">Tin nhắn nhanh</span>
    </button>

    <button
      onClick={() => setActiveSheet("pinned-messages")}
      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left
                 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <Star className="w-4 h-4 text-orange-500" />
      <span className="text-gray-700">Tin đánh dấu</span>
    </button>

    <button
      onClick={() => setActiveSheet("todo-list")}
      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left
                 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <ListTodo className="w-4 h-4 text-blue-500" />
      <span className="text-gray-700">Việc cần làm</span>
    </button>
  </div>
</PopoverContent>
```

**Styling Details**:

**Popover Container**:

- Width: 224px (`w-56`)
- Padding: 8px (`p-2`)
- Alignment: End (right-aligned)
- Shadow: Default popover shadow
- Border Radius: 12px

**Menu Items**:

- **Container**: `w-full flex items-center gap-3`

  - Width: 100%
  - Display: Flex with 12px gap
  - Alignment: Vertically centered

- **Padding**: `px-3 py-2` (12px horizontal, 8px vertical)
- **Font**: 14px (`text-sm`)
- **Text Alignment**: Left
- **Hover**: Light gray background (#F3F4F6)
- **Border Radius**: 8px
- **Transition**: Colors, smooth

**Icons**:

- Size: 16×16px (`w-4 h-4`)
- Colors:
  - Zap (Quick Message): Yellow-500 (#EAB308)
  - Star (Pinned): Orange-500 (#F97316)
  - ListTodo (Todo): Blue-500 (#3B82F6)

**Text Labels**:

- Color: Gray-700 (#374151)
- Font: 14px, regular weight

**Menu Items**:

1. **Tin nhắn nhanh** (Quick Messages)

   - Icon: Zap (yellow)
   - Action: Opens QuickMessageManager sheet
   - Purpose: Send templated quick messages

2. **Tin đánh dấu** (Pinned Messages)

   - Icon: Star (orange)
   - Action: Opens PinnedMessagesPanel sheet
   - Purpose: View all pinned/starred messages

3. **Việc cần làm** (Todo List)
   - Icon: ListTodo (blue)
   - Action: Opens TodoListManager sheet
   - Purpose: Manage personal todo list

---

## 4. Tab Switcher

### 4.1 Gradient Pill Tabs

**Structure**:

```tsx
<ToggleGroup
  type="single"
  value={selectedTab}
  onValueChange={(value) => value && setSelectedTab(value)}
  className="inline-flex p-0.5 rounded-full bg-gradient-to-r from-brand-200 via-emerald-200 to-teal-200 mb-2"
>
  <ToggleGroupItem
    value="group"
    className="px-6 py-1.5 text-sm font-medium rounded-full 
               data-[state=on]:bg-white data-[state=on]:text-brand-600 data-[state=on]:shadow-sm
               data-[state=off]:text-gray-600 data-[state=off]:hover:text-gray-900
               transition-all duration-200"
  >
    Nhóm
  </ToggleGroupItem>
  <ToggleGroupItem
    value="personal"
    className="px-6 py-1.5 text-sm font-medium rounded-full 
               data-[state=on]:bg-white data-[state=on]:text-brand-600 data-[state=on]:shadow-sm
               data-[state=off]:text-gray-600 data-[state=off]:hover:text-gray-900
               transition-all duration-200"
  >
    Cá nhân
  </ToggleGroupItem>
</ToggleGroup>
```

**Styling Details**:

**Container** (Gradient Pill):

- Display: `inline-flex`
- Padding: 2px (`p-0.5`)
- Border Radius: Full rounded (`rounded-full`)
- Background: `bg-gradient-to-r from-brand-200 via-emerald-200 to-teal-200`
  - Gradient: #BFDBFE → #A7F3D0 → #99F6E4
  - Direction: Left to right
- Margin: 8px bottom (`mb-2`)

**Tab Items**:

- **Active State** (`data-[state=on]`):

  - Background: White (`bg-white`)
  - Text Color: Brand-600 (#2563EB)
  - Shadow: Small shadow (`shadow-sm`)
  - Font: 14px, medium weight
  - Padding: 24px horizontal, 6px vertical

- **Inactive State** (`data-[state=off]`):

  - Background: Transparent
  - Text Color: Gray-600 (#4B5563)
  - Hover: Gray-900 (#111827)
  - No shadow

- **Common**:
  - Border Radius: Full rounded
  - Transition: All properties, 200ms duration

**Tab Labels**:

- "Nhóm" (Group conversations)
- "Cá nhân" (Personal conversations)

---

## 5. Conversation List

### 5.1 List Container

**Structure**:

```tsx
<ScrollArea className="flex-1">
  <div className="divide-y divide-gray-100">
    {filteredConversations.map((conversation) => (
      <ConversationItem
        key={conversation.id}
        conversation={conversation}
        isSelected={selectedChat?.id === conversation.id}
        onClick={() => handleSelectChat(conversation)}
      />
    ))}
  </div>
</ScrollArea>
```

**Styling**:

- **ScrollArea**: `flex-1` (takes remaining height)
- **Divider**: 1px solid #F3F4F6 between items
- **Scrollbar**: Custom styled (auto-hide)

### 6.2 Conversation Item

**Structure**:

```tsx
<button
  onClick={onClick}
  className={cn(
    "w-full flex items-start gap-3 px-3 py-3 transition-colors",
    isSelected ? "bg-brand-50" : "hover:bg-gray-50 active:bg-gray-100"
  )}
>
  {/* Avatar */}
  <div className="relative flex-shrink-0">
    <Avatar size="md" name={conversation.name} />
    {conversation.isOnline && (
      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
    )}
  </div>

  {/* Content */}
  <div className="flex-1 min-w-0 text-left">
    <div className="flex items-center justify-between mb-1">
      <h3 className="font-medium text-sm text-gray-900 truncate">
        {conversation.name}
      </h3>
      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
        {formatTime(conversation.lastMessageTime)}
      </span>
    </div>
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-600 truncate">
        {conversation.lastMessage}
      </p>
      {conversation.unreadCount > 0 && (
        <Badge variant="destructive" className="ml-2 flex-shrink-0">
          {conversation.unreadCount}
        </Badge>
      )}
    </div>
  </div>
</button>
```

**Styling Details**:

**Container Button**:

- Width: 100% (`w-full`)
- Display: Flex with 12px gap (`gap-3`)
- Padding: 12px all sides (`px-3 py-3`)
- Alignment: Top-aligned items (`items-start`)
- Transition: Background colors

**States**:

- **Default**: Transparent background
- **Hover**: Light gray (#FAFAFA)
- **Active**: Slightly darker gray (#F3F4F6)
- **Selected**: Brand-50 background (#EFF6FF)

**Avatar Section**:

- Size: 40×40px (medium)
- Position: Relative (for online dot)
- Flex: No shrink (`flex-shrink-0`)

**Online Indicator**:

- Size: 12×12px (`w-3 h-3`)
- Color: Green-500 (#22C55E)
- Border: 2px white (`border-2 border-white`)
- Shape: Full rounded circle
- Position: Absolute, bottom-right

**Content Section**:

- Flex: Grow to fill space (`flex-1`)
- Min Width: 0 (enables truncation)
- Text Align: Left

**Name Row**:

- Display: Flex with space-between
- Margin Bottom: 4px (`mb-1`)

**Name Text**:

- Font: 14px, medium weight
- Color: Gray-900 (#111827)
- Truncate: Single line with ellipsis
- Max Width: Calculated (flex container)

**Time Text**:

- Font: 12px (`text-xs`)
- Color: Gray-500 (#6B7280)
- Margin: 8px left (`ml-2`)
- Flex: No shrink

**Last Message Row**:

- Display: Flex with space-between
- Alignment: Center

**Message Text**:

- Font: 14px (`text-sm`)
- Color: Gray-600 (#4B5563)
- Truncate: Single line with ellipsis

**Unread Badge**:

- Variant: Destructive (red)
- Margin: 8px left (`ml-2`)
- Flex: No shrink
- Padding: 2px 8px
- Font: 12px, medium weight
- Background: Red-500 (#EF4444)
- Color: White
- Border Radius: 9999px (full rounded)

---

## 6. Styling Details

### 6.1 Colors

**Gradient (Tab Switcher)**:

- Brand-200: #BFDBFE (Blue)
- Emerald-200: #A7F3D0 (Green)
- Teal-200: #99F6E4 (Teal)

**Text Colors**:

- Primary: Gray-900 (#111827)
- Secondary: Gray-600 (#4B5563)
- Tertiary: Gray-500 (#6B7280)
- Placeholder: Gray-400 (#9CA3AF)

**Backgrounds**:

- Selected: Brand-50 (#EFF6FF)
- Hover: Gray-50 (#FAFAFA)
- Active: Gray-100 (#F3F4F6)

**Borders**:

- Light: Gray-200 (#E5E7EB)
- Divider: Gray-100 (#F3F4F6)

**Status Colors**:

- Online: Green-500 (#22C55E)
- Unread: Red-500 (#EF4444)
- Quick Message: Yellow-500 (#EAB308)
- Pinned: Orange-500 (#F97316)
- Todo: Blue-500 (#3B82F6)

### 6.2 Typography

**Font Sizes**:

- Extra Small: 12px (`text-xs`) - Time, badge
- Small: 14px (`text-sm`) - Most text
- Base: 16px (`text-base`) - Not used here

**Font Weights**:

- Regular: 400 (default)
- Medium: 500 (`font-medium`) - Names, tabs

**Line Height**:

- Default: 1.5 (Tailwind default)
- Truncate: 1 line with ellipsis

### 6.3 Spacing

**Padding**:

- Search Container: 12px horizontal, 10px vertical
- Search Input: 32px left, 12px right, 6px vertical
- Header (Title + Menu): 16px horizontal, 12px vertical
- Tab Items: 24px horizontal, 6px vertical
- Conversation Items: 12px all sides
- Menu Items: 12px horizontal, 8px vertical

**Gaps**:

- Avatar to Content: 12px (`gap-3`)
- Icon to Text: 12px (`gap-3`)

**Margins**:

- Tab Switcher: 8px bottom
- Name to Message: 4px bottom
- Time: 8px left
- Badge: 8px left

### 6.4 Borders & Shadows

**Border Radius**:

- Input: 8px (`rounded-lg`)
- Buttons: 8px (`rounded-lg`)
- Tabs: Full rounded (`rounded-full`)
- Badge: Full rounded (`rounded-full`)

**Borders**:

- Input: 1px solid #E5E7EB
- Header: 1px solid #E5E7EB (bottom)
- Online Dot: 2px white border

**Shadows**:

- Active Tab: Small shadow (`shadow-sm`)
- Popover: Default popover shadow

### 6.5 Animations

**Transitions**:

- Background Colors: 200ms ease
- Tab Switch: All properties, 200ms
- Button Hover: Colors, smooth

**Transform**:

- Icon Center: `translate-y-1/2`

---

## 7. Interactions

### 7.1 Search

**Interaction**:

1. User taps search input
2. Keyboard appears
3. User types query
4. List filters in real-time
5. Matching conversations highlighted

**Code**:

```tsx
const [searchQuery, setSearchQuery] = useState("");

const filteredConversations = useMemo(() => {
  if (!searchQuery.trim()) return conversations;

  const query = searchQuery.toLowerCase();
  return conversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(query) ||
      conv.lastMessage.toLowerCase().includes(query)
  );
}, [conversations, searchQuery]);
```

**Search Criteria**:

- Conversation name
- Last message content
- Case-insensitive matching

### 7.2 Tab Switching

**Interaction**:

1. User taps "Nhóm" or "Cá nhân"
2. Active tab slides to new position
3. Background turns white
4. Text color changes to brand
5. List updates to show filtered conversations

**Code**:

```tsx
const [selectedTab, setSelectedTab] = useState<"group" | "personal">("group");

const filteredByTab = useMemo(() => {
  return filteredConversations.filter((conv) =>
    selectedTab === "group" ? conv.isGroup : !conv.isGroup
  );
}, [filteredConversations, selectedTab]);
```

**Animation**:

- Duration: 200ms
- Easing: Ease-in-out
- Properties: Background, text color, shadow

### 7.3 Conversation Selection

**Interaction**:

1. User taps conversation item
2. Item background changes to brand-50
3. Chat screen opens
4. Conversation list hides (mobile)
5. Bottom navigation hides

**Code**:

```tsx
const handleSelectChat = (conversation: Conversation) => {
  onSelectChat(conversation);
  // Parent component (WorkspaceView) handles:
  // - Setting selectedChat state
  // - Hiding bottom navigation
  // - Showing ChatMain
};
```

**Visual Feedback**:

- Tap: Active state (gray-100)
- Selected: Brand-50 background
- Transition: 150ms background color

### 7.4 Tools Menu

**Interaction**:

1. User taps three-dot menu (⋮)
2. Popover opens from top-right
3. User taps menu item
4. Appropriate bottom sheet opens
5. Popover closes

**Code**:

```tsx
const [activeSheet, setActiveSheet] = useState<string | null>(null);

const openQuickMessages = () => {
  setActiveSheet("quick-message");
};

const openPinnedMessages = () => {
  setActiveSheet("pinned-messages");
};

const openTodoList = () => {
  setActiveSheet("todo-list");
};
```

**Sheet Mapping**:

- Quick Messages → QuickMessageManager
- Pinned Messages → PinnedMessagesPanel
- Todo List → TodoListManager

---

## 8. Navigation

### 8.1 To Chat Screen

**Trigger**: Tap conversation item

**Navigation Flow**:

```
Conversation List Screen
         ↓ (tap conversation)
    Chat Main Screen
```

**Code**:

```tsx
// In WorkspaceView.tsx
const handleMobileSelectChat = (chat: Chat) => {
  setSelectedChat(chat);
  // ChatMain will be shown
  // LeftSidebar will be hidden
  // Bottom navigation will be hidden
};
```

**Related Docs**: [02-mobile-chat-main.md](./02-mobile-chat-main.md)

### 8.2 To Bottom Sheets

**Trigger**: Tap tools menu item

**Sheet Types**:

1. **Quick Messages**: `QuickMessageManager`
2. **Pinned Messages**: `PinnedMessagesPanel`
3. **Todo List**: `TodoListManager`

**Navigation Flow**:

```
Conversation List Screen
         ↓ (tap menu item)
      Bottom Sheet
         ↓ (swipe down or tap close)
Conversation List Screen
```

**Related Docs**: [04-bottom-sheets.md](./04-bottom-sheets.md)

### 8.3 From Chat Screen

**Trigger**: Tap back button in ChatMain

**Navigation Flow**:

```
    Chat Main Screen
         ↓ (tap back)
Conversation List Screen
         ↓ (bottom nav appears)
    Bottom Navigation
```

**Code**:

```tsx
// In ChatMain.tsx
<button onClick={onBack}>
  <ChevronLeft className="w-5 h-5" />
</button>;

// In WorkspaceView.tsx
const handleBackToList = () => {
  setSelectedChat(null);
  // LeftSidebar will be shown
  // Bottom navigation will be shown
};
```

---

## 9. Testing Checklist

### 9.1 Visual Testing

- [ ] Search box displays correctly with icon
- [ ] Gradient tabs render with proper colors
- [ ] Active tab has white background and shadow
- [ ] Inactive tab has transparent background
- [ ] Tools menu button visible in header
- [ ] Conversation items properly aligned
- [ ] Avatar displays with correct size
- [ ] Online dot shows for active users
- [ ] Unread badge displays on conversations
- [ ] Time format correct (10:30 AM, Yesterday, etc.)
- [ ] Last message truncates with ellipsis
- [ ] Dividers between conversation items
- [ ] Proper spacing and padding

### 9.2 Interaction Testing

- [ ] Search input accepts text
- [ ] Search filters conversations in real-time
- [ ] Clear search shows all conversations
- [ ] Tab switching between Nhóm/Cá nhân
- [ ] Tab animation smooth (200ms)
- [ ] Conversation tap opens chat
- [ ] Selected conversation has brand-50 background
- [ ] Tools menu opens on tap
- [ ] Menu items clickable
- [ ] Menu closes after selection
- [ ] Sheets open from menu items
- [ ] Scroll works smoothly
- [ ] Pull-to-refresh works (if implemented)

### 9.3 State Testing

- [ ] Empty state when no conversations
- [ ] Loading state while fetching
- [ ] Search "no results" state
- [ ] Selected conversation persists
- [ ] Unread count updates correctly
- [ ] Online status updates in real-time
- [ ] Last message updates when new message arrives
- [ ] Time updates (e.g., "Just now" → "1m ago")

### 9.4 Navigation Testing

- [ ] Tap conversation opens ChatMain
- [ ] Bottom nav hides when chat opens
- [ ] Back button returns to list
- [ ] Bottom nav shows when back to list
- [ ] Tools menu sheets open correctly
- [ ] Sheet close returns to list
- [ ] Deep link to conversation works

### 9.5 Responsive Testing

- [ ] Adapts to different mobile screen sizes
- [ ] Works on 320px width (small phones)
- [ ] Works on 414px width (standard)
- [ ] Works on tablets (if applicable)
- [ ] Keyboard doesn't hide content
- [ ] Safe area insets respected

### 9.6 Performance Testing

- [ ] List scrolls at 60fps
- [ ] Search debounced (doesn't lag)
- [ ] Large lists virtualized (if needed)
- [ ] Images lazy load
- [ ] No memory leaks on tab switch
- [ ] Smooth animations

### 10.7 Accessibility Testing

- [ ] Search input has proper label
- [ ] Conversation items have tap targets (44×44px)
- [ ] Menu buttons have tap targets
- [ ] Focus visible on keyboard navigation
- [ ] Screen reader announces selections
- [ ] Color contrast meets WCAG AA

### 9.8 Edge Cases

- [ ] Very long conversation names truncate
- [ ] Very long last messages truncate
- [ ] Unread count > 99 shows "99+"
- [ ] Empty search query shows all
- [ ] Special characters in search work
- [ ] Emoji in messages display correctly
- [ ] Avatar missing (fallback initials)

---

## Summary

The **Mobile Conversation List Screen** provides a clean, touch-friendly interface for viewing and selecting conversations. Key features include:

- **Gradient pill tabs** for switching between group and personal chats
- **Search functionality** for finding conversations quickly
- **Tools menu** for accessing quick messages, pinned messages, and todos
- **Conversation list** with avatars, online status, unread badges, and time stamps
- **Smooth animations** and transitions for a polished mobile experience

All styling uses Tailwind CSS with precise spacing, colors, and responsive design patterns optimized for mobile devices.

---

**Related Documentation**:

- [02 - Chat Main Screen](./02-mobile-chat-main.md)
- [04 - Bottom Sheets](./04-bottom-sheets.md)
- [05 - Mobile UI Components](./05-mobile-ui-components.md)
- [06 - Navigation Patterns](./06-navigation-patterns.md)
