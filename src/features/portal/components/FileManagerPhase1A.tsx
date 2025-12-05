import React from "react";
import {
  PlayCircle,
  FileText,
  FileSpreadsheet,
  FileType2,
  MessageCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { mockMessagesByWorkType } from "@/data/mockMessages";
import { IconButton } from "@/components/ui/icon-button";

/**
 * Loại file Phase 1A – gom đơn giản thành 3 nhóm:
 * - image: ảnh
 * - video: video (nếu sau này cần tách riêng)
 * - doc: tài liệu (pdf/excel/word/khác)
 */
export type Phase1AFileKind = "image" | "video" | "doc";

export type Phase1AFileItem = {
  id: string;
  name: string;
  kind: Phase1AFileKind;
  url: string;
  ext?: string;
  sizeLabel?: string;
  dateLabel?: string;
  messageId?: string;
};

export type FileManagerPhase1AMode = "media" | "docs";

type AttachmentType = "pdf" | "excel" | "word" | "image" | "other";

type MessageLike = {
  id: string;
  groupId?: string;
  type: "text" | "image" | "file" | "system";
  createdAt?: string;
  time?: string;
  files?: { name: string; url: string; type: AttachmentType; size?: string }[];
  fileInfo?: { name: string; url: string; type: AttachmentType; size?: string };
};

export type FileManagerPhase1AProps = {
  mode: FileManagerPhase1AMode;

  /** group đang chat – ví dụ: "grp_vh_kho" */
  groupId?: string;

  /** workTypeId hiện tại – ví dụ: "wt_nhan_hang", "wt_doi_tra" */
  selectedWorkTypeId?: string;

  /** Callback khi user bấm "Xem tin nhắn gốc" */
  onOpenSourceMessage?: (messageId: string) => void;
};

const getWorkTypeKey = (workTypeId?: string) => {
  switch (workTypeId) {
    case "wt_nhan_hang":
      return "nhanHang";
    case "wt_doi_tra":
      return "doiTra";
    case "wt_lich_boc_hang":
      return "lichBocHang";
    case "wt_don_boc_hang":
      return "donBocHang";
    default:
      return "nhanHang";
  }
};

const getDocIcon = (ext?: string) => {
  const e = (ext || "").toLowerCase();
  if (e === "xlsx" || e === "xls") {
    return <FileSpreadsheet className="h-6 w-6 text-emerald-600" />;
  }
  if (e === "doc" || e === "docx") {
    return <FileType2 className="h-6 w-6 text-sky-600" />;
  }
  if (e === "pdf") {
    return <FileText className="h-6 w-6 text-rose-600" />;
  }
  return <FileText className="h-6 w-6 text-gray-500" />;
};

const isMediaAttachment = (attType: AttachmentType) => attType === "image";
const isDocAttachment = (attType: AttachmentType) => attType !== "image";

export const FileManagerPhase1A: React.FC<FileManagerPhase1AProps> = ({
  mode,
  groupId,
  selectedWorkTypeId,
  onOpenSourceMessage,
}) => {
  const [previewFile, setPreviewFile] = React.useState<Phase1AFileItem | null>(
    null
  );
  const [showAll, setShowAll] = React.useState(false);

  // ----- Lấy list message tương ứng group + workType từ mockMessages.ts -----
  const messageList = React.useMemo<MessageLike[]>(() => {
    const key = getWorkTypeKey(selectedWorkTypeId);
    const all = (mockMessagesByWorkType as any)[key] || [];
    if (!groupId) return all;
    const gid = groupId.toLowerCase();
    return (all as MessageLike[]).filter(
      (m) => (m.groupId || "").toLowerCase() === gid
    );
  }, [groupId, selectedWorkTypeId]);

  // ----- Chuyển message -> list file dùng cho UI Phase 1A -----
  const { mediaFiles, docFiles } = React.useMemo<{
    mediaFiles: Phase1AFileItem[];
    docFiles: Phase1AFileItem[];
  }>(() => {
    const media: Phase1AFileItem[] = [];
    const docs: Phase1AFileItem[] = [];

    messageList.forEach((m) => {
      const attachments: {
        name: string;
        url: string;
        type: AttachmentType;
        size?: string;
      }[] = [];

      if (Array.isArray(m.files)) {
        attachments.push(...m.files);
      }
      if (m.fileInfo) {
        attachments.push(m.fileInfo);
      }

      attachments.forEach((att, index) => {
        const ext = (att.name.split(".").pop() || "").toLowerCase();
        const dateLabel = m.createdAt
          ? new Date(m.createdAt).toLocaleDateString("vi-VN")
          : m.time;

        const base: Phase1AFileItem = {
          id: `${m.id}__${index}`,
          name: att.name,
          kind: "doc", // sẽ override bên dưới
          url: att.url,
          ext,
          sizeLabel: att.size,
          dateLabel,
          messageId: m.id,
        };

        if (isMediaAttachment(att.type)) {
          media.push({ ...base, kind: "image" });
        } else if (isDocAttachment(att.type)) {
          docs.push({ ...base, kind: "doc" });
        }
      });
    });

    return { mediaFiles: media, docFiles: docs };
  }, [messageList]);

  const allFiles = mode === "media" ? mediaFiles : docFiles;
  const limit = mode === "media" ? 6 : 3;        // 6 media / 3 docs gần nhất
  const visible = allFiles.slice(0, limit);
  const label = mode === "media" ? "Ảnh / Video" : "Tài liệu";

  const [allTab, setAllTab] = React.useState<FileManagerPhase1AMode>("media");


  const handleOpenPreview = (f: Phase1AFileItem) => {
    setPreviewFile(f);
  };

  const handleClosePreview = () => setPreviewFile(null);

  const handleOpenSource = (
    e: React.MouseEvent,
    f: Phase1AFileItem
  ) => {
    e.stopPropagation();
    if (f.messageId && onOpenSourceMessage) {
      onOpenSourceMessage(f.messageId);
    }
  };

  const renderMediaTile = (f: Phase1AFileItem, compact = false) => (
    <div
      key={f.id}
      className={`group relative overflow-hidden rounded-lg bg-gray-100 cursor-pointer ${
        compact ? "aspect-[4/3]" : "aspect-[4/3]"
      }`}
      onClick={() => handleOpenPreview(f)}
      onContextMenu={(e) => e.preventDefault()}
    >      
      {f.kind === "image" ? (
        // eslint-disable-next-line jsx-a11y/alt-text
        <img
          src={f.url}
          alt={f.name}
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-slate-800">
          <PlayCircle className="h-10 w-10 text-white drop-shadow" />
        </div>
      )}
       
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />

      {f.messageId && onOpenSourceMessage && (
        <IconButton
          label="Xem tin nhắn gốc"
          icon={<MessageCircle className="h-3.5 w-3.5 text-gray-700" />}
          onClick={(e) => {
            e.stopPropagation();
            handleOpenSource(e, f);
          }}
          className="absolute right-1.5 top-1.5 h-6 w-6 p-0 bg-white/90 rounded-md opacity-0
             group-hover:opacity-100 hover:opacity-100 shadow-sm"
        />
      )}

    </div>
  );

  const renderDocRow = (f: Phase1AFileItem) => (
    <div
      key={f.id}
      className="group relative flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-gray-50 cursor-pointer"
      onClick={() => handleOpenPreview(f)}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100">
          {getDocIcon(f.ext)}
        </div>
        <div className="min-w-0">
          <div className="truncate text-[13px] text-gray-800">
            {f.name}
          </div>
          {(f.sizeLabel || f.dateLabel) && (
            <div className="mt-0.5 text-[11px] text-gray-500">
              {f.sizeLabel && <span>{f.sizeLabel}</span>}
              {f.sizeLabel && f.dateLabel && (
                <span className="mx-1">•</span>
              )}
              {f.dateLabel && <span>{f.dateLabel}</span>}
            </div>
          )}
        </div>
      </div>

      {f.messageId && onOpenSourceMessage && (        
        <IconButton
          label="Xem tin nhắn gốc"
          icon={<MessageCircle className="h-3.5 w-3.5 text-gray-700" />}
          onClick={(e) => {
            e.stopPropagation();
            handleOpenSource(e, f);
          }}
          className="absolute right-1.5 top-1.5 h-6 w-6 p-0 bg-white/90 rounded-md opacity-0
             group-hover:opacity-100 hover:opacity-100 shadow-sm"
        />
      )}
    </div>
  );

  return (
    <div
      className="space-y-2"
      onContextMenu={(e) => e.preventDefault()}
    >
      {mode === "media" ? (
        <div className="grid grid-cols-3 gap-2">
          {visible.length === 0 ? (
            <div className="col-span-3 text-[11px] text-gray-400">
              Chưa có {label.toLowerCase()} nào.
            </div>
          ) : (
            visible.map((f) => renderMediaTile(f, true))
          )}
        </div>
      ) : (
        <div className="space-y-1">
          {visible.length === 0 ? (
            <div className="text-[11px] text-gray-400">
              Chưa có tài liệu nào.
            </div>
          ) : (
            visible.map(renderDocRow)
          )}
        </div>
      )}

      {allFiles.length > visible.length && (
        <button
          type="button"
          className="mt-2 w-full rounded-md bg-gray-100 py-1.5 text-center text-xs text-gray-700 hover:bg-gray-200"
          onClick={() => {
            setAllTab(mode);      // click ở Ảnh/Video thì mở tab Ảnh/Video trước, tương tự cho Tài liệu
            setShowAll(true);
          }}
        >
          Xem tất cả
        </button>
      )}

      {/* Dialog Xem tất cả – 2 tab Ảnh/Video & Tài liệu, group theo ngày */}
      <Dialog open={showAll} onOpenChange={setShowAll}>
        <DialogContent
          className="max-w-5xl"
          onContextMenu={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Tất cả file trong nhóm chat</DialogTitle>
          </DialogHeader>

          {/* Tabs đơn giản */}
          <div className="mt-3 flex items-center gap-2 border-b border-gray-200 pb-2">
            <button
              type="button"
              className={`rounded-full px-3 py-1 text-xs ${allTab === "media"
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-100"
                }`}
              onClick={() => setAllTab("media")}
            >
              Ảnh / Video ({mediaFiles.length})
            </button>
            <button
              type="button"
              className={`rounded-full px-3 py-1 text-xs ${allTab === "docs"
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-100"
                }`}
              onClick={() => setAllTab("docs")}
            >
              Tài liệu ({docFiles.length})
            </button>
          </div>

          <div className="mt-3 max-h-[70vh] overflow-y-auto">
            {(() => {
              const source =
                allTab === "media" ? mediaFiles : docFiles;

              if (source.length === 0) {
                return (
                  <div className="text-[12px] text-gray-400">
                    Chưa có file nào trong nhóm chat cho tab này.
                  </div>
                );
              }

              // group theo ngày (dùng dateLabel đã format)
              const groups = source.reduce<
                { date: string; items: Phase1AFileItem[] }[]
              >((acc, f) => {
                const key = f.dateLabel || "Khác";
                const found = acc.find((g) => g.date === key);
                if (found) {
                  found.items.push(f);
                } else {
                  acc.push({ date: key, items: [f] });
                }
                return acc;
              }, []);

              return (
                <div className="space-y-4">
                  {groups.map((g) => (
                    <div key={g.date}>
                      <div className="mb-2 text-[11px] font-medium text-gray-500">
                        {g.date}
                      </div>

                      {allTab === "media" ? (
                        <div className="grid grid-cols-4 gap-3">
                          {g.items.map((f) => (
                            <div key={f.id}>
                              {renderMediaTile(f)}
                              <div className="mt-1 line-clamp-2 text-[11px] text-gray-700">
                                {f.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {g.items.map(renderDocRow)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog preview đơn giản, view-only (không có nút download) */}
      <Dialog
        open={!!previewFile}
        onOpenChange={(open) =>
          open ? null : handleClosePreview()
        }
      >
        <DialogContent
          className="max-w-4xl"
          onContextMenu={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {previewFile?.name || "Xem trước"}
            </DialogTitle>
          </DialogHeader>

          {previewFile && previewFile.kind === "image" && (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img
              src={previewFile.url}
              alt={previewFile.name}
              className="w-full max-h-[70vh] object-contain rounded-lg"
              draggable={false}
            />
          )}

          {previewFile && previewFile.kind === "video" && (
            <video
              src={previewFile.url}
              className="w-full max-h-[70vh] rounded-lg"
              controls
            />
          )}

          {previewFile && previewFile.kind === "doc" && (
            <div className="rounded-lg border border-dashed p-4 text-sm text-gray-500">
              Xem trước tài liệu sẽ được tích hợp với viewer PDF/Office ở bước tiếp theo.
            </div>
          )}
        </DialogContent>
      </Dialog>

      
    </div>
  );
};
