"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { aboutContent } from "../../content/about";
import { contactRoute, siteRoutes } from "../../data/siteRoutes";
import { AboutDrawer } from "./AboutDrawer";
import { AboutServiceIcon } from "./AboutServiceIcon";
import { MotionButton, MotionItem, MotionLink } from "../motion";

export function AboutExpertiseSection() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  function handleOpenDrawer(serviceName: string) {
    setSelectedService(serviceName);
    setIsDrawerOpen(true);
  }

  const [primaryService, featuredService] = aboutContent.expertise.services;

  return (
    <>
      <section className="relative overflow-hidden bg-zinc-950 px-6 py-24 text-white md:px-12 md:py-32">
        <div className="pointer-events-none absolute bottom-[-10%] left-[-5%] h-[450px] w-[450px] select-none text-blue-500 opacity-10">
          <svg
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="h-full w-full"
            aria-hidden="true"
          >
            <path d="M50 0 L50 100 M0 50 L100 50 M15 15 L85 85 M15 85 L85 15" />
            <polygon points="50,15 85,50 50,85 15,50" />
            <polygon points="50,5 95,50 50,95 5,50" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-16 lg:grid-cols-12">
          <div className="flex flex-col justify-between py-2 lg:col-span-5">
            <div className="space-y-6">
              <span className="block text-sm font-semibold uppercase tracking-wider text-blue-500">
                {aboutContent.expertise.badge}
              </span>

              <h2 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
                {aboutContent.expertise.title.lineOne}
                <br />
                {aboutContent.expertise.title.lineTwo}
              </h2>

              <p className="max-w-sm text-sm font-light leading-relaxed text-zinc-500">
                {aboutContent.expertise.description}
              </p>
            </div>

            <div className="pt-12 lg:pt-0">
              <MotionLink
                href={siteRoutes.useCases}
                className="group inline-flex items-center gap-3 rounded-full bg-white px-6 py-4 text-sm font-semibold tracking-tight text-zinc-950 shadow-lg transition-all hover:bg-zinc-100 active:scale-95"
              >
                <span>{aboutContent.expertise.cta.label}</span>

                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-950 text-white transition-transform group-hover:rotate-45">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </MotionLink>
            </div>
          </div>

          <div className="flex flex-col lg:col-span-7">
            <div className="flex justify-end border-t border-zinc-800 py-6">
              <MotionLink
                href={contactRoute({ subject: "diagnostico-arquitetura" })}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white"
                aria-label={aboutContent.expertise.quickAction.ariaLabel}
              >
                <ArrowUpRight className="h-4 w-4" />
              </MotionLink>
            </div>

            <MotionItem>
            <article className="group flex flex-col items-start justify-between gap-8 border-t border-zinc-800 py-12 md:flex-row">
              <div className="max-w-md space-y-6">
                <AboutServiceIcon icon={primaryService.icon} />

                <div className="space-y-3">
                  <h3 className="text-2xl font-bold tracking-tight text-white transition-colors group-hover:text-blue-400">
                    {primaryService.title}
                  </h3>

                  <p className="text-sm font-light leading-relaxed text-zinc-500">
                    {primaryService.description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenDrawer(primaryService.serviceName)}
                className="flex h-12 w-12 items-center justify-center self-end rounded-full border border-zinc-800 text-zinc-400 transition-all group-hover:border-zinc-500 group-hover:bg-zinc-900 group-hover:text-white md:self-center"
                aria-label={primaryService.ariaLabel}
              >
                <ArrowUpRight className="h-5 w-5 transition-transform group-hover:rotate-45" />
              </button>
            </article>
            </MotionItem>

            <MotionButton
              type="button"
              onClick={() => handleOpenDrawer(featuredService.serviceName)}
              className="group flex w-full cursor-pointer flex-col items-start justify-between gap-8 rounded-3xl bg-blue-600 p-8 text-left text-white shadow-xl shadow-blue-900/10 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-zinc-950 md:flex-row md:items-center md:p-12"
              aria-label={featuredService.ariaLabel}
            >
              <div className="max-w-md space-y-6">
                <AboutServiceIcon icon={featuredService.icon} featured />

                <div className="space-y-3">
                  <h3 className="text-2xl font-bold tracking-tight">
                    {featuredService.title}
                  </h3>

                  <p className="text-sm font-light leading-relaxed text-blue-100">
                    {featuredService.description}
                  </p>
                </div>
              </div>

              <div className="flex h-12 w-12 items-center justify-center self-end rounded-full bg-white text-blue-600 shadow-md transition-transform group-hover:rotate-45 md:self-center">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </MotionButton>
          </div>
        </div>
      </section>

      {isDrawerOpen ? (
        <AboutDrawer
          selectedService={selectedService}
          onClose={() => setIsDrawerOpen(false)}
        />
      ) : null}
    </>
  );
}
