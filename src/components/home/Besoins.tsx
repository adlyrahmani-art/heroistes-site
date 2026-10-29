"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import RichText from "@/components/RichText";
import { clean, editAttr } from "@/sanity/lib/clean";
import { imageUrl } from "@/sanity/lib/image";
import type { BesoinsData, HomeDoc } from "./homeTypes";
import styles from "./Besoins.module.css";

/** Bloc 9.3 · Vos besoins, nos solutions : accordéon à 6 situations, une seule ouverte à la fois (réf. mattis « Services »). */
export default function Besoins({ besoins, doc }: { besoins: BesoinsData; doc: HomeDoc }) {
  const [open, setOpen] = useState<number | null>(null);
  const ref = useRef<HTMLElement>(null);

  // Révélation des lignes à l'entrée dans l'écran
  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add(styles.in);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} id="besoins" className={styles.section} aria-labelledby="besoins-title">
      <div className="fx-grain" aria-hidden="true" />
      <div className={styles.head}>
        <h2 id="besoins-title" className={styles.title}>
          {(besoins.title ?? "").split(", ").map((part, i, all) => (
            <Fragment key={i}>
              {part}
              {i < all.length - 1 && (
                <>
                  ,<br />
                </>
              )}
            </Fragment>
          ))}
        </h2>
        <p className={styles.intro}>
          <RichText text={besoins.intro ?? ""} />
        </p>
      </div>

      <ul className={styles.list}>
        {besoins.items?.map((b, i) => {
          const isOpen = open === i;
          const id = `besoin-${i + 1}`;
          const key = clean(b._key);
          const img = imageUrl(b.image, 1690, 774); // ratio 845 / 387, point focal appliqué
          return (
            <li key={key} className={`${styles.item} ${isOpen ? styles.open : ""}`} style={{ "--i": i } as React.CSSProperties}>
              <h3>
                <button
                  type="button"
                  className={styles.row}
                  aria-expanded={isOpen}
                  aria-controls={id}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className={styles.num}>{String(i + 1).padStart(2, "0")}.</span>
                  <span className={styles.name}>{b.title}</span>
                  <span className={styles.icon} aria-hidden="true" />
                </button>
              </h3>
              <div id={id} className={styles.panel} role="region" aria-label={clean(b.title ?? "")} inert={!isOpen}>
                <div className={styles.inner}>
                  <p className={styles.text}>
                    <RichText text={b.text ?? ""} />
                  </p>
                  <div className={styles.media} data-sanity={editAttr(doc, `besoins.items[_key=="${key}"].image`)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {img && <img src={img} alt="" width={845} height={387} loading="lazy" />}
                  </div>
                  <a href={clean(b.href ?? "#")} className={`btn ${styles.cta}`}>
                    Découvrez l’offre<span className="visually-hidden"> {b.offer}</span>
                  </a>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
