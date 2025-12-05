import React from "react";
import type { ChecklistItem } from "../types";
import { Plus, X } from "lucide-react";

type EditorProps = {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
};

export const TaskChecklistEditor: React.FC<EditorProps> = ({ items, onChange }) => {
  const update = (id: string, label: string) => {
    onChange(items.map((c) => (c.id === id ? { ...c, label } : c)));
  };

  const remove = (id: string) => {
    onChange(items.filter((c) => c.id !== id));
  };

  const add = () => {
    onChange([
      ...items,
      { id: "c_" + Date.now().toString(36), label: "", done: false },
    ]);
  };

  return (
    <div className="mt-2 space-y-1">
      {items.map((c) => (
        <div key={c.id} className="flex items-center gap-2 text-[12px]">
          <input
            className="flex-1 rounded border px-2 py-1 text-[11px]"
            value={c.label}
            onChange={(e) => update(c.id, e.target.value)}
          />
          <button onClick={() => remove(c.id)} className="text-rose-600">
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}

      <button
        onClick={add}
        className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:underline"
      >
        <Plus className="w-3 h-3" /> Thêm mục
      </button>
    </div>
  );
};

type ViewerProps = {
  items: ChecklistItem[];
  onToggle: (id: string, done: boolean) => void;
};

export const TaskChecklistViewer: React.FC<ViewerProps> = ({
  items,
  onToggle,
}) => {
  return (
    <div className="mt-2 space-y-1">
      {items.map((c) => (
        <div key={c.id} className="flex items-start gap-2 text-[12px]">
          {/* check icon */}
          <button
            onClick={() => onToggle(c.id, !c.done)}
            className="h-4 w-4 flex items-center justify-center rounded-full border border-emerald-300"
          >
            {c.done ? "✔" : ""}
          </button>

          <span
            className={c.done ? "line-through text-gray-400" : "text-gray-700"}
          >
            {c.label}
          </span>
        </div>
      ))}
    </div>
  );
};
