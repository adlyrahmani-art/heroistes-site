import { expect, test, type Page } from "@playwright/test";

test("accueil : hero et 3 cas clients", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#hero-title")).toContainText("L’agence");
  await expect(page.locator("#cas-clients article[data-slide]")).toHaveCount(3);
});

test("article de blog", async ({ page, request }) => {
  await page.goto("/blog/illusion-esthetique-refonte-ui");
  await expect(page.locator("h1").first()).toBeVisible();
  await expect(page.locator("h1").first()).not.toBeEmpty();
  const res = await request.get("/blog/inexistant");
  expect(res.status()).toBe(404);
});

test("cas client", async ({ page }) => {
  await page.goto("/cas-clients/praneo");
  await expect(page.locator("h1").first()).toContainText("Pranéo");
});

test("Studio : écran de connexion", async ({ page }) => {
  const res = await page.goto("/studio");
  expect(res?.status()).toBe(200);
  await expect(page.getByText(/sanity|log in|login|connexion|sign in/i).first()).toBeVisible({ timeout: 30_000 });
});

async function fillAndSend(page: Page) {
  await page.goto("/");
  const form = page.locator("form[novalidate]").filter({ has: page.locator("#contact-lastName") });
  await form.locator("#contact-lastName").fill("Test");
  await form.locator("#contact-firstName").fill("E2E");
  await form.locator("#contact-email").fill("e2e@example.com");
  await form.locator("#contact-phone").fill("0102030405");
  await form.locator("#contact-subject").fill("Test e2e");
  await form.locator("#contact-description").fill("Message automatique de test de bout en bout.");
  await form.getByRole("button", { name: "Envoyer ma demande" }).click();
  return form.locator('[role="status"]');
}

// Sans E2E_TOKEN, l'envoi écrirait une vraie demande dans Sanity de production et enverrait un e-mail.
test.describe("formulaire", () => {
  test.skip(!process.env.E2E_TOKEN, "E2E_TOKEN absent : envoi réel évité");

  test("succès", async ({ page }) => {
    const status = await fillAndSend(page);
    await expect(status).not.toBeEmpty({ timeout: 30_000 });
    await expect(page.locator("#contact-lastName")).toHaveValue("");
  });

  test("erreur", async ({ page }) => {
    await page.route("**/api/contact", (route) =>
      route.continue({ headers: { ...route.request().headers(), "x-e2e-fail": "1" } }),
    );
    const status = await fillAndSend(page);
    await expect(status).not.toBeEmpty({ timeout: 30_000 });
    await expect(page.locator("#contact-lastName")).toHaveValue("Test");
  });
});
