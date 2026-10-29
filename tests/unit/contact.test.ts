import { describe, expect, test, vi } from "vitest";
import { validateContact, type ContactFormConfig } from "@/lib/contact/validate";
import { handleContact } from "@/lib/contact/send";
import { hashIp, RATE_LIMIT } from "@/lib/contact/rateLimit";
import { buildDeps } from "@/lib/contact/deps";
import { fallbackContactForm } from "@/lib/contact/defaults";

type Opt = { enabled?: boolean; required?: boolean };
const formWith = (o: { phone?: Opt; subject?: Opt }): ContactFormConfig =>
  ({
    _id: "contactForm",
    _type: "contactForm",
    recipient: "contact@heroistes.com",
    successMessage: "Merci !",
    errorMessage: "Échec de l’envoi.",
    rateLimitMessage: "Trop de demandes.",
    phone: { label: "Téléphone", ...o.phone },
    subject: { label: "Sujet", ...o.subject },
  }) as unknown as ContactFormConfig;

const form = formWith({ phone: { enabled: true, required: true }, subject: { enabled: false } });
const valid = (o: Record<string, unknown> = {}) => ({
  lastName: "Martin",
  firstName: "Olivier",
  email: "olivier@exemple.fr",
  description: "Je veux un site.",
  phone: "06 12 34 56 78",
  subject: "Créer mon site web",
  ...o,
});
const fakeDeps = (o: { recent?: number; saveFails?: boolean; sendFails?: boolean } = {}) => ({
  form,
  ipHash: "h",
  countRecent: vi.fn(async () => o.recent ?? 0),
  saveCopy: vi.fn(async () => {
    if (o.saveFails) throw new Error("sanity down");
    return "req-1" as string | null;
  }),
  markEmail: vi.fn(async () => {}),
  sendEmail: vi.fn(async () => {
    if (o.sendFails) throw new Error("resend down");
  }),
});

describe("validateContact", () => {
  test("nom, prénom, e-mail et description toujours obligatoires", () =>
    expect(validateContact({}, form)).toMatchObject({
      ok: false,
      errors: { lastName: expect.any(String), firstName: expect.any(String), email: expect.any(String), description: expect.any(String) },
    }));
  test("champ prévu activé et obligatoire exigé", () =>
    expect(validateContact(valid({ phone: "" }), form)).toMatchObject({ ok: false, errors: { phone: expect.any(String) } }));
  test("champ prévu masqué ignoré même s'il est envoyé", () =>
    expect(validateContact(valid({ phone: "06 12 34 56 78", subject: "Créer mon site web" }), form)).toEqual({
      ok: true,
      data: expect.not.objectContaining({ subject: expect.anything() }),
    }));
  test("champ prévu activé mais facultatif accepté vide", () =>
    expect(
      validateContact(valid({ phone: "" }), formWith({ phone: { enabled: true, required: false }, subject: { enabled: true, required: true } })),
    ).toMatchObject({ ok: true }));
  test("e-mail invalide refusé", () =>
    expect(validateContact(valid({ email: "pas-un-email" }), form)).toMatchObject({ ok: false, errors: { email: expect.any(String) } }));
  test("valeurs non textuelles ou trop longues refusées", () => {
    expect(validateContact(valid({ lastName: 42 }), form)).toMatchObject({ ok: false, errors: { lastName: expect.any(String) } });
    expect(validateContact(valid({ description: "x".repeat(6000) }), form)).toMatchObject({
      ok: false,
      errors: { description: expect.any(String) },
    });
  });
});

