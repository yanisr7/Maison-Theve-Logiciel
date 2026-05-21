"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "danger" | "subtle";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-gold text-[var(--dark)] hover:bg-[var(--gold-light)] focus-visible:outline-gold",
  ghost:
    "border border-cream-faint text-cream hover:border-gold hover:text-gold focus-visible:outline-gold",
  danger:
    "border border-[#4a2424] bg-[#341a1a] text-[#d68a8a] hover:bg-[#3f1f1f] focus-visible:outline-[#d68a8a]",
  subtle:
    "bg-cream-faint text-cream hover:bg-[rgba(240,232,212,0.2)] focus-visible:outline-cream",
};

export const ActionButton = forwardRef<HTMLButtonElement, Props>(function ActionButton(
  { className, variant = "primary", ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2",
        VARIANTS[variant],
        className
      )}
      {...rest}
    />
  );
});
