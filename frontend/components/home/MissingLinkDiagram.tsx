import { backendBrowserContent } from "../../content/home";

function ConnectorArrows() {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 px-1 md:px-2">
      <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-gray-950" aria-hidden="true">
        <path d="M1 5 h11 M8 1 l4 4 l-4 4" />
      </svg>
      <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-gray-950" aria-hidden="true">
        <path d="M13 5 h-11 M5 1 l-4 4 l4 4" />
      </svg>
    </div>
  );
}

function LeftCluster() {
  return (
    <div className="relative flex h-36 w-36 items-center justify-center md:h-40 md:w-40">
      <div className="absolute h-[104px] w-[104px] rounded-full border border-gray-900/10 bg-white" />
      <div className="absolute top-0 z-10 flex h-16 w-16 items-center justify-center rounded-full border border-gray-950 bg-white">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-black" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <circle cx="17.5" cy="17.5" r="3.5" />
        </svg>
      </div>
      <div className="absolute bottom-1 left-1 z-10 flex h-16 w-16 items-center justify-center rounded-full border border-gray-950 bg-white">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-black" aria-hidden="true">
          <circle cx="7" cy="12" r="2.5" fill="currentColor" />
          <circle cx="17" cy="12" r="2.5" fill="currentColor" />
          <circle cx="12" cy="7" r="2.5" fill="currentColor" />
          <circle cx="12" cy="17" r="2.5" fill="currentColor" />
        </svg>
      </div>
      <div className="absolute bottom-1 right-1 z-10 flex h-16 w-16 items-center justify-center rounded-full border border-gray-950 bg-white">
        <svg width="24" height="24" viewBox="0 0 127.14 96.36" fill="currentColor" className="h-6 w-6 text-black" aria-hidden="true">
          <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.45-5c.87-.64,1.72-1.31,2.53-2a75.46,75.46,0,0,0,72.76,0c.81.7,1.66,1.37,2.53,2a68.43,68.43,0,0,1-10.45,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129,54.65,123.5,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5.14-12.69,11.41-12.69S53.9,46,53.8,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.38,40.31,84.69,40.31,96.14,46,96,53,91,65.69,84.69,65.69Z" />
        </svg>
      </div>
      <div className="absolute left-0 top-1/2 z-0 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full border border-gray-950 bg-white" />
      <div className="absolute right-0 top-1/2 z-0 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full border border-gray-950 bg-white" />
    </div>
  );
}

function MiddleSeal() {
  return (
    <div className="relative flex h-20 w-20 items-center justify-center md:h-24 md:w-24">
      <svg width="84" height="84" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-950" aria-hidden="true">
        <path d="M 50,4 C 58,18 82,18 90,26 C 98,34 98,58 90,66 C 82,74 58,74 50,88 C 42,74 18,74 10,66 C 2,58 2,34 10,26 C 18,18 42,18 50,4 Z" strokeLinejoin="round" />
        <path d="M 50,12 C 56,24 76,24 82,30 C 88,36 88,56 82,62 C 76,68 56,68 50,80 C 44,68 24,68 18,62 C 12,56 12,36 18,30 C 24,24 44,24 50,12 Z" strokeLinejoin="round" className="opacity-80" />
        <path d="M 50,20 C 54,30 70,30 74,34 C 78,38 78,54 74,58 C 70,62 54,62 50,72 C 46,62 30,62 26,58 C 22,54 22,38 26,34 C 30,30 46,30 50,20 Z" strokeLinejoin="round" className="opacity-60" />
      </svg>
    </div>
  );
}

function RightCluster() {
  return (
    <div className="relative flex h-32 w-32 items-center justify-center md:h-40 md:w-40">
      <div className="absolute h-[104px] w-[104px] rounded-full border border-gray-900/10 bg-white" />
      <div className="absolute top-0 z-10 flex h-16 w-16 items-center justify-center rounded-full border border-gray-950 bg-white">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" className="text-black" aria-hidden="true">
          <path d="M18 15L12 9L6 15" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="absolute bottom-1 left-1 z-10 flex h-16 w-16 items-center justify-center rounded-full border border-gray-950 bg-white">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-black" aria-hidden="true">
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(90 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(150 12 12)" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </div>
      <div className="absolute bottom-1 right-1 z-10 flex h-16 w-16 items-center justify-center rounded-full border border-gray-950 bg-white">
        <span className="text-[10px] font-bold tracking-tighter text-black">alexa</span>
      </div>
      <div className="absolute left-0 top-1/2 z-0 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full border border-gray-950 bg-white" />
      <div className="absolute right-0 top-1/2 z-0 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full border border-gray-950 bg-white" />
    </div>
  );
}

export function MissingLinkDiagram() {
  const { missingLink } = backendBrowserContent;

  return (
    <div className="relative z-10 mx-auto max-w-4xl bg-white pb-24 text-center">
      <div className="mb-12 flex select-none items-center justify-center gap-2 md:gap-4">
        <LeftCluster />
        <ConnectorArrows />
        <MiddleSeal />
        <ConnectorArrows />
        <RightCluster />
      </div>

      <h3 className="mb-2 text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
        {missingLink.title}
      </h3>
      <p className="mx-auto mb-8 max-w-md text-sm text-gray-500">
        {missingLink.description}
      </p>

      <div className="inline-block">
        <div className="flex items-center gap-2.5 rounded-xl border border-orange-200 bg-orange-50/50 px-4 py-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EA580C] text-xs font-black text-white">
            {missingLink.badge.mark}
          </div>
          <div className="text-left">
            <p className="text-[9px] font-extrabold uppercase leading-none tracking-wider text-[#EA580C]">
              {missingLink.badge.eyebrow}
            </p>
            <p className="text-xs font-extrabold leading-tight text-[#EA580C]">
              {missingLink.badge.text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
