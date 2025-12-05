import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import React from "react";
import type { Message, ReceivedInfo } from "../../features/portal/types";

interface Props {
  open: boolean;
  source?: "message" | "receivedInfo";
  message?: Message;
  info?: ReceivedInfo;

  members: Array<{ id: string; name: string }>;

  selectedWorkTypeId?: string;

  // danh sách dạng checklist của work type (nếu có)
  checklistVariants?: { id: string; name: string; isDefault?: boolean }[];

  // id dạng checklist mặc định (nếu có)
  defaultChecklistVariantId?: string;

  onClose: () => void;
  onCreateTask: (payload: {
    title: string;
    sourceMessageId: string;
    assigneeId: string;
    checklistVariantId?: string;
    checklistVariantName?: string;
  }) => void;
}

export function AssignTaskSheet({
  open,
  source,
  message,
  info,
  members,
  selectedWorkTypeId,
  checklistVariants,
  defaultChecklistVariantId,
  onClose,
  onCreateTask,
}: Props) {
  const [assignee, setAssignee] = React.useState("");
  const [title, setTitle] = React.useState("");

  // dạng checklist được chọn
  const [checklistVariantId, setChecklistVariantId] = React.useState<string>("");

  React.useEffect(() => {
    if (!open) return;

    if (source === "message" && message) {
      setTitle(message.content || "");
    } else if (source === "receivedInfo" && info) {
      setTitle(info.title);
    }

    setAssignee(members[0]?.id ?? "");

    // reset dạng checklist theo default hoặc phần tử đầu
    if (checklistVariants && checklistVariants.length > 0) {
      const defaultId =
        defaultChecklistVariantId ??
        checklistVariants.find((v) => v.isDefault)?.id ??
        checklistVariants[0]?.id ??
        "";

      setChecklistVariantId(defaultId);
    } else {
      setChecklistVariantId("");
    }
  }, [open, source, message, info, members, checklistVariants, defaultChecklistVariantId]);


  const handleSubmit = () => {
    if (!assignee || !title.trim()) return;

    const trimmedTitle = title.trim();
    const variant = checklistVariantId;
    const selectedVariant = checklistVariants?.find((v) => v.id === variant);

    onCreateTask({
      title: trimmedTitle,
      sourceMessageId: (source === "message" ? message?.id : info?.messageId) || "",
      assigneeId: assignee,
      checklistVariantId: variant || undefined,
      checklistVariantName: selectedVariant?.name,
    });

    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[380px]">
        <SheetHeader className="pb-3 border-b border-gray-100">
          <SheetTitle className="text-base font-semibold text-gray-900">
            Giao Công Việc
          </SheetTitle>
          <p className="text-[12px] text-gray-500 mt-0.5">
            Tạo công việc mới cho thành viên trong nhóm
          </p>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div>
            <Label className="text-xs font-medium text-gray-700">Tên công việc</Label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-700">Giao cho</Label>
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Chọn nhân viên..." />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dạng checklist (sub work type) */}
          {checklistVariants && checklistVariants.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-700">
                Dạng checklist
              </Label>
              <Select
                value={checklistVariantId}
                onValueChange={setChecklistVariantId}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn dạng checklist..." />
                </SelectTrigger>
                <SelectContent>
                  {checklistVariants.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>              
            </div>
          )}

        </div>

        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Huỷ
          </Button>
          <Button onClick={handleSubmit}>Giao việc</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
