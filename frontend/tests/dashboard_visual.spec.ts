import { test, expect } from '@playwright/test';

test.describe('KASUMO Dashboard Visual Reference Verification', () => {
  test('Capture 16:9 Desktop Student Dashboard', async ({ page }) => {
    // 16:9 Desktop Viewport matching the reference image aspect ratio
    await page.setViewportSize({ width: 1440, height: 810 });

    // Navigate to login
    await page.goto('/login');
    await page.waitForSelector('form');

    // Fill credentials for student
    await page.fill('input[type="email"]', 'student@kasumio.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for Dashboard to load
    await page.waitForURL('**/');
    await page.waitForSelector('text=Your Skill DNA');

    // Verify all key cards from reference image are visible
    await expect(page.locator('text=Good Morning')).toBeVisible();
    await expect(page.locator('text=Your Skill Confidence')).toBeVisible();
    await expect(page.locator('text=87%')).toBeVisible();
    await expect(page.locator('text=Your Skill DNA')).toBeVisible();
    await expect(page.locator('text=Evidence Timeline')).toBeVisible();
    await expect(page.locator('text=Recommended Opportunities')).toBeVisible();
    await expect(page.locator('text=My Progress')).toBeVisible();
    await expect(page.locator('text=Quick Actions')).toBeVisible();
    await expect(page.locator('text=Your Recruiter Insights')).toBeVisible();
    await expect(page.locator('text=2,847')).toBeVisible();

    // Take screenshot of the complete dashboard
    await page.screenshot({
      path: 'tests/screenshots/kasumo-dashboard-reference-match.png',
      fullPage: false
    });
  });
});
