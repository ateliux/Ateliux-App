type EmptyStateProps = {
  title?: string;
  description?: string;
};

export function EmptyState({ title = "Nada encontrado.", description = "Quando houver dados, eles aparecerao aqui." }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-bold text-gray-900">{title}</p>
      <p className="mt-2 text-xs leading-5 text-gray-500">{description}</p>
    </div>
  );
}
