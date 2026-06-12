import { ColorPaletteSection } from "./ColorPaletteSection";
import { ComponentsLibrarySection } from "./ComponentsLibrarySection";
import { DesignHero } from "./DesignHero";
import { TypographySection } from "./TypographySection";
import { MotionItem } from "../motion";

export function DesignPage() {
  return (
    <main className="min-h-screen w-full overflow-hidden bg-white pb-32 text-slate-800">
      <div className="mx-auto w-full max-w-7xl px-6 pt-20">
        <MotionItem><DesignHero /></MotionItem>
        <MotionItem direction="right"><TypographySection /></MotionItem>
        <MotionItem><ColorPaletteSection /></MotionItem>
        <MotionItem><ComponentsLibrarySection /></MotionItem>
      </div>
    </main>
  );
}
