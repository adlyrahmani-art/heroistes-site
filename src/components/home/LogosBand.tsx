import { clean, editAttr } from "@/sanity/lib/clean";
import { imageUrl } from "@/sanity/lib/image";
import { nativeSize, type HomeDoc, type LogosData } from "./homeTypes";
import styles from "./LogosBand.module.css";

/** Bloc 9.2 · Bandeau de preuves : logos clients en niveaux de gris, défilement continu (pause au survol). */
export default function LogosBand({ logos, doc }: { logos: LogosData; doc: HomeDoc }) {
  const row = (hidden: boolean) =>
    logos.clients?.map((c) => {
      const size = nativeSize(c.asset);
      const src = imageUrl(c, size?.w ?? 360);
      if (!src) return null;
      const key = clean(c._key);
      return (
        <li
          key={key}
          className={styles.logo}
          data-sanity={hidden ? undefined : editAttr(doc, `logosBand.clients[_key=="${key}"]`)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={hidden ? "" : clean(c.alt ?? "")} width={size?.w} height={size?.h} loading="lazy" />
        </li>
      );
    });
  return (
    <section className={styles.band} aria-label="Ils nous font confiance">
      <p className={styles.text}>{logos.text}</p>
      <div className={styles.marquee}>
        <ul className={styles.row}>{row(false)}</ul>
        <ul className={styles.row} aria-hidden="true">
          {row(true)}
        </ul>
      </div>
    </section>
  );
}
