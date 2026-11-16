import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import Cursor from "@/components/Cursor";
import styles from "./not-found.module.css";
import "./globals.css";

// Voyant unique : [x, y, rayon] de la lentille sur la photo (repère 1920 × 1080)
const LIGHT: [number, number, number] = [1320, 145, 27];

export const metadata: Metadata = {
  title: "Page introuvable | Héroïstes",
  robots: { index: false },
};

/**
 * Page 404 (maquette « Page - 404 Md »). Sert aux URL inconnues et aux notFound() de toutes les routes.
 * Rendue sous la mise en page racine : elle importe donc elle-même les styles globaux.
 */
export default function NotFound() {
  return (
    <>
      <SiteHeader anchorBase="/" />
      <main className={styles.page} data-tone="dark">
        <div className={styles.bg} aria-hidden="true" />
        {/* Voyants de la machine, calés sur la photo (repère 1920 × 1080, même cadrage que le fond) */}
        <svg className={styles.lights} viewBox="0 0 1920 1080" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
          <defs>
            <radialGradient id="voyant">
              <stop offset="0" stopColor="#c9fff6" stopOpacity="0.9" />
              <stop offset="0.35" stopColor="#11e3c7" stopOpacity="0.55" />
              <stop offset="0.6" stopColor="#11e3c7" stopOpacity="0.15" />
              <stop offset="1" stopColor="#11e3c7" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle className={styles.light} cx={LIGHT[0]} cy={LIGHT[1]} r={LIGHT[2] * 1.5} fill="url(#voyant)" />
        </svg>
        <div className="fx-grain" aria-hidden="true" />

        <div className={styles.content}>
          <nav aria-label="Fil d’Ariane" className={styles.crumb}>
            <Link href="/">Accueil</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Page introuvable</span>
          </nav>
          <p className={styles.eyebrow}>
            Erreur 404 <span aria-hidden="true">·</span> Rapport d’audit de page
          </p>
          <h1 className={styles.title}>
            <span className={styles.l1}>Cette page ne rapportait rien.</span>
            <span className={styles.l2}>
              On l’a <span className={styles.hl}>arrêtée.</span>
            </span>
          </h1>
          <p className={styles.text}>
            Chez Héroïstes, chaque action est jugée sur vos ventes. Même nos pages.{" "}
            <br />
            Celle-ci n’a pas passé l’audit : nous l’avons arrêtée.
          </p>
          <Link href="/" className={`btn btn-primary ${styles.cta}`}>
            Relancer la machine
          </Link>
        </div>
      </main>
      <Cursor />
    </>
  );
}
