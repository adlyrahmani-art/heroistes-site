"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { clean, editAttr } from "@/sanity/lib/clean";
import { imageUrl } from "@/sanity/lib/image";
import { splitCardTitle } from "./splitCardTitle";
import type { BlogData, LatestPost } from "./homeTypes";
import styles from "./Blog.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * Bloc 9.8 · Blog (maquette « Blog ») : 4 cartes cliquables en entier vers leur article.
 * Survol : le cadre de la photo se resserre pendant que l'image zoome, une étiquette
 * « Lire l'article » monte dans le coin, et le titre se souligne en turquoise.
 */
const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" }) : "";

export default function Blog({ blog, posts }: { blog: BlogData; posts: LatestPost[] }) {
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
        {blog.title?.map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </h2>

      <ul className={styles.grid}>
        {posts.map((p, i) => {
          const tall = i % 2 === 0;
          const src = imageUrl(p.cover, 876, tall ? 908 : 642);
          const { lead, rest } = splitCardTitle(p.title ?? "");
          return (
            <li key={clean(p._id)} className={styles.item} style={{ "--i": i } as React.CSSProperties} data-in>
              <a href={`/blog/${clean(p.slug)}`} className={styles.card}>
                <span className={`${styles.media} ${tall ? styles.tall : ""}`}>
                  {src && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt={clean(p.cover?.alt) ?? ""}
                      width={438}
                      height={tall ? 454 : 321}
                      loading="lazy"
                      data-sanity={editAttr({ _id: clean(p._id), _type: "blogPost" }, "cover")}
                    />
                  )}
                  <span className={styles.read} aria-hidden="true">
                    Lire l’article <span>→</span>
                  </span>
                </span>
                <span className={styles.heading}>
                  <span className={styles.line}>
                    <strong>{lead}</strong>
                    {rest && ` ${rest}`}
                  </span>
                </span>
                {p.publishedAt && <time className={styles.date} dateTime={clean(p.publishedAt)}>{formatDate(p.publishedAt)}</time>}
              </a>
            </li>
          );
        })}
      </ul>

      {blog.cta?.href && (
        <a href={clean(blog.cta.href)} className={`btn btn-primary ${styles.cta}`}>
          {blog.cta.label}
        </a>
      )}
    </section>
  );
}
