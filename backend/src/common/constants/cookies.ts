export const AUTH_COOKIE_NAMES = {
  legacy: {
    access: 'ateliux_access_token',
    refresh: 'ateliux_refresh_token',
  },
  admin: {
    access: 'ateliux_admin_access_token',
    refresh: 'ateliux_admin_refresh_token',
  },
  client: {
    access: 'ateliux_client_access_token',
    refresh: 'ateliux_client_refresh_token',
  },
} as const;

export type AuthCookieScope = keyof Omit<typeof AUTH_COOKIE_NAMES, 'legacy'>;
