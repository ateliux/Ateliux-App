type BlogImagePlaceholderProps = {
  label?: string;
};

export function BlogImagePlaceholder({ label = "Imagem do artigo" }: BlogImagePlaceholderProps) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_35%,transparent_70%),linear-gradient(135deg,#151518,#08080A)]">
      <div className="rounded-full border border-white/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
        {label}
      </div>
    </div>
  );
}
