import React, { useState } from "react";
import { ChevronLeft, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WorkTypeCard } from "./WorkTypeCard";
import { AddEditWorkTypeDialog } from "./AddEditWorkTypeDialog";
import { ManageVariantsDialog } from "./ManageVariantsDialog";
import type { GroupChat, WorkType, ChecklistVariant } from "../../types";

interface WorkTypeEditorProps {
  group: GroupChat;
  onBack: () => void;
  onSave: (updatedWorkTypes: WorkType[]) => void;
  onClose:  () => void;
}

export const WorkTypeEditor: React.FC<WorkTypeEditorProps> = ({
  group,
  onBack,
  onSave,
  onClose,
}) => {
  const [workTypes, setWorkTypes] = useState<WorkType[]>(
    group.workTypes ??  []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editingWorkType, setEditingWorkType] = useState<WorkType | null>(null);
  const [managingVariantsFor, setManagingVariantsFor] = useState<WorkType | null>(null);

  const filteredWorkTypes = workTypes.filter((wt) =>
    wt.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNew = () => {
    setEditingWorkType(null);
    setShowAddEdit(true);
  };

  const handleEdit = (wt: WorkType) => {
    setEditingWorkType(wt);
    setShowAddEdit(true);
  };

  // File: WorkTypeEditor.tsx (Part 4)
// ...  (keep everything else the same)

  const handleSaveWorkType = (name: string) => {
    if (editingWorkType) {
      // Edit existing - update name only (keep existing key)
      setWorkTypes((prev) =>
        prev.map((wt) =>
          wt.id === editingWorkType.id ? { ...wt, name } : wt
        )
      );
    } else {
      // Add new - generate key from name
      const generateKey = (str: string): string => {
        return str
          .toLowerCase()
          .normalize("NFD") // Decompose Vietnamese chars
          .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
          .replace(/đ/g, "d")
          .replace(/\s+/g, "_")
          .replace(/[^a-z0-9_]/g, "");
      };

      const newWorkType: WorkType = {
        id: "wt_" + Date.now().toString(36),
        key: generateKey(name), // "Nhận hàng" → "nhan_hang"
        name,
        icon: undefined,
        color: undefined,
        checklistVariants: [],
      };
      setWorkTypes((prev) => [...prev, newWorkType]);
    }
    setShowAddEdit(false);
    setEditingWorkType(null);
  };

  const handleSaveVariants = (workTypeId: string, variants: ChecklistVariant[]) => {
    setWorkTypes((prev) =>
      prev.map((wt) =>
        wt.id === workTypeId ?  { ...wt, checklistVariants: variants } : wt
      )
    );
    setManagingVariantsFor(null);
  };

  const handleSaveAll = () => {
    onSave(workTypes);
  };

  return (
    <>
      <div className="flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              Quản lý Loại Việc
            </h2>
          </div>
          {/* <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button> */}
        </div>

        {/* Group Info */}
        <div className="px-6 py-3 bg-gray-50 border-b">
          <p className="text-sm text-gray-600">
            Nhóm:  <span className="font-medium text-gray-900">{group. name}</span>
          </p>
        </div>

        {/* Search + Add */}
        <div className="px-6 py-4 border-b space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e. target.value)}
                placeholder="Tìm loại việc..."
                className="pl-9"
              />
            </div>
            <Button onClick={handleAddNew} className="shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Thêm
            </Button>
          </div>
        </div>

        {/* WorkType List */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 py-4 space-y-3">
            {filteredWorkTypes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-400 mb-4">
                  {searchQuery
                    ? "Không tìm thấy loại việc phù hợp"
                    : "Chưa có loại việc nào"}
                </p>
                {! searchQuery && (
                  <Button onClick={handleAddNew} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm loại việc đầu tiên
                  </Button>
                )}
              </div>
            ) : (
              filteredWorkTypes.map((wt) => (
                <WorkTypeCard
                  key={wt.id}
                  workType={wt}
                  onEdit={() => handleEdit(wt)}
                  onManageVariants={() => setManagingVariantsFor(wt)}
                />
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onBack}>
            Quay lại
          </Button>
          <Button onClick={handleSaveAll}>
            Lưu thay đổi
          </Button>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <AddEditWorkTypeDialog
        open={showAddEdit}
        onOpenChange={setShowAddEdit}
        workType={editingWorkType}
        existingNames={workTypes
          .filter((wt) => wt.id !== editingWorkType?.id)
          .map((wt) => wt.name)}
        onSave={handleSaveWorkType}
      />

      {/* Manage Variants Dialog */}
      {managingVariantsFor && (
        <ManageVariantsDialog
          open={!! managingVariantsFor}
          onOpenChange={(open) => !open && setManagingVariantsFor(null)}
          workType={managingVariantsFor}
          onSave={(variants) => handleSaveVariants(managingVariantsFor.id, variants)}
        />
      )}
    </>
  );
};