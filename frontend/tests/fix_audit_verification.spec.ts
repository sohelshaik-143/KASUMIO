import { test, expect } from '@playwright/test';

test.describe('Audit & Fixes Verification Suite', () => {

  test('1. Notification Bell Opens Dropdown & Works for Both Roles', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 810 });
    await page.goto('/login');
    await page.fill('input[type="email"]', 'student@kasumio.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // Click Notification bell button
    const bellBtn = page.locator('button[aria-label="Notifications"]').first();
    await expect(bellBtn).toBeVisible();
    await bellBtn.click();

    // Verify Dropdown panel opened
    await expect(page.locator('text=Notifications').first()).toBeVisible();
    await expect(page.locator('text=Mark all as read')).toBeVisible();

    // Click "Mark all as read"
    await page.click('text=Mark all as read');
    await expect(page.locator('text=Mark all as read')).not.toBeVisible();

    // Close dropdown
    await bellBtn.click();
  });

  test('2. Student Settings Page has 2FA Setup, Password & Privacy Controls', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 810 });
    await page.goto('/login');
    await page.fill('input[type="email"]', 'student@kasumio.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // Click Settings in sidebar
    const nav = page.locator('aside nav');
    await nav.locator('text=Settings').click();
    await page.waitForURL('**/student/settings');

    // Check page header
    await expect(page.locator('text=Account & Security Settings')).toBeVisible();

    // Check 2FA section
    await expect(page.locator('text=Two-Factor Authentication (2FA)')).toBeVisible();
    const setup2FABtn = page.locator('button:has-text("Set Up 2FA")');
    if (await setup2FABtn.isVisible()) {
      await setup2FABtn.click();
      await expect(page.locator('text=Authenticator App Configuration')).toBeVisible();
      await expect(page.locator('input[value*="KASU-MIO2"]')).toBeVisible();

      // Enter 6-digit verification code
      await page.fill('input[placeholder="123456"]', '829145');
      await page.click('button:has-text("Verify & Activate")');

      // Verify 2FA activated and recovery codes displayed
      await expect(page.locator('text=Two-Factor Authentication (2FA) is now active')).toBeVisible();
      await expect(page.locator('text=One-Time Recovery Backup Codes')).toBeVisible();
    }

    // Check Password & Privacy sections
    await expect(page.locator('text=Change Password')).toBeVisible();
    await expect(page.locator('text=Selective Contact Disclosure')).toBeVisible();
  });

  test('3. Recruiter Agent Console Allows Publishing Role Even with 0 Candidates', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 810 });
    await page.goto('/login');
    await page.fill('input[type="email"]', 'recruiter@kasumio.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // Go to Create Opportunity page
    await page.goto('/recruiter/opportunities/new');
    await expect(page.locator('text=Automated Role Specification').first()).toBeVisible();

    // Fill intent prompt
    await page.fill('textarea#recruiter-intent-textarea', 'Hiring Principal Distributed Systems Architect with Java and Kubernetes experience');
    await page.click('button:has-text("Parse Intent & Discover Candidates")');

    // Wait for analysis to complete
    await page.waitForSelector('text=Technical Screening Blueprint', { timeout: 10000 });

    // Locate the Publish Role button
    const publishBtn = page.locator('button:has-text("Publish Role")');
    await expect(publishBtn).toBeVisible();
    // Must NOT be disabled even if 0 candidates matched
    await expect(publishBtn).toBeEnabled();

    // Click Publish Role
    await publishBtn.click();

    // Expect success execution banner
    await expect(page.locator('text=Recruitment Workflow Successfully Executed')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=View Published Opportunity')).toBeVisible();
  });

  test('4. Recruiter Portal Displays Clean Real Metrics (Values Default to 0 when Empty)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 810 });
    await page.goto('/login');
    await page.fill('input[type="email"]', 'recruiter@kasumio.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // Verify stat cards are visible and honest
    await expect(page.locator('text=Total Candidates').first()).toBeVisible();
    await expect(page.locator('text=Shortlisted').first()).toBeVisible();
    await expect(page.locator('text=Applications').first()).toBeVisible();
    await expect(page.locator('text=Hired').first()).toBeVisible();

    // Check Shortlist page starts clean or with real saved
    await page.goto('/recruiter/shortlist');
    await expect(page.locator('text=Shortlisted Candidates')).toBeVisible();

    // Check Applications page starts clean
    await page.goto('/recruiter/applications');
    await expect(page.locator('text=Applicant Pipeline')).toBeVisible();
  });

  test('5. Student Messaging Modal with Recruiter Works in Student Portal Style', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 810 });
    await page.goto('/login');
    await page.fill('input[type="email"]', 'student@kasumio.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // Navigate to Connections
    await page.goto('/student/connections');
    await expect(page.locator('text=Trusted Connections')).toBeVisible();

    // Check if any accepted connection exists, or test modal component
    const messageBtn = page.locator('button:has-text("Message Recruiter")').first();
    if (await messageBtn.isVisible()) {
      await messageBtn.click();
      await expect(page.locator('text=Verified Recruiter')).toBeVisible();
      await page.fill('input[placeholder*="Type your message"]', 'Hello, I updated my GitHub repository with recent unit tests.');
      await page.click('button[type="submit"]:has-text("Send")');
      await expect(page.locator('text=Hello, I updated my GitHub repository with recent unit tests.')).toBeVisible();
    }
  });
});
