import { contactContent } from "../../content/contact";
import { MotionContainer, MotionItem } from "../motion";

export function ContactClients() {
  return (
    <section className="px-6 pb-20 pt-28 md:pb-28 md:pt-36">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
          {contactContent.clients.title}
        </h2>

        <MotionContainer className="mt-16 grid grid-cols-2 items-center gap-x-10 gap-y-8 opacity-35 md:grid-cols-4">
          {contactContent.clients.items.map((client) => (
            <MotionItem key={client} staggered>
            <div
              key={client}
              className="flex items-center justify-center text-2xl font-bold tracking-tight text-slate-500"
            >
              {client}
            </div>
            </MotionItem>
          ))}
        </MotionContainer>
      </div>
    </section>
  );
}
