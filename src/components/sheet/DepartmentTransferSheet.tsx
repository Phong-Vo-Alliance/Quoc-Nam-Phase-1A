import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectItem, SelectValue, SelectContent } from "@/components/ui/select";
import type { ReceivedInfo } from "../../features/portal/types";

interface Props {
  open: boolean;
  info?: ReceivedInfo;
  departments: { id: string; name: string }[];
  onClose: () => void;
  onConfirm: (infoId: string, departmentId: string) => void;
}

export function DepartmentTransferSheet({
  open,
  info,
  departments,
  onClose,
  onConfirm,
}: Props) {
  const [targetDept, setTargetDept] = React.useState<string>("");

  React.useEffect(() => {
    if (open) setTargetDept("");
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[380px]">
        <SheetHeader>
          <SheetTitle>Chuyển phòng ban xử lý</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div>
            <Label className="text-sm text-gray-600">Nội dung tiếp nhận</Label>
            <div className="mt-1 p-2 rounded-md bg-gray-50 border text-sm">
              {info?.title}
            </div>
          </div>

          <div>
            <Label className="text-sm text-gray-600">Chọn phòng ban</Label>

            <Select value={targetDept} onValueChange={(v) => setTargetDept(v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Chọn phòng ban..." />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            disabled={!targetDept}
            onClick={() => info && onConfirm(info.id, targetDept)}
          >
            Chuyển
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
