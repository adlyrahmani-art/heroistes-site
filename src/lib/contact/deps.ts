import { Resend } from "resend";
import { RATE_LIMIT } from "./rateLimit";
import type { ContactDeps } from "./send";
import type { ContactData, ContactFormConfig } from "./validate";

/** Sous-ensemble du client Sanity utilisé ici (injectable en test). */
type WriteClient = {
  fetch(query: string, params: Record<string, unknown>): Promise<number>;
  create(doc: Record<string, unknown>): Promise<{ _id: string }>;
  patch(id: string): { set(v: Record<string, unknown>): { commit(): Promise<unknown> } };
};

export const COUNT_RECENT_QUERY = `count(*[_type == "contactRequest" && ipHash == $h && receivedAt > $since])`;

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export function buildDeps(opts: {
  form: ContactFormConfig;
  ipHash: string;
  env: Record<string, string | undefined>;
  writeClient: WriteClient;
  resend?: Pick<Resend, "emails">;
  /** Tests de bout en bout : aucune écriture ni envoi réel ; `fail` simule un échec d'envoi. */
  e2e?: { fail: boolean };
}): ContactDeps {
  const { form, ipHash, env, writeClient, e2e } = opts;
  return {
    form,
    ipHash,
    async countRecent(h) {
      const since = new Date(Date.now() - RATE_LIMIT.windowMinutes * 60_000).toISOString();
      return writeClient.fetch(COUNT_RECENT_QUERY, { h, since });
    },
    async saveCopy(data) {
      if (e2e) return null;
      // Id pointé (« contactRequest.<uuid> ») : document privé, jamais lisible sans jeton dans un dataset public.
      const doc = await writeClient.create({
        _id: `contactRequest.${crypto.randomUUID()}`,
        _type: "contactRequest",
        language: "fr",
        receivedAt: new Date().toISOString(),
        ipHash,
        ...data,
      });
      return doc._id;
    },
    async markEmail(id, status) {
      await writeClient.patch(id).set({ emailStatus: status }).commit();
    },
    async sendEmail(data: ContactData, to: string) {
      if (e2e) {
        if (e2e.fail) throw new Error("Échec simulé (e2e)");
        return;
      }
      const key = env.RESEND_API_KEY;
      const from = env.CONTACT_FROM_EMAIL;
      if (!key || !from) throw new Error("RESEND_API_KEY ou CONTACT_FROM_EMAIL manquant");
      if (!to) throw new Error("Adresse de réception absente du formulaire Sanity");
      const resend = opts.resend ?? new Resend(key);
      const lines: [string, string | undefined][] = [
        ["Nom", data.lastName],
        ["Prénom", data.firstName],
        ["E-mail", data.email],
        ["Téléphone", data.phone],
        ["Sujet", data.subject],
        ["Description du projet", data.description],
      ];
      const rows = lines.filter(([, v]) => v) as [string, string][];
      const { error } = await resend.emails.send({
        from,
        to,
        replyTo: data.email,
        subject: `Nouvelle demande de contact : ${data.firstName} ${data.lastName}`,
        text: rows.map(([k, v]) => `${k} : ${v}`).join("\n"),
        html: rows.map(([k, v]) => `<p><strong>${esc(k)}</strong><br>${esc(v).replace(/\n/g, "<br>")}</p>`).join(""),
      });
      if (error) throw new Error(`Resend : ${error.message}`);
    },
  };
}
