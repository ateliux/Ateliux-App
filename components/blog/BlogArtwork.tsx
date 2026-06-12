import type { BlogArtworkName } from "../../content/blog";

type BlogArtworkProps = {
  artwork: BlogArtworkName;
};

export function BlogArtwork({ artwork }: BlogArtworkProps) {
  if (artwork === "hero") {
    return (
      <svg viewBox="0 0 600 400" className="h-full w-full object-cover" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="150" r="100" fill="#FFB19E" />
        <path d="M450,50 L550,50 L500,150 Z" fill="#FFB19E" />
        <rect x="50" y="250" width="120" height="120" fill="none" stroke="#2B36B2" strokeWidth="8" />
        <path d="M350,100 L450,200 L350,300 Z" fill="none" stroke="#FFB19E" strokeWidth="8" />
        <circle cx="500" cy="300" r="70" fill="#FFB19E" />
        <path d="M100,0 L200,100 L100,200 Z" fill="none" stroke="#2B36B2" strokeWidth="8" />
        <path d="M400,250 Q450,250 450,320 M450,320 L420,300 M450,320 L480,300" fill="none" stroke="#2B36B2" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M280,350 Q250,300 300,250 M300,250 L280,230 M300,250 L320,270" fill="none" stroke="#FFB19E" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M100,150 Q50,100 120,50 M120,50 L90,40 M120,50 L130,80" fill="none" stroke="#FFB19E" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M520,70 L560,110 M540,70 L540,110 M520,90 L560,90" fill="none" stroke="#2B36B2" strokeWidth="6" strokeLinecap="round" />
        <path d="M350,0 L350,400" stroke="#2B36B2" strokeWidth="2" opacity="0.3" strokeDasharray="5,5" />
        <path d="M0,150 L600,150" stroke="#2B36B2" strokeWidth="2" opacity="0.3" strokeDasharray="5,5" />
      </svg>
    );
  }

  if (artwork === "pixels") {
    return (
      <svg viewBox="0 0 400 240" className="h-full w-full object-cover" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="240" fill="#4B6BFF" />
        <g transform="translate(40, 90)">
          <rect x="0" y="0" width="30" height="20" fill="white" />
          <rect x="30" y="0" width="40" height="20" fill="#FF5252" />
          <rect x="70" y="0" width="20" height="20" fill="#1A1A1A" />
          <rect x="90" y="0" width="50" height="20" fill="white" />
          <rect x="140" y="0" width="30" height="20" fill="#FFB0B0" />
          <rect x="170" y="0" width="60" height="20" fill="#1A1A1A" />
          <rect x="230" y="0" width="30" height="20" fill="white" />
          <rect x="260" y="0" width="40" height="20" fill="#FF5252" />
          <rect x="10" y="20" width="40" height="20" fill="#1A1A1A" />
          <rect x="50" y="20" width="30" height="20" fill="white" />
          <rect x="80" y="20" width="60" height="20" fill="#FF5252" />
          <rect x="140" y="20" width="20" height="20" fill="#1A1A1A" />
          <rect x="160" y="20" width="50" height="20" fill="white" />
          <rect x="210" y="20" width="40" height="20" fill="#FFB0B0" />
          <rect x="250" y="20" width="30" height="20" fill="#1A1A1A" />
          <rect x="0" y="40" width="20" height="20" fill="white" />
          <rect x="20" y="40" width="50" height="20" fill="#FFB0B0" />
          <rect x="70" y="40" width="40" height="20" fill="white" />
          <rect x="110" y="40" width="30" height="20" fill="#1A1A1A" />
          <rect x="140" y="40" width="60" height="20" fill="#FF5252" />
          <rect x="200" y="40" width="30" height="20" fill="white" />
          <rect x="230" y="40" width="50" height="20" fill="#1A1A1A" />
        </g>
      </svg>
    );
  }

  if (artwork === "yellowShapes") {
    return (
      <svg viewBox="0 0 400 240" className="h-full w-full object-cover" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="240" fill="#F4D03F" />
        <path d="M-20,100 Q80,150 150,0 L0,0 Z" fill="#111" />
        <path d="M120,240 Q180,120 300,180 L200,240 Z" fill="white" />
        <path d="M250,50 Q320,180 420,100 L420,0 L200,0 Z" fill="#EAEAEA" />
        <path d="M100,50 Q150,150 200,80" stroke="#111" strokeWidth="20" fill="none" strokeLinecap="round" />
        <path d="M160,180 Q220,100 280,200" stroke="#111" strokeWidth="30" fill="none" strokeLinecap="round" />
        <circle cx="300" cy="120" r="10" fill="#1DB954" />
      </svg>
    );
  }

  if (artwork === "circles") {
    return (
      <svg viewBox="0 0 400 240" className="h-full w-full object-cover" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="240" fill="#1A1A1A" />
        <circle cx="80" cy="50" r="45" fill="#FF7B54" />
        <circle cx="160" cy="50" r="45" fill="#A8A8A8" />
        <circle cx="240" cy="50" r="45" fill="#B9A0FF" />
        <circle cx="320" cy="50" r="45" fill="#FFC857" />
        <circle cx="80" cy="120" r="45" fill="#FFC857" />
        <circle cx="160" cy="120" r="45" fill="#FF7B54" />
        <circle cx="240" cy="120" r="45" fill="#A8A8A8" />
        <circle cx="320" cy="120" r="45" fill="#B9A0FF" />
        <circle cx="80" cy="190" r="45" fill="#B9A0FF" />
        <circle cx="160" cy="190" r="45" fill="#FFC857" />
        <circle cx="240" cy="190" r="45" fill="#FF7B54" />
        <circle cx="320" cy="190" r="45" fill="#A8A8A8" />
        <circle cx="160" cy="50" r="20" fill="#1A1A1A" />
        <circle cx="320" cy="190" r="20" fill="#1A1A1A" />
        <circle cx="80" cy="120" r="20" fill="#1A1A1A" />
      </svg>
    );
  }

  if (artwork === "softSystem") {
    return (
      <svg viewBox="0 0 400 240" className="h-full w-full object-cover" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="240" fill="#D5F5E3" />
        <rect x="180" y="40" width="160" height="30" rx="15" fill="none" stroke="#A6ACAF" strokeWidth="3" />
        <rect x="150" y="85" width="200" height="30" rx="15" fill="#EAEDED" />
        <rect x="70" y="130" width="180" height="30" rx="15" fill="none" stroke="#A6ACAF" strokeWidth="3" />
        <rect x="100" y="175" width="220" height="30" rx="15" fill="#EAEDED" />
        <circle cx="90" cy="70" r="25" fill="#A6ACAF" />
        <circle cx="320" cy="145" r="20" fill="#D2B4DE" />
        <circle cx="80" cy="190" r="40" fill="#117A65" />
        <circle cx="260" cy="190" r="15" fill="#76D7C4" />
      </svg>
    );
  }

  if (artwork === "gradient") {
    return (
      <svg viewBox="0 0 400 240" className="h-full w-full object-cover" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="blogGradientOne" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF85A2" />
            <stop offset="100%" stopColor="#FF5722" />
          </linearGradient>
          <linearGradient id="blogGradientTwo" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF5722" />
            <stop offset="100%" stopColor="#FF85A2" />
          </linearGradient>
        </defs>
        <rect width="400" height="240" fill="url(#blogGradientOne)" />
        <path d="M0,80 L200,80 L200,240 L0,240 Z" fill="white" fillOpacity="0.2" />
        <path d="M200,0 L400,0 L400,160 L200,160 Z" fill="white" fillOpacity="0.15" />
        <circle cx="100" cy="160" r="60" fill="url(#blogGradientTwo)" />
        <polygon points="300,100 380,220 220,220" fill="url(#blogGradientOne)" />
        <rect x="50" y="30" width="100" height="40" fill="white" fillOpacity="0.3" />
        <rect x="250" y="40" width="80" height="80" fill="white" fillOpacity="0.2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 400 240" className="h-full w-full object-cover" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="240" fill="#161A1D" />
      <g fill="none" strokeWidth="2">
        <path d="M20,20 L100,50 L50,120 Z" stroke="#FF578A" />
        <path d="M150,30 L250,10 L280,80 L180,100 Z" stroke="#00E676" />
        <path d="M300,40 L380,20 L350,100 Z" stroke="#00B0FF" />
        <path d="M10,180 L80,140 L120,220 L40,230 Z" stroke="#00B0FF" />
        <path d="M150,150 L220,120 L270,180 L200,220 Z" stroke="#FF578A" />
        <path d="M280,200 L350,130 L390,210 Z" stroke="#00E676" />
        <circle cx="100" cy="180" r="10" stroke="#FF578A" />
        <circle cx="250" cy="50" r="15" stroke="#00B0FF" />
        <circle cx="340" cy="180" r="8" stroke="#FF578A" />
      </g>
    </svg>
  );
}