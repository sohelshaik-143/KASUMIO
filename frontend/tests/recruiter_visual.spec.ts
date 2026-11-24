import { test, expect } from '@playwright/test';

test.describe('KASUMO Recruiter Workspace Visual Verification', () => {
  test('Capture 16:9 Desktop Recruiter Workspace', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 810 });

    // Navigate to login
    await page.goto('/login');
    await page.waitForSelector('form');

    // Fill credentials for recruiter
    await page.fill('input[type="email"]', 'recruiter@kasumio.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for Dashboard to load
    await page.waitForURL('**/');
    await page.waitForSelector('text=Recruiter Workspace');

    await expect(page.locator('text=Recruiter Workspace').first()).toBeVisible();
    await expect(page.locator('text=Active Roles').first()).toBeVisible();
    await expect(page.locator('text=Verification Queue').first()).toBeVisible();

    // Take screenshot of the complete recruiter workspace
    await page.screenshot({
      path: 'tests/screenshots/kasumo-recruiter-reference-match.png',
      fullPage: false
    });
  });
});
