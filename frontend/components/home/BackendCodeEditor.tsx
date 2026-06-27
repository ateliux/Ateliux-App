"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { ChevronDown, FileText, Maximize2, Play, Settings } from "lucide-react";
import {
  backendBrowserContent,
  backendExampleKeys,
  type CodeExampleKey,
} from "../../content/home";

type EditorMode = "code" | "modules";
type RunMode = "preview" | "production";

function pickString(source: string, key: string, fallback: string) {
  const match = source.match(new RegExp(`${key}\\s*:\\s*["']([^"']+)["']`));
  return match?.[1] ?? fallback;
}

function pickNumber(source: string, key: string, fallback: number) {
  const match = source.match(new RegExp(`${key}\\s*:\\s*([0-9]+(?:\\.[0-9]+)?)`));
  return match ? Number(match[1]) : fallback;
}

function pickBoolean(source: string, key: string, fallback: boolean) {
  const match = source.match(new RegExp(`${key}\\s*:\\s*(true|false)`));
  return match ? match[1] === "true" : fallback;
}

function pickStringArray(source: string, key: string, fallback: string[]) {
  const match = source.match(new RegExp(`${key}\\s*:\\s*\\[([^\\]]*)\\]`));

  if (!match) {
    return fallback;
  }

  const values = match[1].match(/["']([^"']+)["']/g);

  if (!values) {
    return fallback;
  }

  return values.map((value) => value.replace(/["']/g, ""));
}

function formatResponse(body: Record<string, unknown>, mode: RunMode) {
  return [
    "Status: 200 OK",
    "Content-Type: application/json",
    `Runtime: ${mode === "production" ? "Ateliux Production Edge" : "Ateliux Preview Runtime"}`,
    "",
    JSON.stringify(body, null, 2),
  ].join("\n");
}

function buildHelloOutput(source: string, mode: RunMode) {
  const message = pickString(source, "message", "hello, world!");

  return formatResponse(
    {
      message,
      service: "Ateliux API",
      ready: true,
      environment: mode,
      next: "Ambiente validado e pronto para evoluir.",
    },
    mode,
  );
}

function buildProductOutput(source: string, mode: RunMode) {
  const stock = pickNumber(source, "stock", 18);
  const price = pickNumber(source, "price", 22);
  const name = pickString(source, "name", "Açaí Premium 500ml");
  const slug = pickString(source, "slug", "acai-premium-500ml");
  const category = pickString(source, "category", "Delivery");
  const featured = pickBoolean(source, "featured", true);
  const channels = pickStringArray(source, "channels", ["site", "whatsapp", "ifood"]);

  return formatResponse(
    {
      product: {
        id: pickString(source, "id", "prod_ateliux_001"),
        name,
        slug,
        category,
        price,
        priceFormatted: price.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        stock,
        featured,
        channels,
      },
      available: stock > 0,
      route: "GET /api/storefront/products/:slug",
      cache: mode === "production" ? "revalidate=60s" : "preview-no-cache",
      message:
        stock > 0
          ? "Produto pronto para aparecer na vitrine digital."
          : "Produto indisponível para venda no momento.",
    },
    mode,
  );
}

function buildProjectBlueprintOutput(source: string, mode: RunMode) {
  const business = pickString(source, "business", "Empresa em crescimento");
  const projectType = pickString(source, "projectType", "SaaS com dashboard");
  const goal = pickString(source, "goal", "Centralizar vendas, clientes e operação");
  const features = pickStringArray(source, "features", [
    "login",
    "dashboard",
    "cadastro",
    "relatórios",
    "automação",
  ]);

  return formatResponse(
    {
      project: {
        business,
        projectType,
        goal,
        features,
      },
      recommendedStack: [
        "Next.js",
        "TypeScript",
        "Tailwind CSS",
        "NestJS",
        "PostgreSQL",
      ],
      architecture: {
        frontend: "Interface responsiva com experiência premium.",
        backend: "API modular preparada para regras de negócio.",
        database: "Dados estruturados para escala e relatórios.",
        deploy: mode === "production" ? "Ambiente de produção monitorado." : "Preview navegável para validação.",
      },
      roadmap: [
        "Design UI/UX",
        "Protótipo navegável",
        "Frontend",
        "Backend API",
        "Integrações",
        "Testes",
        "Deploy",
      ],
      nextStep: "Transformar o escopo em protótipo navegável.",
    },
    mode,
  );
}

function buildOutputByExample(key: CodeExampleKey, source: string, mode: RunMode) {
  if (key === "productApi") {
    return buildProductOutput(source, mode);
  }

  if (key === "projectBlueprint") {
    return buildProjectBlueprintOutput(source, mode);
  }

  return buildHelloOutput(source, mode);
}

export function BackendCodeEditor() {
  const [activeTab, setActiveTab] = useState<CodeExampleKey>("hello");
  const [editorMode, setEditorMode] = useState<EditorMode>("code");
  const [runMode, setRunMode] = useState<RunMode>("preview");
  const [draftCode, setDraftCode] = useState<string>(
    backendBrowserContent.examples.hello.defaultCode,
  );
  const [isRunning, setIsRunning] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string | null>(null);
  const [showRunOptions, setShowRunOptions] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [showSchema, setShowSchema] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedRoute, setCopiedRoute] = useState(false);

  const activeExample = backendBrowserContent.examples[activeTab];

  const lineNumbers = useMemo(() => {
    return draftCode.split("\n").map((_, index) => index + 1);
  }, [draftCode]);

  function handleRunCode() {
    setIsRunning(true);
    setTerminalOutput(null);

    window.setTimeout(() => {
      setIsRunning(false);
      setTerminalOutput(buildOutputByExample(activeTab, draftCode, runMode));
    }, 650);
  }

  function handleResetCode() {
    setDraftCode(activeExample.defaultCode);
    setTerminalOutput(null);
  }

  function handleTabIndent(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Tab") {
      return;
    }

    event.preventDefault();

    const target = event.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const nextValue = `${draftCode.slice(0, start)}  ${draftCode.slice(end)}`;

    setDraftCode(nextValue);

    window.requestAnimationFrame(() => {
      target.selectionStart = start + 2;
      target.selectionEnd = start + 2;
    });
  }

  async function handleCopyRoute() {
    try {
      await navigator.clipboard.writeText(`${backendBrowserContent.editor.url}${activeExample.route}`);
      setCopiedRoute(true);

      window.setTimeout(() => {
        setCopiedRoute(false);
      }, 1200);
    } catch {
      setCopiedRoute(false);
    }
  }

  function handleNextExample() {
    const currentIndex = backendExampleKeys.indexOf(activeTab);
    const nextIndex = currentIndex === backendExampleKeys.length - 1 ? 0 : currentIndex + 1;

    handleSelectExample(backendExampleKeys[nextIndex]);
  }

  function handleSelectExample(key: CodeExampleKey) {
    setActiveTab(key);
    setDraftCode(backendBrowserContent.examples[key].defaultCode);
    setTerminalOutput(null);
    setShowDocs(false);
    setShowSchema(false);
    setEditorMode("code");
  }

  return (
    <>
      <div className={`relative z-10 mx-auto mb-12 ${isExpanded ? "max-w-6xl" : "max-w-4xl"}`}>
        <div className="absolute -inset-1.5 rounded-[1.8rem] bg-[linear-gradient(90deg,#ef4444,#f472b6,#a855f7,#60a5fa,#4ade80,#eab308)] opacity-20 blur-2xl" />

        <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_15px_50px_rgba(0,0,0,0.06)]">
          <div className="flex min-w-0 items-center justify-between gap-3 border-b border-gray-100 bg-white px-3 py-3 sm:gap-4 sm:px-6 sm:py-4">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-6">
              <div className="flex shrink-0 items-center gap-2.5 text-gray-400 sm:gap-3.5">
                <button
                  type="button"
                  onClick={handleResetCode}
                  className="transition-colors hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
                  aria-label="Resetar código"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    aria-hidden="true"
                  >
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => setRunMode((mode) => (mode === "preview" ? "production" : "preview"))}
                  className="transition-colors hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
                  aria-label="Alternar ambiente seguro"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    aria-hidden="true"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyRoute}
                className="flex min-w-0 flex-1 items-center justify-between gap-2 overflow-hidden rounded-xl border border-gray-200/40 bg-[#F4F4F5] px-3 py-2 text-left text-xs text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 sm:max-w-md sm:px-4"
                aria-label="Copiar rota do exemplo"
              >
                <span className="min-w-0 truncate whitespace-nowrap font-medium tracking-wide">
                  {backendBrowserContent.editor.url}
                  {activeExample.route}
                </span>
                <span className="shrink-0 text-sm font-bold text-gray-400">
                  {copiedRoute ? "✓" : "+"}
                </span>
              </button>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden text-[10px] font-bold uppercase tracking-wider text-gray-400 sm:inline">
                {runMode === "production" ? "Produção" : "Preview"}
              </span>
              <span className="h-2.5 w-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
            </div>
          </div>

          <div className="flex select-none flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-white px-3 py-3 sm:flex-nowrap sm:px-6">
            <div className="flex min-w-0 items-center gap-1 text-xs font-semibold sm:gap-3">
              <button
                type="button"
                onClick={() => setEditorMode("code")}
                className={`cursor-pointer rounded-lg px-3.5 py-1.5 transition-colors ${
                  editorMode === "code"
                    ? "bg-[#F1F1F4] text-black"
                    : "text-gray-400 hover:text-black"
                }`}
              >
                {backendBrowserContent.editor.primaryTab}
              </button>

              <button
                type="button"
                onClick={() => setEditorMode("modules")}
                className={`cursor-pointer rounded-lg px-3.5 py-1.5 transition-colors ${
                  editorMode === "modules"
                    ? "bg-[#F1F1F4] text-black"
                    : "text-gray-400 hover:text-black"
                }`}
              >
                {backendBrowserContent.editor.secondaryTab}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowRunOptions((value) => !value)}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-gray-500 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
            >
              <span>{backendBrowserContent.editor.language}</span>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </button>
          </div>

          {showRunOptions ? (
            <div className="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
              <div className="flex flex-col gap-3 text-xs text-gray-500 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-bold text-gray-900">Modo de execução</p>
                  <p>Alterne entre preview de validação e simulação de produção.</p>
                </div>

                <div className="flex gap-2">
                  {(["preview", "production"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setRunMode(mode)}
                      className={`rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${
                        runMode === mode
                          ? "border-black bg-black text-white"
                          : "border-gray-200 bg-white text-gray-500 hover:text-black"
                      }`}
                    >
                      {mode === "preview" ? "Preview" : "Produção"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {editorMode === "code" ? (
            <div className="relative flex min-h-[260px] gap-5 bg-white p-6 font-mono text-xs leading-relaxed md:text-sm">
              <div className="flex select-none flex-col gap-0.5 border-r border-gray-50 pr-3 text-right text-gray-300">
                {lineNumbers.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>

              <textarea
                value={draftCode}
                onChange={(event) => {
                  setDraftCode(event.target.value);
                  setTerminalOutput(null);
                }}
                onKeyDown={handleTabIndent}
                spellCheck={false}
                aria-label="Editor de código TypeScript"
                className="min-h-[260px] min-w-0 flex-1 resize-none overflow-x-auto whitespace-pre border-none bg-transparent font-mono tracking-wide text-gray-800 outline-none placeholder:text-gray-300"
              />

              <div className="pointer-events-none absolute right-6 top-6 select-none opacity-[0.03]">
                <svg width="60" height="60" viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
                  <circle cx="50" cy="50" r="40" />
                </svg>
              </div>
            </div>
          ) : (
            <div className="min-h-[260px] bg-white p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Método
                  </p>
                  <p className="text-sm font-bold text-gray-900">{activeExample.method}</p>
                  <p className="mt-2 text-xs text-gray-500">{activeExample.route}</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Objetivo
                  </p>
                  <p className="text-sm font-semibold leading-relaxed text-gray-700">
                    {activeExample.summary}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Stack
                  </p>
                  <p className="text-sm font-semibold leading-relaxed text-gray-700">
                    Next.js, TypeScript, API Routes e arquitetura preparada para backend real.
                  </p>
                </div>
              </div>
            </div>
          )}

          {terminalOutput ? (
            <div className="border-t border-gray-800 bg-[#18181B] p-4 font-mono text-[11px] leading-relaxed text-gray-300">
              <div className="mb-2 select-none text-[10px] font-bold uppercase tracking-wider text-gray-500">
                {backendBrowserContent.editor.outputLabel}
              </div>
              <pre className="whitespace-pre-wrap">{terminalOutput}</pre>
            </div>
          ) : null}

          {showDocs ? (
            <div className="border-t border-gray-100 bg-white px-6 py-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                Documentação rápida
              </p>
              <ul className="grid gap-2 text-sm text-gray-600 md:grid-cols-3">
                {activeExample.docs.map((item) => (
                  <li key={item} className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {showSchema ? (
            <div className="border-t border-gray-100 bg-[#FAFAFA] px-6 py-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                Schema de resposta
              </p>
              <pre className="overflow-x-auto rounded-2xl border border-gray-100 bg-white p-4 font-mono text-xs text-gray-600">
                {activeExample.schema}
              </pre>
            </div>
          ) : null}

          <div className="flex flex-col justify-between gap-4 border-t border-gray-50 bg-white px-6 py-4 md:flex-row md:items-center">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleRunCode}
                disabled={isRunning}
                className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-gray-800 disabled:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
              >
                <Play className={`h-3 w-3 fill-white ${isRunning ? "animate-pulse" : ""}`} />
                <span>{backendBrowserContent.editor.runLabel}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowRunOptions((value) => !value)}
                className="rounded-lg border border-gray-200/80 px-3.5 py-2 text-xs font-semibold text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
              >
                {backendBrowserContent.editor.runOptionsLabel}
              </button>

              <button
                type="button"
                onClick={() => setShowDocs((value) => !value)}
                className="rounded-lg border border-gray-200/80 px-3.5 py-2 text-xs font-semibold text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
              >
                {backendBrowserContent.editor.docsLabel}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsExpanded((value) => !value)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-100 text-gray-400 transition-colors hover:bg-gray-50 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
                aria-label="Expandir editor"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowRunOptions((value) => !value)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-100 text-gray-400 transition-colors hover:bg-gray-50 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
                aria-label="Abrir configurações"
              >
                <Settings className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowSchema((value) => !value)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-100 text-gray-400 transition-colors hover:bg-gray-50 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
                aria-label="Ver schema da resposta"
              >
                <FileText className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto mb-32 max-w-2xl select-none text-center">
        <div className="relative inline-block">
          <div className="absolute -left-20 -top-8 hidden md:block">
            <svg width="60" height="40" viewBox="0 0 60 40" fill="none" className="text-gray-300" aria-hidden="true">
              <path d="M5 5 C 10 30, 45 35, 55 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M50 15 L 55 12 L 56 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
            <span className="absolute -top-4 -left-12 whitespace-nowrap text-[9px] font-bold uppercase tracking-wider text-gray-400 [font-family:var(--font-geist-mono)]">
              {backendBrowserContent.sampleLabel}
            </span>
          </div>

          <div className="inline-flex rounded-xl border border-gray-200/80 bg-white p-1 shadow-sm">
            {backendExampleKeys.map((key, index) => (
              <div key={key} className="flex">
                <button
                  type="button"
                  onClick={() => handleSelectExample(key)}
                  className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                    activeTab === key ? "bg-[#F4F4F5] text-black" : "text-gray-400 hover:text-black"
                  }`}
                >
                  {backendBrowserContent.examples[key].label}
                </button>
                {index < backendExampleKeys.length - 1 ? <div className="my-1 w-px bg-gray-100" /> : null}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <button
            type="button"
            onClick={handleNextExample}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-semibold text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 [font-family:var(--font-geist-mono)]"
          >
            {backendBrowserContent.moreExamplesLabel}
          </button>
        </div>
      </div>
    </>
  );
}
