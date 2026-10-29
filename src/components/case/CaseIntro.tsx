import RichText from "@/components/RichText";
import { clean, editAttr } from "@/sanity/lib/clean";
import { imageUrl } from "@/sanity/lib/image";
import type { CaseData, CaseDoc } from "./caseTypes";
import styles from "./Case.module.css";

/** Introduction : titre et texte en colonne gauche, puis grande image (1325 × 476 à 1920). */
export default function CaseIntro({ intro, doc }: { intro: NonNullable<CaseData["detailIntro"]>; doc: CaseDoc }) {
  const src = imageUrl(intro.image, 2650, 952);
  return (
    <section className={`${styles.section} ${styles.intro}`}>
      <div data-in>
        {!!intro.title?.length && (
          <h2 className={styles.h2}>
            {intro.title.map((l, i) => (
              <span key={i}>{i ? " " : ""}{l}</span>
            ))}
          </h2>
        )}
        {intro.text && (
          <p className={styles.text}>
            <RichText text={intro.text} />
          </p>
        )}
      </div>
      {src && (
        <figure className={styles.wide} data-in data-sanity={editAttr(doc, "detailIntro.image")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={clean(intro.image?.alt) ?? ""} width={1325} height={476} loading="lazy" />
        </figure>
      )}
    </section>
  );
}
