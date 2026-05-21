"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Toast = { id: number; text: string; tone: "success" | "info" | "error" };

const ToastCtx = createContext<{ push: (text: string, tone?: Toast["tone"]) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((text: string, tone: Toast["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text, tone }]);
  }, []);

  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((t) =>
      setTimeout(() => {
        setToasts((prev) => prev.filter((p) => p.id !== t.id));
      }, 3200)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts]);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              "pointer-events-auto max-w-sm rounded-md border px-4 py-3 text-sm shadow-lg " +
              (t.tone === "error"
                ? "border-[#4a2424] bg-[#341a1a] text-[#f0d6d6]"
                : t.tone === "info"
                  ? "border-cream-faint bg-dark3 text-cream"
                  : "border-gold bg-gold-dim text-cream")
            }
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast() doit être utilisé dans <ToastProvider>");
  return ctx;
}
