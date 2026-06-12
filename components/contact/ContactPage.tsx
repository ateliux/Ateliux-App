import { ContactClients } from "./ContactClients";
import { ContactFooterSection } from "./ContactFooterSection";
import { ContactHero } from "./ContactHero";
import { QuoteForm } from "./QuoteForm";
import { MotionItem } from "../motion";

export function ContactPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-950 antialiased">
      <MotionItem direction="down"><ContactHero /></MotionItem>
      <MotionItem><QuoteForm /></MotionItem>
      <MotionItem><ContactClients /></MotionItem>
      <MotionItem><ContactFooterSection /></MotionItem>
    </main>
  );
}
