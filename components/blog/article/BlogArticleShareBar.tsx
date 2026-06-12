"use client";

import { useState } from "react";
import { Link2, Mail, MessageCircle, Send, Share2 } from "lucide-react";

const shareActions = [
  { label: "Compartilhar nas redes", icon: Share2 },
  { label: "Compartilhar em conversa", icon: MessageCircle },
  { label: "Compartilhar por e-mail", icon: Mail },
  { label: "Compartilhar mensagem", icon: Send },
  { label: "Copiar link", icon: Link2 },
] as const;

export function BlogArticleShareBar() {
  const [status, setStatus] = useState("");

  async function handleShare(label: string) {
    const shareData = {
      title: document.title,
      url: window.location.href,
    };

    try {
      if (label !== "Copiar link" && navigator.share) {
        await navigator.share(shareData);
        setStatus("Artigo compartilhado.");
        return;
      }

      await navigator.clipboard.writeText(shareData.url);
      setStatus("Link copiado.");
    } catch {
      setStatus("Compartilhamento cancelado.");
    }
  }

  return (
    <nav
      aria-label="Compartilhar artigo"
      className="flex gap-2 lg:sticky lg:top-28 lg:grid lg:grid-cols-1"
    >
      {shareActions.map(({ label, icon: Icon }) => (
        <button
          key={label}
          type="button"
          aria-label={label}
          onClick={() => void handleShare(label)}
          className="flex h-11 w-11 items-center justify-center border border-white/[0.08] bg-[#0A0A0C] text-zinc-500 transition-colors hover:border-white/20 hover:bg-white hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black"
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
      <span className="sr-only" aria-live="polite">{status}</span>
    </nav>
  );
}
