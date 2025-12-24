import React from "react";
import { 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Edit2,
  ChevronDown,
} from "lucide-react";
import type { 
  ChecklistTemplateItem, 
  ChecklistVariant, 
  ChecklistTemplateMap 
} from "../types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type MinimalMember = { id: string; name: string; role?:  "Leader" | "Member" };

export const DefaultChecklistMobile: React.FC<{
  open: boolean;
  onBack: () => void;
  
  // Context
  groupId?:  string;
  groupName?: string;
  workTypeName?:  string;
  selectedWorkTypeId?: string;
  viewMode?: "lead" | "staff";
  
  // Members (for leader only)
  members?: MinimalMember[];

  // 🆕 NEW: Checklist template data
  checklistTemplates?: ChecklistTemplateMap;
  checklistVariants?: ChecklistVariant[];
  
  // 🆕 NEW: Callbacks
  onUpdateChecklistTemplate?: (
    workTypeId: string,
    variantId: string,
    items: ChecklistTemplateItem[]
  ) => void;
}> = ({
  open,
  onBack,
  groupId,
  groupName = "Nhóm",
  workTypeName = "—",
  selectedWorkTypeId,
  viewMode = "staff",
  members = [],
  checklistTemplates = {},
  checklistVariants = [],
  onUpdateChecklistTemplate,
}) => {
  // 🆕 State for variant selection
  const [selectedVariantId, setSelectedVariantId] = React.useState<string>(
    checklistVariants. find((v) => v.isDefault)?.id || 
    checklistVariants[0]?.id || 
    ""
  );

  // 🆕 State for checklist items
  const [items, setItems] = React.useState<ChecklistTemplateItem[]>([]);

  // 🆕 Bottom sheets for mobile
  const [showVariantSheet, setShowVariantSheet] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<ChecklistTemplateItem | null>(null);
  const [newLabel, setNewLabel] = React. useState("");
  const [showEditSheet, setShowEditSheet] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<ChecklistTemplateItem | null>(null);

  // 🆕 Load template when variant changes
  React.useEffect(() => {
    if (! selectedWorkTypeId || !selectedVariantId) return;
    
    const template = checklistTemplates[selectedWorkTypeId]?.[selectedVariantId] || [];
    setItems(template);
  }, [selectedWorkTypeId, selectedVariantId, checklistTemplates]);

  // 🆕 Reset variant when work type changes
  React.useEffect(() => {
    const defaultVariant = 
      checklistVariants.find((v) => v.isDefault) || 
      checklistVariants[0];
    
    if (defaultVariant) {
      setSelectedVariantId(defaultVariant. id);
    }
  }, [selectedWorkTypeId, checklistVariants]);

  // 🆕 Save changes
  const handleSave = () => {
    if (!selectedWorkTypeId || ! selectedVariantId) return;
    
    // Filter out empty items
    const validItems = items. filter((item) => item.label.trim() !== "");
    
    onUpdateChecklistTemplate?.(selectedWorkTypeId, selectedVariantId, validItems);
    onBack();
  };

  // 🆕 Add new item
  const handleAddItem = () => {
    setEditingItem({ id: "new", label: "" });
    setNewLabel("");
    setShowEditSheet(true);
  };

  // 🆕 Edit existing item
  const handleEditItem = (item: ChecklistTemplateItem) => {
    setEditingItem(item);
    setNewLabel(item.label);
    setShowEditSheet(true);
  };

  // 🆕 Delete item
  const handleDeleteItem = (item: ChecklistTemplateItem) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  // 🆕 Confirm edit
  const confirmEdit = () => {
    if (!newLabel.trim()) return;

    if (editingItem?. id === "new") {
      // Add new
      const newItem: ChecklistTemplateItem = {
        id: "tpl_" + Date.now().toString(36),
        label: newLabel.trim(),
      };
      setItems((prev) => [...prev, newItem]);
    } else {
      // Edit existing
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItem?. id
            ? { ...item, label: newLabel.trim() }
            : item
        )
      );
    }

    setShowEditSheet(false);
    setEditingItem(null);
    setNewLabel("");
  };

  // 🆕 Confirm delete
  const confirmDelete = () => {
    if (itemToDelete) {
      setItems((prev) => prev.filter((item) => item.id !== itemToDelete. id));
    }
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  // Get current variant name
  const currentVariant = checklistVariants. find((v) => v.id === selectedVariantId);
  const currentVariantName = currentVariant?.name || "—";

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

            {/* Save button */}
            <button
              onClick={handleSave}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium active:bg-emerald-700"
            >
              Lưu
            </button>
          </div>

          {/* Variant selector */}
          {checklistVariants. length > 0 && (
            <div className="px-3 pb-3">
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                Dạng checklist
              </label>
              <button
                onClick={() => setShowVariantSheet(true)}
                className="mt-1 w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 active:bg-gray-50"
              >
                <span className="truncate">{currentVariantName}</span>
                <ChevronDown className="h-4 w-4 text-gray-400 shrink-0 ml-2" />
              </button>
            </div>
          )}
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2 bg-gray-50">
          {items.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400">
              Chưa có mục nào.  Nhấn "Thêm mục" để bắt đầu.
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-lg px-3 py-3 bg-white border border-gray-200 active:bg-gray-50"
              >
                {/* Order number */}
                <span className="flex-shrink-0 text-xs font-medium text-gray-400 w-6">
                  {index + 1}. 
                </span>

                {/* Label */}
                <span className="flex-1 text-sm text-gray-800 min-w-0 truncate">
                  {item.label}
                </span>

                {/* Actions */}
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleEditItem(item)}
                    className="p-1.5 rounded-md bg-white border border-gray-200 active:bg-gray-100"
                  >
                    <Edit2 className="w-3. 5 h-3.5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item)}
                    className="p-1.5 rounded-md bg-white border border-rose-200 active:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Add button */}
          <button
            onClick={handleAddItem}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-emerald-300 text-emerald-700 active:bg-emerald-50"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Thêm mục</span>
          </button>

          {/* Bottom spacing for safe area */}
          <div className="h-[calc(env(safe-area-inset-bottom,0px)+1rem)]" />
        </div>
      </div>

      {/* 🆕 Bottom Sheet:  Variant Selector */}
      <Sheet open={showVariantSheet} onOpenChange={setShowVariantSheet}>
        <SheetContent side="bottom" className="rounded-t-2xl p-0 w-[92vw] max-w-[430px] left-1/2 -translate-x-1/2 right-auto top-auto">
          <SheetHeader className="px-4 py-4 border-b">
            <SheetTitle className="text-sm">Chọn dạng checklist</SheetTitle>
          </SheetHeader>

          <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
            <div className="space-y-2">
              {checklistVariants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => {
                    setSelectedVariantId(variant. id);
                    setShowVariantSheet(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                    selectedVariantId === variant.id
                      ? "bg-brand-50 border-brand-300 text-brand-700 font-medium"
                      : "bg-white border-gray-200 text-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{variant.name}</span>
                    {variant.isDefault && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                        Mặc định
                      </span>
                    )}
                  </div>
                  {variant.description && (
                    <p className="text-xs text-gray-500 mt-1">{variant.description}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* 🆕 Bottom Sheet: Add/Edit Item */}
      <Sheet open={showEditSheet} onOpenChange={setShowEditSheet}>
        <SheetContent side="bottom" className="rounded-t-2xl p-0 w-[92vw] max-w-[430px] left-1/2 -translate-x-1/2 right-auto top-auto">
          <SheetHeader className="px-4 py-4 border-b">
            <SheetTitle className="text-sm">
              {editingItem?.id === "new" ? "Thêm mục checklist" : "Chỉnh sửa mục"}
            </SheetTitle>
          </SheetHeader>

          <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm"
              value={newLabel}
              autoFocus
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Nhập nội dung mục..."
            />

            <div className="flex gap-3 mt-4">
              <button
                className="flex-1 py-3 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium active:bg-gray-200"
                onClick={() => {
                  setShowEditSheet(false);
                  setEditingItem(null);
                  setNewLabel("");
                }}
              >
                Huỷ
              </button>
              <button
                className="flex-1 py-3 rounded-lg bg-emerald-600 text-white text-sm font-medium active:bg-emerald-700 disabled:opacity-50"
                disabled={!newLabel.trim()}
                onClick={confirmEdit}
              >
                Lưu
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* 🆕 Bottom Sheet: Delete Confirmation */}
      <Sheet open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <SheetContent side="bottom" className="rounded-t-2xl p-0 w-[92vw] max-w-[430px] left-1/2 -translate-x-1/2 right-auto top-auto">
          <SheetHeader className="px-4 py-4 border-b">
            <SheetTitle className="text-sm">Xác nhận xóa</SheetTitle>
          </SheetHeader>

          <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
            <p className="text-sm text-gray-600 mb-4">
              Bạn có chắc muốn xóa mục{" "}
              <span className="font-semibold">"{itemToDelete?.label}"</span>?
            </p>

            <div className="flex gap-3">
              <button
                className="flex-1 py-3 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium active:bg-gray-200"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setItemToDelete(null);
                }}
              >
                Huỷ
              </button>
              <button
                className="flex-1 py-3 rounded-lg bg-rose-600 text-white text-sm font-medium active:bg-rose-700"
                onClick={confirmDelete}
              >
                Xóa
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};