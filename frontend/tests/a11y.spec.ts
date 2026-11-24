import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Audits (WCAG 2.2 AA)', () => {
  test('Login page has no accessibility violations', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('form');

    const scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(scanResults.violations).toEqual([]);
  });

  test('Register page has no accessibility violations', async ({ page }) => {
    await page.goto('/register');
    await page.waitForSelector('form');

    const scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(scanResults.violations).toEqual([]);
  });
});
