type QuickPick = {
  label: string;
  value: string;
};

type QuickPicksProps = {
  /** Short caption shown before the chips, e.g. "Quick pick:". */
  label?: string;
  options: QuickPick[];
  onPick: (value: string) => void;
  className?: string;
};

/**
 * A row of small "chip" buttons that fill a field with a common value —
 * makes date/time (and similar) selection fast and obvious.
 */
export function QuickPicks({
  label,
  options,
  onPick,
  className = "",
}: QuickPicksProps) {
  return (
    <div className={["flex flex-wrap items-center gap-2", className].join(" ")}>
      {label && <span className="text-xs text-slate-500">{label}</span>}

      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={() => onPick(option.value)}
          className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300 transition hover:border-orange-500 hover:text-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
