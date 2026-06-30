export type ApiErrorPayload = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  details?:
    | string
    | {
        message?: string | string[];
        error?: string;
        statusCode?: number;
      };
};

export type ApiRequestInit = RequestInit & {
  json?: unknown;
  skipAuthRefresh?: boolean;
};
