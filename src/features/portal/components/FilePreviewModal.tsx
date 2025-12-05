import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileAttachment } from "@/features/portal/types";

export type PreviewFile = FileAttachment | null;


export const FilePreviewModal: React.FC<{
  open: boolean;
  file: PreviewFile;
  onOpenChange: (open: boolean) => void;
}> = ({ open, file, onOpenChange }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle>{file?.name || 'Xem nhanh'}</DialogTitle>
      </DialogHeader>
      {file?.type === 'pdf' ? (
        <iframe src={file.url} className="w-full h-[70vh] rounded-lg border" title="File preview" />
      ) : file?.type === 'image' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={file.url} alt={file.name} className="w-full h-auto rounded-lg" />
      ) : null}
    </DialogContent>
  </Dialog>
);