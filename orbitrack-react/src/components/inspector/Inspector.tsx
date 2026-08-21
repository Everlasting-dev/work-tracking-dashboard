import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function Inspector({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-[420px] max-w-[calc(100vw-24px)] border-l border-border bg-bg shadow-2xl outline-none">
          <div className="h-12 px-3 border-b border-border flex items-center gap-2">
            <Dialog.Title className="text-[14px] font-semibold flex-1 truncate">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" title="Close">
                <X size={15} />
              </Button>
            </Dialog.Close>
          </div>
          <div className="h-[calc(100%-48px)] overflow-auto p-3">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
