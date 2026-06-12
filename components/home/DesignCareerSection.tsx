import Image from "next/image";
import Link from "next/link";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  CheckCircle2,
  Heart,
  Pipette,
  Plus,
  Star,
} from "lucide-react";
import { designCareerContent } from "../../content/home";

type Task = (typeof designCareerContent.tasks)[number];
type Skill = (typeof designCareerContent.profile.skills)[number];
type Lead = (typeof designCareerContent.leads)[number];

function TaskRow({ task }: { task: Task }) {
  const content = (
    <>
      <span
        className={`absolute -top-3 left-10 z-10 rounded-full px-2 py-0.5 text-[7px] font-bold tracking-wider text-white ${task.statusClass}`}
      >
        {task.status}
      </span>

      <div className="flex items-center gap-3">
        <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm">
          <Image
            src={task.image}
            alt={task.alt}
            width={72}
            height={72}
            className={`h-full w-full object-cover ${
              task.grayscale ? "grayscale" : ""
            }`}
          />
        </div>

        <div>
          <h4 className="text-sm font-bold leading-tight text-gray-900">
            {task.name}
          </h4>

          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-gray-400">
            {task.read ? (
              <span className="font-bold text-blue-500">✓✓</span>
            ) : null}
            {task.message}
          </p>
        </div>
      </div>

      {!task.featured ? (
        <span className="text-[10px] font-medium text-gray-300">
          {task.time}
        </span>
      ) : null}
    </>
  );

  if (task.featured) {
    return (
      <div className="relative z-20 -ml-[9%] flex w-[118%] items-center justify-between rounded-2xl border border-gray-50/50 bg-white p-3 shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
        {content}

        <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
          <span className="text-[10px] font-medium text-gray-300">
            {task.time}
          </span>

          <div className="h-1.5 w-1.5 rounded-full bg-pink-500 shadow-[0_0_5px_rgba(236,72,153,0.5)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-start justify-between px-1 pb-2">
      {content}
    </div>
  );
}

function ProfileSkill({ skill }: { skill: Skill }) {
  return (
    <div className="flex items-center justify-between pt-2 first:pt-0">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF477E]/10">
          <span
            className={`block h-3 w-3 rounded-sm bg-[#FF477E] ${skill.opacity}`}
          />
        </div>

        <span className="text-sm font-bold text-gray-800">{skill.label}</span>
      </div>

      {skill.checked ? (
        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#00C48C]">
          <CheckCircle2 className="h-3 w-3 text-white" strokeWidth={3} />
        </div>
      ) : (
        <Plus className="h-4 w-4 text-gray-400" strokeWidth={2.5} />
      )}
    </div>
  );
}

function LeadRow({ lead }: { lead: Lead }) {
  return (
    <div className="flex items-center justify-between px-1">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border-[3px] border-white bg-orange-100 shadow-sm">
          <Image
            src={lead.image}
            alt={lead.alt}
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
        </div>

        <div>
          <h4 className="text-[13px] font-extrabold leading-tight text-gray-900">
            {lead.name}
          </h4>

          <p className="mt-0.5 text-[10px] font-medium text-gray-400">
            {lead.description}
          </p>
        </div>
      </div>

      <div
        className={`rounded-full p-2 ${
          lead.liked ? "bg-[#FF477E]/10" : "bg-gray-50"
        }`}
      >
        <Heart
          className={`h-3.5 w-3.5 ${
            lead.liked
              ? "fill-[#FF477E] text-[#FF477E]"
              : "fill-gray-300 text-gray-300"
          }`}
          strokeWidth={1}
        />
      </div>
    </div>
  );
}

