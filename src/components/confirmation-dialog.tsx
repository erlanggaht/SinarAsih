"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export function ConfirmationDialog({
  title,
  children,
  busy,
  onClose,
}: {
  title: string;
  children: ReactNode;
  busy: boolean;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      aria-busy={busy}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto border border-border bg-card p-0 text-card-foreground shadow-xl backdrop:bg-black/50"
    >
      <div className="flex items-start justify-between gap-3 border-b border-border p-5">
        <h2 id={titleId} className="pt-2 text-xl font-semibold wrap-anywhere">
          {title}
        </h2>
        <button
          type="button"
          disabled={busy}
          aria-label="Batalkan penghapusan"
          onClick={onClose}
          className="flex size-11 shrink-0 items-center justify-center hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  );
}
