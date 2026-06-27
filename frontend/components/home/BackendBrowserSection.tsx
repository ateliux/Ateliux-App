import { backendBrowserContent } from "../../content/home";
import { BackendCodeEditor } from "./BackendCodeEditor";
import { DeployFeatureGrid } from "./DeployFeatureGrid";
import { MissingLinkDiagram } from "./MissingLinkDiagram";

export function BackendBrowserSection() {
  return (
    <section className="relative overflow-hidden border-t border-gray-100 bg-white px-4 pb-24 pt-24 sm:px-6 md:pb-32 md:pt-32" aria-labelledby="backend-browser-title">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] border-b border-gray-100 bg-white" />

      <div className="relative z-10 mx-auto mb-16 max-w-3xl text-center">
        <h2
          id="backend-browser-title"
          className="mb-6 text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-5xl lg:text-6xl"
        >
          {backendBrowserContent.title}
        </h2>
        <p className="mx-auto max-w-2xl text-lg font-normal leading-relaxed text-gray-500 md:text-xl">
          {backendBrowserContent.description[0]}
          <br />
          {backendBrowserContent.description[1]}
        </p>

        <div className="mt-12 inline-block">
          <div className="rounded-lg border border-gray-200/60 bg-white px-4 py-1.5 text-[11px] font-mono text-gray-400 shadow-sm">
            {backendBrowserContent.editorHint}
          </div>
        </div>
      </div>

      <BackendCodeEditor />
      <DeployFeatureGrid />
      <MissingLinkDiagram />
    </section>
  );
}
