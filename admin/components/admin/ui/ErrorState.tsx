import { AdminButton } from "./AdminButton";

type ErrorStateProps = {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Nao foi possivel carregar estes dados agora.",
  description = "Tente novamente em instantes.",
  retryLabel = "Tentar novamente",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-bold text-gray-900">{title}</p>
      <p className="mt-2 text-xs leading-5 text-gray-500">{description}</p>
      {onRetry ? (
        <AdminButton className="mt-5" variant="secondary" onClick={onRetry}>
          {retryLabel}
        </AdminButton>
      ) : null}
    </div>
  );
}
