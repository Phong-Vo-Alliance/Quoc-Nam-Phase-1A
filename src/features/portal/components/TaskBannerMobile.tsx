import React from 'react';
import { Bell, ChevronDown, ChevronUp, ChevronRight, X } from 'lucide-react';

export type TaskBreakdownItem = {
  workTypeId: string;
  workTypeName: string;
  todoCount: number;
  inProgressCount: number;
};

export type TaskBannerMobileProps = {
  visible:  boolean;
  workType: string;        // "Nhận hàng"
  taskTitle: string;       // "Bắt đầu nhận hàng mới..."
  totalCount: number;      // 3
  breakdown: TaskBreakdownItem[];
  onViewWorkType: (workTypeId: string) => void;  // Navigate to specific WorkType
};

export const TaskBannerMobile: React.FC<TaskBannerMobileProps> = ({
  visible,
  workType,
  taskTitle,
  totalCount,
  breakdown,
  onViewWorkType,
}) => {
  const [expanded, setExpanded] = React. useState(false);

  // Auto-close when component unmounts or becomes invisible
  React.useEffect(() => {
    if (!visible) {
      setExpanded(false);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="relative">
      {/* Collapsed Banner */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="
          flex items-center justify-between w-full
          px-3 py-2 h-9
          border-b border-amber-200 bg-amber-50
          active:bg-amber-100 transition-colors
          relative z-10
        "
        aria-expanded={expanded}
        aria-label="Xem chi tiết công việc"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Bell className="h-4 w-4 text-amber-600 shrink-0" />
          
          <span className="text-xs font-semibold text-gray-800 shrink-0">
            {workType}:
          </span>
          
          <span className="text-xs text-gray-600 truncate">
            {taskTitle}
          </span>
        </div>

        <div className="flex rounded-full border border-amber-300 p-1 items-center gap-1.5 shrink-0">
          <span className="text-xs font-bold text-amber-700">
            {totalCount}
          </span>
          
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </button>

      {/* Backdrop + Popup (Portal to prevent z-index issues) */}
      {expanded && (
        <>
          {/* Backdrop */}
          <div
            className="
              fixed inset-0 
              bg-black/20 
              z-40
              animate-fade-in
            "
            onClick={() => setExpanded(false)}
            aria-hidden="true"
          />

          {/* Popup Dropdown */}
          <div
            className="
              absolute left-3 right-3 top-full mt-1
              bg-white rounded-lg shadow-lg
              border border-gray-200
              z-50
              animate-slide-down
              max-h-[40vh] overflow-y-auto
            "
            role="dialog"
            aria-label="Chi tiết công việc"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b sticky top-0 bg-white z-10">
              <span className="text-xs font-semibold text-gray-700">
                Chi tiết công việc
              </span>
              <button
                onClick={() => setExpanded(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label="Đóng"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            {/* Breakdown List with Individual Links */}
            <div className="px-3 py-3 space-y-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
              {breakdown.map((item) => {
                const parts: string[] = [];
                if (item.inProgressCount > 0) {
                  parts.push(`${item.inProgressCount} đang làm`);
                }
                if (item.todoCount > 0) {
                  parts.push(`${item.todoCount} chưa xử lý`);
                }

                return (
                  <div
                    key={item.workTypeId}
                    className="
                      flex items-start justify-between gap-3
                      pb-2 border-b border-gray-100 last:border-b-0
                    "
                  >
                    {/* Left:  WorkType info */}
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <span className="text-gray-400 mt-0.5 text-xs shrink-0">•</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-800">
                          {item.workTypeName}
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          {parts.join(', ')}
                        </div>
                      </div>
                    </div>

                    {/* Right:  Action button */}
                    <button
                      onClick={() => {
                        setExpanded(false);
                        onViewWorkType(item.workTypeId);
                      }}
                      className="
                        shrink-0 flex items-center gap-1
                        px-2.5 py-1.5 rounded-md
                        text-xs font-medium text-brand-600
                        border border-brand-200 bg-white
                        hover:bg-brand-50 active:bg-brand-100
                        transition-colors
                      "
                    >
                      <span>Xem {item.todoCount + item.inProgressCount}</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
            
          </div>
        </>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity:  0; }
          to { opacity: 1; }
        }
        @keyframes slide-down {
          from { 
            opacity: 0; 
            transform: translateY(-8px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        . animate-fade-in {
          animation: fade-in 150ms ease-out;
        }
        .animate-slide-down {
          animation: slide-down 200ms ease-out;
        }
      `}</style>
    </div>
  );
};