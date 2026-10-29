import { defineLocations, type PresentationPluginOptions } from "sanity/presentation";

const home = { title: "Accueil", href: "/" };

export const resolve: PresentationPluginOptions["resolve"] = {
  locations: {
    homePage: defineLocations({ message: "Cette page est l'accueil du site.", locations: [home] }),
    siteSettings: defineLocations({ message: "Ces réglages sont utilisés sur tout le site.", locations: [home] }),
    contactForm: defineLocations({ message: "Ce formulaire est affiché sur l'accueil.", locations: [home] }),
    blogPost: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) => ({
        locations: doc?.slug ? [{ title: doc.title || "Sans titre", href: `/blog/${doc.slug}` }] : [],
      }),
    }),
    caseStudy: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          ...(doc?.slug ? [{ title: doc.title || "Sans titre", href: `/cas-clients/${doc.slug}` }] : []),
          home,
        ],
      }),
    }),
  },
};
