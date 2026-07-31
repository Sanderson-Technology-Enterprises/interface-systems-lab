"use client";

import { useRef } from "react";

export function NativeDialogDemo() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  function openDialog() {
    const dialog = dialogRef.current;
    if (dialog === null || dialog.open) return;

    dialog.returnValue = "";
    dialog.showModal();
  }

  function restoreOpenerFocus() {
    openerRef.current?.focus();
  }

  return (
    <div className="native-dialog-demo ly-stack ly-gap-4">
      <button
        className="interactive-surface site-action"
        data-surface-variant="primary"
        data-surface-level="2"
        type="button"
        ref={openerRef}
        onClick={openDialog}
      >
        Open native dialog
      </button>

      <dialog
        ref={dialogRef}
        aria-describedby="native-dialog-description"
        aria-labelledby="native-dialog-title"
        data-native-part="dialog-backdrop"
        onClose={restoreOpenerFocus}
        onClick={(event) => {
          // A backdrop click targets the dialog itself; clicks inside its article do not.
          if (event.target === event.currentTarget) {
            event.currentTarget.close("backdrop");
          }
        }}
      >
        <article className="native-dialog-body ly-stack ly-gap-4">
          <header className="ly-stack ly-gap-2">
            <p className="section-label">Browser top layer</p>
            <h4 id="native-dialog-title">Native dialog specimen</h4>
            <p id="native-dialog-description">
              This modal uses <code>showModal()</code>, the browser backdrop,
              native Escape handling, and a{" "}
              <code>method=&quot;dialog&quot;</code>
              close action.
            </p>
          </header>

          <form method="dialog" className="dialog-actions ly-cluster ly-gap-4">
            <button
              className="interactive-surface site-action"
              data-surface-variant="primary"
              data-surface-level="2"
              type="submit"
              value="confirmed"
            >
              Close native dialog
            </button>
            <button
              className="interactive-surface site-action"
              data-surface-variant="subtle"
              data-surface-level="1"
              type="submit"
              value="cancelled"
            >
              Cancel
            </button>
          </form>
        </article>
      </dialog>
    </div>
  );
}
