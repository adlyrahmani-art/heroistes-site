import { LogoMark } from "./Logo";
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

export default function Header() {
  return (
    <header className={styles.header}>
      {/* Flou progressif sous le menu : plus fort en haut, il s'efface vers le bas */}
      <div className={styles.blur} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <a href="#accueil" className={styles.brand} aria-label="Héroïstes, retour à l'accueil">
        <LogoMark className={styles.mark} />
        <span>Héroïstes</span>
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
