"use client";

import { useState } from "react";

// Copies `text` to the clipboard and says so for a moment.
export function CopyButton({ text, label = "Copy", className }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard blocked (e.g. not https); the text is still on screen to copy by hand.
        }
      }}
      className={className ?? "cursor-pointer text-sm text-cherry underline-offset-4 hover:underline"}
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}
