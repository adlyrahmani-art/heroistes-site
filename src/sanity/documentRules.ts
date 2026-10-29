import type { DocumentActionComponent, DocumentActionsContext, TemplateItem } from "sanity";

/** Pages uniques : ID fixe, jamais créées ni supprimées dans le Studio. */
export const SINGLETON_TYPES = ["siteSettings", "homePage", "contactForm"] as const;
export const SINGLETON_IDS = { siteSettings: "siteSettings", homePage: "homePage", contactForm: "contactForm" } as const;
const SINGLETON_BANNED = ["delete", "duplicate", "unpublish"];
const CREATABLE_TYPES = ["blogPost", "caseStudy"];

export const resolveDocumentActions = <A extends { action?: string }>(prev: A[], schemaType: string): A[] => {
  if ((SINGLETON_TYPES as readonly string[]).includes(schemaType))
    return prev.filter((a) => !SINGLETON_BANNED.includes(a.action ?? ""));
  if (schemaType === "contactRequest") return [];
  return prev;
};

export const resolveNewDocumentOptions = (prev: TemplateItem[]): TemplateItem[] =>
  prev.filter((item) => CREATABLE_TYPES.includes(item.templateId));

export const documentActions = (prev: DocumentActionComponent[], ctx: DocumentActionsContext) =>
  resolveDocumentActions(prev, ctx.schemaType);
