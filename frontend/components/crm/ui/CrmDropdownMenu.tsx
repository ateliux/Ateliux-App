"use client";

import { useEffect, useRef } from "react";

export type CrmDropdownItem = {
  label: string;
  onSelect: () => void;
  danger?: boolean;
};

export function CrmDropdownMenu({ items, onClose, align = "right" }: { items: CrmDropdownItem[]; onClose: () => void; align?: "left" | "right" }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key === "Escape") onClose();
      if (event instanceof MouseEvent && ref.current && !ref.current.contains(event.target as Node)) onClose();
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [onClose]);

  return (
    <div ref={ref} role="menu" className={`absolute top-full z-30 mt-2 w-52 rounded-xl border border-slate-100 bg-white p-1.5 text-left shadow-xl ${align === "right" ? "right-0" : "left-0"}`}>
      {items.map((item) => (
        <button key={item.label} type="button" role="menuitem" onClick={() => { item.onSelect(); onClose(); }} className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black ${item.danger ? "text-rose-600 hover:bg-rose-50" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
          {item.label}
        </button>
      ))}
    </div>
  );
}

