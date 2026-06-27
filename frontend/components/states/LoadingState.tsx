type LoadingStateProps = {
  title?: string;
  description?: string;
};

export function LoadingState({ title = "Carregando dados", description = "Buscando informacoes atualizadas." }: LoadingStateProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-black" />
      <p className="mt-4 text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}
