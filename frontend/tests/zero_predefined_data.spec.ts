import { test, expect } from '@playwright/test';

test.describe('Zero Predefined Data Verification Across All 8 Screen Areas', () => {

  test('Recruiter Portal has 0 candidates, 0 blueprints, and 0 fake stats', async ({ page }) => {
    // Login as recruiter
    await page.goto('/login');
    await page.waitForSelector('form');
    await page.fill('input[type="email"]', 'recruiter@kasumio.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/');

    // 1. Dashboard Top Recommended Candidates -> Clean empty state, no "Alex Rivera" or "Shaik Sohel"
    await expect(page.locator('text=No candidate profiles recorded yet')).toBeVisible();
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('Alex Rivera');
    expect(bodyText).not.toContain('Shaik Sohel');
    expect(bodyText).not.toContain('Berkeley University');
    expect(bodyText).not.toContain('RGUKT IIIT');

    // 2. Find Candidates -> 0 Available, no candidates found
    await page.goto('/recruiter/candidates');
    await expect(page.locator('text=0 Available')).toBeVisible();
    await expect(page.locator('text=No candidates found')).toBeVisible();

    // 3. Talent Search -> Artifact Inspector (0)
    await page.goto('/recruiter/talent-search');
    await expect(page.locator('text=Artifact Inspector (0)')).toBeVisible();

    // 4. Analytics -> 0 proof-verified candidates, 0 views, 0 applications
    await page.goto('/recruiter/analytics');
    await expect(page.locator('text=PROOF-VERIFIED CANDIDATES')).toBeVisible();
    const analyticsText = await page.textContent('body');
    expect(analyticsText).not.toContain('Alex Rivera');
    expect(analyticsText).not.toContain('Shaik Sohel');

    // 5. Technical Screening Assessments -> 0 Blueprints
    await page.goto('/recruiter/assessments');
    await expect(page.locator('text=0 Blueprints')).toBeVisible();
    await expect(page.locator('text=No screening blueprints created yet')).toBeVisible();
  });

  test('Student Portal has 0 opportunities, 0 screenings, and 0 fake technology demands', async ({ page }) => {
    // Login as student
    await page.goto('/login');
    await page.waitForSelector('form');
    await page.fill('input[type="email"]', 'student@kasumio.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/');

    // 6. Assessments -> 0 Available Screenings
    await page.goto('/student/assessments');
    await expect(page.locator('text=Available Technical Screenings (0)')).toBeVisible();
    await expect(page.locator('text=No active screenings available right now')).toBeVisible();

    // 7. Opportunities -> 0 opportunities found (clean empty state)
    await page.goto('/student/discover');
    await expect(page.locator('text=No matching opportunities found')).toBeVisible();

    // 8. Skill DNA / Intelligence -> 0 technologies indexed
    await page.goto('/student/intelligence');
    await expect(page.getByRole('heading', { name: 'Market Technology Demand' })).toBeVisible();
    await expect(page.locator('text=0 technologies indexed')).toBeVisible();
  });

});
