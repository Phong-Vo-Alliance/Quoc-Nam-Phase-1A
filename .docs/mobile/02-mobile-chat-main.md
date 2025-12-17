# 02 - Mobile Chat Main Screen

## Màn hình Chat (Mobile)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Screen Structure](#screen-structure)
3. [Header Section](#header-section)
4. [Work Type Tabs](#work-type-tabs)
5. [Message Area](#message-area)
6. [Message Composer](#message-composer)
7. [Message Actions](#message-actions)
8. [Styling Details](#styling-details)
9. [Interactions](#interactions)
10. [Navigation](#navigation)
11. [Testing Checklist](#testing-checklist)

---

## 1. Overview

### Purpose (Mục đích)

**Vietnamese**: Màn hình chat cho phép người dùng xem tin nhắn, gửi tin nhắn mới, và thực hiện các hành động như ghim, chuyển tiếp công việc, và giao việc.

**English**: Chat screen allows users to view messages, send new messages, and perform actions like pinning, forwarding work, and assigning tasks.

### Component Location

- **File**: `src/features/portal/workspace/ChatMain.tsx`
- **Component**: `ChatMain`
- **Props**: `isMobile={true}`, `onBack={() => void}`

### Display Conditions

- **Route**: `/mobile`
- **Mobile Tab**: `mobileTab === "messages"`
- **Visibility**: Shown when chat is selected (`selectedChat !== null`)
- **Hidden**: When back to conversation list

---

## 2. Screen Structure

```
┌─────────────────────────────────┐
│ [←] Avatar Name    [🔍] [⋮]    │ ← Header (Compact)
├─────────────────────────────────┤
│ [Công việc] [Thông tin] [Nhận] │ ← Work Type Tabs (Mobile-only row)
├─────────────────────────────────┤
│                                 │
│  ┌────────────────┐            │
│  │ Received msg   │            │ ← Other's message (left)
│  │ 10:30 AM       │            │
│  └────────────────┘            │
│                                 │
│            ┌────────────────┐  │
│            │ My message     │  │ ← My message (right)
│            │ 10:32 AM   ✓✓  │  │
│            └────────────────┘  │
│                                 │
│        [HintBanner]             │ ← Hint (if shown)
│                                 │
│                                 │ ← Message Area (Scrollable)
│                                 │
├─────────────────────────────────┤
│ [+] [Type message...] [→]      │ ← Composer
└─────────────────────────────────┘
```

---

## 3. Header Section

### 3.1 Mobile Header Layout

**Structure**:

```tsx
<div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-white">
  {/* Left: Back Button + Avatar + Name */}
  <div className="flex items-center gap-2 min-w-0">
    <button
      onClick={onBack}
      className="p-1.5 -ml-1.5 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <ChevronLeft className="w-5 h-5 text-gray-700" />
    </button>

    <Avatar size="sm" name={chat.name} />

    <div className="min-w-0">
      <h2 className="text-sm font-medium text-gray-900 truncate">
        {chat.name}
      </h2>
      {chat.isOnline && <span className="text-xs text-green-600">Online</span>}
    </div>
  </div>

  {/* Right: Search + Menu Buttons */}
  <div className="flex items-center gap-1 flex-shrink-0">
    <button
      onClick={onOpenSearch}
      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <Search className="w-5 h-5 text-gray-600" />
    </button>

    <button
      onClick={onOpenMobileMenu}
      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <MoreVertical className="w-5 h-5 text-gray-600" />
    </button>
  </div>
</div>
```

**Styling Details**:

**Container**:

- Display: Flex with space-between
- Padding: `px-3 py-2` (12px horizontal, 8px vertical)
- Border: 1px solid #E5E7EB (bottom only)
- Background: White
- Height: Auto (compact ~48px)

**Back Button**:

- Padding: 6px (`p-1.5`)
- Margin: -6px left (optical alignment)
- Icon: ChevronLeft, 20×20px
- Color: Gray-700 (#374151)
- Hover: Light gray background (#F3F4F6)
- Border Radius: 8px
- Tap Target: 32×32px

**Avatar**:

- Size: Small (32×32px)
- Margin: 8px right (via gap)
- Flex: No shrink

**Name Section**:

- Min Width: 0 (enables truncation)
- Flex: Grow to fill space

**Name Text**:

- Font: 14px (`text-sm`), medium weight
- Color: Gray-900 (#111827)
- Truncate: Single line with ellipsis

**Online Status**:

- Font: 12px (`text-xs`)
- Color: Green-600 (#16A34A)
- Display: Only if online

**Right Button Group**:

- Display: Flex with 4px gap (`gap-1`)
- Flex: No shrink

**Search Button**:

- Padding: 6px (`p-1.5`)
- Icon: Search, 20×20px
- Color: Gray-600 (#4B5563)
- Hover: Light gray background (#F3F4F6)
- Border Radius: 8px
- Tap Target: 32×32px

**Menu Button**:

- Padding: 6px
- Icon: MoreVertical, 20×20px
- Color: Gray-600 (#4B5563)
- Hover: Light gray background
- Border Radius: 8px
- Tap Target: 32×32px

### 3.2 Mobile Menu Options

**Popover Content** (when MoreVertical tapped):

```tsx
<PopoverContent align="end" className="w-56 p-2">
  <div className="space-y-1">
    <button className="menu-item">
      <Archive className="w-4 h-4" />
      <span>Lưu trữ</span>
    </button>
    <button className="menu-item">
      <Trash2 className="w-4 h-4 text-red-500" />
      <span className="text-red-600">Xóa cuộc trò chuyện</span>
    </button>
  </div>
</PopoverContent>
```

**Menu Items**:

- Archive conversation
- Delete conversation (red text)

---

## 4. Work Type Tabs

### 4.1 Mobile-Only Tab Row

**Display Condition**: Only shown on mobile layout (`isMobileLayout === true`)

**Structure**:

```tsx
{
  isMobileLayout && (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50">
      <ToggleGroup
        type="single"
        value={selectedWorkType}
        onValueChange={(value) => value && setSelectedWorkType(value)}
        className="flex gap-1"
      >
        <ToggleGroupItem
          value="work"
          className="px-3 py-1 text-xs font-medium rounded-md
                   data-[state=on]:bg-white data-[state=on]:text-brand-600 data-[state=on]:shadow-sm
                   data-[state=off]:text-gray-600 data-[state=off]:bg-transparent"
        >
          Công việc
        </ToggleGroupItem>
        <ToggleGroupItem
          value="info"
          className="px-3 py-1 text-xs font-medium rounded-md
                   data-[state=on]:bg-white data-[state=on]:text-brand-600 data-[state=on]:shadow-sm
                   data-[state=off]:text-gray-600 data-[state=off]:bg-transparent"
        >
          Thông tin
        </ToggleGroupItem>
        <ToggleGroupItem
          value="received"
          className="px-3 py-1 text-xs font-medium rounded-md
                   data-[state=on]:bg-white data-[state=on]:text-brand-600 data-[state=on]:shadow-sm
                   data-[state=off]:text-gray-600 data-[state=off]:bg-transparent"
        >
          Nhận
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
```

**Styling Details**:

**Container**:

- Display: Flex with 8px gap
- Padding: `px-3 py-2` (12px horizontal, 8px vertical)
- Background: Gray-50 (#F9FAFB)
- Border: 1px solid #E5E7EB (bottom only)

**Tab Items**:

- **Active State**:

  - Background: White
  - Text: Brand-600 (#2563EB)
  - Shadow: Small (`shadow-sm`)
  - Font: 12px (`text-xs`), medium weight
  - Padding: 12px horizontal, 4px vertical
  - Border Radius: 6px (`rounded-md`)

- **Inactive State**:
  - Background: Transparent
  - Text: Gray-600 (#4B5563)
  - No shadow

**Tab Labels**:

- "Công việc" (Work)
- "Thông tin" (Information)
- "Nhận" (Received)

**Purpose**: Filters messages to show only selected work type on mobile (desktop shows all)

---

## 5. Message Area

### 5.1 Message List Container

**Structure**:

```tsx
<ScrollArea className="flex-1 px-3 py-4">
  <div className="space-y-3">
    {messages.map((message, index) => (
      <MessageBubble
        key={message.id}
        message={message}
        isMine={message.senderId === currentUserId}
        showAvatar={shouldShowAvatar(message, index)}
        onPin={handlePinMessage}
        onReceive={handleReceiveInfo}
        onAssign={handleAssignTask}
      />
    ))}
  </div>

  {/* Auto-scroll anchor */}
  <div ref={messagesEndRef} />
</ScrollArea>
```

**Styling**:

- **Container**: `flex-1` (takes remaining height)
- **Padding**: 12px horizontal, 16px vertical
- **Gap**: 12px between messages (`space-y-3`)
- **Scroll**: Auto-hide scrollbar, smooth scroll
- **Background**: White

### 5.2 Message Bubble (Others)

**Structure**:

```tsx
<div className="flex gap-2 items-start max-w-[80%]">
  {/* Avatar (if shown) */}
  {showAvatar && <Avatar size="sm" name={message.senderName} />}
  {!showAvatar && <div className="w-8" />} {/* Spacer */}
  {/* Message Content */}
  <div>
    {/* Sender Name (if shown) */}
    {showAvatar && (
      <span className="text-xs text-gray-500 mb-1 block">
        {message.senderName}
      </span>
    )}

    {/* Bubble */}
    <div
      className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Text Message */}
      {message.type === "text" && (
        <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
          {message.content}
        </p>
      )}

      {/* Image Message */}
      {message.type === "image" && (
        <img
          src={message.imageUrl}
          alt="Image"
          onClick={() => onViewImage(message.imageUrl)}
          className="max-w-[240px] rounded-lg cursor-pointer"
        />
      )}

      {/* File Message */}
      {message.type === "file" && (
        <div
          onClick={() => onViewFile(message.fileUrl, message.fileName)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <FileText className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-sm text-gray-900 font-medium">
              {message.fileName}
            </p>
            <p className="text-xs text-gray-500">{message.fileSize}</p>
          </div>
        </div>
      )}
    </div>

    {/* Time + Actions */}
    <div className="flex items-center gap-2 mt-1">
      <span className="text-xs text-gray-500">
        {formatTime(message.timestamp)}
      </span>
      <button
        onClick={() => onPin(message)}
        className="text-xs text-gray-400 hover:text-orange-500"
      >
        Ghim
      </button>
      <button
        onClick={() => onReceive(message)}
        className="text-xs text-gray-400 hover:text-blue-500"
      >
        Nhận
      </button>
    </div>

    {/* Received Status (if received) */}
    {message.receivedBy && (
      <div className="flex items-center gap-1 mt-1">
        <CheckCircle2 className="w-3 h-3 text-green-500" />
        <span className="text-xs text-green-600">
          Đã tiếp nhận bởi {message.receivedBy.name} lúc{" "}
          {formatTime(message.receivedBy.timestamp)}
        </span>
      </div>
    )}

    {/* Received Status (if received) */}
    {message.receivedBy && (
      <div className="flex items-center gap-1 mt-1">
        <CheckCircle2 className="w-3 h-3 text-green-500" />
        <span className="text-xs text-green-600">
          Đã tiếp nhận bởi {message.receivedBy.name} lúc{" "}
          {formatTime(message.receivedBy.timestamp)}
        </span>
      </div>
    )}
  </div>
</div>;

{
  /* Long Press Context Menu */
}
{
  showContextMenu && (
    <Popover open={showContextMenu} onOpenChange={setShowContextMenu}>
      <PopoverContent className="w-48 p-2">
        <div className="space-y-1">
          <button className="menu-item">
            <Reply className="w-4 h-4" />
            <span>Trả lời</span>
          </button>
          <button className="menu-item">
            <Star className="w-4 h-4 text-orange-500" />
            <span>Đánh dấu sao</span>
          </button>
          <button className="menu-item">
            <UserPlus className="w-4 h-4 text-blue-500" />
            <span>Giao task</span>
          </button>
          <button className="menu-item">
            <Download className="w-4 h-4 text-green-500" />
            <span>Tiếp nhận thông tin</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

**Styling Details**:

**Container**:

- Display: Flex with 8px gap
- Alignment: Top (`items-start`)
- Max Width: 80% of screen
- Justified: Left (default)

**Avatar**:

- Size: Small (32×32px)
- Show: First message in group or after time gap
- Spacer: 32px wide if avatar hidden

**Sender Name**:

- Font: 12px (`text-xs`)
- Color: Gray-500 (#6B7280)
- Margin: 4px bottom
- Display: Block

**Message Bubble**:

- Background: Gray-100 (#F3F4F6)
- Border Radius: 16px (`rounded-2xl`)
- Top-Left Corner: 2px (`rounded-tl-sm`) for chat tail effect
- Padding: 12px horizontal, 8px vertical
- Long Press: Hold 500ms to open context menu

**Message Types**:

**Text Message**:

- Font: 14px (`text-sm`)
- Color: Gray-900 (#111827)
- Whitespace: Pre-wrap (preserves line breaks)
- Word Break: Break long words

**Image Message**:

- Max Width: 240px
- Border Radius: 8px (`rounded-lg`)
- Cursor: Pointer (tap to view)
- Tap Action: Opens full-screen image viewer

**File Message**:

- Display: Flex with 8px gap
- Icon: FileText, 20×20px, blue-500
- File Name: 14px, gray-900, medium weight
- File Size: 12px, gray-500
- Cursor: Pointer (tap to view/download)
- Tap Action: Opens file viewer or downloads

**Actions Row**:

- Display: Flex with 8px gap
- Margin: 4px top
- Alignment: Center

**Time**:

- Font: 12px
- Color: Gray-500

**Action Buttons**:

- Font: 12px
- Color: Gray-400 (default)
- Hover: Orange-500 (pin), Blue-500 (receive)
- No background or border

**Received Status** (if message received):

- Display: Flex with 4px gap
- Margin: 4px top
- Alignment: Center
- Icon: CheckCircle2, 12×12px, green-500
- Text: 12px, green-600
- Format: "Đã tiếp nhận bởi [username] lúc [timestamp]"

**Long Press Context Menu**:

- Width: 192px (`w-48`)
- Padding: 8px (`p-2`)
- Background: White
- Shadow: Default popover shadow
- Border Radius: 12px

**Menu Items**:

- Display: Flex with 8px gap
- Padding: 8px horizontal, 6px vertical
- Font: 14px
- Hover: Light gray background (#F3F4F6)
- Border Radius: 6px

**Menu Options**:

1. **Trả lời** (Reply)

   - Icon: Reply, gray
   - Action: Opens reply composer

2. **Đánh dấu sao** (Star/Pin)

   - Icon: Star, orange-500
   - Action: Pins message

3. **Giao task** (Assign Task)

   - Icon: UserPlus, blue-500
   - Action: Opens AssignTaskSheet

4. **Tiếp nhận thông tin** (Receive Info)
   - Icon: Download, green-500
   - Action: Opens GroupTransferSheet

### 5.3 Message Bubble (Mine)

**Structure**:

```tsx
<div className="flex gap-2 items-start max-w-[80%] ml-auto">
  {/* Message Content */}
  <div className="ml-auto">
    {/* Bubble */}
    <div
      className="bg-brand-500 rounded-2xl rounded-tr-sm px-3 py-2"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Text Message */}
      {message.type === "text" && (
        <p className="text-sm text-white whitespace-pre-wrap break-words">
          {message.content}
        </p>
      )}

      {/* Image Message */}
      {message.type === "image" && (
        <img
          src={message.imageUrl}
          alt="Image"
          onClick={() => onViewImage(message.imageUrl)}
          className="max-w-[240px] rounded-lg cursor-pointer"
        />
      )}

      {/* File Message */}
      {message.type === "file" && (
        <div
          onClick={() => onViewFile(message.fileUrl, message.fileName)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <FileText className="w-5 h-5 text-white" />
          <div>
            <p className="text-sm text-white font-medium">{message.fileName}</p>
            <p className="text-xs text-blue-100">{message.fileSize}</p>
          </div>
        </div>
      )}
    </div>

    {/* Time + Status */}
    <div className="flex items-center gap-1 mt-1 justify-end">
      <span className="text-xs text-gray-500">
        {formatTime(message.timestamp)}
      </span>
      {message.status === "sent" && <Check className="w-3 h-3 text-gray-400" />}
      {message.status === "delivered" && (
        <CheckCheck className="w-3 h-3 text-gray-400" />
      )}
      {message.status === "read" && (
        <CheckCheck className="w-3 h-3 text-blue-500" />
      )}
    </div>

    {/* Received Status (if received) */}
    {message.receivedBy && (
      <div className="flex items-center gap-1 mt-1 justify-end">
        <CheckCircle2 className="w-3 h-3 text-green-500" />
        <span className="text-xs text-green-600">
          Đã tiếp nhận bởi {message.receivedBy.name} lúc{" "}
          {formatTime(message.receivedBy.timestamp)}
        </span>
      </div>
    )}

    {/* Received Status (if received) */}
    {message.receivedBy && (
      <div className="flex items-center gap-1 mt-1 justify-end">
        <CheckCircle2 className="w-3 h-3 text-green-500" />
        <span className="text-xs text-green-600">
          Đã tiếp nhận bởi {message.receivedBy.name} lúc{" "}
          {formatTime(message.receivedBy.timestamp)}
        </span>
      </div>
    )}
  </div>
</div>;

{
  /* Long Press Context Menu */
}
{
  showContextMenu && (
    <Popover open={showContextMenu} onOpenChange={setShowContextMenu}>
      <PopoverContent className="w-48 p-2">
        <div className="space-y-1">
          <button className="menu-item">
            <Reply className="w-4 h-4" />
            <span>Trả lời</span>
          </button>
          <button className="menu-item">
            <Star className="w-4 h-4 text-orange-500" />
            <span>Đánh dấu sao</span>
          </button>
          <button className="menu-item">
            <UserPlus className="w-4 h-4 text-blue-500" />
            <span>Giao task</span>
          </button>
          <button className="menu-item">
            <Download className="w-4 h-4 text-green-500" />
            <span>Tiếp nhận thông tin</span>
          </button>
          <button className="menu-item text-red-600">
            <Trash2 className="w-4 h-4" />
            <span>Xóa tin nhắn</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

**Styling Details**:

**Container**:

- Display: Flex with 8px gap
- Max Width: 80% of screen
- Margin: Auto left (right-aligned)

**Message Bubble**:

- Background: Brand-500 (#3B82F6, blue)
- Border Radius: 16px
- Top-Right Corner: 2px for chat tail effect
- Padding: 12px horizontal, 8px vertical
- Long Press: Hold 500ms to open context menu

**Message Types**:

**Text Message**:

- Font: 14px
- Color: White
- Whitespace: Pre-wrap
- Word Break: Break long words

**Image Message**:

- Max Width: 240px
- Border Radius: 8px (`rounded-lg`)
- Cursor: Pointer (tap to view)
- Tap Action: Opens full-screen image viewer

**File Message**:

- Display: Flex with 8px gap
- Icon: FileText, 20×20px, white
- File Name: 14px, white, medium weight
- File Size: 12px, blue-100
- Cursor: Pointer (tap to view/download)
- Tap Action: Opens file viewer or downloads

**Status Row**:

- Display: Flex with 4px gap
- Margin: 4px top
- Justify: End (right-aligned)

**Time**:

- Font: 12px
- Color: Gray-500

**Read Status Icons**:

- Sent: Single check, gray
- Delivered: Double check, gray
- Read: Double check, blue
- Size: 12×12px (`w-3 h-3`)

**Received Status** (if message received):

- Display: Flex with 4px gap
- Margin: 4px top
- Justify: End (right-aligned)
- Icon: CheckCircle2, 12×12px, green-500
- Text: 12px, green-600
- Format: "Đã tiếp nhận bởi [username] lúc [timestamp]"

**Long Press Context Menu** (My Messages):

- Width: 192px (`w-48`)
- Padding: 8px (`p-2`)
- Background: White
- Shadow: Default popover shadow
- Border Radius: 12px

**Menu Options** (Own Messages):

1. **Trả lời** (Reply)

   - Icon: Reply, gray
   - Action: Opens reply composer

2. **Đánh dấu sao** (Star/Pin)

   - Icon: Star, orange-500
   - Action: Pins message

3. **Giao task** (Assign Task)

   - Icon: UserPlus, blue-500
   - Action: Opens AssignTaskSheet

4. **Tiếp nhận thông tin** (Receive Info)

   - Icon: Download, green-500
   - Action: Opens GroupTransferSheet

5. **Xóa tin nhắn** (Delete Message)
   - Icon: Trash2, red
   - Text Color: Red-600
   - Action: Deletes own message

### 5.4 Work Type Badge on Message

**Structure** (if message has work type):

```tsx
<div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 rounded-full mb-1">
  <Briefcase className="w-3 h-3 text-blue-600" />
  <span className="text-xs text-blue-600 font-medium">{message.workType}</span>
</div>
```

**Styling**:

- Display: Inline-flex with 4px gap
- Padding: 8px horizontal, 2px vertical
- Background: Blue-50 (#EFF6FF)
- Border Radius: Full rounded
- Margin: 4px bottom

**Icon**: Briefcase, 12×12px, blue-600
**Text**: 12px, blue-600, medium weight

### 5.5 Hint Banner

**Structure** (shown for leaders):

```tsx
{
  showHint && (
    <HintBanner
      message="Bạn có thể ghim tin nhắn quan trọng để dễ tìm sau này"
      onDismiss={() => setShowHint(false)}
      variant="info"
    />
  );
}
```

**Display**: Between messages, floating above composer
**Related**: [05-mobile-ui-components.md](./05-mobile-ui-components.md#hintbanner)

---

## 6. Message Composer

### 6.1 Composer Layout

**Structure**:

```tsx
<div className="flex items-end gap-2 px-3 py-2 border-t border-gray-200 bg-white">
  {/* Attachment Button */}
  <button
    onClick={handleOpenAttachmentMenu}
    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg
               transition-colors flex-shrink-0 mb-1"
  >
    <Plus className="w-5 h-5" />
  </button>

  {/* Text Input */}
  <div className="flex-1 max-h-32 overflow-y-auto">
    <textarea
      ref={textareaRef}
      value={message}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      placeholder="Nhắn tin..."
      rows={1}
      className="w-full px-3 py-2 text-sm resize-none border border-gray-200 rounded-2xl
                 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
                 placeholder:text-gray-400"
    />
  </div>

  {/* Send Button */}
  <button
    onClick={handleSend}
    disabled={!message.trim()}
    className="p-2 text-white bg-brand-500 hover:bg-brand-600 rounded-lg
               transition-colors flex-shrink-0 mb-1 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <SendHorizontal className="w-5 h-5" />
  </button>
</div>
```

**Styling Details**:

**Container**:

- Display: Flex with 8px gap
- Alignment: Bottom (`items-end`)
- Padding: 12px horizontal, 8px vertical
- Border: 1px solid #E5E7EB (top only)
- Background: White

**Attachment Button**:

- Padding: 8px
- Icon: Plus, 20×20px
- Color: Gray-400 (default), Gray-600 (hover)
- Hover Background: Gray-100
- Border Radius: 8px
- Margin: 4px bottom (alignment)
- Flex: No shrink

**Text Input Container**:

- Flex: Grow to fill space
- Max Height: 128px (`max-h-32`)
- Overflow: Auto scroll when text exceeds

**Textarea**:

- Width: 100%
- Padding: 12px horizontal, 8px vertical
- Font: 14px
- Resize: None (auto-grows)
- Rows: 1 (initial)
- Border: 1px solid #E5E7EB
- Border Radius: 16px (`rounded-2xl`)
- Focus: 2px ring, brand color
- Placeholder: "Nhắn tin...", gray-400

**Send Button**:

- Padding: 8px
- Icon: SendHorizontal, 20×20px
- Background: Brand-500 (#3B82F6)
- Hover: Brand-600 (#2563EB)
- Color: White
- Border Radius: 8px
- Margin: 4px bottom (alignment)
- Flex: No shrink
- Disabled: 50% opacity when message empty

### 6.2 Auto-Growing Textarea

**Code**:

```tsx
const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  setMessage(e.target.value);

  // Auto-grow textarea
  const textarea = e.target;
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
};
```

**Behavior**:

- Starts at 1 row
- Grows as user types
- Max height: 128px (4-5 lines)
- Scrolls after max height

### 6.3 Attachment Menu

**Popover Content** (when Plus tapped):

```tsx
<PopoverContent side="top" align="start" className="w-56 p-2">
  <div className="space-y-1">
    <button className="menu-item">
      <Image className="w-4 h-4 text-green-500" />
      <span>Ảnh/Video</span>
    </button>
    <button className="menu-item">
      <FileText className="w-4 h-4 text-blue-500" />
      <span>File</span>
    </button>
    <button className="menu-item">
      <Mic className="w-4 h-4 text-red-500" />
      <span>Ghi âm</span>
    </button>
  </div>
</PopoverContent>
```

**Menu Items**:

- Photo/Video (green)
- File (blue)
- Voice Recording (red)

---

## 7. Message Actions

### 7.1 Pin Message (Ghim)

**Trigger**: Tap "Ghim" on message

**Flow**:

```
Message → Tap "Ghim" → Confirmation → Pinned
```

**Code**:

```tsx
const handlePinMessage = async (message: Message) => {
  try {
    await pinMessage(message.id);
    toast.success("Đã ghim tin nhắn");
  } catch (error) {
    toast.error("Không thể ghim tin nhắn");
  }
};
```

**Visual Feedback**:

- Toast notification
- Star icon appears on message
- Available in Pinned Messages panel

**Related**: [04-bottom-sheets.md](./04-bottom-sheets.md#pinnedmessagespanel)

### 7.2 Receive Info (Nhận)

**Trigger**: Tap "Nhận" on message

**Flow**:

```
Message → Tap "Nhận" → Sheet Opens → Select Group → Confirm → Info Received → Status Displayed
```

**Code**:

```tsx
const handleReceiveInfo = async (message: Message) => {
  setSelectedMessageForReceive(message);
  setShowGroupTransferSheet(true);
};

const onConfirmReceive = async (targetGroup: string) => {
  try {
    await receiveInfo(message.id, targetGroup);

    // Update message with received status
    updateMessage(message.id, {
      receivedBy: {
        name: currentUser.name,
        userId: currentUser.id,
        timestamp: new Date(),
      },
    });

    toast.success("Đã tiếp nhận thông tin");
  } catch (error) {
    toast.error("Không thể tiếp nhận thông tin");
  }
};
```

**Visual Feedback**:

- Toast notification: "Đã tiếp nhận thông tin"
- Green status line appears below message
- Icon: CheckCircle2 (green)
- Text: "Đã tiếp nhận bởi [username] lúc [timestamp]"
- Info added to target group's received list

**Sheet**: GroupTransferSheet opens with cascading selects
**Related**: [04-bottom-sheets.md](./04-bottom-sheets.md#grouptransfersheet)

### 7.3 Assign Task (Giao việc)

**Trigger**: Tap "Giao việc" on message (leaders only)

**Flow**:

```
Message → Tap "Giao việc" → Sheet Opens → Select Assignee → Select Checklist → Confirm → Task Assigned
```

**Code**:

```tsx
const handleAssignTask = (message: Message) => {
  setSelectedMessageForAssign(message);
  setShowAssignTaskSheet(true);
};
```

**Sheet**: AssignTaskSheet opens with assignee and checklist selection
**Related**: [04-bottom-sheets.md](./04-bottom-sheets.md#assigntasksheet)

### 7.4 Long Press Menu

**Trigger**: Long press on message bubble

**Menu Options**:

- Copy (Sao chép)
- Reply (Trả lời)
- Forward (Chuyển tiếp)
- Delete (Xóa) - own messages only

**Code**:

```tsx
const handleLongPress = (message: Message, e: React.TouchEvent) => {
  e.preventDefault();
  setContextMenuMessage(message);
  setContextMenuPosition({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  setShowContextMenu(true);
};
```

---

## 8. Styling Details

### 8.1 Colors

**Message Bubbles**:

- Others: Gray-100 (#F3F4F6)
- Mine: Brand-500 (#3B82F6, blue)

**Text Colors**:

- Others' Text: Gray-900 (#111827)
- My Text: White
- Sender Name: Gray-500 (#6B7280)
- Time: Gray-500
- Action Links: Gray-400 (default), Orange-500 (pin hover), Blue-500 (receive hover)

**Status Icons**:

- Sent/Delivered: Gray-400
- Read: Blue-500
- Received: Green-500/Green-600

**Backgrounds**:

- Header: White
- Tab Bar: Gray-50 (#F9FAFB)
- Message Area: White
- Composer: White

**Borders**:

- Light: Gray-200 (#E5E7EB)

### 8.2 Typography

**Font Sizes**:

- Extra Small: 12px (`text-xs`) - Time, actions, sender name
- Small: 14px (`text-sm`) - Messages, input, header name
- Base: 16px - Not used

**Font Weights**:

- Regular: 400 (default)
- Medium: 500 - Header name, tab labels, work type badge

### 8.3 Spacing

**Padding**:

- Header: 12px horizontal, 8px vertical (compact)
- Tab Bar: 12px horizontal, 8px vertical
- Message Area: 12px horizontal, 16px vertical
- Message Bubble: 12px horizontal, 8px vertical
- Composer: 12px horizontal, 8px vertical
- Textarea: 12px horizontal, 8px vertical

**Gaps**:

- Header items: 8px
- Messages: 12px vertical
- Avatar to bubble: 8px
- Action buttons: 8px
- Composer items: 8px

**Margins**:

- Back button: -6px left (optical)
- Sender name: 4px bottom
- Time row: 4px top
- Work badge: 4px bottom
- Button alignment: 4px bottom

### 8.4 Borders & Shadows

**Border Radius**:

- Header buttons: 8px (`rounded-lg`)
- Tab items: 6px (`rounded-md`)
- Message bubbles: 16px (`rounded-2xl`)
- Bubble tails: 2px (`rounded-tl-sm`, `rounded-tr-sm`)
- Composer input: 16px
- Composer buttons: 8px

**Borders**:

- Header: 1px solid #E5E7EB (bottom)
- Tab bar: 1px solid #E5E7EB (bottom)
- Composer: 1px solid #E5E7EB (top)
- Textarea: 1px solid #E5E7EB

**Shadows**:

- Active tab: Small shadow (`shadow-sm`)

### 8.5 Animations

**Transitions**:

- Button hover: Colors, smooth
- Tab switch: Background, colors, 150ms
- Message send: Slide up + fade in, 200ms
- Scroll: Smooth scroll behavior

**Auto-scroll**:

```tsx
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);
```

---

## 9. Interactions

### 9.1 Send Message

**Interaction**:

1. User types in textarea
2. Textarea auto-grows
3. Send button enables when text exists
4. User taps send button (or Enter on keyboard)
5. Message appears in chat
6. Input clears
7. Auto-scrolls to new message

**Code**:

```tsx
const handleSend = async () => {
  if (!message.trim()) return;

  const newMessage = {
    id: generateId(),
    content: message.trim(),
    senderId: currentUserId,
    timestamp: new Date(),
    status: "sending",
  };

  // Optimistic update
  setMessages((prev) => [...prev, newMessage]);
  setMessage("");

  try {
    await sendMessage(newMessage);
    updateMessageStatus(newMessage.id, "sent");
  } catch (error) {
    updateMessageStatus(newMessage.id, "failed");
    toast.error("Không thể gửi tin nhắn");
  }
};
```

**Keyboard Handling**:

```tsx
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
};
```

### 9.2 Back Navigation

**Interaction**:

1. User taps back button (←)
2. Chat closes
3. Conversation list appears
4. Bottom navigation shows

**Code**:

```tsx
const handleBack = () => {
  onBack(); // Calls parent's handler
  // Parent (WorkspaceView) sets selectedChat to null
};
```

### 9.3 Message Actions

**Pin**:

1. Tap "Ghim" below message
2. API call to pin message
3. Toast confirmation
4. Star icon appears on message

**Receive**:

1. Tap "Nhận" below message
2. GroupTransferSheet opens
3. Select target group
4. Confirm transfer
5. Info added to target group's received list

**Assign** (Leaders only):

1. Tap "Giao việc" below message
2. AssignTaskSheet opens
3. Select assignee and checklist
4. Confirm assignment
5. Task created and assigned

### 9.4 Work Type Filter

**Interaction**:

1. User taps work type tab (Công việc, Thông tin, Nhận)
2. Tab becomes active (white background)
3. Message list filters to show only that work type
4. Scroll position resets to top

**Code**:

```tsx
const filteredMessages = useMemo(() => {
  if (!selectedWorkType) return messages;
  return messages.filter((msg) => msg.workType === selectedWorkType);
}, [messages, selectedWorkType]);
```

### 9.5 Attachment

**Interaction**:

1. User taps Plus (+) button
2. Attachment menu opens
3. User selects type (Photo, File, Voice)
4. Native picker opens
5. User selects file
6. File uploads
7. Message with attachment sends

**Code**:

```tsx
const handleSelectPhoto = async () => {
  const file = await pickImage();
  if (file) {
    const url = await uploadFile(file);
    await sendMessage({ type: "image", url });
  }
};
```

---

## 10. Navigation

### 10.1 To Conversation List

**Trigger**: Tap back button

**Flow**:

```
Chat Main Screen
       ↓ (tap back)
Conversation List Screen
       ↓ (bottom nav shows)
   Bottom Navigation
```

**Related**: [01-mobile-conversation-list.md](./01-mobile-conversation-list.md)

### 10.2 To Bottom Sheets

**Triggers**:

- Tap "Ghim" → No sheet (immediate action)
- Tap "Nhận" → GroupTransferSheet
- Tap "Giao việc" → AssignTaskSheet
- Long press message → Context menu

**Flow**:

```
Chat Main Screen
       ↓ (tap action)
   Bottom Sheet
       ↓ (complete or close)
Chat Main Screen
```

**Related**: [04-bottom-sheets.md](./04-bottom-sheets.md)

### 10.3 To Work Panel

**Trigger**: Tap assigned task or created task notification

**Flow**:

```
Chat Main Screen
       ↓ (tap task notification)
  Work Panel Screen
       ↓ (via bottom nav)
    Task Details
```

**Related**: [03-mobile-right-panel.md](./03-mobile-right-panel.md)

### 10.4 Deep Link to Message

**URL Pattern**: `/mobile/chat/:chatId/message/:messageId`

**Flow**:

```
External Link/Notification
          ↓
    Chat Main Screen
          ↓ (auto-scroll)
   Highlighted Message
```

---

## 11. Testing Checklist

### 11.1 Visual Testing

- [ ] Header displays correctly (compact on mobile)
- [ ] Back button visible and properly aligned
- [ ] Avatar and name display in header
- [ ] Online status shows if applicable
- [ ] Menu button (⋮) visible
- [ ] Work type tabs display (mobile-only row)
- [ ] Active tab has white background and shadow
- [ ] Message bubbles properly aligned (left/right)
- [ ] Others' bubbles gray, mine blue
- [ ] Chat tail on bubbles (tl/tr corner 2px)
- [ ] Avatar shows on first message in group
- [ ] Sender name shows if avatar shown
- [ ] Time displays correctly
- [ ] Read status icons (✓ ✓✓) display
- [ ] Action links (Ghim, Nhận) visible
- [ ] Work type badges on messages
- [ ] Composer displays correctly
- [ ] Plus button, textarea, send button aligned
- [ ] Send button disabled when empty
- [ ] Proper spacing between messages

### 11.2 Interaction Testing

- [ ] Back button navigates to conversation list
- [ ] Bottom nav hides when chat open
- [ ] Bottom nav shows when back to list
- [ ] Menu button opens menu
- [ ] Menu items clickable
- [ ] Work type tabs switch correctly
- [ ] Tab animation smooth
- [ ] Message list filters by work type
- [ ] Type in textarea
- [ ] Textarea auto-grows
- [ ] Textarea stops at max height
- [ ] Textarea scrolls after max
- [ ] Enter sends message (no shift)
- [ ] Shift+Enter adds line break
- [ ] Send button sends message
- [ ] Message appears in chat
- [ ] Auto-scrolls to new message
- [ ] Input clears after send
- [ ] Plus button opens attachment menu
- [ ] Attachment options work
- [ ] Pin message works
- [ ] Receive info opens sheet
- [ ] Assign task opens sheet
- [ ] Long press shows context menu

### 11.3 State Testing

- [ ] Empty chat state
- [ ] Loading messages state
- [ ] Sending message state (optimistic)
- [ ] Message sent status (✓)
- [ ] Message delivered status (✓✓ gray)
- [ ] Message read status (✓✓ blue)
- [ ] Failed message state
- [ ] Offline mode handling
- [ ] Online status updates real-time
- [ ] New messages appear automatically
- [ ] Unread count decreases when opened
- [ ] Pinned messages persist
- [ ] Work type filter persists

### 11.4 Navigation Testing

- [ ] Deep link to specific message
- [ ] Auto-scroll to linked message
- [ ] Highlight linked message
- [ ] Navigate from notification
- [ ] Back button returns to list
- [ ] Bottom nav appears on back
- [ ] Sheets open from actions
- [ ] Sheets close properly
- [ ] Navigation state persists

### 11.5 Responsive Testing

- [ ] Works on 320px width
- [ ] Works on 414px width
- [ ] Works on tablets
- [ ] Keyboard doesn't hide composer
- [ ] Keyboard pushes content up
- [ ] Safe area insets respected
- [ ] Message bubbles max 80% width
- [ ] Long messages wrap correctly
- [ ] Long words break properly

### 11.6 Performance Testing

- [ ] Smooth scroll at 60fps
- [ ] Large message lists virtualized
- [ ] Images lazy load
- [ ] No lag when typing
- [ ] Fast message send (optimistic)
- [ ] Efficient re-renders
- [ ] No memory leaks
- [ ] Smooth animations

### 11.7 Accessibility Testing

- [ ] Header elements have tap targets (44×44px)
- [ ] Buttons have tap targets
- [ ] Message bubbles tappable
- [ ] Focus visible
- [ ] Screen reader support
- [ ] Color contrast meets WCAG AA
- [ ] Text readable at default size

### 11.8 Edge Cases

- [ ] Very long messages
- [ ] Messages with only emoji
- [ ] Messages with URLs (linkified)
- [ ] Messages with line breaks
- [ ] Messages with special characters
- [ ] Empty message can't send
- [ ] Failed send retry
- [ ] Network interruption handling
- [ ] Multiple rapid sends
- [ ] Attachment upload failure
- [ ] Large file handling
- [ ] No avatar fallback (initials)

---

## Summary

The **Mobile Chat Main Screen** provides a streamlined, touch-friendly interface for messaging. Key features include:

- **Compact header** with back button, avatar, name, and menu
- **Mobile-only work type tabs** for filtering messages
- **Message bubbles** with chat tails, proper alignment, and read status
- **Auto-growing composer** with attachment support
- **Message actions** (pin, receive, assign) accessible below messages
- **Smooth animations** and auto-scroll for polished UX

All styling uses Tailwind CSS with precise spacing optimized for mobile touch interactions and readability.

---

**Related Documentation**:

- [01 - Conversation List Screen](./01-mobile-conversation-list.md)
- [03 - Right Panel Screen](./03-mobile-right-panel.md)
- [04 - Bottom Sheets](./04-bottom-sheets.md)
- [05 - Mobile UI Components](./05-mobile-ui-components.md)
- [06 - Navigation Patterns](./06-navigation-patterns.md)
