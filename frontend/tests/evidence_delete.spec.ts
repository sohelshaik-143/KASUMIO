import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Evidence Deletion Flow', () => {
  test('Candidate can successfully create, view, and delete an evidence record', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 810 });
    await page.goto('/login');

    await page.fill('input[type="email"]', 'student@kasumio.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // 1. Navigate to Evidence Page
    await page.goto('/evidence');
    await page.waitForSelector('text=Evidence Footprint');

    // 2. Submit new evidence with photo proof
    await page.click('button:has-text("Submit Evidence")');
    await expect(page.locator('text=Add Demonstrable Evidence')).toBeVisible();

    const skillSelect = page.locator('select').first();
    await skillSelect.selectOption({ index: 1 });
    const uniqueTitle = `Deletable Proof Test ${Date.now()}`;
    await page.fill('input[placeholder*="Distributed Order"]', uniqueTitle);
    await page.fill('input[placeholder*="https://github.com"]', 'https://github.com/kasumio/delete-test');

    const filePath = path.resolve('tests/fixtures/sample_proof.png');
    const fileInput = page.locator('input#evidence-photo-input');
    await fileInput.setInputFiles(filePath);
    await expect(page.locator('text=Photo attached successfully')).toBeVisible();

    await page.click('button[type="submit"]:has-text("Submit Evidence")');
    await expect(page.locator('text=New evidence successfully submitted')).toBeVisible();

    // 3. Locate the created card and verify delete button
    const evidenceCard = page.locator(`.kasumo-card:has-text("${uniqueTitle}")`);
    await expect(evidenceCard).toBeVisible();

    const deleteBtn = evidenceCard.locator('button[aria-label^="Delete"]');
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();

    // 4. Confirm Dialog appears
    await expect(page.locator('text=Delete Evidence Record')).toBeVisible();
    const confirmBtn = page.locator('button:has-text("Delete Record")');
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // 5. Verify record is removed and success message appears
    await expect(page.locator('text=Evidence record removed.')).toBeVisible();
    await expect(page.locator(`.kasumo-card:has-text("${uniqueTitle}")`)).not.toBeVisible();
  });
});
