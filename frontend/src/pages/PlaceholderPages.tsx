type PagePlaceholderProps = {
  title: string;
};

export function PagePlaceholder({ title }: PagePlaceholderProps) {
  return (
    <section>
      <p className="text-sm font-medium text-orange-400">Module</p>
      <h1 className="mt-1 text-3xl font-bold text-white">{title}</h1>

      <div className="mt-8 rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-10 text-center">
        <p className="text-slate-400">
          This module will be implemented in a later phase.
        </p>
      </div>
    </section>
  );
}