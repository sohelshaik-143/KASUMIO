import { test, expect } from '@playwright/test';

test.describe('Audit & Error Resolution Verification', () => {

  test('Recruiter navigation, settings, and profile never show Access Restricted', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('form');

    // Sign in as recruiter
    await page.fill('input[type="email"]', 'recruiter@kasumio.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for Dashboard to load
    await page.waitForURL('http://localhost:3000/');
    await expect(page.locator('aside nav').locator('text=Post Opportunity')).toBeVisible();

    // 1. Check sidebar nav items
    await expect(page.locator('aside nav').locator('text=Post Opportunity')).toBeVisible();
    await expect(page.locator('aside nav').locator('text=Find Candidates')).toBeVisible();
    await expect(page.locator('aside nav').locator('text=Talent Search')).toBeVisible();
    await expect(page.locator('aside nav').locator('text=Shortlist')).toBeVisible();
    await expect(page.locator('aside nav').locator('text=Applications')).toBeVisible();
    await expect(page.locator('aside nav').locator('text=Messages')).toBeVisible();
    await expect(page.locator('aside nav').locator('text=Analytics')).toBeVisible();
    await expect(page.locator('aside nav').locator('text=My Organisation')).toBeVisible();
    await expect(page.locator('aside nav').locator('text=Settings')).toBeVisible();

    // 2. Click Settings in sidebar - should take recruiter to /recruiter/settings
    await page.locator('aside nav').locator('text=Settings').click();
    await expect(page).toHaveURL(/.*\/recruiter\/settings/);
    await expect(page.locator('text=Access Restricted')).not.toBeVisible();
    await expect(page.locator('text=Recruiter Profile & Settings')).toBeVisible({ timeout: 10000 });

    // 3. Test direct navigation to /profile - should NOT show Access Restricted
    await page.goto('/profile');
    await expect(page.locator('text=Access Restricted')).not.toBeVisible();

    // 4. Test direct navigation to /settings - should NOT show Access Restricted
    await page.goto('/settings');
    await expect(page.locator('text=Access Restricted')).not.toBeVisible();

    // 4. Navigate to Talent Search - should have 0 mock data
    await page.goto('/recruiter/talent-search');
    await expect(page.locator('text=Access Restricted')).not.toBeVisible();
    await expect(page.locator('text=Artifact Inspector')).toBeVisible();
    // Verify no hardcoded "Sneha Kumar" or "Arjun Reddy" as mock search results
    await expect(page.locator('text=B-Tree Indexing & Query Cost Analyzer')).not.toBeVisible();
  });

  test('Create Opportunity and Publish Role workflow works with 0 candidates', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('form');

    await page.fill('input[type="email"]', 'recruiter@kasumio.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/');

    // Go to Create Opportunity page
    await page.goto('/recruiter/opportunities/new');
    await page.waitForSelector('text=Structured Requirement Parsing');

    // Click Parse Intent & Discover Candidates
    await page.click('button:has-text("Parse Intent & Discover Candidates")');

    // Wait for analysis to complete
    await page.waitForSelector('text=Technical Screening Blueprint', { timeout: 15000 });

    // The publish button should be active and enabled even with 0 candidates
    const publishBtn = page.locator('button:has-text("Publish Role")');
    await expect(publishBtn).toBeVisible();
    await expect(publishBtn).toBeEnabled();

    // Click Publish Role
    await publishBtn.click();

    // Expect success message
    await expect(page.locator('text=successfully published')).toBeVisible({ timeout: 10000 });
  });

  test('Mobile navigation displays recruiter links and no Access Restricted', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/login');
    await page.fill('input[type="email"]', 'recruiter@kasumio.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/');

    // Bottom mobile nav should have recruiter links: Dashboard, Post Role, Candidates, Messages, Settings
    const mobileNav = page.locator('nav[aria-label="Mobile Navigation Bar"]');
    await expect(mobileNav).toBeVisible();
    await expect(mobileNav.locator('text=Post Role')).toBeVisible();
    await expect(mobileNav.locator('text=Candidates')).toBeVisible();
    await expect(mobileNav.locator('text=Messages')).toBeVisible();
    await expect(mobileNav.locator('text=Settings')).toBeVisible();

    // Click mobile Settings
    await mobileNav.locator('text=Settings').click();
    await expect(page.locator('text=Access Restricted')).not.toBeVisible();
    await expect(page.locator('text=Recruiter Profile & Settings')).toBeVisible();
  });

  test('Student Portal design and features remain preserved with 2FA Settings', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/login');
    await page.fill('input[type="email"]', 'student@kasumio.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/');

    // Student sidebar navigation preserved
    await expect(page.locator('aside nav').locator('text=Skill DNA')).toBeVisible();
    await expect(page.locator('aside nav').locator('text=My Projects')).toBeVisible();
    await expect(page.locator('aside nav').locator('text=Assessments')).toBeVisible();
    await expect(page.locator('aside nav').locator('text=Opportunities')).toBeVisible();
    await expect(page.locator('aside nav').locator('text=Connections')).toBeVisible();
    await expect(page.locator('aside nav').locator('text=Profile')).toBeVisible();
    await expect(page.locator('aside nav').locator('text=Settings')).toBeVisible();

    // Navigate to student settings
    await page.locator('aside nav').locator('text=Settings').click();
    await expect(page.locator('text=Access Restricted')).not.toBeVisible();
    await expect(page.locator('text=Two-Factor Authentication (2FA)')).toBeVisible();
  });
});
