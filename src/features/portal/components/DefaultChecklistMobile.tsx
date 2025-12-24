import React from "react";
import { ChevronLeft, ClipboardList, SquarePen, Images, FileText } from "lucide-react";
import { MobileAccordion } from "./MobileAccordion";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type MinimalMember = { id: string; name: string; role?:  "Leader" | "Member" };

export const DefaultChecklistMobile: React. FC<{
  open: boolean;
  onBack: () => void;
  
  // Context
  groupId?: string;
  groupName?: string;
  workTypeName?: string;
  selectedWorkTypeId?: string;
  viewMode?: "lead" | "staff";
  
  // Members (for leader only)
  members?: MinimalMember[];
  
}> = ({
  open,
  onBack,
  groupId,
  groupName = "Nhóm",
  workTypeName = "—",
  selectedWorkTypeId,
  viewMode = "staff",
  members = [],  
}) => {
  
  if (!open) return null;

  return (
    <>
      <div className="absolute inset-0 z-50 bg-white flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 px-3 py-3">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-brand-100 active:bg-brand-300 transition"
            >
              <ChevronLeft className="h-5 w-5 text-brand-600" />
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-800 truncate">
                Checklist Mặc Định
              </div>
              <div className="text-xs text-gray-500 truncate">
                {groupName} • <span className="text-brand-600">{workTypeName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 bg-gray-50">        
          {/* Công việc của tôi */}
          <MobileAccordion 
            title="Công việc của tôi" 
            icon={<ClipboardList className="h-4 w-4 text-emerald-600" />}
            defaultOpen={true}
          >
            <div className="text-sm text-gray-500" />
            
          </MobileAccordion>
          

          {/* Bottom spacing for safe area */}
          <div className="h-[calc(env(safe-area-inset-bottom,0px)+1rem)]" />
        </div>
      </div>
      
    </>
  );
};