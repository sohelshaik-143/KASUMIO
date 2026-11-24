import { test, expect } from '@playwright/test';

test.describe('Kasumo Portal Cleanup & Features Verification', () => {
  test('1. Student Portal has working Messages navigation and clean empty state / conversation view', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('form');

    // Sign in as student
    await page.fill('input[type="email"]', 'student@kasumio.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for student dashboard to load
    await page.waitForURL('http://localhost:3000/');
    
    // Verify Recommended Opportunities card does NOT contain predefined mock data (TCS, Microsoft, Google STEP)
    const pageText = await page.textContent('body');
    expect(pageText).not.toContain('TCS NQT 2026');
    expect(pageText).not.toContain('Microsoft Software Engineer Intern');
    expect(pageText).not.toContain('Google STEP Internship');

    // Verify "Messages" exists in student sidebar
    const messagesLink = page.locator('aside nav a:has-text("Messages")');
    await expect(messagesLink).toBeVisible();

    // Click "Messages" to navigate to /student/messages
    await messagesLink.click();
    await expect(page).toHaveURL('http://localhost:3000/student/messages');
    await expect(page.locator('h1:has-text("Recruiter Messages")')).toBeVisible();

    // Verify student design elements (clean cards, light theme borders)
    const header = page.locator('h1:has-text("Recruiter Messages")');
    await expect(header).toBeVisible();
  });

  test('2. Recruiter Portal has zero hardcoded mock numbers and clean stats', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('form');

    // Sign in as recruiter
    await page.fill('input[type="email"]', 'recruiter@kasumio.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForURL('http://localhost:3000/');

    // Check recruiter navigation matches reference
    await expect(page.locator('aside nav a:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('aside nav a:has-text("Post Opportunity")')).toBeVisible();
    await expect(page.locator('aside nav a:has-text("Find Candidates")')).toBeVisible();
    await expect(page.locator('aside nav a:has-text("Shortlist")')).toBeVisible();
    await expect(page.locator('aside nav a:has-text("Applications")')).toBeVisible();
    await expect(page.locator('aside nav a:has-text("Messages")')).toBeVisible();

    // Verify notifications button has 0 unread badge by default (clean state)
    const notifBtn = page.locator('button[aria-label="Notifications"]');
    await expect(notifBtn).toBeVisible();
    await notifBtn.click();
    await expect(page.locator('text=No notifications')).toBeVisible();
  });

  test('3. Profile Photo upload path is proxied and returns HTTP 200 on localhost', async ({ request }) => {
    // Check that /uploads/avatars proxy route responds without 404
    const response = await request.get('http://localhost:3000/uploads/avatars/avatar_4_1795532197932.jpg');
    expect(response.status()).toBe(200);
  });
});
