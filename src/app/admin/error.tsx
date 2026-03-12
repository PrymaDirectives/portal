"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AdminError]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#f7f6f3] flex items-center justify-center px-4">
      <div className="w-full max-w-lg invoice-sheet rounded-sm p-8 space-y-4">
        <h1 className="text-base font-semibold text-red-700">Something went wrong</h1>
        <pre className="text-xs text-neutral-600 bg-neutral-50 border border-neutral-200 rounded p-3 overflow-auto whitespace-pre-wrap break-all">
          {error.message}
          {error.digest ? `\n\nDigest: ${error.digest}` : ""}
        </pre>
        <button
          onClick={reset}
          className="rounded-sm bg-neutral-900 px-4 py-2 text-xs font-semibold text-white tracking-wide hover:bg-neutral-800 transition"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
