import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';


export const RightAccordion: React.FC<{ title: React.ReactNode; icon?: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="
      rounded-2xl">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm rounded-tl-2xl rounded-tr-2xl"
      >
        <span className="font-semibold flex items-center gap-2">
          {icon}
          {title}
        </span>
        <span className={`transition-transform ${open ? 'rotate-0' : '-rotate-90'}`}>
          <ChevronDown size={14} />
        </span>
      </button>
      {open && <div className="border-t border-emerald-50 p-3">{children}</div>}
    </div>
  );
};
