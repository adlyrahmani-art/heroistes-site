import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DetailLayout from "@/components/DetailLayout";
import PortableBody from "@/components/PortableBody";
import styles from "@/components/DetailLayout.module.css";
import { client } from "@/sanity/lib/client";
import { clean, editAttr } from "@/sanity/lib/clean";
import { imageUrl } from "@/sanity/lib/image";
import { cachedFetch, getDynamicFetchOptions } from "@/sanity/lib/live";
import { BLOG_POST_QUERY, BLOG_SLUGS_QUERY } from "@/sanity/lib/queries";
import type { BLOG_POST_QUERY_RESULT, BLOG_SLUGS_QUERY_RESULT } from "../../../../../sanity.types";

export async function generateStaticParams() {
  const slugs: BLOG_SLUGS_QUERY_RESULT = await client.fetch(BLOG_SLUGS_QUERY);
  return slugs.flatMap((s) => (s.slug ? [{ slug: s.slug }] : []));
}

async function getPost(slug: string) {
  const options = await getDynamicFetchOptions();
  const { data } = await cachedFetch({ query: BLOG_POST_QUERY, params: { slug }, ...options });
  return data as BLOG_POST_QUERY_RESULT;
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  const title = clean(post.seo?.title) || clean(post.title) || "Blog";
  const description = clean(post.seo?.description) || clean(post.excerpt) || undefined;
  const image = imageUrl(post.seo?.image ?? post.cover, 1200, 630);
  const images = image ? [{ url: image }] : undefined;
  return {
    title,
    description,
    openGraph: { title, description, type: "article", ...(images && { images }) },
    twitter: { card: "summary_large_image", title, description, ...(images && { images }) },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = await getPost((await params).slug);
  if (!post) notFound();

  const doc = { _id: clean(post._id), _type: clean(post._type) };
  const cover = imageUrl(post.cover, 1640, 920);
  const date = post.publishedAt
    ? new Date(clean(post.publishedAt)).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <DetailLayout back="Retour au blog" backHref="/#blog">
      {date && <p className={styles.meta}>{date}</p>}
      <h1 className={styles.title} data-sanity={editAttr(doc, "title")}>
        {post.title}
      </h1>
      {post.excerpt && <p className={styles.lead}>{post.excerpt}</p>}
      {cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.cover} src={clean(cover)} alt={clean(post.cover?.alt) ?? ""} data-sanity={editAttr(doc, "cover")} />
      )}
      <PortableBody value={post.body} />
    </DetailLayout>
  );
}
