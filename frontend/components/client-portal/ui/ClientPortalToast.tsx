import { CheckCircle2 } from "lucide-react";

export function ClientPortalToast({ message }: { message: string }) {
  return <div role="status" className="fixed bottom-5 right-5 z-[100] flex max-w-sm items-center gap-3 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white shadow-xl"><CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />{message}</div>;
}
