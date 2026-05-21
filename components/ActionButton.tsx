"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "danger" | "subtle";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const SHADCN_VARIANT: Record<
  Variant,
  "default" | "outline" | "destructive" | "secondary"
> = {
  primary: "default",
  ghost: "outline",
  danger: "destructive",
  subtle: "secondary",
};

export const ActionButton = forwardRef<HTMLButtonElement, Props>(
  function ActionButton({ className, variant = "primary", ...rest }, ref) {
    return (
      <Button
        ref={ref}
        variant={SHADCN_VARIANT[variant]}
        className={cn(className)}
        {...rest}
      />
    );
  }
);
