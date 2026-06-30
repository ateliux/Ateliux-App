import type { ApiErrorPayload } from "./api-types";

const fallbackMessages: Record<number, string> = {
  401: "Sessao expirada. Entre novamente para continuar.",
  403: "Voce nao tem permissao para executar esta acao.",
  404: "Recurso nao encontrado.",
  422: "Revise os dados enviados e tente novamente.",
  429: "Muitas tentativas. Aguarde um momento e tente novamente.",
  500: "Erro interno na API. Tente novamente em instantes.",
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly payload?: ApiErrorPayload,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function messageFromUnknown(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "string") return value;
  return "";
}

export async function normalizeApiError(response: Response) {
  let payload: ApiErrorPayload | undefined;
  let message = fallbackMessages[response.status] ?? `Erro ${response.status} ao chamar API.`;

  try {
    payload = (await response.json()) as ApiErrorPayload;
    const directMessage = messageFromUnknown(payload.message);
    const details = payload.details;
    const detailsMessage =
      typeof details === "string" ? details : messageFromUnknown(details?.message);

    if (directMessage) message = directMessage;
    else if (detailsMessage) message = detailsMessage;
    else if (typeof details !== "string" && details?.error) message = details.error;
    else if (payload.error) message = payload.error;
  } catch {
    const text = await response.text();
    if (text) message = text;
  }

  return new ApiError(message, response.status, payload);
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
