"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listPrivacyConsents,
  listPrivacyRequests,
  updatePrivacyRequest,
  type AdminCookieConsent,
  type AdminPrivacyRequest,
} from "@/services/admin-privacy.service";

const requestTypeLabel: Record<string, string> = {
  ACCESS: "Acesso",
  CORRECTION: "Correcao",
  DELETION: "Eliminacao",
  PORTABILITY: "Portabilidade",
  REVOCATION: "Revogacao",
  INFORMATION: "Informacoes",
  OTHER: "Outro",
};

const statusOptions = ["OPEN", "IN_REVIEW", "RESPONDED", "CLOSED", "REJECTED"];

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function consentSummary(consent: AdminCookieConsent) {
  const enabled = [
    consent.preferences ? "preferencias" : null,
    consent.analytics ? "analytics" : null,
    consent.marketing ? "marketing" : null,
  ].filter(Boolean);

  if (consent.acceptedAll) return "Aceitou todos";
  if (consent.rejectedAll) return "Recusou nao essenciais";
  return enabled.length ? enabled.join(", ") : "Somente necessarios";
}

export function PrivacyManagementView() {
  const [requests, setRequests] = useState<AdminPrivacyRequest[]>([]);
  const [consents, setConsents] = useState<AdminCookieConsent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [requestItems, consentItems] = await Promise.all([
        listPrivacyRequests(),
        listPrivacyConsents(),
      ]);
      setRequests(requestItems);
      setConsents(consentItems);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Nao foi possivel carregar LGPD.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadData]);

  const stats = useMemo(() => {
    const open = requests.filter((item) => item.status === "OPEN" || item.status === "IN_REVIEW").length;
    const closed = requests.filter((item) => item.status === "CLOSED" || item.status === "RESPONDED").length;
    return [
      { label: "Solicitacoes", value: requests.length },
      { label: "Em aberto", value: open },
      { label: "Respondidas/fechadas", value: closed },
      { label: "Consentimentos", value: consents.length },
    ];
  }, [consents.length, requests]);

  async function handleStatusChange(id: string, status: string) {
    setUpdatingId(id);
    setError("");
    try {
      const updated = await updatePrivacyRequest(id, { status });
      setRequests((current) => current.map((item) => (item.id === id ? updated : item)));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Nao foi possivel atualizar status.");
    } finally {
      setUpdatingId("");
    }
  }

  if (loading) {
    return <div className="rounded-[28px] bg-white p-8 text-sm font-semibold text-gray-500">Carregando modulo LGPD...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Governanca</p>
            <h1 className="mt-2 text-2xl font-bold text-gray-950">LGPD e privacidade</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Controle tecnico de solicitacoes de titulares e consentimentos de cookies. Esta area nao substitui revisao juridica.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadData()}
            className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            Atualizar
          </button>
        </div>

        {error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="rounded-[24px] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">{item.label}</p>
            <p className="mt-3 text-3xl font-bold text-gray-950">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[28px] bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-950">Solicitacoes dos titulares</h2>
          <span className="text-xs font-semibold text-gray-400">{requests.length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-[0.14em] text-gray-400">
              <tr>
                <th className="p-4">Titular</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Mensagem</th>
                <th className="p-4">Criada em</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="p-4">
                    <p className="font-semibold text-gray-950">{request.name}</p>
                    <p className="text-xs text-gray-500">{request.email}</p>
                  </td>
                  <td className="p-4 text-gray-600">{requestTypeLabel[request.type] ?? request.type}</td>
                  <td className="max-w-md p-4 text-gray-500">{request.message || "Sem mensagem adicional."}</td>
                  <td className="p-4 text-gray-500">{formatDate(request.createdAt)}</td>
                  <td className="p-4">
                    <select
                      value={request.status}
                      disabled={updatingId === request.id}
                      onChange={(event) => void handleStatusChange(request.id, event.target.value)}
                      className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-black"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[28px] bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-950">Consentimentos recentes</h2>
          <span className="text-xs font-semibold text-gray-400">{consents.length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-[0.14em] text-gray-400">
              <tr>
                <th className="p-4">Identificador</th>
                <th className="p-4">Origem</th>
                <th className="p-4">Versao</th>
                <th className="p-4">Escolha</th>
                <th className="p-4">Criado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {consents.map((consent) => (
                <tr key={consent.id}>
                  <td className="p-4">
                    <p className="font-semibold text-gray-950">{consent.email || consent.userId || "Anonimo"}</p>
                    <p className="text-xs text-gray-500">{consent.anonymousId || consent.id}</p>
                  </td>
                  <td className="p-4 text-gray-600">{consent.source}</td>
                  <td className="p-4 text-gray-500">{consent.consentVersion}</td>
                  <td className="p-4 text-gray-600">{consentSummary(consent)}</td>
                  <td className="p-4 text-gray-500">{formatDate(consent.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
