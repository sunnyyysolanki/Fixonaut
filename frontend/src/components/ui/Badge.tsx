import type { ReactNode } from "react";

type BadgeVariant =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "orange";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-slate-800 text-slate-300",
  info: "bg-blue-950 text-blue-300",
  success: "bg-emerald-950 text-emerald-300",
  warning: "bg-amber-950 text-amber-300",
  danger: "bg-red-950 text-red-300",
  orange: "bg-orange-950 text-orange-300",
};

export function Badge({
  children,
  variant = "neutral",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variantClasses[variant],
      ].join(" ")}
    >
      {children}
    </span>
  );
}