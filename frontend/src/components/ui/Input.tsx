import { forwardRef, type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  /** Optional helper text shown under the field when there is no error. */
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, className = "", ...props },
  ref,
) {
  const inputId = id ?? props.name;

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-slate-200"
      >
        {label}
      </label>

      <input
        ref={ref}
        id={inputId}
        className={[
          "min-h-10 w-full rounded-lg border bg-slate-950 px-3 py-2 text-sm text-white outline-none transition",
          "placeholder:text-slate-600",
          "focus:ring-2 focus:ring-orange-500",
          error ? "border-red-500 focus:ring-red-500" : "border-slate-700",
          className,
        ].join(" ")}
        {...props}
      />

      {error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
});
