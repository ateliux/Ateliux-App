export function isDevFallbackEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_ENABLE_DEV_FALLBACK === "true";
}

export function assertNoMockInProduction(source: string) {
  if (process.env.NODE_ENV === "production") {
    throw new Error(`Mock/fallback bloqueado em producao: ${source}`);
  }
}

export function canUseDevFallback(source: string) {
  void source;
  return isDevFallbackEnabled();
}
