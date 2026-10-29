import type { SchemaTypeDefinition } from "sanity";
import { blogPost } from "./documents/blogPost";
import { caseStudy } from "./documents/caseStudy";
import { contactForm } from "./documents/contactForm";
import { contactRequest } from "./documents/contactRequest";
import { homePage } from "./documents/homePage";
import { siteSettings } from "./documents/siteSettings";
import { button } from "./objects/button";
import { imageWithAlt } from "./objects/imageWithAlt";
import { seo } from "./objects/seo";

export const schemaTypes: SchemaTypeDefinition[] = [
  imageWithAlt,
  button,
  seo,
  siteSettings,
  homePage,
  contactForm,
  contactRequest,
  blogPost,
  caseStudy,
];
