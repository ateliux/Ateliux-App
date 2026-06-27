import { ClientPortalButton } from "@/components/client-portal/ui/ClientPortalButton";

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
    <div className="rounded-2xl border border-rose-100 bg-white p-6 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
      {onRetry ? (
        <ClientPortalButton className="mt-5" variant="secondary" onClick={onRetry}>
          {retryLabel}
        </ClientPortalButton>
      ) : null}
    </div>
  );
}
