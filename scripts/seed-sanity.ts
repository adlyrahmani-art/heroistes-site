/**
 * Import des contenus actuels dans Sanity (idempotent).
 * Exécution : npx sanity exec scripts/seed-sanity.ts
 * Nécessite SANITY_API_WRITE_TOKEN dans .env.local.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { getCliClient } from "sanity/cli";
import { blog, besoins, casClients, engagements, expertises, faq, footer, hero, logos, plan, pourquoi } from "../src/content/accueil";
import { navigation } from "../src/content/navigation";

try {
  process.loadEnvFile(".env.local");
} catch {
  // pas de .env.local : on s'appuie sur l'environnement
}

if (!process.env.SANITY_API_WRITE_TOKEN) {
  console.error("Erreur : SANITY_API_WRITE_TOKEN est absent. Ajoutez-le dans .env.local puis relancez.");
  process.exit(1);
}

const client = getCliClient({ apiVersion: "2026-10-01" }).withConfig({
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: "raw",
});

const PUBLIC_DIR = path.join(process.cwd(), "public");
const assetIds = new Map<string, string>();

/** Téléverse une image (Sanity dédoublonne par contenu) et renvoie un champ imageWithAlt. */
async function image(src: string, alt: string) {
  let id = assetIds.get(src);
  if (!id) {
    const file = path.join(PUBLIC_DIR, src.replace(/^\//, ""));
    const asset = await client.assets.upload("image", readFileSync(file), { filename: path.basename(file) });
    id = asset._id;
    assetIds.set(src, id);
  }
  return { _type: "imageWithAlt", asset: { _type: "reference", _ref: id }, alt };
}

const keyed = <T extends object>(prefix: string, items: T[]) => items.map((item, i) => ({ _key: `${prefix}-${i + 1}`, ...item }));
const button = (b: { label: string; href: string }) => ({ label: b.label, href: b.href });
const block = (key: string, text: string) => ({
  _type: "block",
  _key: key,
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", _key: `${key}-s`, text, marks: [] }],
});
const LANG = { language: "fr" };

async function main() {
  const docs: Record<string, unknown>[] = [];

  /* ---------- Cas clients ---------- */
  const SECTOR: Record<string, string> = {
    praneo: "Bien-être",
    "rezo-partage": "Associatif",
    "isere-habitat": "Promotion immobilière",
  };
  for (const c of casClients.cases) {
    const stat = "stat" in c ? c.stat : undefined;
    docs.push({
      _id: `caseStudy.${c.slug}`,
      _type: "caseStudy",
      ...LANG,
      title: `${c.name} : ${c.question}`,
      slug: { _type: "slug", current: c.slug },
      clientName: c.name,
      sector: SECTOR[c.slug],
      ...(stat ? { keyFigures: keyed("chiffre", [{ result: stat.result, detail: stat.detail }]) } : {}),
      image: await image(c.image, c.imageAlt),
      tag: c.tag,
      question: c.question,
      background: await image(c.bg, c.imageAlt),
      logo: await image(c.logo, c.logoAlt),
      logoSize: c.logoSize,
      highlights: c.items,
      body: [block("intro", `${c.name} : ${c.question}`)],
    });
  }

  /* ---------- Articles de blog ---------- */
  for (const a of blog.articles) {
    const slug = a.href.split("/").filter(Boolean).pop()!;
    const title = `${a.lead} ${a.rest}`.trim();
    docs.push({
      _id: `blogPost.${slug}`,
      _type: "blogPost",
      ...LANG,
      title,
      slug: { _type: "slug", current: slug },
      publishedAt: "2026-10-27T08:00:00.000Z",
      excerpt: title,
      cover: await image(a.image, a.imageAlt),
      body: [block("extrait", title)],
    });
  }

  /* ---------- Page d'accueil ---------- */
  const card = (e: (typeof expertises.strategy)[number], i: number, p: string) => ({
    _key: `${p}-${i + 1}`,
    title: e.title,
    lead: e.lead,
    ...(e.text ? { text: e.text } : {}),
    ...(e.link ? { link: { before: e.link.before, label: e.link.label, href: e.link.href } } : {}),
  });

  docs.push({
    _id: "homePage",
    _type: "homePage",
    ...LANG,
    hero: {
      eyebrow: hero.eyebrow,
      titleLines: hero.titleLines,
      subtitle: hero.subtitle,
      highlight: hero.highlight,
      text: hero.text,
      ctaPrimary: button(hero.ctaPrimary),
      ctaSecondary: button(hero.ctaSecondary),
      image: await image("/images/hero-bg.jpg", "Photographie d’ambiance de l’agence Héroïstes"),
    },
    engagementsTitle: "Nos engagements",
    engagements: await Promise.all(
      engagements.map(async (e, i) => ({
        _key: `engagement-${i + 1}`,
        title: e.title,
        ghost: e.ghost,
        text: e.text,
        image: await image(e.image, e.imageAlt),
        side: e.side,
      })),
    ),
    logosBand: {
      text: logos.text,
      clients: await Promise.all(
        logos.clients.map(async (l, i) => ({ _key: `logo-${i + 1}`, ...(await image(l.src, l.name)) })),
      ),
    },
    besoins: {
      title: besoins.title,
      intro: besoins.intro,
      items: await Promise.all(
        besoins.items.map(async (b, i) => ({
          _key: `besoin-${i + 1}`,
          title: b.title,
          offer: b.offer,
          href: b.href,
          text: b.text,
          image: await image(b.image, b.title),
        })),
      ),
    },
    expertises: {
      title: expertises.title,
      heading: expertises.heading,
      intro: expertises.intro,
      image: await image(expertises.image, "Machine à écrire en gros plan"),
      cards: [
        ...expertises.strategy.map((e, i) => card(e, i, "strategie")),
        ...expertises.delivery.map((e, i) => card(e, i, "deploiement")),
      ],
    },
    pourquoi: {
      title: pourquoi.title,
      intro: pourquoi.intro,
      items: await Promise.all(
        pourquoi.items.map(async (p, i) => ({
          _key: `pourquoi-${i + 1}`,
          title: p.title,
          text: p.text,
          image: await image(p.image, p.imageAlt),
        })),
      ),
      outro: pourquoi.outro,
      cta: button(pourquoi.cta),
    },
    plan: {
      title: plan.title,
      subtitle: plan.subtitle,
      intro: plan.intro,
      steps: await Promise.all(
        plan.steps.map(async (s, i) => ({
          _key: `etape-${i + 1}`,
          title: s.title,
          text: s.text,
          image: await image(s.image, s.imageAlt),
        })),
      ),
      outro: plan.outro,
      cta: button(plan.cta),
    },
    casClients: {
      title: casClients.title,
      intro: casClients.intro,
      image: await image(casClients.image, casClients.imageAlt),
      cases: casClients.cases.map((c) => ({ _type: "reference", _key: `cas-${c.slug}`, _ref: `caseStudy.${c.slug}` })),
      cta: button(casClients.cta),
    },
    blog: { title: blog.title, cta: button(blog.cta) },
    faq: {
      title: faq.title,
      items: faq.items.map((f, i) => ({ _key: `faq-${i + 1}`, question: f.q, answer: f.a })),
    },
    contactLead: { lead: footer.lead },
  });

  /* ---------- Réglages ---------- */
  const nav = (label: string) => navigation.find((n) => n.label === label)!.label;
  docs.push({
    _id: "siteSettings",
    _type: "siteSettings",
    ...LANG,
    navLabels: {
      accueil: nav("Accueil"),
      expertises: nav("Expertises"),
      conseil: nav("Conseil"),
      casClients: nav("Cas clients"),
      secteurs: nav("Secteurs"),
      agence: nav("L’agence"),
      blog: nav("Blog"),
      contact: nav("Contact"),
    },
    headerCta: { label: "Lancer un projet", href: "#contact" },
    footer: {
      visual: await image(footer.visual, footer.visualAlt),
      baseline: footer.baseline,
      newsletterTitle: footer.newsletter.title,
      newsletterText: footer.newsletter.text,
      copyright: footer.copyright,
      email: footer.email,
    },
    social: { linkedin: footer.linkedin },
  });

  /* ---------- Formulaire de contact ---------- */
  const fixed = (label: string, placeholder: string) => ({ label, placeholder });
  const optional = (label: string, placeholder: string) => ({ enabled: true, required: true, label, placeholder });
  const f = Object.fromEntries(footer.fields.map((x) => [x.name, x]));
  docs.push({
    _id: "contactForm",
    _type: "contactForm",
    ...LANG,
    title: footer.title,
    intro: footer.intro,
    recipient: "contact@heroistes.com",
    submitLabel: footer.submit,
    successMessage: "Merci, votre demande est bien envoyée. Nous revenons vers vous rapidement.",
    errorMessage: "L’envoi n’a pas abouti. Réessayez dans un instant ou écrivez-nous à contact@heroistes.com.",
    rateLimitMessage:
      "Vous avez envoyé plusieurs demandes en peu de temps. Réessayez dans une heure ou écrivez-nous à contact@heroistes.com.",
    privacyText: footer.privacy.text,
    privacyLink: button(footer.privacy.link),
    lastName: fixed(f.nom.label, f.nom.placeholder),
    firstName: fixed(f.prenom.label, f.prenom.placeholder),
    email: fixed(f.email.label, f.email.placeholder),
    description: fixed(footer.description.label, footer.description.placeholder),
    phone: optional(f.telephone.label, f.telephone.placeholder),
    subject: optional(f.sujet.label, f.sujet.placeholder),
  });

  /* ---------- Écriture : une seule transaction ---------- */
  const tx = client.transaction();
  for (const doc of docs) {
    tx.createOrReplace(doc as { _id: string; _type: string });
    tx.delete(`drafts.${doc._id as string}`);
  }
  await tx.commit();
  console.log(`Import terminé : ${docs.length} documents, ${assetIds.size} images.`);
}

main().catch((err) => {
  console.error("Échec de l’import :", err?.message ?? err);
  process.exit(1);
});
