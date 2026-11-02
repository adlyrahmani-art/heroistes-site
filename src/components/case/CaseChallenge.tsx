import RichText from "@/components/RichText";
import type { CaseData } from "./caseTypes";
import styles from "./Case.module.css";

/** « Notre défi » : colonne de droite, alignée à droite. */
export default function CaseChallenge({ challenge }: { challenge: NonNullable<CaseData["challenge"]> }) {
  return (
    <section className={`${styles.section} ${styles.challenge}`} data-in>
      <h2 className={styles.display}>{challenge.title || "Notre défi"}</h2>
      {challenge.lead && <p className={styles.lead}>{challenge.lead}</p>}
      {challenge.text && (
        <p className={styles.text}>
          <RichText text={challenge.text} />
        </p>
      )}
    </section>
  );
}
