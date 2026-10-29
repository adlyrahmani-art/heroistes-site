import { defineQuery } from "next-sanity";

// Fragment d'image : asset réduit à ce qui sert (id pour le CDN, url, dimensions natives), plus alt, point focal et recadrage.
const IMG = `{ ..., alt, hotspot, crop, asset->{ _id, url, metadata{ dimensions } } }`;

export const SETTINGS_QUERY = defineQuery(`*[_type == "siteSettings" && language == "fr"][0]{
  ...,
  footer{ ..., visual${IMG} },
  seo{ ..., image${IMG} }
}`);

export const HOME_QUERY = defineQuery(`*[_type == "homePage" && language == "fr"][0]{
  ...,
  hero{ ..., image${IMG} },
  engagements[]{ ..., image${IMG} },
  logosBand{ ..., clients[]${IMG} },
  besoins{ ..., items[]{ ..., image${IMG} } },
  expertises{ ..., image${IMG} },
  pourquoi{ ..., items[]{ ..., image${IMG} } },
  plan{ ..., steps[]{ ..., image${IMG} } },
  casClients{
    ...,
    image${IMG},
    cases[]->{
      _id, title, "slug": slug.current, clientName, sector, tag, question, logoSize, highlights, keyFigures,
      image${IMG}, background${IMG}, logo${IMG}
    }
  }
}`);

export const CONTACT_FORM_QUERY = defineQuery(
  `*[_type == "contactForm" && language == "fr"][0]`,
);

export const CONTACT_LEAD_QUERY = defineQuery(`*[_type == "homePage" && language == "fr"][0]{ contactLead }`);

export const BLOG_POST_QUERY = defineQuery(`*[_type == "blogPost" && language == "fr" && slug.current == $slug][0]{
  ...,
  "slug": slug.current,
  cover${IMG},
  body[]{ ..., _type == "imageWithAlt" => ${IMG} },
  seo{ ..., image${IMG} }
}`);

export const BLOG_SLUGS_QUERY = defineQuery(
  `*[_type == "blogPost" && language == "fr" && defined(slug.current)]{ "slug": slug.current }`,
);

export const LATEST_POSTS_QUERY = defineQuery(`*[_type == "blogPost" && language == "fr" && defined(slug.current)] | order(publishedAt desc)[0...4]{
  _id, title, "slug": slug.current, publishedAt, excerpt, cover${IMG}
}`);

export const CASE_STUDY_QUERY = defineQuery(`*[_type == "caseStudy" && language == "fr" && slug.current == $slug][0]{
  ...,
  "slug": slug.current,
  image${IMG}, background${IMG}, logo${IMG},
  body[]{ ..., _type == "imageWithAlt" => ${IMG} },
  seo{ ..., image${IMG} }
}`);

export const CASE_SLUGS_QUERY = defineQuery(
  `*[_type == "caseStudy" && language == "fr" && defined(slug.current)]{ "slug": slug.current }`,
);
