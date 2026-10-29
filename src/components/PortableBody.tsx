import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { clean } from "@/sanity/lib/clean";
import { imageUrl } from "@/sanity/lib/image";
import styles from "./DetailLayout.module.css";

const components: PortableTextComponents = {
  types: {
    imageWithAlt: ({ value }) => {
      const src = imageUrl(value, 1200);
      if (!src) return null;
      // eslint-disable-next-line @next/next/no-img-element
      return <img className={styles.bodyImg} src={clean(src)} alt={clean(value.alt) ?? ""} loading="lazy" />;
    },
  },
  marks: {
    link: ({ value, children }) => {
      const href = clean(value?.href) as string | undefined;
      return href ? <a href={href}>{children}</a> : <>{children}</>;
    },
  },
};

/** Corps de texte riche (Portable Text). Texte affiché brut ; attributs nettoyés. */
export default function PortableBody({ value }: { value: unknown[] | null | undefined }) {
  if (!value?.length) return null;
  return (
    <div className={styles.body}>
      <PortableText value={value as Parameters<typeof PortableText>[0]["value"]} components={components} />
    </div>
  );
}
