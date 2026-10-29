import { defineField, defineType } from "sanity";
import { languageField } from "../fields";

const ro = (name: string, title: string, type: "string" | "text" | "datetime" = "string") =>
  defineField({ name, title, type, readOnly: true });

export const contactRequest = defineType({
  name: "contactRequest",
  title: "Demande de contact",
  type: "document",
  readOnly: true,
  fields: [
    languageField,
    ro("receivedAt", "Reçue le", "datetime"),
    ro("lastName", "Nom"),
    ro("firstName", "Prénom"),
    ro("email", "E-mail"),
    ro("description", "Description du projet", "text"),
    ro("phone", "Téléphone"),
    ro("subject", "Sujet"),
    ro("ipHash", "Empreinte IP"),
    defineField({
      name: "emailStatus",
      title: "Statut de l’e-mail",
      type: "string",
      readOnly: true,
      options: { list: ["envoyé", "échec"] },
    }),
  ],
  orderings: [{ title: "Plus récentes", name: "receivedAtDesc", by: [{ field: "receivedAt", direction: "desc" }] }],
  preview: {
    select: { first: "firstName", last: "lastName", date: "receivedAt", status: "emailStatus" },
    prepare: ({ first, last, date, status }) => ({
      title: `${first ?? ""} ${last ?? ""}`.trim() || "Demande",
      subtitle: `${date ?? ""} · ${status ?? ""}`,
    }),
  },
});
