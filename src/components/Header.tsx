"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LogoMark } from "./Logo";
import { useLenis } from "./SmoothScroll";
import { navigation, type NavItem, type NavLabels } from "@/content/navigation";
import { clean } from "@/sanity/lib/clean";
import styles from "./Header.module.css";

const num = (i: number) => `${String(i + 1).padStart(2, "0")}.`;

/** Contenu d'un sous-menu : groupes titrés (Expertises) ou liste simple, en colonnes */
function SubLinks({ item, onNavigate, to }: { item: NavItem; onNavigate: () => void; to: (href: string) => string }) {
  let k = 0; // rang d'apparition, pour la cascade
  if (item.groups) {
    return (
      <div className={styles.groups}>
        {item.groups.map((g) => (
          <div key={g.label} className={styles.group}>
            <p className={styles.groupTitle} style={{ "--k": k++ } as React.CSSProperties}>
              {g.label}
            </p>
            <ul>
              {g.links.map((l) => (
                <li key={l.href} style={{ "--k": k++ } as React.CSSProperties}>
                  <a href={to(l.href)} className={styles.subLink} onClick={onNavigate}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }
  return (
    <ul className={`${styles.list} ${(item.links?.length ?? 0) > 6 ? styles.listCols : ""}`}>
      {item.links?.map((l) => (
        <li key={l.href} style={{ "--k": k++ } as React.CSSProperties}>
          <a href={to(l.href)} className={styles.subLink} onClick={onNavigate}>
            {l.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * Header fixe + menu complet (ressources/Menu.png).
 * Ordinateur : survol ou focus d'une entrée à sous-menu → méga-menu sombre qui se déroule depuis
 * le haut, liens en cascade ; passer d'une entrée à l'autre change le contenu sans refermer.
 * Mobile : bouton « Menu » → menu plein écran, sous-menus en accordéon.
 */
export default function Header({
  navLabels,
  cta,
  anchorBase = "",
}: {
  /** Préfixe des liens `#ancre` : « / » hors de l'accueil, pour y revenir. */
  anchorBase?: string;
  navLabels?: NavLabels | null;
  cta?: { label?: string | null; href?: string | null } | null;
}) {
  // Libellé affiché (brut, stega compris en brouillon) ; repli sur le libellé par défaut
  const labelOf = (item: NavItem) => navLabels?.[item.key] || item.label;
  const ctaLabel = cta?.label || "Lancer un projet";
  const ctaHref = clean(cta?.href) || "#contact";
  const [active, setActive] = useState<number | null>(null); // méga-menu ouvert (ordinateur)
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSub, setMobileSub] = useState<number | null>(null);
  const closeTimer = useRef(0);
  const lenisRef = useLenis();
  // Le formulaire (#contact) est dans le footer de chaque page : ce lien reste sur la page courante.
  const to = (href: string) => (href.startsWith("#") && href !== "#contact" ? `${anchorBase}${href}` : href);
  const onHome = anchorBase === "";

  const openMenu = (i: number) => {
    clearTimeout(closeTimer.current);
    setActive(i);
  };
  const closeSoon = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setActive(null), 160);
  };
  const closeAll = useCallback(() => {
    clearTimeout(closeTimer.current);
    setActive(null);
    setMobileOpen(false);
  }, []);

  // Ancres de la page d'accueil : défilement doux (Lenis) et fermeture des menus
  const navigate = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute("href") ?? "";
    closeAll();
    // Seules les ancres de la page courante sont interceptées ; ailleurs, navigation normale vers « /#… ».
    if (!onHome || !href.startsWith("#")) return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    lenisRef?.current?.start();
    if (lenisRef?.current) lenisRef.current.scrollTo(target as HTMLElement, { duration: 1.4 });
    else target.scrollIntoView({ behavior: "smooth" });
  };

  // Échap ferme ; le défilement de la page ferme le méga-menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeAll();
    const onScroll = () => setActive(null);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, [closeAll]);

  // Menu mobile ouvert : la page ne défile plus
  useEffect(() => {
    const lenis = lenisRef?.current;
    document.documentElement.classList.toggle("menu-open", mobileOpen);
    if (mobileOpen) lenis?.stop();
    else lenis?.start();
  }, [mobileOpen, lenisRef]);

  return (
    <>
      <header
        className={styles.header}
        data-open={active !== null || mobileOpen ? "true" : undefined}
        onMouseLeave={closeSoon}
      >
        {/* Flou progressif sous le menu : plus fort en haut, il s'efface vers le bas */}
        <div className={styles.blur} aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <a href={to("#accueil")} className={styles.brand} aria-label="Héroïstes, retour à l'accueil" onClick={navigate}>
          {/* Deux variantes du symbole : la bonne s'affiche selon le fond (voir Header.module.css) */}
          <span className={styles.markWrap}>
            <LogoMark className={`${styles.mark} ${styles.markDark}`} variant="dark" />
            <LogoMark className={`${styles.mark} ${styles.markLight}`} variant="light" />
          </span>
          <span>Héroïstes</span>
        </a>

        <nav className={styles.menu} aria-label="Navigation principale">
          <ul className={styles.top}>
            {navigation.map((item, i) => {
              const hasSub = Boolean(item.groups || item.links);
              const isOpen = active === i;
              return (
                <li
                  key={item.label}
                  onMouseEnter={() => (hasSub ? openMenu(i) : closeSoon())}
                  onFocus={() => (hasSub ? openMenu(i) : setActive(null))}
                >
                  <a
                    href={to(item.href)}
                    className={`${styles.topLink} ${isOpen ? styles.current : ""}`}
                    aria-current={i === 0 && onHome ? "page" : undefined}
                    onClick={navigate}
                  >
                    <i>{num(i)}</i>
                    {labelOf(item)}
                  </a>
                  {hasSub && (
                    <div
                      id={`mega-${i}`}
                      className={`${styles.mega} ${isOpen ? styles.megaOpen : ""}`}
                      inert={!isOpen}
                      onMouseEnter={() => openMenu(i)}
                    >
                      <div className={styles.megaInner} key={isOpen ? "on" : "off"}>
                        <div className={styles.megaHead}>
                          <span className={styles.megaNum}>{num(i)}</span>
                          <p className={styles.megaTitle}>{labelOf(item)}</p>
                          {item.pitch && <p className={styles.megaPitch}>{item.pitch}</p>}
                          <a href={to(item.href)} className={styles.megaAll} onClick={navigate}>
                            Tout voir <span aria-hidden="true">→</span>
                          </a>
                        </div>
                        <SubLinks item={item} onNavigate={closeAll} to={to} />
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <a href={to(ctaHref)} className={styles.cta} onClick={navigate}>
          {ctaLabel}
        </a>
        <button
          type="button"
          className={styles.burger}
          aria-expanded={mobileOpen}
          aria-controls="menu-mobile"
          onClick={() => setMobileOpen((o) => !o)}
        >
          <span className={styles.burgerLabel}>{mobileOpen ? "Fermer" : "Menu"}</span>
          <span className={styles.burgerIcon} aria-hidden="true" />
        </button>
      </header>

      {/* Voile sous le méga-menu : un clic referme */}
      <div className={`${styles.scrim} ${active !== null ? styles.scrimOn : ""}`} onClick={closeAll} aria-hidden="true" />

      {/* Menu mobile plein écran */}
      <div id="menu-mobile" className={`${styles.mobile} ${mobileOpen ? styles.mobileOpen : ""}`} inert={!mobileOpen} data-lenis-prevent>
        <ul className={styles.mobileList}>
          {navigation.map((item, i) => {
            const hasSub = Boolean(item.groups || item.links);
            const subOpen = mobileSub === i;
            return (
              <li key={item.label} style={{ "--k": i } as React.CSSProperties} className={subOpen ? styles.subOpen : ""}>
                <div className={styles.mobileRow}>
                  <a href={to(item.href)} className={styles.mobileLink} onClick={navigate}>
                    <i>{num(i)}</i>
                    {labelOf(item)}
                  </a>
                  {hasSub && (
                    <button
                      type="button"
                      className={styles.mobileToggle}
                      aria-expanded={subOpen}
                      aria-controls={`m-sub-${i}`}
                      aria-label={`Sous-menu ${clean(labelOf(item))}`}
                      onClick={() => setMobileSub(subOpen ? null : i)}
                    />
                  )}
                </div>
                {hasSub && (
                  <div id={`m-sub-${i}`} className={styles.mobileSub} inert={!subOpen}>
                    <div>
                      <SubLinks item={item} onNavigate={closeAll} to={to} />
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <a href={to(ctaHref)} className={`btn btn-primary ${styles.mobileCta}`} onClick={navigate}>
          {ctaLabel}
        </a>
      </div>
    </>
  );
}
