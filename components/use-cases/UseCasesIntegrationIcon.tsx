import type { UseCaseIntegrationIconName } from "../../content/use-cases";

type UseCasesIntegrationIconProps = {
  icon: UseCaseIntegrationIconName;
};

export function UseCasesIntegrationIcon({ icon }: UseCasesIntegrationIconProps) {
  if (icon === "whatsapp") {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
        <path d="M20.52 3.48A11.8 11.8 0 0 0 12.09 0C5.57 0 .27 5.3.27 11.82c0 2.08.54 4.12 1.58 5.92L.17 24l6.41-1.68a11.82 11.82 0 0 0 5.51 1.4h.01c6.52 0 11.82-5.3 11.82-11.82 0-3.15-1.23-6.12-3.4-8.42ZM12.1 21.73h-.01a9.8 9.8 0 0 1-4.99-1.37l-.36-.22-3.8 1 1.01-3.7-.24-.38a9.78 9.78 0 0 1-1.5-5.24c0-5.42 4.42-9.83 9.86-9.83a9.8 9.8 0 0 1 6.96 2.88 9.79 9.79 0 0 1 2.89 6.97c0 5.42-4.41 9.83-9.82 9.83Zm5.4-7.36c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47a9 9 0 0 1-1.66-2.06c-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.49s1.08 2.9 1.23 3.1c.15.2 2.12 3.24 5.13 4.54.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" />
      </svg>
    );
  }

  if (icon === "instagram") {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="#E1306C" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" stroke="#E1306C" strokeWidth="2" />
        <circle cx="17.5" cy="6.5" r="1.25" fill="#E1306C" />
      </svg>
    );
  }

  if (icon === "gmail") {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 8.41l8.073-4.917C21.691 2.279 24 3.434 24 5.457Z" fill="#EA4335" />
        <path d="M18.545 10.09V22h3.819A1.636 1.636 0 0 0 24 20.364V5.457c0-1.045-.636-1.945-1.545-2.273l-3.91 2.382v4.524Z" fill="#C5221F" />
        <path d="M5.455 10.09V22H1.636A1.636 1.636 0 0 1 0 20.364V5.457c0-1.045.636-1.945 1.545-2.273l3.91 2.382v4.524Z" fill="#FABB05" />
      </svg>
    );
  }

  if (icon === "sheets") {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#0F9D58" aria-hidden="true">
        <path d="M19.5 0h-15C2.015 0 0 2.015 0 4.5v15C0 21.985 2.015 24 4.5 24h15c2.485 0 4.5-2.015 4.5-4.5v-15C24 2.015 21.985 0 19.5 0ZM18 18H6V6h12v12Z" />
        <path d="M8 8h8v2H8Zm0 4h8v2H8Z" fill="#fff" />
      </svg>
    );
  }

  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="#635BFF" aria-hidden="true">
      <path d="M12 2 21 7v10l-9 5-9-5V7l9-5Zm0 2.4L5 8.3v7.4l7 3.9 7-3.9V8.3l-7-3.9Zm0 3.1 4 2.2v4.6l-4 2.2-4-2.2V9.7l4-2.2Z" />
    </svg>
  );
}