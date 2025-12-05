import React from "react";
import { IconButton } from "@/components/ui/icon-button";
import {
  Folder as FolderIcon,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileType2,
  MoveRight,
  Edit2,
  Trash2,
  ArrowLeft,
  Plus,
  SlidersHorizontal,
  ListChecks,
  MoreHorizontal, ChevronRight,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from "@/components/ui/select";

/* =========================================================================
   Types
   ========================================================================= */

export type ViewMode = "lead" | "staff";

export type FolderAttribute = {
  id: string;
  key: string;
  value: string;
};

export type FileNode = {
  id: string;
  type: "folder" | "file";
  name: string;
  parentId?: string;
  ext?: "pdf" | "jpg" | "png" | "docx" | "xlsx";
  /** Loại thuộc tính mà thư mục đang sử dụng (nếu có) */
  attrTypeId?: string;

  attrs?: FolderAttribute[];
  level?: 0 | 1; // 0: folder gốc, 1: folder con
};

type FolderAttrTemplate = {
  id: string;
  key: string;
};

type FolderAttrType = {
  id: string;
  name: string;
  templates: FolderAttrTemplate[];
};

/* =========================================================================
   Small helpers
   ========================================================================= */

const FileIcon: React.FC<{ n: FileNode }> = ({ n }) => {
  if (n.type === "folder") {
    return <FolderIcon className="h-5 w-5 text-amber-600" />;
  }

  switch (n.ext) {
    case "pdf":
      // PDF: đỏ
      return <FileText className="h-5 w-5 text-rose-600" />;
    case "docx":
      // Word: xanh dương
      return <FileType2 className="h-5 w-5 text-sky-600" />;
    case "xlsx":
      // Excel: xanh lá
      return <FileSpreadsheet className="h-5 w-5 text-emerald-600" />;
    case "jpg":
    case "png":
      return <ImageIcon className="h-5 w-5 text-sky-600" />;
    default:
      return <FileText className="h-5 w-5 text-gray-600" />;
  }
};


/* =========================================================================
   useDriveView: quản lý context folder hiện tại
   ========================================================================= */

function useDriveView(items: FileNode[]) {
  const [currentFolder, setCurrentFolder] = React.useState<FileNode | null>(
    null
  );

  const contentItems = React.useMemo(() => {
    if (!currentFolder) {
      // Root: folder level 0 + file không có parentId
      return items.filter(
        (x) =>
          (x.type === "folder" && (!x.parentId || x.level === 0)) ||
          (x.type === "file" && !x.parentId)
      );
    }

    // Trong folder: folder con + file bên trong
    return items.filter(
      (x) =>
        x.parentId === currentFolder.id &&
        ((x.type === "folder" && (x.level ?? 1) === 1) || x.type === "file")
    );
  }, [items, currentFolder]);

  const emptyFolder = !!currentFolder && contentItems.length === 0;

  return { currentFolder, setCurrentFolder, contentItems, emptyFolder };
}

/* =========================================================================
   Default Attribute Settings (UI cho leader)
   ========================================================================= */

type DefaultAttrSettingsProps = {
  templates: FolderAttrTemplate[];
  onChange: (next: FolderAttrTemplate[]) => void;

  /** Danh sách loại thuộc tính + loại đang chọn */
  attrTypes?: FolderAttrType[];
  selectedAttrTypeId?: string;
  onChangeSelectedAttrTypeId?: (id: string) => void;
};

const DefaultAttrSettings: React.FC<DefaultAttrSettingsProps> = ({
  templates,
  onChange,
  attrTypes,
  selectedAttrTypeId,
  onChangeSelectedAttrTypeId,
}) => {
  const handleKeyChange = (id: string, key: string) => {
    onChange(
      templates.map((t) => (t.id === id ? { ...t, key } : { ...t }))
    );
  };

  const handleRemove = (id: string) => {
    onChange(templates.filter((t) => t.id !== id));
  };

  const handleAdd = () => {
    const id = "tmpl_" + Date.now().toString(36);
    onChange([...templates, { id, key: "Thuộc tính mới" }]);
  };

  return (
    <div className="rounded-xl border bg-emerald-50/60 px-3 py-3 mb-3 space-y-2 text-xs">
      <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-900">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        <span>Cài đặt thuộc tính mặc định</span>
      </div>
      <div className="text-[11px] text-emerald-900/80">
        Khi tạo thư mục mới, hệ thống sẽ sinh sẵn các thuộc tính bên dưới. Bạn
        có thể chỉnh sửa để phù hợp với cách làm việc của đội nhóm.
      </div>

      {attrTypes && attrTypes.length > 0 && (
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-emerald-900/80 whitespace-nowrap">
            Loại thuộc tính:
          </span>
          <Select
            value={selectedAttrTypeId}
            onValueChange={onChangeSelectedAttrTypeId}
          >
            <SelectTrigger className="w-full h-7 px-2 text-[11px] rounded border border-emerald-200">
              <SelectValue placeholder="Chọn loại thuộc tính" />
            </SelectTrigger>

            <SelectContent className="text-[11px]">
              {attrTypes.map((t) => (
                <SelectItem key={t.id} value={t.id} className="text-[11px]">
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
        </div>
      )}

      <div className="space-y-1.5">
        {templates.map((t) => (
          <div key={t.id} className="flex items-center gap-2">
            <input
              className="flex-1 rounded border border-emerald-200 bg-white px-2 py-1 text-[11px]"
              value={t.key}
              onChange={(e) => handleKeyChange(t.id, e.target.value)}
            />
            <button
              type="button"
              onClick={() => handleRemove(t.id)}
              className="text-[10px] text-rose-600 hover:text-rose-700"
            >
              X
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAdd}
          className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 hover:underline"
        >
          <Plus className="h-3 w-3" />
          Thêm thuộc tính mặc định
        </button>
      </div>
    </div>
  );
};

/* =========================================================================
   FolderAttrEditor: popover xem / sửa thuộc tính của 1 folder
   ========================================================================= */

type FolderAttrEditorProps = {
  folder: FileNode;
  viewMode: ViewMode;
  onUpdateFolderAttrs: (
    folderId: string,
    updater: (attrs: FolderAttribute[]) => FolderAttribute[]
  ) => void;
};

const FolderAttrEditor: React.FC<FolderAttrEditorProps> = ({
  folder,
  viewMode,
  onUpdateFolderAttrs,
}) => {
  const [open, setOpen] = React.useState(false);
  const [localAttrs, setLocalAttrs] = React.useState<FolderAttribute[]>(
    folder.attrs ?? []
  );

  React.useEffect(() => {
    setLocalAttrs(folder.attrs ?? []);
  }, [folder.id]);

  const handleChangeKey = (id: string, key: string) => {
    setLocalAttrs((prev) =>
      prev.map((a) => (a.id === id ? { ...a, key } : a))
    );
  };

  const handleChangeValue = (id: string, value: string) => {
    setLocalAttrs((prev) =>
      prev.map((a) => (a.id === id ? { ...a, value } : a))
    );
  };

  const handleRemove = (id: string) => {
    setLocalAttrs((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAdd = () => {
    const id = "att_" + Date.now().toString(36);
    setLocalAttrs((prev) => [...prev, { id, key: "Thuộc tính mới", value: "" }]);
  };

  const handleSave = () => {
    onUpdateFolderAttrs(folder.id, () => localAttrs);
    setOpen(false);
  };

  const count = localAttrs.length;
  const triggerLabel = count === 0 ? "Thuộc tính" : `Thuộc tính (${count})`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <IconButton
          icon={<ListChecks className="h-3.5 w-3.5" />}
          label={triggerLabel}
          className="h-6 w-6"
          title={triggerLabel}
          onClick={(e) => e.stopPropagation()}
        />
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        className="w-[380px] rounded-xl border border-gray-200 bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3">
          <div className="text-[13px] font-semibold text-gray-900">
            Thuộc tính thư mục
          </div>

          <div className="mt-0.5 text-[11px] text-gray-500 flex items-center gap-1">
            <span className="truncate">{folder.name}</span>

            {folder.attrTypeId && (
              <>
                <span className="mx-1 text-gray-400">•</span> Loại:{" "}
                <span className="text-[11px] text-emerald-700 font-medium">
                  {
                    (window as any).__attrTypes?.find(
                      (t: any) => t.id === folder.attrTypeId
                    )?.name || folder.attrTypeId
                  }
                </span>
              </>
            )}
          </div>
        </div>       

        {localAttrs.length === 0 && (
          <div className="mb-2 text-[11px] text-gray-500">
            {viewMode === "lead" ? (
              <>Chưa có thuộc tính nào. Bạn có thể thêm mới bên dưới.</>
            ):(
              <>Thư mục này chưa có thuộc tính nào.</>              
            )}            
          </div>
        )}

        {/* <div className="max-h-52 overflow-y-auto space-y-1.5">
          {localAttrs.map((a) => (
            <div key={a.id} className="flex items-center gap-2 text-[11px]">
              {viewMode === "lead" ? (
                <>
                  <input
                    className="w-28 rounded border px-1 py-0.5 text-[11px]"
                    value={a.key}
                    onChange={(e) => handleChangeKey(a.id, e.target.value)}
                  />
                  <input
                    className="flex-1 rounded border px-1 py-0.5 text-[11px]"
                    value={a.value}
                    onChange={(e) => handleChangeValue(a.id, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemove(a.id)}
                    className="text-[10px] text-rose-600"
                  >
                    X
                  </button>
                </>
              ) : (
                <>
                  <span className="w-28 truncate text-gray-500">{a.key}:</span>
                  <span className="flex-1 truncate text-gray-800">
                    {a.value || "{empty}"}
                  </span>
                </>
              )}
            </div>
          ))}
        </div> */}
        <div className="max-h-56 overflow-y-auto pr-1 space-y-2">
          {localAttrs.map((a) => (
            <div
              key={a.id}
              className="grid grid-cols-[120px_1fr_auto] items-center gap-2 text-[11px]"
            >
              {viewMode === "lead" ? (
                <>
                  <input
                    className="rounded-md border border-gray-200 px-2 py-1 text-[11px] focus:border-emerald-400 focus:ring-emerald-400"
                    value={a.key}
                    onChange={(e) => handleChangeKey(a.id, e.target.value)}
                  />
                  <input
                    className="rounded-md border border-gray-200 px-2 py-1 text-[11px] focus:border-emerald-400 focus:ring-emerald-400"
                    value={a.value}
                    onChange={(e) => handleChangeValue(a.id, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemove(a.id)}
                    className="text-[11px] px-1 text-rose-600 hover:text-rose-700"
                  >
                    X
                  </button>
                </>
              ) : (
                <>
                  <span className="truncate text-gray-500">{a.key}</span>
                  <span className="truncate text-gray-800">
                    {a.value || "{empty}"}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>


        {viewMode === "lead" && (
          <div className="mt-3 flex justify-between items-center">
            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:underline"
            >
              <Plus className="h-3 w-3" />
              Thêm thuộc tính
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="rounded-md bg-emerald-600 px-3 py-1 text-[11px] font-medium text-white shadow-sm hover:bg-emerald-700"
            >
              Lưu
            </button>
          </div>
        )}

      </PopoverContent>
    </Popover>
  );
};

/* =========================================================================
   FolderActionMenu: popover chứa Đổi tên / Xóa
   ========================================================================= */

type FolderActionMenuProps = {
  canDelete: boolean;
  onRename: () => void;
  onDelete: () => void;
};

const FolderActionMenu: React.FC<FolderActionMenuProps> = ({
  canDelete,
  onRename,
  onDelete,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <IconButton
          icon={<MoreHorizontal className="h-3.5 w-3.5" />}
          label="Thao tác"
          className="h-6 w-6"
          onClick={(e) => e.stopPropagation()}
        />
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-40 rounded-lg border border-gray-200 bg-white p-1 shadow-md text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="w-full rounded px-2 py-1 text-left hover:bg-emerald-50"
          onClick={() => {
            onRename();
            setOpen(false);
          }}
        >
          Đổi tên thư mục
        </button>
        {canDelete && (
          <button
            type="button"
            className="w-full rounded px-2 py-1 text-left text-rose-600 hover:bg-rose-50"
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
          >
            Xóa thư mục
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
};

/* =========================================================================
   DRIVE GRID (Ảnh / Video)
   ========================================================================= */

/* =========================================================================
   DRIVE GRID (Ảnh / Video)
   ========================================================================= */

type DriveGridProps = {
  items: FileNode[];
  folders: FileNode[];
  viewMode?: ViewMode;
  onCreateFolder: (parentId?: string, level?: 0 | 1) => void;
  onMoveFile: (fileId: string, folderId: string | null) => void;
  onRenameFolder: (folderId: string, nextName: string) => void;
  onDeleteFolder?: (folderId: string) => void;
  onUpdateFolderAttrs: (
    folderId: string,
    updater: (attrs: FolderAttribute[]) => FolderAttribute[]
  ) => void;

  showAttrSettings?: boolean;
  onToggleAttrSettings?: () => void;
};

const DriveGrid: React.FC<DriveGridProps> = ({
  items,
  folders,
  viewMode = "staff",
  onCreateFolder,
  onMoveFile,
  onRenameFolder,
  onDeleteFolder,
  onUpdateFolderAttrs,
  showAttrSettings,
  onToggleAttrSettings,
}) => {
  const { currentFolder, setCurrentFolder, contentItems, emptyFolder } =
    useDriveView(items);

  const [renamingId, setRenamingId] = React.useState<string | null>(null);
  const [renameValue, setRenameValue] = React.useState("");

  const canCreateSubFolder =
    viewMode === "lead" && currentFolder && (currentFolder.level ?? 0) === 0;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {currentFolder && (
            <IconButton
              icon={<ArrowLeft className="h-4 w-4" />}
              label="Quay lại"
              onClick={() => setCurrentFolder(null)}
            />
          )}
          <div className="text-sm font-semibold">
            {currentFolder ? `Thư mục: ${currentFolder.name}` : ""}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!currentFolder && viewMode === "lead" && (
            <>
              <button
                onClick={() => onCreateFolder(undefined, 0)}
                className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-brand-50"
              >
                <Plus className="h-3 w-3" />
                Thư mục mới
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleAttrSettings?.();
                }}
                className="text-[11px] text-emerald-700 hover:underline"
              >
                {showAttrSettings ? "Ẩn cài đặt thuộc tính" : "Cài đặt thuộc tính"}
              </button>
            </>
          )}

          {canCreateSubFolder && (
            <button
              onClick={() => onCreateFolder(currentFolder!.id, 1)}
              className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-brand-50"
            >
              <Plus className="h-3 w-3" />
              Folder con
            </button>
          )}
        </div>
      </div>

      {/* Empty folder */}
      {emptyFolder ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
          Thư mục này trống
        </div>
      ) : (
        <div
          className={
            currentFolder
              ? "divide-y rounded border bg-white/60"
              : "grid grid-cols-3 gap-3"
          }
        >
          {contentItems.map((it) => {
            const isFolder = it.type === "folder";
            const isFile = it.type === "file";
            const isRenaming = renamingId === it.id;

            const cardLayout = currentFolder
              ? "flex items-center px-3 py-2"
              : "flex flex-col items-center justify-center gap-2 px-3 py-2 h-20";

            return (
              <div
                key={it.id}
                className={`group relative cursor-pointer transition-all duration-200
                  rounded-xl border border-emerald-100 bg-white/80 shadow-[0_2px_6px_rgba(15,118,110,0.06)]
                  hover:border-emerald-300 hover:bg-emerald-50/85 hover:shadow-[0_12px_26px_rgba(16,185,129,0.25)]
                  ${cardLayout}
                  ${isRenaming ? "z-10" : ""}`}
                onClick={() => {
                  if (isFolder) setCurrentFolder(it);
                }}
              >
                {/* Icon + name (vertical ở grid, horizontal ở inside-folder) */}
                <div
                  className={
                    currentFolder
                      ? "flex items-center gap-2 flex-1 min-w-0"
                      : "flex flex-col items-center justify-center gap-2 flex-1 min-w-0"
                  }
                >
                  {/* icon lớn hơn, trong pill */}
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50/80">
                    <FileIcon n={it} />
                  </div>

                  {isFolder && isRenaming ? (
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          (e.currentTarget as HTMLInputElement).blur();
                        }
                        if (e.key === "Escape") {
                          e.preventDefault();
                          setRenamingId(null);
                          setRenameValue(it.name);
                        }
                      }}
                      onBlur={() => {
                        if (renameValue.trim()) {
                          onRenameFolder(it.id, renameValue.trim());
                        }
                        setRenamingId(null);
                      }}
                      className="w-full max-w-[150px] rounded border px-1 py-0.5 text-xs bg-emerald-50/70 text-center focus:outline-none focus:ring-1 focus:ring-emerald-300"
                    />
                  ) : (
                    <div
                      className={
                        currentFolder
                          ? "flex-1 min-w-0 text-xs text-gray-700"
                          : "w-full text-[11px] text-gray-700 text-center leading-tight"
                      }
                    >
                      <span
                        className={
                          currentFolder
                            ? "block truncate"
                            : "block line-clamp-2 break-words"
                        }
                        title={it.name}
                      >
                        {it.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions bubble (ẩn khi đang rename) */}
                {!isRenaming && (
                  <div className="pointer-events-none absolute inset-x-0 top-1.5 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="pointer-events-auto inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-white px-2 py-[3px] shadow-[0_8px_20px_rgba(15,118,110,0.28)]">
                      {isFolder && (
                        <>
                          {/* Thuộc tính */}
                          <FolderAttrEditor
                            folder={it}
                            viewMode={viewMode}
                            onUpdateFolderAttrs={onUpdateFolderAttrs}
                          />

                          {viewMode === "lead" && (
                            <>
                              {/* Đổi tên */}
                              <IconButton
                                icon={<Edit2 className="h-3.5 w-3.5" />}
                                label="Đổi tên"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRenamingId(it.id);
                                  setRenameValue(it.name);
                                }}
                                className="h-6 w-6"
                              />

                              {/* Xoá */}
                              <IconButton
                                icon={
                                  <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                                }
                                label="Xóa thư mục"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const hasChild = items.some(
                                    (x) => x.parentId === it.id
                                  );
                                  if (hasChild) {
                                    alert("Không thể xóa, thư mục chưa trống.");
                                  } else {
                                    onDeleteFolder?.(it.id);
                                  }
                                }}
                                className="h-6 w-6"
                              />
                            </>
                          )}
                        </>
                      )}

                      {isFile && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <IconButton
                              icon={<MoveRight className="h-3.5 w-3.5" />}
                              label="Chuyển"
                              className="h-6 w-6"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </PopoverTrigger>
                          <PopoverContent
                            side="top"
                            align="center"
                            className="w-48 rounded-lg border border-gray-200 shadow-md p-1 bg-white"
                          >
                            <div className="text-xs text-gray-500 mb-1 px-1">
                              Chọn thư mục:
                            </div>
                            <ul className="max-h-48 overflow-y-auto text-sm">
                              <li
                                className="px-2 py-1 text-gray-700 hover:bg-brand-50 cursor-pointer rounded-md"
                                onClick={() => onMoveFile(it.id, null)}
                              >
                                ⬆️ Thư mục gốc
                              </li>
                              {folders.map((f) => (
                                <li
                                  key={f.id}
                                  className="px-2 py-1 text-gray-700 hover:bg-brand-50 cursor-pointer rounded-md"
                                  onClick={() => onMoveFile(it.id, f.id)}
                                >
                                  {f.parentId ? "└ " : "📁 "}
                                  {f.name}
                                </li>
                              ))}
                            </ul>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


/* =========================================================================
   DRIVE LIST (Tài liệu)
   ========================================================================= */

type DriveListProps = {
  items: FileNode[];
  folders: FileNode[];
  viewMode?: ViewMode;
  onCreateFolder: (parentId?: string, level?: 0 | 1) => void;
  onMoveFile: (fileId: string, folderId: string | null) => void;
  onRenameFolder: (folderId: string, nextName: string) => void;
  onDeleteFolder?: (folderId: string) => void;
  onUpdateFolderAttrs: (
    folderId: string,
    updater: (attrs: FolderAttribute[]) => FolderAttribute[]
  ) => void;

  showAttrSettings?: boolean;
  onToggleAttrSettings?: () => void;
};

const DriveList: React.FC<DriveListProps> = ({
  items,
  folders,
  viewMode = "staff",
  onCreateFolder,
  onMoveFile,
  onRenameFolder,
  onDeleteFolder,
  onUpdateFolderAttrs,
  showAttrSettings,
  onToggleAttrSettings,
}) => {
  const { currentFolder, setCurrentFolder, contentItems, emptyFolder } =
    useDriveView(items);
  const [renamingId, setRenamingId] = React.useState<string | null>(null);
  const [renameValue, setRenameValue] = React.useState("");

  const canCreateSubFolder =
    viewMode === "lead" && currentFolder && (currentFolder.level ?? 0) === 0;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {currentFolder && (
            <IconButton
              icon={<ArrowLeft className="h-4 w-4" />}
              label="Quay lại"
              onClick={() => setCurrentFolder(null)}
            />
          )}
          <div className="text-sm font-semibold">
            {currentFolder ? `Thư mục: ${currentFolder.name}` : ""}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!currentFolder && viewMode === "lead" && (
            <>
              <button
                onClick={() => onCreateFolder(undefined, 0)}
                className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-brand-50"
              >
                <Plus className="h-3 w-3" />
                Thư mục mới
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleAttrSettings?.();
                }}
                className="text-[11px] text-emerald-700 hover:underline"
              >
                {showAttrSettings ? "Ẩn cài đặt thuộc tính" : "Cài đặt thuộc tính"}
              </button>
            </>
          )}

          {canCreateSubFolder && (
            <button
              onClick={() => onCreateFolder(currentFolder!.id, 1)}
              className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-brand-50"
            >
              <Plus className="h-3 w-3" />
              Folder con
            </button>
          )}
        </div>
      </div>

      {/* Empty */}
      {emptyFolder ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
          Thư mục này trống
        </div>
      ) : (
        <div className="space-y-2">
          {contentItems.map((it) => {
            const isFolder = it.type === "folder";
            const isFile = it.type === "file";
            const isRenaming = renamingId === it.id;

            return (
              <div
                key={it.id}
                className={`group relative flex flex-col gap-1 px-2 py-2 hover:bg-brand-50 transition-all duration-200 cursor-pointer
                ${isRenaming ? "z-10" : ""}`}
                onClick={() => {
                  if (isFolder) setCurrentFolder(it);
                }}
              >
                <div className="flex items-center gap-3">
                  <FileIcon n={it} />
                  <div className="flex-1 min-w-0 text-sm text-gray-700">
                    {isFolder && isRenaming ? (
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            (e.currentTarget as HTMLInputElement).blur();
                          }
                          if (e.key === "Escape") {
                            e.preventDefault();
                            setRenamingId(null);
                            setRenameValue(it.name);
                          }
                        }}
                        onBlur={() => {
                          if (renameValue.trim()) {
                            onRenameFolder(it.id, renameValue.trim());
                          }
                          setRenamingId(null);
                        }}
                        className="w-full max-w-[220px] rounded border px-1 py-0.5 text-xs bg-white"
                      />
                    ) : (
                        <div className="flex-1 flex items-center gap-1 truncate text-sm text-gray-700">
                          <span title={it.name} className="truncate">
                            {it.name}
                          </span>
                          {isFolder && (
                            <span className="text-[10px] text-gray-400 group-hover:text-gray-500">
                              <ChevronRight className="inline h-3 w-3" />
                            </span>
                          )}
                        </div>
                    )}
                  </div>

                  {/* Actions bubble (hover) */}
                  <div className="pointer-events-none absolute right-2 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="pointer-events-auto inline-flex items-center gap-1 rounded-full border border-gray-100 bg-white/95 px-1.5 py-0.5 shadow-sm">
                      {isFolder && (
                        <>
                          <FolderAttrEditor
                            folder={it}
                            viewMode={viewMode}
                            onUpdateFolderAttrs={onUpdateFolderAttrs}
                          />

                          <IconButton
                            icon={<Edit2 className="h-3.5 w-3.5" />}
                            label="Đổi tên"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRenamingId(it.id);
                              setRenameValue(it.name);
                            }}
                            className="h-6 w-6"
                          />

                          {viewMode === "lead" && (
                            <IconButton
                              icon={<Trash2 className="h-3.5 w-3.5 text-rose-600" />}
                              label="Xóa thư mục"
                              onClick={(e) => {
                                e.stopPropagation();
                                const hasChild = items.some((x) => x.parentId === it.id);
                                if (hasChild) {
                                  alert("Không thể xóa, thư mục chưa trống.");
                                } else {
                                  onDeleteFolder?.(it.id);
                                }
                              }}
                              className="h-6 w-6"
                            />
                          )}
                        </>
                      )}

                      {isFile && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <IconButton
                              icon={<MoveRight className="h-3.5 w-3.5" />}
                              label="Chuyển"
                              className="h-6 w-6"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </PopoverTrigger>
                          <PopoverContent
                            side="top"
                            align="end"
                            className="w-48 rounded-lg border border-gray-200 bg-white p-1 shadow-md"
                          >
                            <div className="mb-1 px-1 text-xs text-gray-500">
                              Chọn thư mục:
                            </div>
                            <ul className="max-h-48 overflow-y-auto text-sm">
                              <li
                                className="cursor-pointer rounded-md px-2 py-1 text-gray-700 hover:bg-brand-50"
                                onClick={() => onMoveFile(it.id, null)}
                              >
                                ⬆️ Thư mục gốc
                              </li>
                              {folders.map((f) => (
                                <li
                                  key={f.id}
                                  className="cursor-pointer rounded-md px-2 py-1 text-gray-700 hover:bg-brand-50"
                                  onClick={() => onMoveFile(it.id, f.id)}
                                >
                                  {f.parentId ? "└ " : "📁 "}
                                  {f.name}
                                </li>
                              ))}
                            </ul>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   FILE MANAGER WRAPPER
   ========================================================================= */

export type FileManagerMode = "grid" | "list";

export type FileManagerProps = {
  mode: FileManagerMode;
  initialItems: FileNode[];
  viewMode?: ViewMode;
  onItemsChange?: (items: FileNode[]) => void;

  /**
   * Default attributes cho leader:
   * - mỗi lần tạo folder mới sẽ clone từ đây (value = "").
   * - nếu không truyền, dùng default: Tên sản phẩm, Thương hiệu, NSX, Hạn dùng, NCC.
   */
  defaultFolderAttrs?: { key: string }[];
};

export const FileManager: React.FC<FileManagerProps> = ({
  mode,
  initialItems,
  viewMode = "staff",
  onItemsChange,
  defaultFolderAttrs,
}) => {
  const [items, setItems] = React.useState<FileNode[]>(() =>
    initialItems.map((it) =>
      it.type === "folder" ? { ...it, level: it.parentId ? 1 : 0 } : it
    )
  );

  const builtInTemplates: FolderAttrTemplate[] = [
    { id: "tmpl_name", key: "Tên sản phẩm" },
    { id: "tmpl_brand", key: "Thương hiệu" },
    { id: "tmpl_nsx", key: "NSX" },
    { id: "tmpl_exp", key: "Hạn dùng" },
    { id: "tmpl_sup", key: "NCC" },
  ];

  const DEFAULT_ATTR_TYPE_ID = "attr_type_default";

  

  const [attrTypes, setAttrTypes] = React.useState<FolderAttrType[]>(() => {
    const baseTemplates =
      defaultFolderAttrs && defaultFolderAttrs.length > 0
        ? defaultFolderAttrs.map((t, idx) => ({
          id: "tmpl_" + idx,
          key: t.key,
        }))
        : builtInTemplates;

    return [
      {
        id: DEFAULT_ATTR_TYPE_ID,
        name: "Loại thuộc tính mặc định",
        templates: baseTemplates,
      },
      {
        id: "attr_type_product_info",
        name: "Thông tin sản phẩm",
        templates: [
          { id: "tmpl_p1", key: "Tên sản phẩm" },
          { id: "tmpl_p2", key: "Mã SKU" },
          { id: "tmpl_p3", key: "Thương hiệu" },
          { id: "tmpl_p4", key: "Hạn dùng" },
        ],
      },
      {
        id: "attr_type_supplier",
        name: "Thông tin nhà cung cấp",
        templates: [
          { id: "tmpl_s1", key: "Tên NCC" },
          { id: "tmpl_s2", key: "Số điện thoại NCC" },
          { id: "tmpl_s3", key: "Mã hợp đồng" },
        ],
      },
      {
        id: "attr_type_documents",
        name: "Thông tin chứng từ",
        templates: [
          { id: "tmpl_d1", key: "Loại chứng từ" },
          { id: "tmpl_d2", key: "Ngày cấp" },
          { id: "tmpl_d3", key: "Người ký" },
        ],
      },
    ];

  });

  // Expose attrTypes for FolderAttrEditor
  // TODO: Sau này khi backend load attrTypes → FolderAttrEditor sẽ tự cập nhật.
  React.useEffect(() => {
    (window as any).__attrTypes = attrTypes;
  }, [attrTypes]);

  const [selectedAttrTypeId, setSelectedAttrTypeId] =
    React.useState<string>(DEFAULT_ATTR_TYPE_ID);

  const selectedAttrType =
    attrTypes.find((t) => t.id === selectedAttrTypeId) ?? attrTypes[0];

  const attrTemplates = selectedAttrType?.templates ?? [];

  const [showAttrSettings, setShowAttrSettings] = React.useState(false);

  const [createFolderState, setCreateFolderState] = React.useState<{
    open: boolean;
    parentId?: string;
    level: 0 | 1;
  }>({ open: false, parentId: undefined, level: 0 });

  const [newFolderName, setNewFolderName] = React.useState("Thư mục mới");

  const [newFolderAttrTypeId, setNewFolderAttrTypeId] =
    React.useState<string>(DEFAULT_ATTR_TYPE_ID);

  const handleChangeAttrTemplates = (nextTemplates: FolderAttrTemplate[]) => {
    setAttrTypes((prev) =>
      prev.map((type) =>
        type.id === (selectedAttrType?.id ?? selectedAttrTypeId)
          ? { ...type, templates: nextTemplates }
          : type
      )
    );
  };

  React.useEffect(() => {
    onItemsChange?.(items);
  }, [items, onItemsChange]);


  const folders = React.useMemo(
    () => items.filter((x) => x.type === "folder"),
    [items]
  );

  const handleCreateFolder = (parentId?: string, level: 0 | 1 = 0) => {
    const safeLevel: 0 | 1 = level === 1 ? 1 : 0;

    setCreateFolderState({
      open: true,
      parentId,
      level: safeLevel,
    });

    setNewFolderName("Thư mục mới");
    setNewFolderAttrTypeId(selectedAttrType?.id ?? selectedAttrTypeId);
  };

  const handleConfirmCreateFolder = () => {
    if (!createFolderState.open) return;

    const now = Date.now();
    const safeLevel: 0 | 1 = createFolderState.level === 1 ? 1 : 0;

    const type =
      attrTypes.find((t) => t.id === newFolderAttrTypeId) ??
      selectedAttrType ??
      attrTypes[0];

    const templates = type?.templates ?? [];

    const newFolder: FileNode = {
      id: "fd_" + now,
      type: "folder",
      name: newFolderName.trim() || "Thư mục mới",
      parentId: createFolderState.parentId,
      level: safeLevel,
      attrTypeId: type?.id,
      attrs: templates.map((t, idx) => ({
        id: `att_${now}_${idx}`,
        key: t.key,
        value: "",
      })),
    };

    setItems((prev) => [...prev, newFolder]);
    setCreateFolderState({ open: false, parentId: undefined, level: 0 });
    setNewFolderName("Thư mục mới");
  };

  const handleCancelCreateFolder = () => {
    setCreateFolderState({ open: false, parentId: undefined, level: 0 });
    setNewFolderName("Thư mục mới");
  };

  const handleMoveFile = (fileId: string, folderId: string | null) => {
    setItems((prev) =>
      prev.map((file) => {
        if (file.id !== fileId) return file;
        if (folderId === null) {
          const { parentId, ...rest } = file as any;
          return { ...rest };
        }
        return { ...file, parentId: folderId };
      })
    );
  };

  const handleRenameFolder = (folderId: string, nextName: string) => {
    setItems((prev) =>
      prev.map((x) =>
        x.type === "folder" && x.id === folderId ? { ...x, name: nextName } : x
      )
    );
  };

  const handleDeleteFolder = (folderId: string) => {
    setItems((prev) => prev.filter((x) => x.id !== folderId));
  };

  const handleUpdateFolderAttrs = (
    folderId: string,
    updater: (attrs: FolderAttribute[]) => FolderAttribute[]
  ) => {
    setItems((prev) =>
      prev.map((it) =>
        it.type === "folder" && it.id === folderId
          ? { ...it, attrs: updater(it.attrs ?? []) }
          : it
      )
    );
  };

  const grid = (
    <DriveGrid
      items={items}
      folders={folders}
      viewMode={viewMode}
      onCreateFolder={handleCreateFolder}
      onMoveFile={handleMoveFile}
      onRenameFolder={handleRenameFolder}
      onDeleteFolder={handleDeleteFolder}
      onUpdateFolderAttrs={handleUpdateFolderAttrs}
      showAttrSettings={showAttrSettings}
      onToggleAttrSettings={() => setShowAttrSettings((v) => !v)}
    />
  );

  const list = (
    <DriveList
      items={items}
      folders={folders}
      viewMode={viewMode}
      onCreateFolder={handleCreateFolder}
      onMoveFile={handleMoveFile}
      onRenameFolder={handleRenameFolder}
      onDeleteFolder={handleDeleteFolder}
      onUpdateFolderAttrs={handleUpdateFolderAttrs}
      showAttrSettings={showAttrSettings}
      onToggleAttrSettings={() => setShowAttrSettings((v) => !v)}
    />
  );

  return (
    <div className="space-y-3 relative">
      {/* Popup tạo thư mục mới: chọn loại thuộc tính */}
      {viewMode === "lead" && createFolderState.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="w-full max-w-sm rounded-xl border bg-white p-4 shadow-lg">
            <div className="mb-3">
              <div className="text-xs font-semibold text-gray-900">
                Tạo thư mục mới
              </div>
              <div className="mt-0.5 text-[11px] text-gray-500">
                Chọn tên thư mục và loại thuộc tính. Hệ thống sẽ sinh sẵn các
                thuộc tính mặc định cho thư mục này.
              </div>
            </div>

            <div className="space-y-2">
              <div className="space-y-1">
                <div className="text-[11px] font-medium text-gray-700">
                  Tên thư mục
                </div>
                <input
                  className="w-full rounded border border-gray-200 px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-medium text-gray-700">
                  Loại thuộc tính
                </div>
                <Select
                  value={newFolderAttrTypeId}
                  onValueChange={(v) => setNewFolderAttrTypeId(v)}
                >
                  <SelectTrigger className="w-full h-7 px-2 text-[11px] rounded border border-gray-200">
                    <SelectValue placeholder="Chọn loại thuộc tính" />
                  </SelectTrigger>

                  <SelectContent className="text-[11px]">
                    {attrTypes.map((t) => (
                      <SelectItem key={t.id} value={t.id} className="text-[11px]">
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelCreateFolder}
                className="rounded border border-gray-200 px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmCreateFolder}
                className="rounded bg-emerald-600 px-3 py-1 text-[11px] font-medium text-white hover:bg-emerald-700"
              >
                Tạo thư mục
              </button>
            </div>
          </div>
        </div>
      )}

      {viewMode === "lead" && showAttrSettings && (
        <DefaultAttrSettings
          templates={attrTemplates}
          onChange={handleChangeAttrTemplates}
          attrTypes={attrTypes}
          selectedAttrTypeId={selectedAttrTypeId}
          onChangeSelectedAttrTypeId={setSelectedAttrTypeId}
        />
      )}
      {mode === "grid" ? grid : list}
    </div>
  );
};