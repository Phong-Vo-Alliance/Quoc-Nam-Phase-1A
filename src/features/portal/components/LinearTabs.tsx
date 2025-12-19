import React from "react";
import { motion } from "framer-motion";

export const LinearTabs = ({
  tabs,
  active,
  onChange,
  textClass = "text-sm",
  noWrap = true,
}: {
  tabs: { key: string; label: React.ReactNode }[];
  active: string;
  onChange: (key: string) => void;
  textClass?: string;
  noWrap?: boolean;  
}) => {
  return (
    <div className="relative flex items-center gap-6 border-b border-gray-200">
      {tabs.map((tab) => {
        const isActive = tab.key === active;

        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`
              relative pb-2 select-none transition-all outline-none
              ${noWrap ? "text-nowrap" : ""}
              ${textClass}
              ${
                isActive
                  ? "text-brand-600 font-medium scale-[1.05]"
                  : "text-gray-600 opacity-75"
              }
              focus:outline-none focus:ring-0 focus-visible:ring-0
            `}
          >
            {tab.label}

            {isActive && (
              <motion.div
                layoutId="linear-underline"
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
                className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-brand-600 rounded-full"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
