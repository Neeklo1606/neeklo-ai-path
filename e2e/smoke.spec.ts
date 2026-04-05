import { test, expect } from "@playwright/test";

test.describe("public smoke", () => {
  test("home loads", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("main, [role='main'], #root").first()).toBeAttached({ timeout: 20_000 });
  });

  test("services page responds", async ({ page }) => {
    const res = await page.goto("/services");
    expect(res?.ok() ?? false).toBeTruthy();
  });

  test("profile shows login when no session", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByRole("button", { name: /войти/i })).toBeVisible({ timeout: 10_000 });
  });

  test("login flow sets session and shows profile", async ({ page }) => {
    await page.goto("/login?next=/profile");
    await page.getByPlaceholder("Email").fill("test@example.com");
    await page.getByPlaceholder("Пароль").fill("password123");
    await page.getByRole("button", { name: /^Войти$/i }).click();
    await expect(page).toHaveURL(/\/profile$/);
    await page.goto("/profile");
    await expect(page.getByText(/Никита|hello@neeklo/i).first()).toBeVisible({ timeout: 10_000 });
  });
});
