import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { ChecklistVariant } from "../../types";

interface AddEditVariantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: ChecklistVariant | null; // null = add new
  existingNames: string[];
  isFirstVariant: boolean; // First variant is always default
  onSave: (name: string, isDefault: boolean) => void;
}

export const AddEditVariantDialog: React. FC<AddEditVariantDialogProps> = ({
  open,
  onOpenChange,
  variant,
  existingNames,
  isFirstVariant,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName(variant?.name ??  "");
      setIsDefault(variant?.isDefault ?? isFirstVariant);
      setError("");
    }
  }, [open, variant, isFirstVariant]);

  const validate = (value: string): string | null => {
    const trimmed = value.trim();

    if (!trimmed) {
      return "Tên dạng checklist không được để trống";
    }

    if (trimmed.length > 50) {
      return "Tên dạng checklist không được vượt quá 50 ký tự";
    }

    // Check special characters (only allow letters, numbers, spaces, Vietnamese)
    const specialCharRegex = /[^a-zA-ZÀ-ỹ0-9\s]/;
    if (specialCharRegex.test(trimmed)) {
      return "Tên dạng checklist không được chứa ký tự đặc biệt";
    }

    // Check duplicate
    if (existingNames.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      return "Tên dạng checklist đã tồn tại";
    }

    return null;
  };

  const handleSave = () => {
    const validationError = validate(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    onSave(name. trim(), isDefault);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e. key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {variant ? "Chỉnh sửa Dạng Checklist" :  "Thêm Dạng Checklist"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Name Input */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Tên dạng checklist <span className="text-rose-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tên..."
              autoFocus
              maxLength={51}
            />
            <p className="text-xs text-gray-500 mt-1">
              {name.trim().length}/50 ký tự
            </p>
          </div>

          {/* Default Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="default-variant"
              checked={isDefault}
              onCheckedChange={(checked) => setIsDefault(checked === true)}
              disabled={isFirstVariant} // First variant must be default
            />
            <label
              htmlFor="default-variant"
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              Đặt làm dạng mặc định
            </label>
          </div>

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Info */}
          {isFirstVariant && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Dạng checklist đầu tiên sẽ tự động được đặt làm mặc định. 
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};