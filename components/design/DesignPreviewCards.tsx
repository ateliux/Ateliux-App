"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Heart,
  Home,
  MessageSquare,
  Minus,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Star,
  User,
} from "lucide-react";
import { designContent } from "../../content/design";
import { contactRoute, siteRoutes } from "../../data/siteRoutes";
import { MotionLink } from "../motion";

export function ButtonsCard() {
  return (
    <div className="flex flex-col gap-5 rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      {designContent.components.buttons.map((button) => (
        <MotionLink
          key={button.label}
          href={button.href}
          className={`${button.className} flex items-center justify-center`}
        >
          {"icon" in button ? (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              G
            </span>
          ) : null}
          {button.label}
        </MotionLink>
      ))}
    </div>
  );
}

export function BottomNavMock() {
  const [activeItem, setActiveItem] = useState("Início");
  const [hasNotification, setHasNotification] = useState(true);
  const items = [
    { label: "Início", Icon: Home },
    { label: "Buscar", Icon: Search },
    { label: "Notificações", Icon: Bell },
    { label: "Perfil", Icon: User },
  ];

  return (
    <div className="relative flex items-center justify-between rounded-[2rem] bg-white px-8 py-5 text-slate-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      {items.map(({ label, Icon }) => (
        <button
          key={label}
          type="button"
          aria-label={label}
          aria-pressed={activeItem === label}
          className={`relative transition-colors ${
            activeItem === label ? "text-blue-500" : "hover:text-slate-500"
          }`}
          onClick={() => {
            setActiveItem(label);
            if (label === "Notificações") setHasNotification(false);
          }}
        >
          <Icon className="h-6 w-6" />
          {label === "Notificações" && hasNotification ? (
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-400" />
          ) : null}
        </button>
      ))}
    </div>
  );
}

export function DistanceSliderCard() {
  const [progress, setProgress] = useState(50);

  return (
    <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700">
          Evolução do produto: {progress}%
        </span>
      </div>

      <input
        type="range"
        min="10"
        max="100"
        value={progress}
        onChange={(event) => setProgress(Number(event.target.value))}
        className="h-1 w-full cursor-pointer accent-blue-500"
        aria-label="Evolução do produto"
      />

      <div className="mt-3 flex justify-between px-2 text-[10px] font-medium text-slate-400">
        <span>MVP</span>
        <span>Escala</span>
      </div>
    </div>
  );
}

export function SearchInputMock() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");

  return (
    <div>
      <form
        className="flex items-center justify-between rounded-full bg-white p-2 pl-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        onSubmit={(event) => {
          event.preventDefault();
          setResult(query.trim() ? `Resultado demonstrado para "${query.trim()}".` : "Digite um termo para buscar.");
        }}
      >
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar use cases, módulos..."
          className="w-full bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-300"
        />

        <button
          type="submit"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white"
          aria-label="Buscar"
        >
          <Search className="h-4 w-4" />
        </button>
      </form>
      <p aria-live="polite" className="mt-2 px-6 text-[10px] text-slate-400">
        {result}
      </p>
    </div>
  );
}

