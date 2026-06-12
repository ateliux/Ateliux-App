import { AboutExpertiseSection } from "./AboutExpertiseSection";
import { AboutIntroSection } from "./AboutIntroSection";
import { AboutMetricsSection } from "./AboutMetricsSection";
import { MotionItem } from "../motion";

export function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-950 antialiased selection:bg-blue-100 selection:text-blue-600">
      <MotionItem><AboutIntroSection /></MotionItem>
      <MotionItem><AboutExpertiseSection /></MotionItem>
      <MotionItem><AboutMetricsSection /></MotionItem>
    </main>
  );
}
