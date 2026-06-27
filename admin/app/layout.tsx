import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin Ateliux",
  description: "Dashboard administrativo interno da Ateliux."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
