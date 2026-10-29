import type { CONTACT_FORM_QUERY_RESULT } from "../../../sanity.types";

export type ContactFormConfig = NonNullable<CONTACT_FORM_QUERY_RESULT>;

export type ContactData = {
  lastName: string;
  firstName: string;
  email: string;
  description: string;
  phone?: string;
  subject?: string;
};

export type ContactErrors = Partial<Record<keyof ContactData, string>>;

const MAX: Record<keyof ContactData, number> = {
  lastName: 100,
  firstName: 100,
  email: 254,
  description: 5000,
  phone: 40,
  subject: 200,
};
const EMAIL = /^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]+$/;
const CTRL = /[\r\n\0]/;
const REQUIRED = "Ce champ est obligatoire.";

/** Valide selon les champs activés du formulaire Sanity ; ne garde que les champs prévus. */
export function validateContact(
  input: Record<string, unknown>,
  form: ContactFormConfig,
): { ok: true; data: ContactData } | { ok: false; errors: ContactErrors } {
  const errors: ContactErrors = {};
  const data: Partial<ContactData> = {};

  const fields: { key: keyof ContactData; required: boolean }[] = [
    { key: "lastName", required: true },
    { key: "firstName", required: true },
    { key: "email", required: true },
    { key: "description", required: true },
  ];
  for (const key of ["phone", "subject"] as const) {
    const cfg = form[key];
    if (cfg?.enabled !== false) fields.push({ key, required: cfg?.required !== false });
  }

  for (const { key, required } of fields) {
    const raw = input[key];
    if (raw !== undefined && raw !== null && typeof raw !== "string") {
      errors[key] = "Valeur invalide.";
      continue;
    }
    const value = (raw ?? "").trim();
    if (!value) {
      if (required) errors[key] = REQUIRED;
      continue;
    }
    if (key !== "description" && CTRL.test(value)) errors[key] = "Caractères non autorisés.";
    else if (value.length > MAX[key]) errors[key] = `Maximum ${MAX[key]} caractères.`;
    else if (key === "email" && !EMAIL.test(value)) errors[key] = "Adresse e-mail invalide.";
    else data[key] = value;
  }

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data: data as ContactData };
}
