type HeroIllustrationProps = { className?: string };

const ink = (v: string) => ({ fill: `var(${v})` });

export default function HeroIllustration({ className = "" }: HeroIllustrationProps) {
  return (
    <svg
      className={`hero-illus ${className}`.trim()}
      viewBox="0 0 560 500"
      role="img"
      aria-label="A members-only streetio article with a lock over the full text"
    >
      <defs>
        <radialGradient id="hero-illus-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: "var(--color-steel-500)", stopOpacity: 0.35 }} />
          <stop offset="100%" style={{ stopColor: "var(--color-steel-500)", stopOpacity: 0 }} />
        </radialGradient>
        <linearGradient id="hero-illus-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--color-neutral-0)", stopOpacity: 0 }} />
          <stop offset="55%" style={{ stopColor: "var(--color-neutral-0)", stopOpacity: 0.92 }} />
          <stop offset="100%" style={{ stopColor: "var(--color-neutral-0)", stopOpacity: 1 }} />
        </linearGradient>
        <clipPath id="hero-illus-card">
          <rect x="150" y="54" width="260" height="380" rx="20" />
        </clipPath>
      </defs>

      {/* Glow + platform */}
      <ellipse cx="280" cy="280" rx="260" ry="210" fill="url(#hero-illus-glow)" />
      <path
        d="M40 476 C 120 428, 200 412, 280 412 C 360 412, 440 428, 520 476 Z"
        style={{ ...ink("--color-charcoal-600"), opacity: 0.55 }}
      />

      {/* Back cards (a stack of articles) */}
      <rect x="182" y="34" width="228" height="360" rx="20" transform="rotate(7 296 214)" style={ink("--color-charcoal-600")} />
      <rect x="168" y="44" width="244" height="370" rx="20" transform="rotate(3.5 290 229)" style={ink("--color-steel-600")} />

      {/* Main article card */}
      <g className="hero-illus__card">
        <rect x="150" y="54" width="260" height="380" rx="20" style={ink("--color-neutral-0")} />

        <g clipPath="url(#hero-illus-card)">
          {/* cover image */}
          <rect x="150" y="54" width="260" height="118" style={ink("--color-charcoal-700")} />
          <path d="M150 172 L 214 118 L 262 152 L 316 104 L 410 172 Z" style={ink("--color-charcoal-500")} />
          <circle cx="370" cy="92" r="14" style={ink("--color-steel-500")} />

          {/* byline: io mark avatar */}
          <rect x="170" y="190" width="28" height="28" rx="7" style={ink("--color-charcoal-800")} />
          <rect x="178" y="196" width="5" height="5" rx="1" style={ink("--color-neutral-0")} />
          <rect x="178" y="203" width="5" height="9" rx="1" style={ink("--color-neutral-0")} />
          <circle cx="190" cy="207" r="4" style={{ fill: "none", stroke: "var(--color-neutral-0)", strokeWidth: 3 }} />
          <rect x="206" y="194" width="64" height="7" rx="3.5" style={ink("--color-charcoal-800")} />
          <rect x="206" y="207" width="44" height="6" rx="3" style={ink("--color-steel-400")} />

          {/* headline */}
          <rect x="170" y="234" width="210" height="13" rx="6.5" style={ink("--color-charcoal-800")} />
          <rect x="170" y="254" width="168" height="13" rx="6.5" style={ink("--color-charcoal-800")} />

          {/* body text, fading out */}
          <g style={ink("--color-steel-300")}>
            <rect x="170" y="284" width="220" height="7" rx="3.5" />
            <rect x="170" y="298" width="204" height="7" rx="3.5" />
            <rect x="170" y="312" width="214" height="7" rx="3.5" />
            <rect x="170" y="326" width="186" height="7" rx="3.5" />
            <rect x="170" y="340" width="210" height="7" rx="3.5" />
            <rect x="170" y="354" width="196" height="7" rx="3.5" />
            <rect x="170" y="368" width="208" height="7" rx="3.5" />
          </g>
          <rect x="150" y="276" width="260" height="158" fill="url(#hero-illus-fade)" />

          {/* paywall button */}
          <rect x="196" y="388" width="168" height="30" rx="15" style={ink("--color-charcoal-800")} />
          <rect x="232" y="400" width="96" height="6" rx="3" style={ink("--color-steel-400")} />
        </g>

        {/* lock badge */}
        <g className="hero-illus__lock">
          <circle cx="280" cy="342" r="30" style={ink("--color-charcoal-800")} />
          <path
            d="M270 338 v-7 a10 10 0 0 1 20 0 v7"
            style={{ fill: "none", stroke: "var(--color-steel-500)", strokeWidth: 4, strokeLinecap: "round" }}
          />
          <rect x="265" y="336" width="30" height="22" rx="5" style={ink("--color-neutral-0")} />
          <rect x="278" y="342" width="4" height="9" rx="2" style={ink("--color-charcoal-800")} />
        </g>
      </g>

      {/* floating — read time */}
      <g className="hero-illus__float hero-illus__float--1">
        <rect x="26" y="140" width="150" height="64" rx="14" style={ink("--color-neutral-0")} />
        <circle cx="58" cy="172" r="15" style={ink("--color-steel-200")} />
        <path
          d="M58 164 v8 l6 4"
          style={{ fill: "none", stroke: "var(--color-charcoal-800)", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" }}
        />
        <text
          x="82"
          y="180"
          style={{ fill: "var(--color-charcoal-800)", fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 22, letterSpacing: "-0.04em" }}
        >
          12 min
        </text>
      </g>

      {/* floating — topic tags */}
      <g className="hero-illus__float hero-illus__float--2">
        <rect x="396" y="214" width="138" height="104" rx="14" style={ink("--color-neutral-0")} />
        <rect x="412" y="230" width="58" height="7" rx="3.5" style={ink("--color-steel-400")} />
        <rect x="412" y="248" width="52" height="22" rx="11" style={ink("--color-charcoal-800")} />
        <rect x="470" y="248" width="48" height="22" rx="11" style={ink("--color-steel-200")} />
        <rect x="412" y="278" width="64" height="22" rx="11" style={ink("--color-steel-200")} />
        <rect x="482" y="278" width="36" height="22" rx="11" style={ink("--color-steel-500")} />
      </g>

      {/* floating — unlocked check */}
      <g className="hero-illus__float hero-illus__float--3">
        <circle cx="448" cy="128" r="24" style={ink("--color-success")} />
        <path
          d="M437 128 l8 8 l15 -16"
          style={{ fill: "none", stroke: "var(--color-neutral-0)", strokeWidth: 5, strokeLinecap: "round", strokeLinejoin: "round" }}
        />
      </g>

      {/* floating — bookmark */}
      <g className="hero-illus__float hero-illus__float--2">
        <rect x="70" y="318" width="64" height="64" rx="16" style={ink("--color-charcoal-700")} />
        <rect x="70" y="318" width="64" height="64" rx="16" style={{ fill: "none", stroke: "var(--color-steel-600)", strokeOpacity: 0.5 }} />
        <path d="M91 334 h22 v32 l-11 -8 l-11 8 Z" style={ink("--color-steel-500")} />
      </g>
    </svg>
  );
}