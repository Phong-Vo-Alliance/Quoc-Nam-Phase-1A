import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Circle, CheckCircle2, ChevronDown, ChevronUp, Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";

interface TodoItem {
  id: number;
  title: string;
  detail: string;
  completed: boolean;
  completedAt?: string;
}

export const TodoListManager: React.FC<{
  open: boolean;
  onOpenChange: (v: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const [todos, setTodos] = useState<TodoItem[]>([
    {
      id: 1,
      title: "Gọi điện cho khách hàng A",
      detail: "Trao đổi về dự án mới và xác nhận lịch hẹn",
      completed: false,
    },
  ]);
  
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDetail, setNewDetail] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDetail, setEditDetail] = useState("");
  const [deletedId, setDeletedId] = useState<number | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  
  const newTitleRef = useRef<HTMLInputElement>(null);
  const editTitleRef = useRef<HTMLInputElement>(null);

  // Refs to detect if focus is still inside add/edit forms
  const newFormRef = useRef<HTMLDivElement | null>(null);
  const editingRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Focus on new todo input when adding
  useEffect(() => {
    if (isAddingNew && newTitleRef.current) {
      newTitleRef.current.focus();
    }
  }, [isAddingNew]);

  // Focus on edit input when editing
  useEffect(() => {
    if (editingId !== null && editTitleRef.current) {
      editTitleRef.current.focus();
    }
  }, [editingId]);

  const handleAddNew = () => {
    setIsAddingNew(true);
    setNewTitle("");
    setNewDetail("");
  };

  const handleSaveNew = () => {
    const hasContent = newTitle.trim() || newDetail.trim();
    
    if (hasContent) {
      const newId = Date.now();
      setTodos((prev) => [
        { id: newId, title: newTitle, detail: newDetail, completed: false },
        ...prev,
      ]);
    }
    
    setIsAddingNew(false);
    setNewTitle("");
    setNewDetail("");
  };

  // Previously this saved immediately on blur; we now only save when focus leaves the whole new-form container.
  const handleBlurNew = () => {
    // Defer to allow document.activeElement to update to the newly focused element
    setTimeout(() => {
      if (!newFormRef.current) {
        handleSaveNew();
        return;
      }
      const active = document.activeElement;
      if (!newFormRef.current.contains(active)) {
        handleSaveNew();
      }
    }, 0);
  };

  const handleCancelNew = () => {
    // keep behavior: save if has content, otherwise just close
    handleSaveNew();
  };

  const handleStartEdit = (todo: TodoItem) => {
    if (todo.completed) return; // Don't allow editing completed todos
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditDetail(todo.detail);
  };

  const handleSaveEdit = () => {
    if (editingId === null) return;

    setTodos((prev) =>
      prev.map((t) =>
        t.id === editingId
          ? { ...t, title: editTitle, detail: editDetail }
          : t
      )
    );
    
    setEditingId(null);
    setEditTitle("");
    setEditDetail("");
  };

  // Only save edit if focus leaves the editing container for that item
  const handleBlurEdit = (id: number) => {
    setTimeout(() => {
      const el = editingRefs.current[id];
      const active = document.activeElement;
      if (!el || !el.contains(active)) {
        // Only trigger save if we're still editing this id
        if (editingId === id) {
          handleSaveEdit();
        }
      }
    }, 0);
  };

  const handleToggleComplete = (id: number) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : undefined,
            }
          : t
      )
    );
  };

  const handleDelete = (id: number) => {
    setDeletedId(id);
    setTimeout(() => {
      setTodos((prev) => prev.filter((t) => t.id !== id));
      setDeletedId(null);
    }, 400);
  };

  // Filter todos
  const activeTodos = todos.filter((t) => !t.completed);
  const completedToday = todos.filter((t) => {
    if (!t.completed || !t.completedAt) return false;
    const today = new Date().toDateString();
    const completedDate = new Date(t.completedAt).toDateString();
    return today === completedDate;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Danh Sách Việc Cần Làm
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          {/* Add New Link */}
          <div className="mb-4">
            {!isAddingNew ? (
              <Button
                onClick={handleAddNew}
                className="flex items-center gap-2 text-brand-600 hover:text-brand-700 text-sm font-medium"
                variant= "link"
              >
                <Plus className="h-4 w-4" />
                <span>Thêm công việc mới</span>
              </Button>
            ) : (
              // attach ref to whole new-form container so we can detect focus leaving it
              <div ref={newFormRef} className="mb-3 rounded-lg border-brand-200 bg-brand-50 p-3">
                <div className="space-y-2">
                  <Input
                    ref={newTitleRef}
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onBlur={handleBlurNew}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSaveNew();
                      } else if (e.key === "Escape") {
                        setIsAddingNew(false);
                      }
                    }}
                    placeholder="Tiêu đề"
                    className="text-sm"
                  />
                  <Textarea
                    value={newDetail}
                    onChange={(e) => setNewDetail(e.target.value)}
                    onBlur={handleBlurNew}
                    placeholder="Chi tiết"
                    className="text-sm h-20"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Active Todos */}
          <div className="space-y-2">
            {activeTodos.length === 0 && !isAddingNew && (
              <p className="text-sm text-gray-400 italic py-4 text-center">
                Chưa có công việc nào
              </p>
            )}

            {activeTodos.map((todo) => {
              const isEditing = editingId === todo.id;
              
              return (
                <div
                  key={todo.id}
                  className={cn(
                    "group relative rounded-lg bg-white transition-all hover:border-brand-200 hover:bg-brand-50",
                    deletedId === todo.id && "fade-out"
                  )}
                >
                  <div className="flex">
                    {/* Radio icon */}                    
                    <IconButton
                      icon={<Circle className="h-5 w-5 " />}
                      className="left-0 top-0 h-5 w-5 m-1 text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      title="Đánh dấu hoàn thành"
                      onClick={() => handleToggleComplete(todo.id)}
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        // attach a ref for this editing item so blur logic can check focus containment
                        <div
                          ref={(el) => {
                            editingRefs.current[todo.id] = el;
                          }}
                          className="space-y-2"
                        >
                          <Input
                            ref={editTitleRef}
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={() => handleBlurEdit(todo.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleSaveEdit();
                              } else if (e.key === "Escape") {
                                setEditingId(null);
                              }
                            }}
                            placeholder="Tiêu đề"
                            className="text-sm font-medium"
                          />
                          <Textarea
                            value={editDetail}
                            onChange={(e) => setEditDetail(e.target.value)}
                            onBlur={() => handleBlurEdit(todo.id)}
                            placeholder="Chi tiết"
                            className="text-sm h-16"
                          />
                        </div>
                      ) : (
                        <div onClick={() => handleStartEdit(todo)} className="cursor-pointer">
                          <div className="text-sm font-medium text-gray-800 break-words">
                            {todo.title || "Chưa có tiêu đề"}
                          </div>
                          {todo.detail && (
                            <div className="text-sm text-gray-600 mt-1 break-words">
                              {todo.detail}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Delete icon */}
                    <IconButton
                      icon={<Trash2 className="h-3.5 w-3.5" />}
                      className="h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                      title="Xóa công việc"
                      onClick={() => handleDelete(todo.id)}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Completed Today Section */}
          {completedToday.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-brand-600 transition-colors mb-2"
              >
                <span>Đã hoàn thành hôm nay ({completedToday.length})</span>
                {showCompleted ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {showCompleted && (
                <div className="space-y-2 mt-3">
                  {completedToday.map((todo) => (
                    <div
                      key={todo.id}
                      className={cn(
                        "group relative rounded-lg bg-gray-50 transition-all",
                        deletedId === todo.id && "fade-out"
                      )}
                    >
                      <div className="flex gap-3">
                        {/* Checkmark icon */}
                        <IconButton
                          icon={<CheckCircle2 className="h-5 w-5 text-brand-600" />}
                          className="left-0 top-0 h-5 w-5 m-1 text-brand-600"
                          title="Đã hoàn thành"
                          onClick={() => handleToggleComplete(todo.id)}
                        />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-500 line-through break-words">
                            {todo.title || "Chưa có tiêu đề"}
                          </div>
                          {todo.detail && (
                            <div className="text-sm text-gray-400 line-through mt-1 break-words">
                              {todo.detail}
                            </div>
                          )}
                        </div>

                        {/* Delete icon */}
                        <IconButton
                          icon={<Trash2 className="h-3.5 w-3.5" />}
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                          title="Xóa công việc"
                          onClick={() => handleDelete(todo.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};