export function SegmentControlCard() {
  const [theme, setTheme] = useState<"Clean" | "Dark">("Clean");

  return (
    <div className={`flex gap-2 rounded-full p-2 transition-colors ${theme === "Dark" ? "bg-[#121214]" : "bg-slate-50"}`}>
      {(["Clean", "Dark"] as const).map((item) => (
        <button
          key={item}
          type="button"
          aria-pressed={theme === item}
          onClick={() => setTheme(item)}
          className={`flex-1 rounded-full py-3 text-xs font-medium transition-colors ${
            theme === item
              ? theme === "Dark"
                ? "bg-white text-black shadow-sm"
                : "bg-black text-white shadow-sm"
              : theme === "Dark"
                ? "text-zinc-500"
                : "text-slate-500"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export function ProjectCard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [action, setAction] = useState("Tema dark • Leitura editorial");

  return (
    <div className="relative flex items-center justify-between gap-4 rounded-3xl bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-500">
          Blog
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-800">
            <Link href={siteRoutes.blog} className="hover:text-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            Card de blog
            </Link>
          </h4>
          <p className="text-[10px] text-slate-400">
            {action}
          </p>

          <div className="mt-1 flex items-center gap-1 text-yellow-400">
            {[1, 2, 3, 4, 5].map((item) => (
              <Star key={item} className="h-3 w-3 fill-current" />
            ))}
            <span className="ml-1 text-[10px] text-slate-400">(5.0)</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-100 text-slate-400"
        aria-label="Mais opções"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((current) => !current)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {menuOpen ? (
        <div className="absolute right-4 top-14 z-10 flex w-32 flex-col border border-slate-100 bg-white p-1 text-left text-[10px] shadow-lg">
          {["Favoritar card", "Salvar leitura"].map((item) => (
            <button
              key={item}
              type="button"
              className="px-3 py-2 text-left text-slate-500 hover:bg-slate-50 hover:text-black"
              onClick={() => {
                setAction(item);
                setMenuOpen(false);
              }}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function AppointmentCard() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <button
        type="button"
        className="absolute right-6 top-6 text-slate-300"
        aria-label="Mais opções"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((current) => !current)}
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {menuOpen ? (
        <div className="absolute right-6 top-12 z-10 border border-slate-100 bg-white p-2 text-[10px] text-slate-500 shadow-lg">
          Plano configurável e pronto para demonstração.
        </div>
      ) : null}

      <div className="mb-6 flex items-center gap-4">
        <div className="relative">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-sm font-bold text-slate-800">
            PRO
          </div>
          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-400" />
        </div>

        <div>
          <h4 className="font-bold text-slate-800">Plano Profissional</h4>
          <p className="text-xs text-slate-400">Preço • escopo • evolução</p>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between rounded-2xl bg-slate-50 p-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-blue-500" />
          15 Jul 2026
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-500" />
          10:30
        </div>
      </div>

      <MotionLink
        href={siteRoutes.pricing}
        className="flex w-full items-center justify-center rounded-lg bg-black py-3 text-xs font-medium text-white transition-colors hover:bg-gray-800"
      >
        Ver plano
      </MotionLink>

    </div>
  );
}

export function ProductMiniCard() {
  const [favorite, setFavorite] = useState(false);

  return (
    <div className="relative flex flex-col items-center rounded-3xl bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <button
        type="button"
        className={`absolute right-4 top-4 transition-colors ${favorite ? "text-red-400" : "text-slate-300 hover:text-red-400"}`}
        aria-label={favorite ? "Remover dos favoritos" : "Favoritar"}
        aria-pressed={favorite}
        onClick={() => setFavorite((current) => !current)}
      >
        <Heart className={`h-4 w-4 ${favorite ? "fill-current" : ""}`} />
      </button>

      <div className="my-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-blue-50 text-2xl font-bold text-blue-500">
        SaaS
      </div>

      <div className="w-full text-left">
        <h4 className="text-xs font-bold text-slate-800">Módulo SaaS</h4>
        <p className="mb-2 text-[10px] text-slate-400">Dashboard & permissões</p>
        <p className="text-sm font-bold text-blue-500">Use case</p>
      </div>
    </div>
  );
}

export function MessagePreviewCard() {
  return (
    <div className="flex flex-col justify-center p-4">
      <p className="mb-4 text-[10px] leading-relaxed text-slate-400">
        Páginas institucionais usam fundos claros, hierarquia objetiva e CTAs pretos
        para conduzir a jornada comercial.
      </p>

      <p className="text-[10px] leading-relaxed text-slate-400">
        No blog, superfícies dark criam contraste editorial sem romper a identidade
        visual da Ateliux.
      </p>
    </div>
  );
}

export function CartCard() {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <h3 className="mb-6 font-bold text-slate-800">Solicitar orçamento</h3>

      <div className="mb-6 flex gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50 p-2">
          <ShieldCheck className="h-10 w-10 text-blue-500" />
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <h4 className="text-sm font-bold text-slate-800">Backend & APIs</h4>
          <p className="mb-2 text-xs text-slate-400">Integrações e dados</p>

          <div className="mt-auto flex items-center justify-between">
            <span className="text-lg font-bold text-slate-800">
              {quantity} {quantity === 1 ? "módulo" : "módulos"}
            </span>

            <div className="flex items-center gap-3 rounded-full bg-slate-50 px-2 py-1">
              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm"
                aria-label="Remover"
                disabled={quantity === 1}
                onClick={() => {
                  setQuantity((current) => Math.max(1, current - 1));
                }}
              >
                <Minus className="h-3 w-3" />
              </button>

              <span className="w-4 text-center text-xs font-bold">{quantity}</span>

              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm"
                aria-label="Adicionar"
                disabled={quantity === 5}
                onClick={() => {
                  setQuantity((current) => Math.min(5, current + 1));
                }}
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <MotionLink
        href={contactRoute({ subject: "criar-projeto-design" })}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-black py-4 text-sm font-medium text-white transition-colors hover:bg-gray-800"
      >
        Criar projeto <ShoppingCart className="h-4 w-4" />
      </MotionLink>
    </div>
  );
}

export function SystemControlCard() {
  const [activeItem, setActiveItem] = useState("BLOG");
  const items = [
    { label: "HOME", Icon: Home },
    { label: "BLOG", Icon: Search },
    { label: "USE", Icon: MessageSquare },
    { label: "CTA", Icon: User },
  ];

  return (
    <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="mb-6 flex items-center justify-between text-slate-300">
        {items.map(({ label, Icon }) => (
          <button
            key={label}
            type="button"
            aria-label={`Selecionar ${label}`}
            aria-pressed={activeItem === label}
            onClick={() => setActiveItem(label)}
            className={activeItem === label ? "text-blue-500" : "hover:text-slate-500"}
          >
            <Icon className="h-5 w-5" />
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-3 text-center text-xs font-bold text-slate-400">
        {items.map(({ label }) => (
          <button
            type="button"
            aria-pressed={activeItem === label}
            onClick={() => setActiveItem(label)}
            key={label}
            className={activeItem === label ? "rounded-full bg-black py-2 text-white" : "py-2 hover:text-black"}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CalendarCard() {
  const [visibleMonth, setVisibleMonth] = useState({ month: 6, year: 2026 });
  const [selectedDay, setSelectedDay] = useState(15);
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  const firstWeekday = new Date(visibleMonth.year, visibleMonth.month, 1).getDay();
  const daysInMonth = new Date(visibleMonth.year, visibleMonth.month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);

  function changeMonth(delta: number) {
    const nextDate = new Date(visibleMonth.year, visibleMonth.month + delta, 1);
    setVisibleMonth({ month: nextDate.getMonth(), year: nextDate.getFullYear() });
    setSelectedDay(1);
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="mb-6 flex items-center justify-between">
        <button type="button" className="text-slate-300 hover:text-black" aria-label="Anterior" onClick={() => changeMonth(-1)}>
          ‹
        </button>
        <h4 className="text-sm font-bold text-slate-800">
          {monthNames[visibleMonth.month]} {visibleMonth.year}
        </h4>
        <button type="button" className="text-slate-300 hover:text-black" aria-label="Próximo" onClick={() => changeMonth(1)}>
          ›
        </button>
      </div>

      <div className="mb-3 grid grid-cols-7 text-center text-[10px] font-semibold text-slate-400">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-[10px] text-slate-500">
        {Array.from({ length: firstWeekday }, (_, index) => (
          <span key={`empty-${index}`} className="h-7 w-7" />
        ))}
        {days.map((day) => (
          <button
            type="button"
            key={day}
            aria-label={`Selecionar dia ${day}`}
            aria-pressed={selectedDay === day}
            onClick={() => setSelectedDay(day)}
            className={
              day === selectedDay
                ? "mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white"
                : "mx-auto flex h-7 w-7 items-center justify-center rounded-full hover:bg-slate-100"
            }
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}

export function RatingCard() {
  const [rating, setRating] = useState(5);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-sm font-bold text-blue-500">
          AUTO
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-800">Automação</h4>
          <p className="text-[10px] text-slate-400">Fluxo conectado</p>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-1 text-yellow-400">
        {[1, 2, 3, 4, 5].map((item) => (
          <button
            key={item}
            type="button"
            aria-label={`Avaliar com ${item} estrelas`}
            onClick={() => setRating(item)}
          >
            <Star className={`h-3 w-3 ${item <= rating ? "fill-current" : "text-slate-200"}`} />
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400">
        <span>{rating}/5 • Pronta para escalar</span>
        <CheckCircle2 className="h-4 w-4 text-blue-500" />
      </div>
    </div>
  );
}

export function VerticalScaleCard() {
  const [scale, setScale] = useState(60);

  return (
    <div className="flex flex-col items-center justify-between rounded-3xl bg-white py-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <button
        type="button"
        aria-label="Aumentar escala"
        onClick={() => setScale((current) => Math.min(100, current + 10))}
      >
        <Plus className="h-4 w-4 text-blue-500" />
      </button>

      <div className="relative h-40 w-1 rounded-full bg-slate-100">
        <div className="absolute bottom-0 w-full rounded-full bg-blue-500" style={{ height: `${scale}%` }} />
        <div
          className="absolute h-3 w-3 -translate-x-1 rounded-full border-2 border-white bg-blue-500 shadow-sm"
          style={{ bottom: `calc(${scale}% - 6px)` }}
        />
      </div>

      <button
        type="button"
        aria-label="Reduzir escala"
        onClick={() => setScale((current) => Math.max(10, current - 10))}
      >
        <Minus className="h-4 w-4 text-slate-300" />
      </button>
    </div>
  );
}

export function IntegrationCard() {
  const [confirmed, setConfirmed] = useState(false);
  const [activeItems, setActiveItems] = useState(["Layout responsivo", "Dados conectados"]);

  function toggleItem(item: string) {
    setActiveItems((current) =>
      current.includes(item)
        ? current.filter((activeItem) => activeItem !== item)
        : [...current, item],
    );
    setConfirmed(false);
  }

  return (
    <div className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-800">Ecossistema Ateliux</h4>
          <p className="text-[10px] text-slate-400">
            {confirmed ? "Ecossistema confirmado" : "Frontend • Backend • Design"}
          </p>
        </div>

        <button
          type="button"
          className={`flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors ${confirmed ? "bg-green-500" : "bg-blue-500"}`}
          aria-label="Confirmar"
          aria-pressed={confirmed}
          onClick={() => setConfirmed((current) => !current)}
        >
          <CheckCircle2 className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          aria-pressed={activeItems.includes("Layout responsivo")}
          onClick={() => toggleItem("Layout responsivo")}
          className={`rounded-2xl p-3 text-left transition-colors ${activeItems.includes("Layout responsivo") ? "bg-blue-50" : "bg-slate-50 opacity-50"}`}
        >
          <Phone className="mb-2 h-4 w-4 text-blue-500" />
          <p className="text-[10px] font-semibold text-slate-700">Layout responsivo</p>
        </button>

        <button
          type="button"
          aria-pressed={activeItems.includes("Dados conectados")}
          onClick={() => toggleItem("Dados conectados")}
          className={`rounded-2xl p-3 text-left transition-colors ${activeItems.includes("Dados conectados") ? "bg-blue-50" : "bg-slate-50 opacity-50"}`}
        >
          <MessageSquare className="mb-2 h-4 w-4 text-blue-500" />
          <p className="text-[10px] font-semibold text-slate-700">Dados conectados</p>
        </button>
      </div>
    </div>
  );
}
