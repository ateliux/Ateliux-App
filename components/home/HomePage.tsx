import { BackendBrowserSection } from "./BackendBrowserSection";
import { BuildBetterSection } from "./BuildBetterSection";
import { DesignCareerSection } from "./DesignCareerSection";
import { HeroSection } from "./HeroSection";
import { MeetMousebackSection } from "./MeetMousebackSection";
import { MotionItem } from "../motion";

export function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main>
        <MotionItem><HeroSection /></MotionItem>
        <MotionItem><MeetMousebackSection /></MotionItem>
        <MotionItem><BuildBetterSection /></MotionItem>
        <MotionItem><DesignCareerSection /></MotionItem>
        <MotionItem><BackendBrowserSection /></MotionItem>
      </main>
    </div>
  );
}
