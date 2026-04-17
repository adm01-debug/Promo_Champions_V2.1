import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { AIEmailComposerDialog } from "./AIEmailComposerDialog";
import type { RecipientType } from "./aiEmailHelpers";

interface Props extends Omit<ButtonProps, "onClick"> {
  recipientId?: string;
  recipientType?: RecipientType;
  recipientEmail?: string;
  recipientName?: string;
  recipientCompany?: string;
  clientId?: string;
  label?: string;
}

export function AIEmailComposerButton({
  recipientId,
  recipientType,
  recipientEmail,
  recipientName,
  recipientCompany,
  clientId,
  label = "Escrever com IA",
  variant = "outline",
  size = "sm",
  className,
  ...rest
}: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
        {...rest}
      >
        <Sparkles className="h-4 w-4" />
        {label}
      </Button>
      <AIEmailComposerDialog
        open={open}
        onOpenChange={setOpen}
        recipientId={recipientId}
        recipientType={recipientType}
        recipientEmail={recipientEmail}
        recipientName={recipientName}
        recipientCompany={recipientCompany}
        clientId={clientId}
      />
    </>
  );
}
