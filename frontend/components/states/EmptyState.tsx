type EmptyStateProps = {
  title?: string;
  description?: string;
};

export function EmptyState({ title = "Nada encontrado.", description = "Quando houver dados, eles aparecerao aqui." }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}