describe("handleContact", () => {
  test("champ piège rempli : succès sans copie ni e-mail", async () => {
    const deps = fakeDeps();
    expect(await handleContact({ ...valid(), website: "x" }, deps)).toMatchObject({ status: 200 });
    expect(deps.saveCopy).not.toHaveBeenCalled();
    expect(deps.sendEmail).not.toHaveBeenCalled();
  });
  test("validation échouée : 400 avec erreurs", async () => {
    const deps = fakeDeps();
    expect(await handleContact({}, deps)).toMatchObject({ status: 400, errors: { email: expect.any(String) } });
    expect(deps.sendEmail).not.toHaveBeenCalled();
  });
  test("6e envoi dans l'heure : 429 sans e-mail", async () => {
    const deps = fakeDeps({ recent: 5 });
    expect(await handleContact(valid(), deps)).toEqual({ status: 429, message: form.rateLimitMessage });
    expect(deps.sendEmail).not.toHaveBeenCalled();
  });
  test("Sanity indisponible : l'e-mail part, succès", async () => {
    const deps = fakeDeps({ saveFails: true });
    expect(await handleContact(valid(), deps)).toMatchObject({ status: 200 });
    expect(deps.sendEmail).toHaveBeenCalledOnce();
    expect(deps.markEmail).not.toHaveBeenCalled();
  });
  test("succès : copie marquée envoyé", async () => {
    const deps = fakeDeps();
    expect(await handleContact(valid(), deps)).toEqual({ status: 200, message: form.successMessage });
    expect(deps.markEmail).toHaveBeenCalledWith("req-1", "envoyé");
  });
  test("échec d'envoi : message d'erreur du client, copie marquée échec", async () => {
    const deps = fakeDeps({ sendFails: true });
    expect(await handleContact(valid(), deps)).toEqual({ status: 502, message: form.errorMessage });
    expect(deps.markEmail).toHaveBeenCalledWith("req-1", "échec");
  });
});

describe("handleContact : Sanity indisponible (§8.2)", () => {
  test("countRecent échoue : la limite est ignorée, l'e-mail part, succès", async () => {
    const deps = fakeDeps();
    deps.countRecent.mockRejectedValueOnce(new Error("sanity down"));
    expect(await handleContact(valid(), deps)).toEqual({ status: 200, message: form.successMessage });
    expect(deps.sendEmail).toHaveBeenCalledOnce();
  });
  test("configuration de repli : téléphone et sujet obligatoires, destinataire par défaut ou CONTACT_TO_EMAIL", () => {
    const f = fallbackContactForm({});
    expect(f.recipient).toBe("contact@heroistes.com");
    expect(validateContact({ ...valid(), phone: "", subject: "" }, f)).toMatchObject({
      ok: false,
      errors: { phone: expect.any(String), subject: expect.any(String) },
    });
    expect(fallbackContactForm({ CONTACT_TO_EMAIL: "x@y.fr" }).recipient).toBe("x@y.fr");
  });
});

describe("hashIp", () => {
  test("SHA-256 hex stable, dépend du sel", () => {
    expect(hashIp("1.2.3.4", "s")).toMatch(/^[0-9a-f]{64}$/);
    expect(hashIp("1.2.3.4", "s")).toBe(hashIp("1.2.3.4", "s"));
    expect(hashIp("1.2.3.4", "s")).not.toBe(hashIp("1.2.3.4", "t"));
    expect(RATE_LIMIT).toEqual({ max: 5, windowMinutes: 60 });
  });
});

