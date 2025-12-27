import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { GroupSelector } from "./worktype-manager/GroupSelector";
import { WorkTypeEditor } from "./worktype-manager/WorkTypeEditor";
import type { GroupChat, WorkType } from "../types";
import { cn } from "@/lib/utils";

interface WorkTypeManagerDialogProps {
  open: boolean;
  onOpenChange: (open:  boolean) => void;
  groups:  GroupChat[]; // Leader's groups only
  onSave: (groupId: string, updatedWorkTypes: WorkType[]) => void;
}

export const WorkTypeManagerDialog:  React.FC<WorkTypeManagerDialogProps> = ({
  open,
  onOpenChange,
  groups,
  onSave,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedGroup, setSelectedGroup] = useState<GroupChat | null>(null);

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep(1);
        setSelectedGroup(null);
      }, 200); // Wait for close animation
    }
  }, [open]);

  const handleSelectGroup = (group: GroupChat) => {
    setSelectedGroup(group);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedGroup(null);
  };

  const handleSave = (updatedWorkTypes: WorkType[]) => {
    if (selectedGroup) {
      onSave(selectedGroup.id, updatedWorkTypes);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "overflow-hidden p-0 transition-all duration-200",
          step === 1 ?  "max-w-[500px]" : "max-w-[700px]"
        )}
      >
        {step === 1 ?  (
          <GroupSelector
            groups={groups}
            onSelect={handleSelectGroup}
            onClose={() => onOpenChange(false)}
          />
        ) : selectedGroup ? (
          <WorkTypeEditor
            group={selectedGroup}
            onBack={handleBack}
            onSave={handleSave}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};