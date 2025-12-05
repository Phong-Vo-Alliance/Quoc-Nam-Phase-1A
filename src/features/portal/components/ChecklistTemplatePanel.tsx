import React from "react";
import type { ChecklistTemplateItem } from "../types";
import { Plus, X } from "lucide-react";

type Props = {
  workTypeName: string;
  template: ChecklistTemplateItem[];
  onChange: (next: ChecklistTemplateItem[]) => void;
  onClose: () => void;
};

export const ChecklistTemplatePanel: React.FC<Props> = ({
  workTypeName,
  template,
  onChange,
  onClose,
}) => {
  const [items, setItems] = React.useState<ChecklistTemplateItem[]>(template);

  const handleChange = (id: string, label: string) => {
    setItems((list) => list.map((it) => (it.id === id ? { ...it, label } : it)));
  };

  const handleAdd = () => {
    setItems((list) => [
      ...list,
      { id: "tpl_" + Date.now().toString(36), label: "" },
    ]);
  };

  const handleRemove = (id: string) => {
    setItems((list) => list.filter((it) => it.id !== id));
  };

  const handleSave = () => {
    onChange(items);
    onClose();
  };

  return (
    <div className="mt-3 border border-emerald-100 rounded-xl bg-emerald-50/50 p-3 space-y-3">
      <div className="text-[12px] font-semibold text-emerald-800">
        Checklist mặc định cho loại việc: {workTypeName}
      </div>

      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-2">
            <input
              className="flex-1 rounded border border-emerald-200 px-2 py-1 text-[11px] bg-white"
              value={it.label}
              onChange={(e) => handleChange(it.id, e.target.value)}
              placeholder="Tên checklist..."
            />
            <button
              className="text-rose-600 hover:text-rose-700"
              onClick={() => handleRemove(it.id)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:underline"
        >
          <Plus className="w-3 h-3" /> Thêm mục
        </button>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="text-[11px] text-gray-500 hover:underline"
        >
          Hủy
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1 rounded bg-emerald-600 text-white text-[11px] hover:bg-emerald-700"
        >
          Lưu
        </button>
      </div>
    </div>
  );
};
