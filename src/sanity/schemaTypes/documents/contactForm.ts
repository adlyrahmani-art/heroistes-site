import { defineField, defineType } from "sanity";
import { languageField } from "../fields";
import { signatureTitleField } from "../signatureTitle";
import { BOLD_HINT, btn, str, txt } from "./helpers";

const fixedField = (name: string, title: string, label: string, placeholder: string) =>
  defineField({
    name,
    title,
    type: "object",
    fields: [str("label", "Libellé"), str("placeholder", "Texte d’exemple")],
    initialValue: { label, placeholder },
  });

const optionalField = (name: string, title: string, label: string, placeholder: string) =>
  defineField({
    name,
    title,
    type: "object",
    fields: [
      defineField({ name: "enabled", title: "Afficher ce champ", type: "boolean", initialValue: true }),
      defineField({ name: "required", title: "Champ obligatoire", type: "boolean", initialValue: true }),
      str("label", "Libellé"),
      str("placeholder", "Texte d’exemple"),
    ],
    initialValue: { enabled: true, required: true, label, placeholder },
  });

export const contactForm = defineType({
  name: "contactForm",
  title: "Formulaire de contact",
  type: "document",
  fields: [
    languageField,
    signatureTitleField("title", "Titre", { maxLines: 2, maxChars: 13 }),
    txt("intro", "Introduction", BOLD_HINT),
    defineField({
      name: "recipient",
      title: "Adresse de réception des demandes",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    str("submitLabel", "Libellé du bouton d’envoi"),
    str("successMessage", "Message de succès"),
    str("errorMessage", "Message d’erreur"),
    str("rateLimitMessage", "Message de limite d’envois"),
    str("privacyText", "Mention de confidentialité"),
    btn("privacyLink", "Lien de confidentialité"),
    fixedField("lastName", "Champ Nom", "Nom", "Martin"),
    fixedField("firstName", "Champ Prénom", "Prénom", "Olivier"),
    fixedField("email", "Champ E-mail", "Email", "olivier_martin@gmail.com"),
    fixedField("description", "Champ Description du projet", "Description du projet", "Description ici"),
    optionalField("phone", "Champ Téléphone", "Téléphone", "+33 123 456 789"),
    optionalField("subject", "Champ Sujet", "Sujet", "Créer mon site web"),
  ],
  initialValue: {
    title: ["Démarrez", "votre projet"],
    intro:
      "Quelques informations suffisent pour démarrer.\n**Remplissez le formulaire ci-dessous** : nous revenons vers vous pour échanger sur votre projet, sans engagement.",
    submitLabel: "Envoyer ma demande",
    successMessage: "Merci, votre demande est bien envoyée. Nous revenons vers vous rapidement.",
    errorMessage: "L’envoi n’a pas abouti. Réessayez dans un instant ou écrivez-nous à contact@heroistes.com.",
    rateLimitMessage:
      "Vous avez envoyé plusieurs demandes en peu de temps. Réessayez dans une heure ou écrivez-nous à contact@heroistes.com.",
    privacyText: "Vos données servent uniquement à vous recontacter au sujet de votre demande.",
    privacyLink: { label: "Politique de confidentialité", href: "/politique-de-confidentialite/" },
  },
  preview: { prepare: () => ({ title: "Formulaire de contact" }) },
});
