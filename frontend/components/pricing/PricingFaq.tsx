import { pricingContent } from "../../content/pricing";
import { MotionContainer, MotionItem } from "../motion";

export function PricingFaq() {
  return (
    <section className="mt-20 border-t border-gray-100 pt-20">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
            {pricingContent.faq.title}
          </h2>

          <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-500">
            {pricingContent.faq.description}
          </p>
        </div>

        <MotionContainer className="space-y-10 md:col-span-8">
          {pricingContent.faq.items.map((item) => (
            <MotionItem key={item.question} staggered>
            <article key={item.question}>
              <h3 className="mb-2 text-base font-semibold text-gray-900">
                {item.question}
              </h3>

              <p className="max-w-2xl text-sm leading-relaxed text-gray-500">
                {item.answer}
              </p>
            </article>
            </MotionItem>
          ))}
        </MotionContainer>
      </div>
    </section>
  );
}
