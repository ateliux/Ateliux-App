export type ApiErrorPayload = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
};

export type ApiRequestInit = RequestInit & {
  json?: unknown;
};
