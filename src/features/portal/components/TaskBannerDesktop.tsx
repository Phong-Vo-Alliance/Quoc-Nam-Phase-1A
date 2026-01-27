import React from 'react';
import { Bell, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';

export type TaskBreakdownDesktopItem = {
  workTypeId: string;
  workTypeName: string;
  todoCount: number;
  inProgressCount: number;
};

export type TaskBannerDesktopProps = {
  visible: boolean;
  taskTitle: string;       // "Bắt đầu nhận hàng mới..."
  totalCount: number;      // 3
  latestTaskWorkType?: string; // "Nhận hàng" - worktype của latest task
  allWorkTypeBreakdown: TaskBreakdownDesktopItem[];  // Tất cả breakdown theo worktype
  onViewWorkType?: (workTypeId: string) => void;  // Navigate to specific WorkType
};

export const TaskBannerDesktop: React.FC<TaskBannerDesktopProps> = ({
  visible,
  taskTitle,
  totalCount,
  latestTaskWorkType,
  allWorkTypeBreakdown,
  onViewWorkType,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  // Auto-close when component unmounts or becomes invisible
  React.useEffect(() => {
    if (!visible) {
      setExpanded(false);
    }
  }, [visible]);

  // Animation on totalCount change (gentle bounce)
  const [shouldBounce, setShouldBounce] = React.useState(false);
  const prevCountRef = React.useRef(totalCount);

  React.useEffect(() => {
    if (totalCount > prevCountRef.current) {
      setShouldBounce(true);
      const timer = setTimeout(() => setShouldBounce(false), 600);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = totalCount;
  }, [totalCount]);

  // ✅ Bell ring animation on mount and count change
  const [shouldRing, setShouldRing] = React.useState(false);

  React.useEffect(() => {
    if (visible) {
      // Ring on mount
      setShouldRing(true);
      const timer = setTimeout(() => setShouldRing(false), 800);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  React.useEffect(() => {
    // Ring when count increases
    if (totalCount > prevCountRef.current && visible) {
      setShouldRing(true);
      const timer = setTimeout(() => setShouldRing(false), 800);
      return () => clearTimeout(timer);
    }
  }, [totalCount, visible]);

  if (!visible) return null;

  return (
    <div className="relative mx-4 mt-3 mb-2">
      {/* Collapsed Banner */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="
          flex items-center justify-between w-full
          px-4 py-3
          rounded-xl
          border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50
          hover:from-amber-100 hover:to-orange-100
          active:from-amber-100 active:to-orange-100
          transition-all duration-200
          shadow-md hover:shadow-lg
          relative z-10
          animate-slide-down
        "
        aria-expanded={expanded}
        aria-label="Xem chi tiết công việc"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 ${shouldRing ? 'animate-bell-ring' : ''}`}>
            <Bell className="h-4 w-4 text-amber-700" />
          </div>

          {latestTaskWorkType && (
            <span className="text-sm font-bold text-gray-900 shrink-0">
              {latestTaskWorkType}:
            </span>
          )}

          <span className="text-sm text-gray-700 truncate font-medium">
            {taskTitle}
          </span>
        </div>

        <div className={`flex rounded-full border-2 border-amber-400 bg-white px-3 py-1.5 items-center gap-2 shrink-0 shadow-sm ${shouldBounce ? 'animate-bounce-gentle' : ''}`}>
          <span className="text-sm font-bold text-amber-800">
            {totalCount}
          </span>

          {expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-600" />
          )}
        </div>
      </button>

      {/* Expanded Detail (No Backdrop for Desktop) */}
      {expanded && allWorkTypeBreakdown.length > 0 && (
        <div
          className="
            absolute left-0 right-0 top-full mt-2
            bg-white rounded-xl shadow-xl
            border-2 border-gray-200
            z-50
            animate-slide-down
            overflow-hidden
            max-h-[60vh] overflow-y-auto
          "
          role="region"
          aria-label="Chi tiết công việc"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-slate-50 border-b-2 border-gray-200">
            <h3 className="text-sm font-bold text-gray-800">Công việc theo loại</h3>
            <p className="text-xs text-gray-600 mt-0.5">Nhấn "Xem chi tiết" để chuyển đến tab tương ứng</p>
          </div>

          {/* Content */}
          <div className="px-4 py-3 space-y-3">
            {allWorkTypeBreakdown.map((item) => {
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
                    flex items-center justify-between
                    pb-3 border-b border-gray-100 last:border-b-0
                    hover:bg-gray-50 rounded-lg px-2 py-2 -mx-2
                    transition-colors
                  "
                >
                  {/* Left: WorkType info */}
                  <div className="flex-1">
                    <div className="text-sm font-bold text-gray-900 mb-1">
                      {item.workTypeName}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      {item.inProgressCount > 0 && (
                        <span className="inline-flex items-center gap-1 font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                          {item.inProgressCount} đang làm
                        </span>
                      )}
                      {item.todoCount > 0 && (
                        <span className="inline-flex items-center gap-1 font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                          {item.todoCount} chưa xử lý
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Action button */}
                  {onViewWorkType && (
                    <button
                      onClick={() => {
                        setExpanded(false);
                        onViewWorkType(item.workTypeId);
                      }}
                      className="
                        shrink-0 flex items-center gap-1.5
                        px-4 py-2.5 rounded-lg
                        text-sm font-bold text-white
                        bg-gradient-to-r from-brand-500 to-brand-600
                        hover:from-brand-600 hover:to-brand-700
                        active:from-brand-700 active:to-brand-800
                        shadow-md hover:shadow-lg
                        transition-all ml-4
                      "
                    >
                      <span>Xem chi tiết</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
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
        @keyframes bounce-gentle {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        @keyframes bell-ring {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(15deg); }
          20% { transform: rotate(-12deg); }
          30% { transform: rotate(15deg); }
          40% { transform: rotate(-12deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(-8deg); }
          70% { transform: rotate(6deg); }
          80% { transform: rotate(-4deg); }
          90% { transform: rotate(2deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-slide-down {
          animation: slide-down 250ms ease-out;
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 600ms ease-in-out;
        }
        .animate-bell-ring {
          animation: bell-ring 800ms ease-in-out;
          transform-origin: top center;
        }
      `}</style>
    </div>
  );
};
