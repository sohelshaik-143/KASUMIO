import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 }
];

test.describe('Accessibility and Responsive Audits (WCAG 2.2 AA)', () => {
  for (const vp of VIEWPORTS) {
    test(`Login page responsive (${vp.name} - ${vp.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/login');
      await page.waitForSelector('form');

      // Verify no horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);

      // Capture visual snapshot
      await page.screenshot({ path: `tests/screenshots/login-${vp.name}.png`, fullPage: true });

      // Run Axe WCAG 2.2 AA audit
      const scanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

      expect(scanResults.violations).toEqual([]);
    });

    test(`Register page responsive (${vp.name} - ${vp.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/register');
      await page.waitForSelector('form');

      // Verify no horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);

      // Capture visual snapshot
      await page.screenshot({ path: `tests/screenshots/register-${vp.name}.png`, fullPage: true });

      // Run Axe WCAG 2.2 AA audit
      const scanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

      expect(scanResults.violations).toEqual([]);
    });
  }
});
