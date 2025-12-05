import React from 'react';
import type { ToastKind, ToastMsg } from '../types';


const toastStyle: Record<ToastKind, string> = {
  success: 'bg-emerald-600 text-white',
  info: 'bg-brand-600 text-white',
  warning: 'bg-amber-600 text-white',
  error: 'bg-rose-600 text-white',
};


export const ToastContainer: React.FC<{
  toasts: ToastMsg[];
  onClose: (id: string) => void;
}> = ({ toasts, onClose }) => (
  <div className="fixed top-4 right-4 z-[9999] space-y-2">
    {toasts.map((t) => (
      <div key={t.id} className={"flex items-center gap-3 rounded-lg px-3 py-2 shadow-lg " + toastStyle[t.kind]}>
        <span className="text-base">
          {t.kind === "success" && "✔️"}
          {t.kind === "info" && "ℹ️"}
          {t.kind === "warning" && "⚠️"}
          {t.kind === "error" && "⛔"}
        </span>
        <span className="text-sm">{t.msg}</span>
        <button
          className="ml-1 px-2 py-0.5 rounded-md bg-white/20 text-white text-xs hover:bg-white/30 transition"
          onClick={() => onClose(t.id)}
        >
          ✕
        </button>
      </div>
    ))}
  </div>
);