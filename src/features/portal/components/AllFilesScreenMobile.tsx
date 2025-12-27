import React from "react";
import {
  ChevronLeft,
  PlayCircle,
  FileText,
  FileSpreadsheet,
  FileType2,
  MessageCircle,
  Filter,
  X,
} from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import type { Phase1AFileItem } from "../components/FileManagerPhase1A";

type AllFilesScreenMobileProps = {
  open: boolean;
  onBack:  () => void;
  
  // Data
  mediaFiles: Phase1AFileItem[];
  docFiles:  Phase1AFileItem[];
  senders: string[];
  
  // Initial tab
  initialTab?:  "media" | "docs";
  
  // Callbacks
  onPreviewFile: (file: Phase1AFileItem) => void;
  onOpenSourceMessage?:  (messageId: string) => void;
};

const getDocIcon = (ext?:  string) => {
  const e = (ext || "").toLowerCase();
  if (e === "xlsx" || e === "xls") {
    return <FileSpreadsheet className="h-5 w-5 text-emerald-600" />;
  }
  if (e === "doc" || e === "docx") {
    return <FileType2 className="h-5 w-5 text-sky-600" />;
  }
  if (e === "pdf") {
    return <FileText className="h-5 w-5 text-rose-600" />;
  }
  return <FileText className="h-5 w-5 text-gray-500" />;
};

