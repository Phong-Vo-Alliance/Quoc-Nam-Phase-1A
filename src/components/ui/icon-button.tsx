import * as React from "react";
import { Button } from "@/components/ui/button";

interface IconButtonProps extends React.ComponentProps<typeof Button> {
  icon: React.ReactNode;
  label?: string; // accessible label (tooltip)
}

export function IconButton({ icon, label, className, ...props }: IconButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      className={`text-brand-600 hover:bg-brand-50 hover:text-brand-700 
                  hover:border hover:border-brand-600 focus-visible:ring-brand-600 ${className}`}
      {...props}
    >
      {icon}
    </Button>
  );
}
