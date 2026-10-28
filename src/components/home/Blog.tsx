"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { blog } from "@/content/accueil";
import styles from "./Blog.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * Bloc 9.8 · Blog (maquette « Blog ») : 4 cartes cliquables en entier vers leur article.
 * Survol : le cadre de la photo se resserre pendant que l'image zoome, une étiquette
 * « Lire l'article » monte dans le coin, et le titre se souligne en turquoise.
 */
export default function Blog() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current!;
    // Header en encre sur ce fond clair
    const st = ScrollTrigger.create({
      trigger: root,
      start: "top 60px",
      end: "bottom 60px",
      onToggle: (self) => {
        if (self.isActive) requestAnimationFrame(() => (document.body.dataset.tone = "light"));
      },
    });

    // Entrées : titre puis cartes en cascade
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add(styles.in);
          io.unobserve(e.target);
        }),
      { threshold: 0.15 },
    );
    root.querySelectorAll("[data-in]").forEach((el) => io.observe(el));

    return () => {
      st.kill();
      io.disconnect();
    };
  }, []);

  return (
    <section ref={ref} id="blog" className={styles.section} aria-labelledby="blog-title">
      <span className={styles.axis} aria-hidden="true" />
      <h2 id="blog-title" className={styles.title} data-in>
        {blog.title.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </h2>

      <ul className={styles.grid}>
        {blog.articles.map((a, i) => (
          <li key={a.href} className={styles.item} style={{ "--i": i } as React.CSSProperties} data-in>
            <a href={a.href} className={styles.card}>
              <span className={`${styles.media} ${a.tall ? styles.tall : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.image} alt={a.imageAlt} width={438} height={a.tall ? 454 : 321} loading="lazy" />
                <span className={styles.read} aria-hidden="true">
                  Lire l’article <span>→</span>
                </span>
              </span>
              <span className={styles.heading}>
                <span className={styles.line}>
                  <strong>{a.lead}</strong>
                  {a.rest && ` ${a.rest}`}
                </span>
              </span>
              <time className={styles.date}>{a.date}</time>
            </a>
          </li>
        ))}
      </ul>

      <a href={blog.cta.href} className={`btn btn-primary ${styles.cta}`}>
        {blog.cta.label}
      </a>
    </section>
  );
}
