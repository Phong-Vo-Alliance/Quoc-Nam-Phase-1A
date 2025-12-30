import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { ReceivedInfo, GroupChat } from "@/features/portal/types";
import { ArrowRight, Users, Briefcase } from "lucide-react";

interface Props {
  open: boolean;
  info?:  ReceivedInfo;

  groups:  GroupChat[];
  currentUserId: string;
  currentUserName: string;
  members: Array<{ id: string; name:  string }>;

  onClose: () => void;
  onConfirm: (payload: {
    infoId: string;
    toGroupId: string;
    workTypeId: string;
    assigneeId: string;
    toGroupName: string;
    toWorkTypeName: string;
  }) => void;
}

export const MobileGroupTransferSheet: React. FC<Props> = ({
  open,
  info,
  groups,
  currentUserId,
  currentUserName,
  members,
  onClose,
  onConfirm,
}) => {
  const [selectedGroupId, setSelectedGroupId] = React.useState("");
  const [selectedWorkTypeId, setSelectedWorkTypeId] = React.useState("");
  const [assignee, setAssignee] = React.useState(currentUserId);

  React.useEffect(() => {
    if (! open || !info) return;
    setSelectedGroupId("");
    setSelectedWorkTypeId("");
    setAssignee(currentUserId);
  }, [open, info, currentUserId]);

  const group = groups.find((g) => g.id === selectedGroupId);
  const canSubmit = selectedGroupId && selectedWorkTypeId && assignee;

  const handleSubmit = () => {
    if (!info || !canSubmit) return;

    const wt = group?.workTypes?. find(w => w.id === selectedWorkTypeId);

    onConfirm({
      infoId: info.id,
      toGroupId: selectedGroupId,
      workTypeId: selectedWorkTypeId,
      assigneeId: assignee,
      toGroupName: group?.name || "",
      toWorkTypeName:  wt?.name || "",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl z-[200] shadow-2xl px-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]"
        style={{
          // Inline styles win over Sheet's default inset-x:0; ensure true centering and width
          width: "min(92vw, 430px)",
          left: "50%",
          right: "auto",
          transform: "translateX(-50%)",
          marginBottom: "100px",
        }}
      >
        <SheetHeader className="pb-3 border-b">
          <SheetTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <ArrowRight className="h-5 w-5 text-amber-600" />
            Chuyển nhóm xử lý
          </SheetTitle>
          {info && (
            <p className="text-xs text-gray-500 line-clamp-1 mt-1">
              {info.title}
            </p>
          )}
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Chọn nhóm */}
          <div>
            <Label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1. 5">
              <Users className="h-4 w-4 text-gray-500" />
              Nhóm đích
            </Label>
            <Select value={selectedGroupId} onValueChange={(val) => {
              setSelectedGroupId(val);
              setSelectedWorkTypeId(""); // Reset work type
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn nhóm..." />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Chọn work type */}
          {group && group.workTypes && group.workTypes.length > 0 && (
            <div>
              <Label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <Briefcase className="h-4 w-4 text-gray-500" />
                Loại việc
              </Label>
              <Select value={selectedWorkTypeId} onValueChange={setSelectedWorkTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại việc..." />
                </SelectTrigger>
                <SelectContent>
                  {group.workTypes.map((wt) => (
                    <SelectItem key={wt.id} value={wt. id}>
                      {wt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Chọn assignee (optional:  có thể ẩn nếu muốn) */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5">
              Giao cho (tùy chọn)
            </Label>
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[260px] z-[250]" position="popper" sideOffset={4}>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="mt-6">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
          >
            Xác nhận chuyển
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};