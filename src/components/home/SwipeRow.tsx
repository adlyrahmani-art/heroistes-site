import type { ReactNode } from "react";
import styles from "./SwipeRow.module.css";

/**
 * Sur grand écran : sans effet (les lames restent dans la piste horizontale épinglée).
 * Mobile et tablette portrait : rangée balayée au doigt, pour raccourcir le défilement vertical.
 */
export default function SwipeRow({ children, label, className = "" }: { children: ReactNode; label: string; className?: string }) {
  return (
    <div role="group" aria-label={label} className={`${styles.row} ${className}`}>
      {children}
    </div>
  );
}
