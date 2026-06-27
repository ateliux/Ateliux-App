import { ContactClients } from "./ContactClients";
import { ContactFooterSection } from "./ContactFooterSection";
import { ContactHero } from "./ContactHero";
import { QuoteForm } from "./QuoteForm";
import { MotionItem } from "../motion";

type ContactPageProps = {
  initialEmail?: string;
};

export function ContactPage({ initialEmail }: ContactPageProps) {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-950 antialiased">
      <MotionItem direction="down"><ContactHero /></MotionItem>
      <MotionItem><QuoteForm initialEmail={initialEmail} /></MotionItem>
      <MotionItem><ContactClients /></MotionItem>
      <MotionItem><ContactFooterSection /></MotionItem>
    </main>
  );
}
