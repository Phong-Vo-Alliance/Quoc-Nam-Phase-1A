import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export const MobileAccordion: React. FC<{
  title: string;
  icon?: React.ReactNode;
  children: React. ReactNode;
  defaultOpen?:  boolean;
  badge?: React.ReactNode; // Optional badge (số lượng items, etc.)
}> = ({ title, icon, children, defaultOpen = false, badge }) => {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header - Clickable */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-50 active:bg-gray-100 transition"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {icon}
          <span className="text-sm font-semibold text-gray-800 truncate">{title}</span>
          {badge && <span className="ml-auto">{badge}</span>}
        </div>
        <div className="ml-2 flex-shrink-0">
          {open ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </button>

      {/* Content - Collapsible */}
      {open && (
        <div
          className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          <div className="p-3 pt-0 border-t border-gray-100">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};