export function DesignCareerSection() {
  return (
    <section
      className="relative mt-16 overflow-hidden border-t border-gray-100 bg-white px-4 pb-32 pt-32"
      aria-labelledby="design-career-title"
    >
      <div className="relative z-10 mx-auto mb-20 max-w-4xl text-center">
        <div className="mb-6 flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          <Star className="h-3 w-3 fill-gray-400 text-gray-400" />
          <span>{designCareerContent.rating.score}</span>
          <span className="mx-1 text-gray-300">•</span>
          <span>{designCareerContent.rating.by}</span>
          <span className="mx-1 text-gray-300">•</span>
          <Star className="h-3 w-3 fill-gray-400 text-gray-400" />
        </div>

        <h2
          id="design-career-title"
          className="relative mb-6 inline-block text-4xl font-bold leading-[1.15] tracking-tight text-gray-900 md:text-5xl lg:text-6xl"
        >
          <div className="absolute -top-10 -left-6 -rotate-45 opacity-80 md:-left-12">
            <Pipette className="h-7 w-7 text-gray-900" strokeWidth={2} />
          </div>

          {designCareerContent.title.beforeHighlight}{" "}

          <span className="relative inline-block select-none rounded-sm border-[1.5px] border-[#0D99FF] px-2 text-gray-900">
            {designCareerContent.title.highlight}
            <span className="absolute -left-[4px] -top-[4px] h-[6px] w-[6px] border border-[#0D99FF] bg-white" />
            <span className="absolute -right-[4px] -top-[4px] h-[6px] w-[6px] border border-[#0D99FF] bg-white" />
            <span className="absolute -bottom-[4px] -left-[4px] h-[6px] w-[6px] border border-[#0D99FF] bg-white" />
            <span className="absolute -bottom-[4px] -right-[4px] h-[6px] w-[6px] border border-[#0D99FF] bg-white" />
          </span>

          <br />

          {designCareerContent.title.afterHighlight}
        </h2>

        <p className="mx-auto mb-8 max-w-md text-lg text-gray-500">
          {designCareerContent.description}
        </p>

        <Link
          href={designCareerContent.ctaHref}
          className="inline-flex rounded-lg bg-black px-7 py-3 text-sm font-medium text-white shadow-sm transition-all hover:scale-[1.02] hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
        >
          {designCareerContent.ctaLabel}
        </Link>
      </div>

      <div className="pointer-events-none relative mx-auto mt-16 flex max-w-6xl select-none flex-col items-start justify-center gap-6 lg:flex-row lg:gap-8 lg:px-8">
        <div className="relative mt-24 flex w-full max-w-[320px] flex-col items-center lg:mt-28">
          <div className="absolute -top-8 z-30 flex items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white/90 p-3 shadow-[0_15px_40px_rgb(0,0,0,0.06)] backdrop-blur-md">
            {designCareerContent.colorPalette.map((color, index) => (
              <div
                key={color}
                className={`${
                  index === 1 ? "h-6 w-6 ring-4 ring-blue-50/50" : "h-5 w-5"
                } rounded-md shadow-[0_0_20px_rgba(0,102,255,0.18)]`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <div className="relative z-10 w-full rounded-[2.5rem] bg-[#F7F8FA] p-4 shadow-sm">
            <div className="rounded-[2rem] bg-white px-5 pb-4 pt-6 shadow-sm">
              <div className="mb-8 flex items-center gap-5 px-1">
                <span className="rounded-full bg-[#0A0A0A] px-5 py-2 text-xs font-bold text-white shadow-md">
                  {designCareerContent.taskTabs.active}
                </span>

                <span className="text-xs font-bold tracking-wide text-gray-400">
                  {designCareerContent.taskTabs.inactive}
                </span>
              </div>

              <div className="space-y-6">
                {designCareerContent.tasks.map((task) => (
                  <TaskRow key={task.name} task={task} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="z-10 w-full max-w-[300px] lg:-mt-10">
          <div className="rounded-[3rem] bg-[#F7F8FA] p-4 pt-8 shadow-sm">
            <div className="relative mt-12 rounded-[2.5rem] border border-gray-50/50 bg-white p-6 pt-16 shadow-sm">
              <div className="absolute -top-12 left-1/2 flex -translate-x-1/2 flex-col items-center">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-[6px] border-white bg-white shadow-md">
                  <Image
                    src={designCareerContent.profile.image}
                    alt={designCareerContent.profile.alt}
                    width={128}
                    height={128}
                    className="h-full w-full scale-[1.25] object-cover object-center"
                  />
                </div>

                <span className="relative z-10 -mt-3 rounded-full border-2 border-white bg-[#0066FF] px-3 py-1 text-[8px] font-bold tracking-widest text-white shadow-sm">
                  {designCareerContent.profile.badge}
                </span>
              </div>

              <div className="mb-8 text-center">
                <h3 className="text-lg font-extrabold text-gray-900">
                  {designCareerContent.profile.name}
                </h3>

                <p className="mt-0.5 text-xs font-medium text-gray-400">
                  {designCareerContent.profile.username}
                </p>
              </div>

              <div className="mb-8 flex w-full justify-between px-2 text-center">
                {designCareerContent.profile.stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-base font-bold text-gray-900">
                      {stat.value}
                    </p>

                    <p className="mt-1 text-[10px] font-medium text-gray-400">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mb-6 h-px w-full bg-gray-100" />

              <div className="w-full space-y-4">
                {designCareerContent.profile.skills.map((skill) => (
                  <ProfileSkill key={skill.label} skill={skill} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full max-w-[280px] flex-col gap-6 lg:mt-24">
          <div className="rounded-3xl bg-[#F7F8FA] p-2 shadow-sm">
            <div className="rounded-[1.5rem] border border-gray-50 bg-white p-5 shadow-sm">
              <div className="mb-6 flex justify-between px-3">
                <AlignLeft className="h-4 w-4 text-black" strokeWidth={2.5} />
                <AlignCenter
                  className="h-4 w-4 text-gray-300"
                  strokeWidth={2.5}
                />
                <AlignRight
                  className="h-4 w-4 text-gray-300"
                  strokeWidth={2.5}
                />
                <AlignJustify
                  className="h-4 w-4 text-gray-300"
                  strokeWidth={2.5}
                />
              </div>

              <div className="flex items-center justify-between px-2">
                {designCareerContent.alignmentSizes.map((size) => (
                  <span
                    key={size}
                    className={
                      size === designCareerContent.alignmentActive
                        ? "flex h-7 w-7 items-center justify-center rounded-full bg-[#0A0A0A] text-xs font-bold text-white shadow-md"
                        : "text-xs font-bold text-gray-400"
                    }
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-[#F7F8FA] p-2 shadow-sm">
            <div className="space-y-4 rounded-[1.5rem] border border-gray-50 bg-white p-4 shadow-sm">
              {designCareerContent.leads.map((lead) => (
                <LeadRow key={lead.name} lead={lead} />
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-[#F7F8FA] p-2 shadow-sm">
            <div className="rounded-[1.5rem] border border-gray-50 bg-white p-5 shadow-sm">
              <div className="relative mb-6 h-8 w-full overflow-hidden rounded-xl border border-gray-100/50 bg-gray-50">
                <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(45deg,#000_25%,transparent_25%),linear-gradient(-45deg,#000_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#000_75%),linear-gradient(-45deg,transparent_75%,#000_75%)] [background-position:0_0,0_4px,4px_-4px,-4px_0px] [background-size:8px_8px]" />

                <div className="absolute inset-0 w-[60%] bg-gradient-to-r from-transparent via-[#0066FF]/80 to-[#0066FF]" />

                <div className="absolute left-[60%] top-1/2 z-10 flex h-9 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border border-gray-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
                  <div className="h-2.5 w-2.5 rounded-full border-[2px] border-[#0A0A0A]" />
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-4">
                  <span className="rounded-lg bg-[#0A0A0A] px-3 py-1.5 text-[11px] font-bold text-white shadow-sm">
                    {designCareerContent.slider.active}
                  </span>

                  <span className="text-[11px] font-bold text-gray-400">
                    {designCareerContent.slider.inactive}
                  </span>
                </div>

                <span className="text-sm font-extrabold text-gray-900">
                  {designCareerContent.slider.percentage}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 text-center">
        <p className="font-serif text-lg italic tracking-wide text-gray-400">
          {designCareerContent.signoff}
        </p>
      </div>
    </section>
  );
}
