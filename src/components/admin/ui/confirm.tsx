"use client";

import { useState } from "react";
import { Button } from "./button";
import { Dialog, DialogContent, DialogFooter, DialogBody } from "./dialog";

/** Destructive actions always ask first. */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Sil",
  onConfirm,
}: {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => Promise<unknown> | void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <DialogContent title={title} description={description} className="w-[min(92vw,440px)]">
        <DialogBody className="sr-only">{description}</DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
            İmtina
          </Button>
          <Button
            variant="danger"
            loading={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
                setOpen(false);
              } finally {
                setBusy(false);
              }
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