describe("buildDeps (câblage réel, clients factices)", () => {
  const data = { lastName: "Martin", firstName: "Olivier", email: "o@e.fr", description: "d", phone: "0612" };
  const mkClient = () => {
    const commit = vi.fn(async () => ({}));
    const set = vi.fn(() => ({ commit }));
    return {
      fetch: vi.fn(async () => 3),
      create: vi.fn(async (doc: Record<string, unknown>) => ({ _id: "doc-1", ...doc })),
      patch: vi.fn(() => ({ set })),
      set,
    };
  };
  const env = { RESEND_API_KEY: "k", CONTACT_FROM_EMAIL: "Site <no-reply@heroistes.com>" };

  test("countRecent, saveCopy, markEmail parlent le schéma contactRequest", async () => {
    const c = mkClient();
    const d = buildDeps({ form, ipHash: "h", env, writeClient: c as never });
    expect(await d.countRecent("h")).toBe(3);
    expect(c.fetch).toHaveBeenCalledWith(
      expect.stringContaining('_type == "contactRequest"'),
      expect.objectContaining({ h: "h", since: expect.any(String) }),
    );
    expect(await d.saveCopy(data)).toBe(c.create.mock.calls[0][0]._id);
    expect(c.create).toHaveBeenCalledWith(
      expect.objectContaining({ _id: expect.stringMatching(/^contactRequest\.[0-9a-f-]{36}$/), _type: "contactRequest", language: "fr", ipHash: "h", receivedAt: expect.any(String), lastName: "Martin", phone: "0612" }),
    );
    const id = c.create.mock.calls[0][0]._id;
    await d.markEmail(id, "envoyé");
    expect(c.patch).toHaveBeenCalledWith(id);
    expect(c.set).toHaveBeenCalledWith({ emailStatus: "envoyé" });
  });

  test("saveCopy : chaque demande a un _id pointé distinct (document privé)", async () => {
    const c = mkClient();
    const d = buildDeps({ form, ipHash: "h", env, writeClient: c as never });
    await d.saveCopy(data);
    await d.saveCopy(data);
    const [a, b] = c.create.mock.calls.map((x) => x[0]._id as string);
    expect(a).toMatch(/^contactRequest\./);
    expect(a).not.toBe(b);
  });

  test("sendEmail : Resend avec expéditeur, destinataire du formulaire, reply-to", async () => {
    const send = vi.fn(async (_: Record<string, unknown>) => ({ data: { id: "m" }, error: null }));
    const d = buildDeps({ form, ipHash: "h", env, writeClient: mkClient() as never, resend: { emails: { send } } as never });
    await d.sendEmail(data, "contact@heroistes.com");
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: env.CONTACT_FROM_EMAIL,
        to: "contact@heroistes.com",
        replyTo: "o@e.fr",
        subject: expect.any(String),
        text: expect.stringContaining("Martin"),
      }),
    );
  });

  test("sendEmail lève si Resend renvoie une erreur", async () => {
    const send = vi.fn(async () => ({ data: null, error: { message: "bad" } }));
    const d = buildDeps({ form, ipHash: "h", env, writeClient: mkClient() as never, resend: { emails: { send } } as never });
    await expect(d.sendEmail(data, "x@y.fr")).rejects.toThrow();
  });

  test("sendEmail lève si RESEND_API_KEY ou CONTACT_FROM_EMAIL manquent (chemin 502)", async () => {
    const c = mkClient();
    await expect(buildDeps({ form, ipHash: "h", env: { CONTACT_FROM_EMAIL: "a@b.fr" }, writeClient: c as never }).sendEmail(data, "x@y.fr")).rejects.toThrow();
    await expect(buildDeps({ form, ipHash: "h", env: { RESEND_API_KEY: "k" }, writeClient: c as never }).sendEmail(data, "x@y.fr")).rejects.toThrow();
  });

  test("mode e2e : copie et e-mail neutralisés, échec simulé sur demande", async () => {
    const c = mkClient();
    const ok = buildDeps({ form, ipHash: "h", env, writeClient: c as never, e2e: { fail: false } });
    expect(await ok.saveCopy(data)).toBeNull();
    await expect(ok.sendEmail(data, "x@y.fr")).resolves.toBeUndefined();
    expect(c.create).not.toHaveBeenCalled();
    const ko = buildDeps({ form, ipHash: "h", env, writeClient: c as never, e2e: { fail: true } });
    await expect(ko.sendEmail(data, "x@y.fr")).rejects.toThrow();
  });
});

describe("validateContact : durcissement", () => {
  test("retours ligne et octet nul refusés dans les champs sur une ligne", () => {
    for (const k of ["lastName", "firstName", "phone"]) {
      for (const bad of ["a\nb", "a\rb", "a\0b"]) {
        expect(validateContact(valid({ [k]: bad }), form)).toMatchObject({ ok: false, errors: { [k]: expect.any(String) } });
      }
    }
    expect(validateContact(valid({ description: "ligne 1\nligne 2" }), form)).toMatchObject({ ok: true });
  });
  test("e-mail avec caractères d'injection refusé", () => {
    for (const bad of ["a@b.fr,c@d.fr", "a@b.fr;c@d.fr", "<a@b.fr>", 'a"b@c.fr', "a@b.fr\nBcc: x@y.fr"]) {
      expect(validateContact(valid({ email: bad }), form)).toMatchObject({ ok: false, errors: { email: expect.any(String) } });
    }
  });
});
