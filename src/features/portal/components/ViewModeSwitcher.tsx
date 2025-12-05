import React from "react";
import { Briefcase, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  viewMode: "lead" | "staff";
  setViewMode: (v: "lead" | "staff") => void;
}

export const ViewModeSwitcher: React.FC<Props> = ({ viewMode, setViewMode }) => {
  const toggle = () => setViewMode(viewMode === "lead" ? "staff" : "lead");

  return (
    <button
      onClick={toggle}
      title={`Chuyển sang chế độ ${viewMode === "lead" ? "Nhân viên" : "Trưởng phòng"}`}
      className={cn(
        "fixed bottom-4 right-4 flex items-center rounded-full shadow-lg transition px-2 py-2 text-sm font-medium border",
        "bg-white hover:bg-brand-50 border-brand-300 text-brand-700"
      )}
    >
      {viewMode === "lead" ? (
        <>
          <Briefcase size={16} className="text-brand-600" />          
        </>
      ) : (
        <>
          <Users size={16} className="text-brand-600" />          
        </>
      )}
    </button>
  );
};
