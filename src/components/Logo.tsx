// Tracés exacts du symbole (ressources/Logo Heroistes final.svg)
const BLADE_LEFT = "M266.506 0L153 113.574V349.68L328.636 173.939H267.94L266.506 0Z";
const BLADE_RIGHT = "M267.494 388L381 274.426V38.3203L205.364 214.045H266.06L267.494 388Z";

/** Symbole H : deux lames. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="153 0 228 388" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="logo-blade-l" x1="240.818" y1="0" x2="240.818" y2="349.68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5E5D5D" />
          <stop offset="1" stopColor="#252525" />
        </linearGradient>
        <linearGradient id="logo-blade-r" x1="293.182" y1="38.3203" x2="293.182" y2="388" gradientUnits="userSpaceOnUse">
          <stop stopColor="#11E3C7" stopOpacity="0.44" />
          <stop offset="1" stopColor="#11E3C7" />
        </linearGradient>
      </defs>
      <path d={BLADE_LEFT} fill="url(#logo-blade-l)" />
      <path d={BLADE_RIGHT} fill="url(#logo-blade-r)" />
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
