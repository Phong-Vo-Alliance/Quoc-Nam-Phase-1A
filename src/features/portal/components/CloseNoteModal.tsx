import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';


export const CloseNoteModal: React.FC<{
  open: boolean;
  note: string;
  setNote: (v: string) => void;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}> = ({ open, note, setNote, onConfirm, onOpenChange }) => {
  const inputCls =
    'rounded-lg border px-3 py-2 text-sm border-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-sky-300 w-full';
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ghi chú khi đóng công việc</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <input value={note} onChange={(e) => setNote(e.target.value)} className={inputCls} placeholder="Nhập ghi chú (không bắt buộc)" />
        </div>
        <DialogFooter className="mt-4 flex justify-end gap-2">
          <button className="rounded-lg border px-3 py-1 bg-white text-brand-700 border-brand-200 hover:bg-brand-50" onClick={() => onOpenChange(false)}>
            Hủy
          </button>
          <button className="rounded-lg border px-3 py-1 bg-brand-600 text-white border-sky-600 shadow-sm" onClick={onConfirm}>
            Xác nhận đóng
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};