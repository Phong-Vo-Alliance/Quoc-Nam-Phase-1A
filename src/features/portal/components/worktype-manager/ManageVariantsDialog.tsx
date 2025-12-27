import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Pencil, Star, AlertCircle } from "lucide-react";
import { AddEditVariantDialog } from "./AddEditVariantDialog";
import type { WorkType, ChecklistVariant } from "../../types";

interface ManageVariantsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workType: WorkType;
  onSave: (variants: ChecklistVariant[]) => void;
}

export const ManageVariantsDialog: React.FC<ManageVariantsDialogProps> = ({
  open,
  onOpenChange,
  workType,
  onSave,
}) => {
  const [variants, setVariants] = useState<ChecklistVariant[]>([]);
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ChecklistVariant | null>(null);

  // Initialize variants from workType
  useEffect(() => {
    if (open) {
      setVariants(workType.checklistVariants ??  []);
    }
  }, [open, workType]);

  const handleAddNew = () => {
    setEditingVariant(null);
    setShowAddEdit(true);
  };

  const handleEdit = (variant: ChecklistVariant) => {
    setEditingVariant(variant);
    setShowAddEdit(true);
  };

  const handleSaveVariant = (name: string, isDefault: boolean) => {
    if (editingVariant) {
      // Edit existing
      setVariants((prev) =>
        prev.map((v) => {
          if (v.id === editingVariant.id) {
            return { ...v, name, isDefault };
          }
          // If setting new default, unset others
          if (isDefault && v.isDefault) {
            return { ...v, isDefault: false };
          }
          return v;
        })
      );
    } else {
      // Add new
      const newVariant: ChecklistVariant = {
        id: "var_" + Date.now().toString(36),
        name,
        isDefault:  isDefault || variants.length === 0, // First variant is always default
      };

      setVariants((prev) => {
        // If setting as default, unset others
        if (newVariant.isDefault) {
          return [... prev. map((v) => ({ ...v, isDefault: false })), newVariant];
        }
        return [...prev, newVariant];
      });
    }
    setShowAddEdit(false);
    setEditingVariant(null);
  };

  const handleSetDefault = (variantId: string) => {
    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        isDefault: v.id === variantId,
      }))
    );
  };

  const handleSaveAll = () => {
    // Validate:  must have at least 1 variant
    if (variants.length === 0) {
      return;
    }

    // Ensure exactly 1 default
    const defaultCount = variants.filter((v) => v.isDefault).length;
    if (defaultCount === 0) {
      // Set first as default
      const updated = variants.map((v, idx) => ({
        ...v,
        isDefault: idx === 0,
      }));
      onSave(updated);
    } else {
      onSave(variants);
    }
  };

  const canSave = variants.length > 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[550px] max-h-[80vh] flex flex-col p-0">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>
              Quản lý Dạng Checklist - {workType.name}
            </DialogTitle>
          </DialogHeader>

          {/* Description */}
          <div className="px-6 py-3 bg-gray-50 border-b">
            <p className="text-sm text-gray-600">
              Dạng checklist giúp bạn tạo nhiều bộ checklist mặc định khác nhau
              cho cùng một loại việc. 
            </p>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-6 py-4 space-y-3">
              {variants.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400 mb-4">
                    Chưa có dạng checklist nào
                  </p>
                  <Button onClick={handleAddNew} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm dạng checklist đầu tiên
                  </Button>
                </div>
              ) : (
                <>
                  {variants.map((variant) => (
                    <div
                      key={variant. id}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Default star */}
                        <button
                          onClick={() => handleSetDefault(variant.id)}
                          className={`shrink-0 p-1 rounded transition-colors ${
                            variant. isDefault
                              ? "text-amber-500"
                              : "text-gray-300 hover:text-amber-400"
                          }`}
                          title={
                            variant.isDefault
                              ? "Dạng mặc định"
                              :  "Đặt làm mặc định"
                          }
                        >
                          <Star
                            className="h-4 w-4"
                            fill={variant.isDefault ? "currentColor" : "none"}
                          />
                        </button>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {variant.name}
                          </p>
                          {variant.description && (
                            <p className="text-xs text-gray-500 truncate">
                              {variant.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Edit button */}
                      <button
                        onClick={() => handleEdit(variant)}
                        className="shrink-0 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  ))}

                  {/* Add new button */}
                  <button
                    onClick={handleAddNew}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-gray-300 text-gray-600 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Thêm dạng checklist
                    </span>
                  </button>
                </>
              )}
            </div>
          </ScrollArea>

          {/* Info */}
          <div className="px-6 py-3 border-t bg-gray-50">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Lưu ý:</strong>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  <li>Nên có ít nhất 1 dạng checklist</li>
                  <li>
                    Dạng mặc định (<Star className="inline h-3 w-3" />) sẽ được
                    dùng khi tạo task mới
                  </li>
                  <li>Nhấn vào <Star className="inline h-3 w-3" /> để đổi dạng mặc định</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleSaveAll} disabled={!canSave}>
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Variant Dialog */}
      <AddEditVariantDialog
        open={showAddEdit}
        onOpenChange={setShowAddEdit}
        variant={editingVariant}
        existingNames={variants
          .filter((v) => v.id !== editingVariant?.id)
          .map((v) => v.name)}
        isFirstVariant={variants.length === 0}
        onSave={handleSaveVariant}
      />
    </>
  );
};