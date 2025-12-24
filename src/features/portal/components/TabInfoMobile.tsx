import React from "react";
import { ChevronLeft, Users, Plus, Images, FileText } from "lucide-react";
import { MobileAccordion } from "./MobileAccordion";
import { FileManagerPhase1A, Phase1AFileItem } from "../components/FileManagerPhase1A";
import { AllFilesScreenMobile } from "./AllFilesScreenMobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type MinimalMember = { id: string; name: string; role?:  "Leader" | "Member" };

export const TabInfoMobile: React. FC<{
  open: boolean;
  onBack: () => void;
  
  // Context
  groupId?: string;
  groupName?: string;
  workTypeName?: string;
  selectedWorkTypeId?: string;
  viewMode?: "lead" | "staff";
  
  // Members (for leader only)
  members?: MinimalMember[];
  onAddMember?: () => void;
  
  // Navigation
  onOpenSourceMessage?: (messageId: string) => void;
  
  // 🆕 NEW: File data from parent
  allMediaFiles?: Phase1AFileItem[];
  allDocFiles?: Phase1AFileItem[];
  allSenders?: string[];
}> = ({
  open,
  onBack,
  groupId,
  groupName = "Nhóm",
  workTypeName = "—",
  selectedWorkTypeId,
  viewMode = "staff",
  members = [],
  onAddMember,
  onOpenSourceMessage,
  allMediaFiles = [],
  allDocFiles = [],
  allSenders = [],
}) => {
  const [showAllFiles, setShowAllFiles] = React.useState(false);
  const [allFilesTab, setAllFilesTab] = React.useState<"media" | "docs">("media");
  const [previewFile, setPreviewFile] = React.useState<Phase1AFileItem | null>(null);

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
                Thông tin
              </div>
              <div className="text-xs text-gray-500 truncate">
                {groupName} • <span className="text-brand-600">{workTypeName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 bg-gray-50">        
          {/* Ảnh / Video */}
          <MobileAccordion 
            title="Ảnh / Video" 
            icon={<Images className="h-4 w-4 text-emerald-600" />}
            defaultOpen={true}
          >
            <FileManagerPhase1A
              mode="media"
              groupId={groupId}
              selectedWorkTypeId={selectedWorkTypeId}
              onOpenSourceMessage={onOpenSourceMessage}
              isMobile
              onOpenAllFiles={(mode) => {
                setAllFilesTab(mode);
                setShowAllFiles(true);
              }}
            />
          </MobileAccordion>

          {/* Tài liệu */}
          <MobileAccordion 
            title="Tài liệu" 
            icon={<FileText className="h-4 w-4 text-blue-600" />}
            defaultOpen={true}
          >
            <FileManagerPhase1A
              mode="docs"
              groupId={groupId}
              selectedWorkTypeId={selectedWorkTypeId}
              onOpenSourceMessage={onOpenSourceMessage}
              isMobile
              onOpenAllFiles={(mode) => {
                setAllFilesTab(mode);
                setShowAllFiles(true);
              }}
            />
          </MobileAccordion>

          {/* Thành viên (Leader only) */}
          {viewMode === "lead" && (
            <MobileAccordion 
              title="Thành viên"
              icon={<Users className="h-4 w-4 text-brand-600" />}
              badge={
                <span className="text-xs text-gray-500 font-normal">
                  {members.length}
                </span>
              }
              defaultOpen={false}
            >
              <div className="space-y-3">
                {members.length === 0 ? (
                  <div className="text-xs text-gray-400 text-center py-4">
                    Chưa có thành viên nào
                  </div>
                ) : (
                  <div className="space-y-2">
                    {members.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition"
                      >
                        <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-semibold text-brand-700">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-800 truncate">
                            {m.name}
                          </div>
                          {m.role && (
                            <div className="text-xs text-gray-500">{m.role}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {onAddMember && (
                  <button
                    onClick={onAddMember}
                    className="w-full mt-3 py-2 rounded-lg border border-dashed border-brand-300 text-sm text-brand-600 hover:bg-brand-50 active:bg-brand-100 transition flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Thêm thành viên</span>
                  </button>
                )}
              </div>
            </MobileAccordion>
          )}

          {/* Bottom spacing for safe area */}
          <div className="h-[calc(env(safe-area-inset-bottom,0px)+1rem)]" />
        </div>
      </div>

      {/* All Files Screen */}
      {showAllFiles && (
        <AllFilesScreenMobile
          open={showAllFiles}
          onBack={() => setShowAllFiles(false)}
          mediaFiles={allMediaFiles}
          docFiles={allDocFiles}
          senders={allSenders}
          initialTab={allFilesTab}
          onPreviewFile={(file) => {
            setPreviewFile(file);
          }}
          onOpenSourceMessage={(msgId) => {
            setShowAllFiles(false);
            onOpenSourceMessage?.(msgId);
          }}
        />
      )}

      {/* Preview Dialog */}
      <Dialog
        open={!!previewFile}
        onOpenChange={(open) => ! open && setPreviewFile(null)}
      >
        <DialogContent
          className="max-w-[95vw] max-h-[90vh]"
          onContextMenu={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-sm truncate">
              {previewFile?.name || "Xem trước"}
            </DialogTitle>
          </DialogHeader>

          {previewFile && previewFile.kind === "image" && (
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
            <div className="rounded-lg border border-dashed p-8 text-sm text-gray-500 text-center">
              Xem trước tài liệu sẽ được tích hợp ở bước tiếp theo. 
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};