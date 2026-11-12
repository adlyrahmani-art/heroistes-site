import type { CSSProperties } from "react";
import RichText from "@/components/RichText";
import { clean, editAttr } from "@/sanity/lib/clean";
import { imageUrl } from "@/sanity/lib/image";
import type { ChapterLayout } from "@/content/cases";
import type { CaseDoc, ChapterData } from "./caseTypes";
import styles from "./Case.module.css";

const IMG_H = 476; // hauteur des images de chapitre à 1920
const FALLBACK_RATIO = 663 / 476;

/**
 * Chapitre : très grand titre qui traverse le trait central, blocs de texte et image facultative.
 * Image à droite → blocs à gauche ; image à gauche → blocs à droite (texte aligné à droite) ; sans image → blocs à gauche.
 * Grand titre facultatif (suite d'un chapitre, maquette Beauchamp). Largeur des blocs réglable (`textWidth`, px à 1920).
 */
export default function CaseChapter({ chapter, doc, layout }: { chapter: ChapterData; doc: CaseDoc; layout?: ChapterLayout }) {
  const key = clean(chapter._key);
  const dims = chapter.image?.asset?.metadata?.dimensions;
  const ratio = dims?.width && dims?.height ? dims.width / dims.height : FALLBACK_RATIO;
  const src = imageUrl(chapter.image, Math.round(2 * IMG_H * ratio), 2 * IMG_H);
  const left = !!src && clean(chapter.imageSide) === "left";
  const untitled = !chapter.blocks?.[0]?.title?.length;
  const hasTitle = !!chapter.title?.length;
  const widths = layout?.blockWidths ?? [];
  // Colonne aussi large que le plus large des blocs
  const textWidth = Math.max(clean(chapter.textWidth) ?? 0, ...widths.map((w) => w ?? 0)) || undefined;
  const spacing = {
    ...(layout?.gap !== undefined && { "--ch-gap": layout.gap }),
    ...(layout?.colsGap !== undefined && { "--cols-gap": layout.colsGap }),
    ...(layout?.imageGap !== undefined && { "--fig-gap": layout.imageGap }),
    ...(layout?.blockGap !== undefined && { "--block-gap": layout.blockGap }),
  } as CSSProperties;

  return (
    <section className={`${styles.section} ${styles.chapter} ${hasTitle ? "" : styles.noTitle}`} style={spacing}>
      {hasTitle && (
        <div data-in>
          <h2 className={`${styles.display} ${styles.chapterTitle}`}>
            {chapter.title?.map((l, i) => (
              <span key={i}>{i ? " " : ""}{l}</span>
            ))}
          </h2>
        </div>
      )}
      <div
        className={`${styles.cols} ${left ? styles.imageLeft : ""} ${untitled ? styles.untitled : ""}`}
        style={textWidth ? ({ "--blocks-w": textWidth } as CSSProperties) : undefined}
      >
        <div className={styles.blocks} data-in>
          {chapter.blocks?.map((b, i) => (
            <div
              key={clean(b._key)}
              className={styles.block}
              style={widths[i] ? ({ "--bw": widths[i] } as CSSProperties) : undefined}
            >
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
