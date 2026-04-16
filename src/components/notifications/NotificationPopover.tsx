import { type ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NotificationCenter } from "./NotificationCenter";

interface NotificationPopoverProps {
  children: ReactNode;
}

export function NotificationPopover({ children }: NotificationPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[420px] p-0 border-0 shadow-2xl"
        sideOffset={8}
      >
        <NotificationCenter />
      </PopoverContent>
    </Popover>
  );
}
