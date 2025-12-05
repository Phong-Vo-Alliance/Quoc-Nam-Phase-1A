import { X } from "lucide-react";
import React, { useEffect } from "react";

interface HintBannerProps {
  title: string;
  content: React.ReactNode;
  storageKey: string;
  autoCloseMs?: number;
}

export const HintBanner: React.FC<HintBannerProps> = ({
  title,
  content,
  storageKey,
  autoCloseMs = 8000,
}) => {
  const [visible, setVisible] = React.useState(() => {
    return sessionStorage.getItem(storageKey) !== "hidden";
  });

  // Auto-dismiss after X ms
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem(storageKey, "hidden");
    }, autoCloseMs);
    return () => clearTimeout(timer);
  }, [visible, autoCloseMs]);

  if (!visible) return null;

  return (
    <div className="relative rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm shadow-sm mb-3">
      {/* Close button */}
      <button
        className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
        onClick={() => {
          setVisible(false);
          localStorage.setItem(storageKey, "hidden");
        }}
      >
        <X size={14} />
      </button>

      <div className="flex items-start gap-2">
        <span className="text-sky-600 text-lg">💡</span>

        <div className="flex-1">
          <div className="font-semibold text-sky-700">{title}</div>

          <div className="text-xs text-sky-700 mt-1 leading-relaxed">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
};
