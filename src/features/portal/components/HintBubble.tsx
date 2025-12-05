import { X } from "lucide-react";
import React, { useEffect } from "react";

interface HintBubbleProps {
  title: string;
  content: React.ReactNode;
  storageKey: string;
  autoCloseMs?: number;
  show: boolean;      // 👈 điều kiện hiển thị (vd: receivedInfos.length > 0)
}

export const HintBubble: React.FC<HintBubbleProps> = ({
  title,
  content,
  storageKey,
  autoCloseMs = 8000,
  show
}) => {
  // chỉ hiển thị nếu show=true và chưa được dismiss
  const [visible, setVisible] = React.useState(() => {
    return show && sessionStorage.getItem(storageKey) !== "hidden";
  });

  // Khi điều kiện show đổi → cập nhật
  useEffect(() => {
    if (show && sessionStorage.getItem(storageKey) !== "hidden") {
      setVisible(true);
    }
  }, [show]);

  // Auto close
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setVisible(false);
      localStorage.setItem(storageKey, "hidden");
    }, autoCloseMs);
    return () => clearTimeout(timer);
  }, [visible, autoCloseMs]);

  if (!visible) return null;

  return (
    <div className="relative">
      {/* Bubble */}
      <div className="relative w-fit max-w-sm rounded-lg bg-white border shadow-lg p-3 text-sm">

        {/* Close */}
        <button
          className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"
          onClick={() => {
            localStorage.setItem(storageKey, "hidden");
            setVisible(false);
          }}
        >
          <X size={14} />
        </button>

        {/* Content */}
        <div className="flex items-start gap-2">
          <span className="text-lg">💡</span>
          <div className="flex-1">
            <div className="font-semibold text-gray-800">{title}</div>
            <div className="text-xs text-gray-600 mt-1 leading-relaxed">{content}</div>
          </div>
        </div>
      </div>

      {/* Arrow */}
      <div className="absolute left-6 -bottom-2 w-0 h-0 
        border-l-[8px] border-r-[8px] border-t-[8px]
        border-l-transparent border-r-transparent border-t-white drop-shadow" />
    </div>
  );
};
