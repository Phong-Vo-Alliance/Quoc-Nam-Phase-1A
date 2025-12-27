import React, { useState, useRef } from "react";
import { ChevronLeft, Plus, Pencil, Trash2, Circle, CheckCircle2, ChevronDown, ChevronRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface TodoItem {
  id:  number;
  title: string;
  detail:  string;
  completed: boolean;
  completedAt?: string;
}

export const TodoListManagerMobile:  React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  // Data
  const [todos, setTodos] = useState<TodoItem[]>([
    {
      id: 1,
      title: "Gọi điện cho khách hàng A",
      detail: "Trao đổi về dự án mới và xác nhận lịch hẹn",
      completed:  false,
    },
    {
      id: 2,
      title: "Chuẩn bị báo cáo tuần",
      detail: "Hoàn thành trước 5pm hôm nay",
      completed: false,
    },
  ]);

  // Sheet states
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newDetail, setNewDetail] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDetail, setEditDetail] = useState("");

  // Active item states
  const [contextMenuTodo, setContextMenuTodo] = useState<TodoItem | null>(null);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [todoToDelete, setTodoToDelete] = useState<TodoItem | null>(null);

  // Swipe/animation states
  const [swipedId, setSwipedId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [pressingId, setPressingId] = useState<number | null>(null);

  // Accordion
  const [showCompleted, setShowCompleted] = useState(true);

  // Touch refs
  const touchStartX = useRef<number>(0);
  const touchCurrentX = useRef<number>(0);
  const longPressTimer = useRef<NodeJS. Timeout | null>(null);

  // Mouse refs
  const mouseDownTime = useRef<number>(0);
  const isMouseDown = useRef<boolean>(false);

  // ==================== HANDLERS ====================

  // Add new todo
  const handleAddNew = () => {
    setNewTitle("");
    setNewDetail("");
    setShowAddSheet(true);
  };

  const handleSaveNew = () => {
    if (! newTitle.trim()) return;

    const newId = Date.now();
    setTodos((prev) => [
      { id: newId, title: newTitle. trim(), detail: newDetail.trim(), completed: false },
      ...prev,
    ]);

    setHighlightedId(newId);
    setTimeout(() => setHighlightedId(null), 1500);

    setShowAddSheet(false);
    setNewTitle("");
    setNewDetail("");
  };

  // Toggle done
  const handleToggleDone = (id: number) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: ! t.completed ? new Date().toISOString() : undefined,
            }
          : t
      )
    );
  };

  // Edit todo
  const handleStartEdit = (todo: TodoItem) => {
    setEditingTodo(todo);
    setEditTitle(todo.title);
    setEditDetail(todo.detail);
    setShowEditSheet(true);
    setShowContextMenu(false);
  };

  const handleSaveEdit = () => {
    if (!editingTodo || !editTitle.trim()) return;

    setTodos((prev) =>
      prev.map((t) =>
        t.id === editingTodo.id
          ? { ...t, title: editTitle. trim(), detail: editDetail.trim() }
          : t
      )
    );

    setHighlightedId(editingTodo.id);
    setTimeout(() => setHighlightedId(null), 1500);

    setShowEditSheet(false);
    setEditingTodo(null);
    setEditTitle("");
    setEditDetail("");
  };

  // Delete todo
  const handleDelete = (todo: TodoItem) => {
    setTodoToDelete(todo);
    setShowDeleteConfirm(true);
    setShowContextMenu(false);
  };

  const confirmDelete = () => {
    if (!todoToDelete) return;

    setDeletingId(todoToDelete. id);
    setSwipedId(null);

    setTimeout(() => {
      setTodos((prev) => prev.filter((t) => t.id !== todoToDelete.id));
      setDeletingId(null);
      setTodoToDelete(null);
      setShowDeleteConfirm(false);
    }, 300);
  };

  // ==================== TOUCH HANDLERS ====================

  const handleTouchStart = (todo: TodoItem, e: React.TouchEvent) => {
    e.preventDefault();

    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;

    // Start long press timer
    longPressTimer.current = setTimeout(() => {
      setContextMenuTodo(todo);
      setShowContextMenu(true);
      touchStartX.current = 0;
      touchCurrentX.current = 0;
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentX.current = e.touches[0].clientX;

    // Cancel long press if moved
    const moveDistance = Math.abs(touchStartX.current - touchCurrentX. current);
    if (moveDistance > 10 && longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchEnd = (todo: TodoItem) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (touchStartX.current === 0) return;

    const swipeDistance = touchStartX.current - touchCurrentX.current;

    if (swipeDistance > 80) {
      setSwipedId(todo.id);
    } else if (swipeDistance < -20) {
      setSwipedId(null);
    }

    touchStartX.current = 0;
    touchCurrentX.current = 0;
  };

  // ==================== MOUSE HANDLERS ====================

  const handleMouseDown = (todo: TodoItem, e: React. MouseEvent) => {
    e.preventDefault();

    isMouseDown.current = true;
    mouseDownTime.current = Date.now();
    setPressingId(todo.id);

    longPressTimer.current = setTimeout(() => {
      if (isMouseDown.current) {
        setContextMenuTodo(todo);
        setShowContextMenu(true);
        setPressingId(null);
      }
    }, 500);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMouseDown.current && longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      setPressingId(null);
    }
  };

  const handleMouseUp = (todo: TodoItem, e: React.MouseEvent) => {
    e.preventDefault();

    isMouseDown.current = false;
    setPressingId(null);

    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    const pressDuration = Date.now() - mouseDownTime.current;

    if (pressDuration < 200) {
      setSwipedId(null);
    }

    mouseDownTime.current = 0;
  };

  const handleMouseLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    isMouseDown.current = false;
    setPressingId(null);
  };

  // ==================== COMPUTED DATA ====================

  const activeTodos = todos.filter((t) => !t.completed);

  const completedToday = todos.filter((t) => {
    if (!t.completed || !t.completedAt) return false;
    const today = new Date().toDateString();
    const completedDate = new Date(t. completedAt).toDateString();
    return today === completedDate;
  });

  if (! open) return null;

  return (
    <div className="absolute inset-0 z-[70] bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-3 py-3">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition"
          >
            <ChevronLeft className="h-5 w-5 text-brand-600" />
          </button>

          <div className="flex-1 text-center">
            <h1 className="text-sm font-semibold text-gray-900">Việc cần làm</h1>
          </div>

          <button
            onClick={handleAddNew}
            className="p-2 rounded-full hover: bg-brand-50 active:bg-brand-100 transition"
          >
            <Plus className="h-5 w-5 text-brand-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-gray-50">
        {/* Active Todos */}
        {activeTodos. length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-400">Chưa có công việc nào</p>
            <button
              onClick={handleAddNew}
              className="mt-3 text-xs text-brand-600 underline"
            >
              Thêm công việc đầu tiên
            </button>
          </div>
        )}

        {activeTodos.map((todo) => (
          <div
            key={todo.id}
            className={`
              relative overflow-hidden
              transition-all duration-300
              touch-pan-y
              cursor-pointer
              ${highlightedId === todo.id ?  "animate-highlight" : ""}
              ${deletingId === todo.id ? "animate-delete" : ""}
              ${pressingId === todo.id ? "scale-[0.98] opacity-90" : ""}
            `}
            style={{ touchAction: "pan-y" }}
            onTouchStart={(e) => handleTouchStart(todo, e)}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => handleTouchEnd(todo)}
            onMouseDown={(e) => handleMouseDown(todo, e)}
            onMouseMove={handleMouseMove}
            onMouseUp={(e) => handleMouseUp(todo, e)}
            onMouseLeave={handleMouseLeave}
          >
            {/* Delete background */}
            <div
              className={`
                absolute inset-y-0 right-0 w-20
                bg-rose-500 flex items-center justify-center
                transition-opacity duration-200
                ${swipedId === todo.id ?  "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
              `}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(todo);
              }}
            >
              <Trash2 className="h-5 w-5 text-white" />
            </div>

            {/* Card content */}
            <div
              className="
                relative bg-white rounded-lg border border-gray-200 p-3 shadow-sm
                transition-transform duration-200
              "
              style={{
                transform: swipedId === todo.id ?  "translateX(-80px)" : "translateX(0)",
              }}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleDone(todo.id);
                  }}
                  className="shrink-0 mt-0.5 px-0.5"
                >
                  <Circle className="h-5 w-5 text-gray-400 hover:text-brand-600 transition-colors" />
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 break-words">
                    {todo.title}
                  </div>
                  {todo.detail && (
                    <div className="text-sm text-gray-600 mt-1 break-words">
                      {todo.detail}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Completed Section */}
        {completedToday.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-white border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-2">
                {showCompleted ? (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                )}
                <span className="text-sm font-semibold text-gray-700">
                  Đã hoàn thành hôm nay
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {completedToday.length}
              </span>
            </button>

            {showCompleted && (
              <div className="mt-3 space-y-2">
                {completedToday. map((todo) => (
                  <div
                    key={todo.id}
                    className={`
                      relative bg-gray-50 rounded-lg border border-gray-200 p-3
                      ${deletingId === todo.id ? "animate-delete" : ""}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkmark (undo) */}
                      <button
                        onClick={() => handleToggleDone(todo.id)}
                        className="shrink-0 mt-0.5"
                      >
                        <CheckCircle2 className="h-5 w-5 text-brand-600 hover:text-brand-700 transition-colors" />
                      </button>

                      {/* Content (strikethrough) */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-500 line-through break-words">
                          {todo.title}
                        </div>
                        {todo.detail && (
                          <div className="text-sm text-gray-400 line-through mt-1 break-words">
                            {todo.detail}
                          </div>
                        )}
                      </div>

                      {/* Delete icon */}
                      <button
                        onClick={() => handleDelete(todo)}
                        className="shrink-0 mt-0.5"
                      >
                        <Trash2 className="h-4 w-4 text-gray-400 hover:text-rose-600 transition-colors" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Safe area */}
        <div className="h-[calc(env(safe-area-inset-bottom,0px)+1rem)]" />
      </div>

      {/* Add New Sheet */}
      <Sheet open={showAddSheet} onOpenChange={setShowAddSheet}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl p-0 w-[92vw] max-w-[430px] left-1/2 -translate-x-1/2 right-auto top-auto z-[80]"
        >
          <SheetHeader className="px-4 py-4 border-b">
            <SheetTitle className="text-sm">Thêm công việc mới</SheetTitle>
          </SheetHeader>

          <div className="px-4 py-4 space-y-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tiêu đề <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Nhập tiêu đề..."
                autoFocus
                className="
                  w-full px-3 py-2.5 rounded-lg
                  border border-gray-300
                  focus:outline-none focus:ring-2 focus:ring-brand-300
                  text-sm
                "
              />
            </div>

            {/* Detail */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Chi tiết
              </label>
              <textarea
                value={newDetail}
                onChange={(e) => setNewDetail(e.target.value)}
                placeholder="Nhập chi tiết..."
                rows={4}
                className="
                  w-full px-3 py-2.5 rounded-lg
                  border border-gray-300
                  focus:outline-none focus:ring-2 focus:ring-brand-300
                  text-sm resize-none
                "
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddSheet(false)}
                className="
                  flex-1 py-2.5 rounded-lg
                  bg-gray-100 text-gray-700 text-sm font-medium
                  active:bg-gray-200 transition-colors
                "
              >
                Hủy
              </button>
              <button
                onClick={handleSaveNew}
                disabled={!newTitle. trim()}
                className="
                  flex-1 py-2.5 rounded-lg
                  bg-brand-600 text-white text-sm font-medium
                  active:bg-brand-700 transition-colors
                  disabled:opacity-50 disabled: cursor-not-allowed
                "
              >
                Lưu
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Sheet */}
      <Sheet open={showEditSheet} onOpenChange={setShowEditSheet}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl p-0 w-[92vw] max-w-[430px] left-1/2 -translate-x-1/2 right-auto top-auto z-[80]"
        >
          <SheetHeader className="px-4 py-4 border-b">
            <SheetTitle className="text-sm">Chỉnh sửa công việc</SheetTitle>
          </SheetHeader>

          <div className="px-4 py-4 space-y-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tiêu đề <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Nhập tiêu đề..."
                autoFocus
                className="
                  w-full px-3 py-2.5 rounded-lg
                  border border-gray-300
                  focus:outline-none focus:ring-2 focus:ring-brand-300
                  text-sm
                "
              />
            </div>

            {/* Detail */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Chi tiết
              </label>
              <textarea
                value={editDetail}
                onChange={(e) => setEditDetail(e.target.value)}
                placeholder="Nhập chi tiết..."
                rows={4}
                className="
                  w-full px-3 py-2.5 rounded-lg
                  border border-gray-300
                  focus:outline-none focus:ring-2 focus:ring-brand-300
                  text-sm resize-none
                "
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowEditSheet(false)}
                className="
                  flex-1 py-2.5 rounded-lg
                  bg-gray-100 text-gray-700 text-sm font-medium
                  active:bg-gray-200 transition-colors
                "
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editTitle.trim()}
                className="
                  flex-1 py-2.5 rounded-lg
                  bg-brand-600 text-white text-sm font-medium
                  active:bg-brand-700 transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                Lưu
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Context Menu Sheet */}
      <Sheet open={showContextMenu} onOpenChange={setShowContextMenu}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl p-0 w-[92vw] max-w-[430px] left-1/2 -translate-x-1/2 right-auto top-auto z-[80]"
        >
          <SheetHeader className="px-4 py-3 border-b">
            <SheetTitle className="text-sm truncate">
              {contextMenuTodo?. title}
            </SheetTitle>
          </SheetHeader>

          <div className="px-3 py-3 space-y-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
            {/* Edit button (only for active todos) */}
            {!contextMenuTodo?.completed && (
              <button
                onClick={() => contextMenuTodo && handleStartEdit(contextMenuTodo)}
                className="
                  w-full flex items-center gap-3 px-3 py-3 rounded-lg
                  bg-white border border-gray-200
                  active:bg-gray-50 transition-colors
                "
              >
                <Pencil className="h-4 w-4 text-brand-600" />
                <span className="text-sm text-gray-700">Chỉnh sửa</span>
              </button>
            )}

            {/* Delete button */}
            <button
              onClick={() => contextMenuTodo && handleDelete(contextMenuTodo)}
              className="
                w-full flex items-center gap-3 px-3 py-3 rounded-lg
                bg-white border border-rose-200
                active:bg-rose-50 transition-colors
              "
            >
              <Trash2 className="h-4 w-4 text-rose-600" />
              <span className="text-sm text-rose-600">Xóa</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="w-[92vw] max-w-[340px] left-1/2 -translate-x-1/2 right-auto z-[80]">
          <DialogHeader>
            <DialogTitle className="text-sm">Xác nhận xóa</DialogTitle>
          </DialogHeader>

          <div className="py-3">
            <p className="text-sm text-gray-600">
              Bạn có chắc muốn xóa công việc{" "}
              <span className="font-semibold text-gray-900">
                "{todoToDelete?.title}"
              </span>
              ? 
            </p>
          </div>

          <DialogFooter>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="
                  flex-1 py-2.5 rounded-lg
                  bg-gray-100 text-gray-700 text-sm font-medium
                  active:bg-gray-200 transition-colors
                "
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="
                  flex-1 py-2.5 rounded-lg
                  bg-rose-600 text-white text-sm font-medium
                  active:bg-rose-700 transition-colors
                "
              >
                Xóa
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Animations */}
      <style>{`
        @keyframes highlight {
          0%, 100% { background-color:  white; }
          50% { background-color: #f0fdf4; }
        }
        . animate-highlight {
          animation:  highlight 1. 5s ease-in-out;
        }

        @keyframes delete {
          0% { opacity:  1; transform: translateX(0); }
          50% { opacity: 0.5; transform: translateX(-20px); }
          100% { opacity: 0; transform: translateX(-100%); margin-bottom: 0; padding:  0; height: 0; }
        }
        .animate-delete {
          animation: delete 300ms ease-out forwards;
        }
      `}</style>
    </div>
  );
};