import { motion } from "framer-motion";
import React from "react";

export const SegmentedTabs = ({
  tabs,
  active,
  onChange,
  noWrap = true,
  textClass = "text-sm",
}: {
  tabs: { key: string; label: string }[];
  active: string;
  onChange: (key: string) => void;
  noWrap?: boolean;
  textClass?: string;
}) => {
  const activeIndex = tabs.findIndex((t) => t.key === active);

  return (
    <div className="relative flex items-center gap-1 bg-gray-100 p-1 rounded-xl overflow-hidden">
      <motion.div
        layout
        layoutId="segmented-highlight"
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="absolute top-1 bottom-1 rounded-lg shadow-sm bg-brand-600"
        style={{
          left: `calc(${activeIndex} * (100% / ${tabs.length}) + 4px)`,
          width: `calc((100% / ${tabs.length}) - 8px)`,
        }}
      />

      {tabs.map((tab) => {
        const isActive = tab.key === active;

        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`
              relative z-10 flex-1 px-3 py-1.5 rounded-lg transition-all select-none outline-none
              ${noWrap ? "text-nowrap" : ""}
              ${textClass}
              ${
                isActive
                  ? "text-white font-semibold bg-brand-500 scale-[1.06]"
                  : "text-gray-600 opacity-80"
              }
              focus:outline-none focus:ring-0 focus-visible:ring-0
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
