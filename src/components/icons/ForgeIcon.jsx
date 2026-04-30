import React from "react";

const ICON_STROKE_WIDTH = 1.75;

function IconSvg({ children, size = 24, title, className = "", ...props }) {
  const label = title || props["aria-label"];
  return (
    <svg
      className={["forge-icon", className].filter(Boolean).join(" ")}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={label ? "img" : "presentation"}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      stroke="currentColor"
      strokeWidth={ICON_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

function GemCore() {
  return (
    <>
      <path d="M7.5 3.8h9L21 9.2 12 21 3 9.2 7.5 3.8Z" />
      <path d="M3 9.2h18" />
      <path d="M7.5 3.8 12 9.2l4.5-5.4" />
      <path d="m8.2 9.2 3.8 11.3 3.8-11.3" />
    </>
  );
}

const ICONS = {
  add: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
      <path d="M4.5 4.5h15v15h-15z" />
    </>
  ),
  anvil: (
    <>
      <path d="M4 8h13.5c1.6 0 2.8 1.2 2.8 2.8v.2H14l-2.2 2.6H8.1L6.4 16H3.8l2.1-5H4V8Z" />
      <path d="M8 16h7" />
      <path d="M10 16v4" />
      <path d="M6.5 20h7" />
    </>
  ),
  armor: (
    <>
      <path d="M12 3.4 20 6v5.2c0 4.7-3.1 8.1-8 9.4-4.9-1.3-8-4.7-8-9.4V6l8-2.6Z" />
      <path d="M12 6.2v11.2" />
      <path d="M7.2 8.2h9.6" />
    </>
  ),
  claim: (
    <>
      <path d="M4.2 9.2h15.6v9.4H4.2z" />
      <path d="M5.8 7.2h12.4l1.6 2H4.2l1.6-2Z" />
      <path d="M8.8 9.2v9.4" />
      <path d="M15.2 9.2v9.4" />
      <path d="M10.4 12.3h3.2v2.7h-3.2z" />
      <path d="M7.4 7.2V5.9c0-1.2.9-2.1 2.1-2.1h5c1.2 0 2.1.9 2.1 2.1v1.3" />
    </>
  ),
  "chevron-down": (
    <>
      <path d="m6.2 9.2 5.8 5.8 5.8-5.8" />
    </>
  ),
  "chevron-left": (
    <>
      <path d="m14.8 5.8-6.2 6.2 6.2 6.2" />
    </>
  ),
  "chevron-right": (
    <>
      <path d="m9.2 5.8 6.2 6.2-6.2 6.2" />
    </>
  ),
  combat: (
    <>
      <path d="m4.2 19.8 6.7-6.7" />
      <path d="m8.4 5.3 10.3 10.3.9 4-4-.9L5.3 8.4 4.1 4.1l4.3 1.2Z" />
      <path d="m19.8 4.2-6.2 6.2" />
      <path d="m15.8 4.8 3.4 3.4" />
    </>
  ),
  close: (
    <>
      <path d="M5.2 5.2 18.8 18.8" />
      <path d="M18.8 5.2 5.2 18.8" />
      <path d="M4.2 4.2h15.6v15.6H4.2z" />
    </>
  ),
  distillery: (
    <>
      <path d="M9 4.2h6" />
      <path d="M10 4.2v5l-4.8 8.1c-.8 1.4.2 3.1 1.8 3.1h10c1.6 0 2.6-1.7 1.8-3.1L14 9.2v-5" />
      <path d="M7.4 16.4c1.9-1.1 3.6 1 5.4-.1 1.3-.8 2.4-1.1 3.8-.1" />
      <path d="M8.8 18.5h6.4" />
    </>
  ),
  essence: <GemCore />,
  extract: (
    <>
      <path d="M12 3.2 18.8 7v7.8L12 20.8l-6.8-6V7L12 3.2Z" />
      <path d="M12 3.2v17.6" />
      <path d="M5.2 7 12 11l6.8-4" />
      <path d="M8.3 15.2 5.2 18.3" />
      <path d="M15.7 15.2l3.1 3.1" />
    </>
  ),
  fire: (
    <>
      <path d="M13.2 3.4c.7 3.4-1.6 4.6-2.4 6.8 1.5-.5 2.4-1.4 3-3.2 2.8 2.1 4.6 4.8 4.6 8 0 3.5-2.8 5.7-6.4 5.7S5.6 18.5 5.6 15c0-2.8 1.4-4.9 3.5-6.8.7-.7 1.2-1.7.9-3 1.2.5 2.2 1.1 3.2 2.3Z" />
      <path d="M12 20.6c-1.6-.7-2.6-1.9-2.6-3.5 0-1.3.8-2.5 2.1-3.6.1 1.2.7 2 1.6 2.7.6.5 1 1.1 1 1.9 0 1.1-.8 2-2.1 2.5Z" />
    </>
  ),
  forge: (
    <>
      <path d="M4 15.5h16" />
      <path d="M6.5 15.5 8 20h8l1.5-4.5" />
      <path d="M8 12.6h8" />
      <path d="M10.8 4.2h2.4v8.4h-2.4z" />
      <path d="m8.2 6.8 3.8-3.4 3.8 3.4" />
    </>
  ),
  gold: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <circle cx="12" cy="12" r="5.2" />
      <path d="M12 6.8v10.4" />
      <path d="M8.9 9.4h4.5a1.8 1.8 0 0 1 0 3.6h-2.8a1.9 1.9 0 0 0 0 3.8h4.7" />
    </>
  ),
  hero: (
    <>
      <path d="M12 3.2 18.2 6v5.5c0 4.4-2.4 7.4-6.2 9.3-3.8-1.9-6.2-4.9-6.2-9.3V6L12 3.2Z" />
      <path d="M8.2 9.3h7.6" />
      <path d="M9.4 13.2h5.2" />
      <path d="M12 3.2v17.6" />
    </>
  ),
  inventory: (
    <>
      <path d="M5.5 8.5h13l-1 11h-11l-1-11Z" />
      <path d="M8 8.5V7a4 4 0 0 1 8 0v1.5" />
      <path d="M8.2 13.3h7.6" />
      <path d="M9.5 16.2h5" />
    </>
  ),
  laboratory: (
    <>
      <path d="M9 3.8h6" />
      <path d="M10 3.8v5.4l-4 7.7c-.8 1.6.3 3.4 2.1 3.4h7.8c1.8 0 2.9-1.8 2.1-3.4l-4-7.7V3.8" />
      <path d="M7.5 15.8h9" />
      <path d="M9.6 18.2h4.8" />
      <path d="M16.9 7.8h2.4" />
      <path d="M18.1 6.6V9" />
    </>
  ),
  library: (
    <>
      <path d="M5.2 5.2h9.5c2.2 0 4.1 1.8 4.1 4v10.3H8.4c-1.8 0-3.2-1.4-3.2-3.2V5.2Z" />
      <path d="M8.4 5.2v14.3" />
      <path d="M11 8h4.5" />
      <path d="M11 11h4.8" />
      <path d="M11 14h3.8" />
    </>
  ),
  locked: (
    <>
      <rect x="5.2" y="10.2" width="13.6" height="9.4" rx="1.4" />
      <path d="M8.4 10.2V7.7a3.6 3.6 0 0 1 7.2 0v2.5" />
      <path d="M12 14v2" />
    </>
  ),
  mail: (
    <>
      <path d="M4 6.8h16v10.4H4z" />
      <path d="m4 7.2 8 6.1 8-6.1" />
      <path d="m4.8 16.6 4.5-4" />
      <path d="m19.2 16.6-4.5-4" />
    </>
  ),
  more: (
    <>
      <path d="M5 7h5v5H5z" />
      <path d="M14 7h5v5h-5z" />
      <path d="M5 16h5v5H5z" />
      <path d="M14 16h5v5h-5z" />
    </>
  ),
  repeat: (
    <>
      <path d="M17.2 7.2H8.3a4.2 4.2 0 0 0-3.8 2.4" />
      <path d="m14.8 4.8 2.4 2.4-2.4 2.4" />
      <path d="M6.8 16.8h8.9a4.2 4.2 0 0 0 3.8-2.4" />
      <path d="m9.2 19.2-2.4-2.4 2.4-2.4" />
    </>
  ),
  bleed: (
    <>
      <path d="M12 3.5c3.4 4.1 5.2 7.2 5.2 10.1a5.2 5.2 0 0 1-10.4 0c0-2.9 1.8-6 5.2-10.1Z" />
      <path d="M9.4 13.8c.2 1.5 1.2 2.6 2.6 2.6" />
    </>
  ),
  fracture: (
    <>
      <path d="M12 3.4 20 6v5.1c0 4.6-3 8-8 9.4-5-1.4-8-4.8-8-9.4V6l8-2.6Z" />
      <path d="m12 6.4-1.8 4.1 3 1.4-2.1 5.4" />
      <path d="M7.3 8.8h4" />
      <path d="M13.5 15.6h3.2" />
    </>
  ),
  mark: (
    <>
      <circle cx="12" cy="12" r="7.2" />
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 2.8v3" />
      <path d="M12 18.2v3" />
      <path d="M2.8 12h3" />
      <path d="M18.2 12h3" />
    </>
  ),
  poison: (
    <>
      <circle cx="9" cy="10" r="3.3" />
      <circle cx="15.4" cy="9.4" r="2.7" />
      <circle cx="13.2" cy="15" r="3.5" />
      <path d="M7.3 17.8c2.2.9 5.3.9 8.4 0" />
    </>
  ),
  sanctuary: (
    <>
      <path d="M12 3.2 20.2 9H3.8L12 3.2Z" />
      <path d="M5.4 9v10.3" />
      <path d="M18.6 9v10.3" />
      <path d="M3.8 19.3h16.4" />
      <path d="M9.4 19.3v-6h5.2v6" />
      <path d="M12 5.8v3.2" />
    </>
  ),
  shop: (
    <>
      <path d="M5 9h14l-1.2 11H6.2L5 9Z" />
      <path d="M8 9V7a4 4 0 0 1 8 0v2" />
      <path d="M8.1 13.2h7.8" />
      <path d="M9.4 16h5.2" />
    </>
  ),
  skull: (
    <>
      <path d="M12 3.8c4.2 0 7.2 3 7.2 7.3 0 2.6-1.2 4.7-3.3 5.9v3.2H8.1V17c-2.1-1.2-3.3-3.3-3.3-5.9 0-4.3 3-7.3 7.2-7.3Z" />
      <circle cx="9.3" cy="11.2" r="1.2" />
      <circle cx="14.7" cy="11.2" r="1.2" />
      <path d="m12 13.3-1.1 2h2.2L12 13.3Z" />
      <path d="M9.1 18.1h5.8" />
      <path d="M10.4 18.1v2.1" />
      <path d="M13.6 18.1v2.1" />
    </>
  ),
  sigilAltar: (
    <>
      <path d="M12 3.4 17.2 7v6.2L12 20.6l-5.2-7.4V7L12 3.4Z" />
      <path d="M12 7.2v9.6" />
      <path d="M8.5 10.1h7" />
      <path d="m8.8 15.2 3.2 2.2 3.2-2.2" />
    </>
  ),
  talents: (
    <>
      <path d="M12 4v5" />
      <path d="M7 10.2 12 9l5 1.2" />
      <path d="M7 10.2v4.7" />
      <path d="M17 10.2v4.7" />
      <path d="M12 9v8.2" />
      <circle cx="12" cy="4" r="1.7" />
      <circle cx="7" cy="15.6" r="1.7" />
      <circle cx="12" cy="18.9" r="1.7" />
      <circle cx="17" cy="15.6" r="1.7" />
    </>
  ),
  upgrade: (
    <>
      <path d="M12 4v15" />
      <path d="m6.8 9.2 5.2-5.2 5.2 5.2" />
      <path d="M6.2 19.5h11.6" />
      <path d="M8.2 14.5h7.6" />
    </>
  ),
  xp: (
    <>
      <path d="M12 3.5 19.5 8v8L12 20.5 4.5 16V8L12 3.5Z" />
      <path d="M8.2 9.2 10.7 12l-2.5 2.8" />
      <path d="m15.8 9.2-2.5 2.8 2.5 2.8" />
      <path d="M10.3 15.3 13.7 8.7" />
    </>
  ),
};

const ALIASES = {
  armorShield: "armor",
  crit: "mark",
  crit_chance: "mark",
  damage: "combat",
  defense: "armor",
  echo: "essence",
  echoes: "essence",
  errands: "mail",
  fireResource: "fire",
  flow: "repeat",
  gem: "essence",
  goldCoin: "gold",
  health: "fire",
  heroArmor: "hero",
  loot: "claim",
  missions: "mail",
  stats: "more",
  stationForge: "anvil",
  treasure: "claim",
};

export const FORGE_ICON_NAMES = Object.freeze(Object.keys(ICONS));

export default function ForgeIcon({
  name,
  size = 24,
  title,
  className,
  fallback = "more",
  ...props
}) {
  const resolvedName = ALIASES[name] || name;
  const icon = ICONS[resolvedName] || ICONS[fallback] || ICONS.more;
  return (
    <IconSvg size={size} title={title} className={className} {...props}>
      {icon}
    </IconSvg>
  );
}
