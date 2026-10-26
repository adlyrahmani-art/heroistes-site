import styles from "./SectionTitlePanel.module.css";

type Props = { num: string; title: string; tone?: "light" | "dark" };

/** Carton de titre affiché avant le contenu d'une section (réf. m-n.fr « I. Manifesto »). */
export default function SectionTitlePanel({ num, title, tone = "light" }: Props) {
  return (
    <div className={`${styles.panel} ${styles[tone]}`} data-panel data-reveal data-tone={tone}>
      <h2 className={styles.title} data-speed="-0.12">
        <span className={styles.num}>{num}</span>
        <span className={styles.ln}>
          <span>{title}</span>
        </span>
        <span className={styles.bar} aria-hidden="true" />
      </h2>
    </div>
  );
}
