export const useCaseCategoryIds = [
  "ecommerce",
  "landing-pages",
  "institutional",
  "saas",
  "dashboards",
  "automations",
  "crm",
  "design",
  "backend",
  "marketing",
  "operations",
] as const;

export type UseCaseCategoryId = (typeof useCaseCategoryIds)[number];

export function isUseCaseCategoryId(value: string | null): value is UseCaseCategoryId {
  return useCaseCategoryIds.some((categoryId) => categoryId === value);
}
