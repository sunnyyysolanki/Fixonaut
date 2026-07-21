import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={[
        "rounded-2xl border border-slate-800 bg-slate-900",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

type CardHeaderProps = HTMLAttributes<HTMLDivElement>;

export function CardHeader({
  className = "",
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div className={["p-6", className].join(" ")} {...props}>
      {children}
    </div>
  );
}

type CardContentProps = HTMLAttributes<HTMLDivElement>;

export function CardContent({
  className = "",
  children,
  ...props
}: CardContentProps) {
  return (
    <div className={["px-6 pb-6", className].join(" ")} {...props}>
      {children}
    </div>
  );
}