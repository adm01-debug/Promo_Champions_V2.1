import { cn } from "@/lib/utils";
import React from "react";

export const NeonText = React.memo(function NeonText({ children, color, className }: { children: React.ReactNode; color: string; className?: string }) {
  return (
    <span
      className={cn("relative", className)}
      style={{ textShadow: `0 0 7px ${color}, 0 0 10px ${color}, 0 0 21px ${color}` }}
    >
      {children}
    </span>
  );
});
