// Tracés exacts du symbole (ressources/Logo Heroistes final.svg)
export const BLADE_LEFT = "M266.506 0L153 113.574V349.68L328.636 173.939H267.94L266.506 0Z";
export const BLADE_RIGHT = "M267.494 388L381 274.426V38.3203L205.364 214.045H266.06L267.494 388Z";

/**
 * Symbole H : deux lames.
 * - variante « light » (fond clair, « Logo Heroistes final.svg ») : lame gauche anthracite ;
 * - variante « dark » (fond sombre, « Logo v2.svg ») : lame gauche gris clair, visible sur le noir.
 */
export function LogoMark({ className, variant = "light" }: { className?: string; variant?: "light" | "dark" }) {
  const dark = variant === "dark";
  const l = `logo-blade-l-${variant}`;
  const r = `logo-blade-r-${variant}`;
  return (
    <svg viewBox="153 0 228 388" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={l} x1="240.818" y1="0" x2="240.818" y2="349.68" gradientUnits="userSpaceOnUse">
          <stop stopColor={dark ? "#F5F5F5" : "#5E5D5D"} />
          <stop offset="1" stopColor={dark ? "#CFCFCF" : "#252525"} />
        </linearGradient>
        <linearGradient id={r} x1="293.182" y1="38.3203" x2="293.182" y2="388" gradientUnits="userSpaceOnUse">
          <stop stopColor="#11E3C7" stopOpacity={dark ? 0.34 : 0.44} />
          <stop offset="1" stopColor="#11E3C7" />
        </linearGradient>
      </defs>
      <path d={BLADE_LEFT} fill={`url(#${l})`} />
      <path d={BLADE_RIGHT} fill={`url(#${r})`} />
    </svg>
  );
}

/** Éclair turquoise seul (lame droite), utilisé comme signature en bas des lames. */
export function Bolt({ className }: { className?: string }) {
  return (
    <svg viewBox="205 38 176 350" className={className} aria-hidden="true">
      <path d={BLADE_RIGHT} fill="#11E3C7" />
    </svg>
  );
}
