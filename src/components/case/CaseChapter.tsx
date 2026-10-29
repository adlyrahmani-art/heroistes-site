import RichText from "@/components/RichText";
import { Bolt } from "@/components/Logo";
import { clean, editAttr } from "@/sanity/lib/clean";
import { imageUrl } from "@/sanity/lib/image";
import type { CaseDoc, ChapterData } from "./caseTypes";
import styles from "./Case.module.css";

const IMG_H = 476; // hauteur des images de chapitre à 1920
const FALLBACK_RATIO = 663 / 476;

/**
 * Chapitre : éclair, très grand titre qui traverse le trait central, blocs de texte et image facultative.
 * Image à droite → blocs à gauche ; image à gauche → blocs à droite (texte aligné à droite) ; sans image → blocs à gauche.
 */
export default function CaseChapter({ chapter, doc }: { chapter: ChapterData; doc: CaseDoc }) {
  const key = clean(chapter._key);
  const dims = chapter.image?.asset?.metadata?.dimensions;
  const ratio = dims?.width && dims?.height ? dims.width / dims.height : FALLBACK_RATIO;
  const src = imageUrl(chapter.image, Math.round(2 * IMG_H * ratio), 2 * IMG_H);
  const left = !!src && clean(chapter.imageSide) === "left";
  const untitled = !chapter.blocks?.[0]?.title?.length;

  return (
    <section className={`${styles.section} ${styles.chapter}`}>
      <div data-in>
        <Bolt className={styles.bolt} />
        <h2 className={`${styles.display} ${styles.chapterTitle}`}>
          {chapter.title?.map((l, i) => (
            <span key={i}>{i ? " " : ""}{l}</span>
          ))}
        </h2>
      </div>
      <div
        className={`${styles.cols} ${left ? styles.imageLeft : ""} ${untitled ? styles.untitled : ""}`}
      >
        <div className={styles.blocks} data-in>
          {chapter.blocks?.map((b) => (
            <div key={clean(b._key)} className={styles.block}>
              {!!b.title?.length && (
                <h3 className={styles.h2}>
                  {b.title.map((l, i) => (
                    <span key={i}>{i ? " " : ""}{l}</span>
                  ))}
                </h3>
              )}
              {b.text && (
                <p className={styles.text}>
                  <RichText text={b.text} />
                </p>
              )}
            </div>
          ))}
        </div>
        {src && (
          <figure
            className={styles.figure}
            style={{ aspectRatio: `${ratio}` }}
            data-in
            data-sanity={editAttr(doc, `chapters[_key=="${key}"].image`)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={clean(chapter.image?.alt) ?? ""} loading="lazy" />
          </figure>
        )}
      </div>
    </section>
  );
}
