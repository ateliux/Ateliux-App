import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { DesignPage } from "../../components/design/DesignPage";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Design — Ateliux",
  description:
    "Conheça como a Ateliux estrutura direção visual, tipografia, paleta de cores e componentes antes de transformar uma ideia em produto digital.",
};

export default function DesignRoute() {
  return (
    <div className={poppins.className}>
      <DesignPage />
    </div>
  );
}