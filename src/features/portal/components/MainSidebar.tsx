import React from "react";
import {
  MessageSquareText,
  Users,
  Monitor,
  Wrench,
  LogOut,
  Zap,
  Star,
  AlarmClock,
  ListTodo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import QuocnamLogo from "@/assets/Quocnam_logo.png";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { QuickMessageManager } from "./QuickMessageManager";
import { TodoListManager } from "./TodoListManager";

interface MainSidebarProps {
  activeView: "workspace" | "lead";
  onSelect: (view: "workspace" | "lead" | "pinned" | "logout") => void;
  workspaceMode?: "default" | "pinned";
  viewMode?: "lead" | "staff";

  pendingTasks?: {
    id: string;
    title: string;
    workTypeName?: string;
    pendingUntil?: string;
  }[];
  showPinnedToast: boolean;
}

export const MainSidebar: React.FC<MainSidebarProps> = ({
  activeView,
  onSelect,
  workspaceMode,
  viewMode,
  pendingTasks: initialPending = [],
  showPinnedToast,  
}) => {
  const [openTools, setOpenTools] = React.useState(false);
  const [openQuickMsg, setOpenQuickMsg] = React.useState(false);  
  const [openTodoList, setOpenTodoList] = React.useState(false);
  const [openPending, setOpenPending] = React.useState(false);
  const [pendingTasks, setPendingTasks] = React.useState<typeof initialPending>(initialPending ?? []);

  const [openDateModal, setOpenDateModal] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<string | null>(null);
  const [newDate, setNewDate] = React.useState<Date | undefined>(undefined);

  //const [showPinnedToast, setShowPinnedToast] = React.useState(false);

  // TODO: Bật lại khi qua phase kế tiếp
  const isShowPhasedFeatures = false;

  // Helper màu nền cho từng trạng thái ngày
  const getTaskBg = (dateStr?: string) => {
    if (!dateStr) return "bg-gray-50 border-gray-200";
    const d = new Date(dateStr);
    const today = new Date();
    const isSameDay = d.toDateString() === today.toDateString();
    const isPast = d < today;
    if (isPast) return "bg-red-50 border-red-200"; // trễ hạn
    if (isSameDay) return "bg-amber-50 border-amber-200"; // hôm nay
    return "bg-gray-50 border-gray-200"; // chưa tới ngày
  };

  // Helper text trạng thái ngày
  const getStatusText = (dateStr?: string) => {
    if (!dateStr) return "Chờ xử lý";
    const d = new Date(dateStr);
    const today = new Date();
    const isSameDay = d.toDateString() === today.toDateString();
    const isPast = d < today;
    if (isPast) return "Trễ hạn";
    if (isSameDay) return "Bắt đầu hôm nay";
    return "Chờ tới ngày";
  };

   const handleOpenDateModal = (taskId: string) => {
    setSelectedTask(taskId);
    const task = pendingTasks.find((t) => t.id === taskId);
    setNewDate(task?.pendingUntil ? new Date(task.pendingUntil) : new Date());
    setOpenDateModal(true);
  };

  // 🆕 Lưu ngày mới
  const handleSaveDate = () => {
    if (!newDate || !selectedTask) return;
    const updated = pendingTasks.map((t) =>
      t.id === selectedTask
        ? { ...t, pendingUntil: newDate.toISOString() }
        : t
    );
    setPendingTasks(updated);
    setOpenDateModal(false);
    setSelectedTask(null);
  };

  // 🧠 Không cho chọn ngày quá khứ
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <aside className="flex flex-col items-center justify-between w-16 h-screen bg-brand-600 text-white shadow-lg">
      {/* Logo */}
      <div className="flex flex-col items-center mt-4">
        <img
          src={QuocnamLogo}
          alt="Quốc Nam Logo"
          className="h-10 w-10 rounded-full border border-white/30 shadow-sm"
        />

        {/* Icon section */}
        <div className="mt-6 flex flex-col items-center gap-5">
          {/* Workspace */}
          <button
            title="Tin nhắn"
            onClick={() => onSelect("workspace")}
            className={cn(
              "p-2 rounded-lg transition-colors",
              activeView === "workspace" && workspaceMode !== "pinned"
                ? "bg-white/20 text-white"
                : "bg-brand-600 text-white/90 hover:text-white hover:bg-white/10"
            )}
          >
            <MessageSquareText className="h-6 w-6" />
          </button>

          {/* Team Monitor */}
          {/* TODO: Bật lại khi qua phase kế tiếp */}
          {/* {viewMode === "lead" && (
            <button
              title="Team Monitor – Lead"
              onClick={() => onSelect("lead")}
              className={cn(
                "p-2 rounded-lg transition-colors",
                activeView === "lead"
                  ? "bg-white/20 text-white"
                  : "bg-brand-600 text-white/90 hover:text-white hover:bg-white/10"
              )}
            >
              <Monitor className="h-6 w-6" />
            </button>
          )} */}
          
        </div>
      </div>

      {/* Bottom buttons */}
      {/* TODO: Bật lại khi qua phase kế tiếp */}
      <div className="flex flex-col items-center gap-5 mb-4">
        
        {isShowPhasedFeatures && ( 
          <>
        {/* Pending Tasks Popover */}
        <Popover open={openPending} onOpenChange={setOpenPending} >
          <PopoverTrigger asChild>
            <button
              title="Việc chờ xử lý"
              onClick={() => setOpenPending(!openPending)}
              className={cn(
                "p-2 rounded-lg transition-colors relative",
                openPending
                  ? "bg-white/20 text-white"
                  : "bg-brand-600 text-white/90 hover:text-white hover:bg-white/10"
              )}
            >
              <AlarmClock className="h-6 w-6" />
              {pendingTasks.length > 0 && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-brand-600"></span>
              )}
            </button>
          </PopoverTrigger>

          <PopoverContent
            align="start"
            side="right"
            className="w-80 rounded-xl border border-gray-200 shadow-lg p-3"
          >
            <h4 className="px-2 pb-2 text-sm font-semibold text-gray-700 border-b border-gray-100">
              Việc chờ xử lý
            </h4>

            {pendingTasks.length === 0 ? (
              <div className="px-2 py-4 text-xs text-gray-500 text-center">
                Không có việc chờ xử lý
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 max-h-80 overflow-y-auto mt-2 space-y-2">
                {pendingTasks.map((t) => {
                  const bg = getTaskBg(t.pendingUntil);
                  const status = getStatusText(t.pendingUntil);
                  const dateText = t.pendingUntil
                    ? new Date(t.pendingUntil).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "—";
                  return (
                    <li
                      key={t.id}
                      className={cn(
                        "p-2 rounded-lg border transition hover:bg-brand-50 cursor-pointer",
                        bg
                      )}
                      onClick={() => {
                        // TODO: có thể mở group tương ứng
                        setOpenPending(false);
                      }}
                    >
                      <div className="text-sm font-medium text-gray-800 truncate">
                        {t.title}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        Loại việc: {t.workTypeName || "—"}
                      </div>
                      <div className="text-xs flex justify-between mt-1">
                        <span
                          className={cn(
                            "font-medium",
                            status === "Trễ hạn"
                              ? "text-red-600"
                              : status === "Bắt đầu hôm nay"
                              ? "text-amber-600"
                              : "text-gray-500"
                          )}
                        >
                          {status}
                        </span>
                        <div className="flex items-center gap-2 text-gray-500">
                          <span>{dateText}</span>
                          <button
                            onClick={() => handleOpenDateModal(t.id)}
                            className="text-brand-700 hover:underline"
                          >
                            Đổi ngày
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </PopoverContent>
        </Popover>
        </>
        )}


        {/* Tools Popover */}
        <Popover open={openTools} onOpenChange={setOpenTools}>
          <PopoverTrigger asChild>
            <button
              title="Công cụ"
              onClick={() => setOpenTools(!openTools)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                openTools
                  ? "bg-white/20 text-white"
                  : "bg-brand-600 text-white/90 hover:text-white hover:bg-white/10"
              )}
            >
              <Wrench className="h-6 w-6" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            side="right"
            className="w-56 rounded-xl border border-gray-200 shadow-lg p-3"
          >
            <h4 className="px-2 pb-2 text-sm font-semibold text-gray-700 border-b border-gray-100">
              Công cụ
            </h4>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {/* Tin nhắn nhanh */}
              <div
                className="flex flex-col items-center text-center text-gray-500 hover:text-brand-700 cursor-pointer"
                onClick={() => {
                  setOpenTools(false);
                  setOpenQuickMsg(true);
                }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 mb-1">
                  <Zap className="h-5 w-5 text-brand-600" />
                </div>
                <span className="text-xs font-medium">Tin nhắn nhanh</span>
              </div>

              {/* Tin đánh dấu */}
              <div
                className="flex flex-col items-center text-center text-gray-500 hover:text-brand-700 cursor-pointer"
                onClick={() => {
                  setOpenTools(false);
                  //setShowPinned(true);
                  onSelect("pinned"); // Trigger via PortalWireframes
                }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 mb-1">
                  <Star className="h-5 w-5 text-brand-600" />
                </div>
                <span className="text-xs font-medium">Tin đánh dấu</span>
              </div>

              {/* Danh sách việc cần làm */}
              <div
                className="flex flex-col items-center text-center text-gray-500 hover:text-brand-700 cursor-pointer"
                onClick={() => {
                  setOpenTools(false);
                  setOpenTodoList(true);
                }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 mb-1">
                  <ListTodo className="h-5 w-5 text-brand-600" />
                </div>
                <span className="text-xs font-medium">Danh sách việc cần làm</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Toast thông báo đã đánh dấu */}
        {showPinnedToast && (
          <div className="absolute left-16 bottom-24 z-[9999] animate-fade-in">
            <div className="relative bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1 rounded-md shadow">
              <span className="text-sm font-medium">⭐ Đã đánh dấu</span>

              {/* Mũi tên chỉ vào icon Công cụ */}
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 
                      w-0 h-0 border-t-8 border-b-8 border-r-8 
                      border-t-transparent border-b-transparent border-r-amber-200">
              </div>
            </div>
          </div>
        )}


        <button
          title="Đăng xuất"
          onClick={() => onSelect("logout")}
          className="p-2 rounded-lg bg-brand-600 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        >
          <LogOut className="h-6 w-6" />
        </button>
      </div>
      
      <QuickMessageManager open={openQuickMsg} onOpenChange={setOpenQuickMsg} />
      <TodoListManager open={openTodoList} onOpenChange={setOpenTodoList} />      

      {/* Modal chọn ngày */}
      <Dialog open={openDateModal} onOpenChange={setOpenDateModal}>
        <DialogContent className="max-w-sm flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-4">
            <DialogTitle>Chọn ngày bắt đầu dự kiến</DialogTitle>
          </DialogHeader>
          <div>
            <Calendar
              mode="single"
              selected={newDate}
              onSelect={setNewDate}
              disabled={isDateDisabled}
              className="mx-auto"
            />
          </div>
          <DialogFooter className="px-6 py-4 border-t bg-gray-50 mt-auto flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpenDateModal(false)} className="w-24" >
              Hủy
            </Button>
            <Button
              onClick={handleSaveDate}
              disabled={!newDate}
              className="bg-brand-600 hover:bg-brand-700 text-white w-28"
            >
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>    
  );
};
