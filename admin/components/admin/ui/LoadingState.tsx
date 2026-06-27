type LoadingStateProps = {
  title?: string;
  description?: string;
};

export function LoadingState({ title = "Carregando dados", description = "Buscando informacoes atualizadas." }: LoadingStateProps) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-gray-200 border-t-[#00B074]" />
      <p className="mt-4 text-sm font-bold text-gray-900">{title}</p>
      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </div>
  );
}
