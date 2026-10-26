import styles from "./Header.module.css";

const NAV = [
  ["Accueil", "#accueil"],
  ["Expertises", "#expertises"],
  ["Conseil", "#conseil"],
  ["Cas clients", "#cas-clients"],
  ["Secteurs", "#secteurs"],
  ["L'agence", "#agence"],
  ["Blog", "#blog"],
  ["Contact", "#contact"],
] as const;

/** Symbole H : deux lames (approximation — tracés exacts à reprendre des vectors Figma 1:32 / 1:33). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 229 389" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="logo-a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5E5D5D" />
          <stop offset="1" stopColor="#252525" />
        </linearGradient>
        <linearGradient id="logo-b" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#11E3C7" stopOpacity=".45" />
          <stop offset="1" stopColor="#11E3C7" />
        </linearGradient>
      </defs>
      <polygon fill="url(#logo-a)" points="0,80 105,0 105,150 175,130 105,200 105,270 0,350" />
      <polygon fill="url(#logo-b)" points="227.36,308.32 122.36,388.32 122.36,238.32 52.36,258.32 122.36,188.32 122.36,118.32 227.36,38.32" />
    </svg>
  );
}

export default function Header() {
  return (
    <header className={styles.header}>
      <a href="#accueil" className={styles.brand} aria-label="Héroïstes, retour à l'accueil">
        <LogoMark className={styles.mark} />
        Héroïstes
      </a>
      <nav className={styles.menu} aria-label="Navigation principale">
        {NAV.map(([label, href], i) => (
          <a key={href} href={href} aria-current={i === 0 ? "page" : undefined}>
            <i>{String(i + 1).padStart(2, "0")}.</i>
            {label}
          </a>
        ))}
      </nav>
      <a href="#contact" className={styles.cta}>Lancer un projet</a>
    </header>
  );
}
