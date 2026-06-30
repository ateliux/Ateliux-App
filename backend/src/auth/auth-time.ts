export function durationToMs(value: string, fallbackMs: number) {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) return fallbackMs;

  const amount = Number(match[1]);
  const unit = match[2];
  const multiplier =
    unit === 's' ? 1000 : unit === 'm' ? 60_000 : unit === 'h' ? 3_600_000 : 86_400_000;

  return amount * multiplier;
}

export function expiresAtFromNow(value: string, fallbackMs = 7 * 24 * 60 * 60 * 1000) {
  return new Date(Date.now() + durationToMs(value, fallbackMs));
}