export const AllFilesScreenMobile: React.FC<AllFilesScreenMobileProps> = ({
  open,
  onBack,
  mediaFiles,
  docFiles,
  senders,
  initialTab = "media",
  onPreviewFile,
  onOpenSourceMessage,
}) => {
  const [activeTab, setActiveTab] = React.useState<"media" | "docs">(initialTab);
  const [showFilter, setShowFilter] = React. useState(false);
  
  // Filters
  const [senderFilter, setSenderFilter] = React. useState<string>("all");
  const [datePreset, setDatePreset] = React.useState<string>("all");
  const [dateRange, setDateRange] = React.useState<{ from?:  string; to?: string }>({});

  // Reset tab when initialTab changes
  React.useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  // Reset filters when closing
  React.useEffect(() => {
    if (!open) {
      setSenderFilter("all");
      setDatePreset("all");
      setDateRange({});
    }
  }, [open]);

  if (!open) return null;

  const renderMediaTile = (f: Phase1AFileItem) => (
    <div
      key={f.id}
      className="group relative overflow-hidden rounded-lg bg-gray-100 aspect-[4/3]"
      onClick={() => onPreviewFile(f)}
    >
      {f.kind === "image" ?  (
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

      <div className="absolute inset-0 bg-black/0 active:bg-black/20 transition-colors" />

      {f.messageId && onOpenSourceMessage && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenSourceMessage(f.messageId! );
          }}
          className="absolute right-1 top-1 h-7 w-7 flex items-center justify-center
            bg-white/95 rounded-md shadow-sm active:bg-white"
        >
          <MessageCircle className="h-3. 5 w-3.5 text-gray-700" />
        </button>
      )}
    </div>
  );

  const renderDocRow = (f: Phase1AFileItem) => (
    <div
      key={f.id}
      className="group relative flex items-center gap-3 rounded-lg px-3 py-3 
        bg-white border border-gray-200 active:bg-gray-50"
      onClick={() => onPreviewFile(f)}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 flex-shrink-0">
        {getDocIcon(f.ext)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 line-clamp-2">
          {f.name}
        </div>
        {(f.sizeLabel || f.dateLabel) && (
          <div className="mt-0.5 text-xs text-gray-500">
            {f.sizeLabel && <span>{f.sizeLabel}</span>}
            {f. sizeLabel && f.dateLabel && <span className="mx-1">•</span>}
            {f.dateLabel && <span>{f.dateLabel}</span>}
          </div>
        )}
      </div>

      {f.messageId && onOpenSourceMessage && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenSourceMessage(f.messageId! );
          }}
          className="h-8 w-8 flex items-center justify-center
            bg-gray-50 rounded-md active:bg-gray-100 flex-shrink-0"
        >
          <MessageCircle className="h-4 w-4 text-gray-600" />
        </button>
      )}
    </div>
  );

  // Apply filters
  let sourceFiles = activeTab === "media" ? mediaFiles : docFiles;

  if (senderFilter !== "all") {
    sourceFiles = sourceFiles.filter((f) => {
      // Note: Cần truyền messageList vào để filter theo sender
      // Hoặc thêm sender vào Phase1AFileItem
      return true; // Placeholder
    });
  }

  // TODO: Apply date filters
  if (datePreset !== "all" && datePreset !== "custom") {
    const days = parseInt(datePreset);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    sourceFiles = sourceFiles.filter((f) => {
      if (!f.dateLabel) return true;
      // Parse dateLabel (format: dd/MM/yyyy)
      const [day, month, year] = f.dateLabel.split("/").map(Number);
      const fileDate = new Date(year, month - 1, day);
      return fileDate >= cutoff;
    });
  }

  // Group by date
  const groups = sourceFiles.reduce<{ date: string; items: Phase1AFileItem[] }[]>(
    (acc, f) => {
      const key = f.dateLabel || "Khác";
      const found = acc.find((g) => g.date === key);
      if (found) {
        found.items.push(f);
      } else {
        acc. push({ date: key, items:  [f] });
      }
      return acc;
    },
    []
  );

  const hasActiveFilters = senderFilter !== "all" || datePreset !== "all";

  return (
    <div className="absolute inset-0 z-[60] bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-3 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition"
            >
              <ChevronLeft className="h-5 w-5 text-brand-600" />
            </button>
            <div>
              <div className="text-sm font-semibold text-gray-800">
                Tất cả file
              </div>
              <div className="text-xs text-gray-500">
                {activeTab === "media"
                  ? `${mediaFiles.length} ảnh/video`
                  : `${docFiles.length} tài liệu`}
              </div>
            </div>
          </div>

          {/* Filter button */}
          <button
            onClick={() => setShowFilter(true)}
            className="relative p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition"
          >
            <Filter className="h-5 w-5 text-brand-600" />
            {hasActiveFilters && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500" />
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-3 pb-2">
          <button
            onClick={() => setActiveTab("media")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === "media"
                ?  "bg-emerald-50 text-emerald-700"
                : "bg-gray-50 text-gray-600 active:bg-gray-100"
            }`}
          >
            Ảnh / Video ({mediaFiles.length})
          </button>
          <button
            onClick={() => setActiveTab("docs")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === "docs"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-gray-50 text-gray-600 active:bg-gray-100"
            }`}
          >
            Tài liệu ({docFiles.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-4 bg-gray-50">
        {groups.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">
            Không có file nào
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((g) => (
              <div key={g.date}>
                {/* Date header - sticky */}
                <div className="sticky top-0 z-[5] bg-gray-50/95 backdrop-blur-sm 
                  py-2 mb-3 -mx-3 px-3">
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    {g.date}
                  </div>
                </div>

                {activeTab === "media" ? (
                  <div className="grid grid-cols-2 gap-2">
                    {g.items.map(renderMediaTile)}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {g.items.map(renderDocRow)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bottom safe area */}
        <div className="h-[calc(env(safe-area-inset-bottom,0px)+1rem)]" />
      </div>

      {/* Filter Sheet (Bottom Sheet) */}
      <Sheet open={showFilter} onOpenChange={setShowFilter}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl p-0 h-[40vh] w-[92vw] max-w-[430px] left-1/2 -translate-x-1/2 -translate-y-1/3  flex flex-col"
          style={{
            position: 'fixed',
            bottom: 0,            
            zIndex: 9998,
          }}
        >
          <SheetHeader className="px-4 py-4 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <SheetTitle>Bộ lọc</SheetTitle>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSenderFilter("all");
                    setDatePreset("all");
                    setDateRange({});
                  }}
                  className="text-xs text-brand-600"
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
            {/* Người gửi */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Người gửi
              </label>
              <Select value={senderFilter} onValueChange={setSenderFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn người gửi" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  side="top"
                  align="start"
                  className="z-[9999] max-h-[180px] overflow-y-auto"
                  sideOffset={4}
                  avoidCollisions={true}
                >
                  <SelectItem value="all">Tất cả</SelectItem>
                  {senders.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Thời gian */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Thời gian
              </label>
              <Select value={datePreset} onValueChange={setDatePreset}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn khoảng thời gian" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  side="top"
                  align="start"
                  className="z-[9999] max-h-[180px] overflow-y-auto"
                  sideOffset={4}
                  avoidCollisions={true}
                >
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="7">7 ngày gần đây</SelectItem>
                  <SelectItem value="15">15 ngày gần đây</SelectItem>
                  <SelectItem value="30">30 ngày gần đây</SelectItem>
                  <SelectItem value="custom">Tùy chỉnh...</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom date range */}
            {datePreset === "custom" && (
              <div className="space-y-3 pt-2">
                <div className="text-xs text-gray-500 mb-2">Gợi ý thời gian</div>
                <div className="grid grid-cols-3 gap-2">
                  {[7, 15, 30].map((d) => (
                    <Button
                      key={d}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const now = new Date();
                        const from = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
                        setDateRange({
                          from: from.toISOString().split("T")[0],
                          to: now.toISOString().split("T")[0],
                        });
                      }}
                      className="text-xs"
                    >
                      {d} ngày
                    </Button>
                  ))}
                </div>

                {/* Date range display */}
                {(dateRange.from || dateRange.to) && (
                  <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
                    <div className="font-medium mb-1">Khoảng thời gian đã chọn:</div>
                    <div>
                      {dateRange.from && (
                        <span>Từ {new Date(dateRange.from).toLocaleDateString("vi-VN")}</span>
                      )}
                      {dateRange.from && dateRange.to && <span> - </span>}
                      {dateRange.to && (
                        <span>đến {new Date(dateRange.to).toLocaleDateString("vi-VN")}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

    {/* Footer */}
    <div className="border-t p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] flex-shrink-0 bg-white">
      <Button
        onClick={() => setShowFilter(false)}
        className="w-full"
      >
        Áp dụng bộ lọc
      </Button>
    </div>
  </SheetContent>
</Sheet>
      
      
    </div>
  );
};