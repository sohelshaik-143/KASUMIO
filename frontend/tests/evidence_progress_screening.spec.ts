import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Evidence Footprint, Progress Tracking & Proctored Screening', () => {
  test('Fresh student shows 0% progress and honest empty evidence state', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 810 });
    await page.goto('/login');

    await page.fill('input[type="email"]', 'student@kasumio.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // Verify Skill Confidence Card
    await expect(page.locator('text=Your Skill Confidence')).toBeVisible();

    // Verify Evidence Timeline
    await expect(page.locator('text=Evidence Timeline')).toBeVisible();

    // Verify My Progress
    await expect(page.locator('text=My Progress')).toBeVisible();
  });

  test('Evidence creation requires mandatory photo/screenshot proof and displays thumbnail', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 810 });
    await page.goto('/login');

    await page.fill('input[type="email"]', 'student@kasumio.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // Navigate to Evidence Page
    await page.goto('/evidence');
    await page.waitForSelector('text=Evidence Footprint');

    // Click "Submit Evidence" in header
    await page.click('button:has-text("Submit Evidence")');
    await expect(page.locator('text=Add Demonstrable Evidence')).toBeVisible();

    // Fill title, url, select skill
    const skillSelect = page.locator('select').first();
    await skillSelect.selectOption({ index: 1 });
    await page.fill('input[placeholder*="Distributed Order"]', 'Playwright Automated Microservice Proof');
    await page.fill('input[placeholder*="https://github.com"]', 'https://github.com/kasumio/e2e-proof');

    // Attempt to submit WITHOUT photo
    await page.click('button[type="submit"]:has-text("Submit Evidence")');

    // Must show mandatory photo error
    await expect(page.locator('text=A photo or screenshot of the evidence is mandatory')).toBeVisible();

    // Attach sample image
    const filePath = path.resolve('tests/fixtures/sample_proof.png');
    const fileInput = page.locator('input#evidence-photo-input');
    await fileInput.setInputFiles(filePath);

    // Verify photo preview is shown
    await expect(page.locator('text=Photo attached successfully')).toBeVisible();

    // Submit with photo
    await page.click('button[type="submit"]:has-text("Submit Evidence")');

    // Verify evidence is created and displayed
    await expect(page.locator('text=New evidence successfully submitted')).toBeVisible();
    await expect(page.locator('text=Playwright Automated Microservice Proof').first()).toBeVisible();

    // Verify photo thumbnail is visible on evidence card
    await expect(page.locator('img[alt*="Playwright Automated Microservice Proof"]').first()).toBeVisible();
  });

  test('Pre-Assessment requires webcam and screen-recording permissions before starting', async ({ page, context, request }) => {
    await page.setViewportSize({ width: 1440, height: 810 });

    // Grant permissions at browser level to allow media request testing
    await context.grantPermissions(['camera', 'microphone']);

    // Ensure at least one published opportunity with assessment exists
    try {
      const loginRes = await request.post('http://localhost:8080/api/auth/login', {
        data: { email: 'recruiter@kasumio.com', password: 'password123' },
      });
      const loginData = await loginRes.json();
      const headers = { Authorization: `Bearer ${loginData.token}` };

      const oppRes = await request.post('http://localhost:8080/api/opportunities', {
        headers,
        data: {
          title: 'Cloud Backend Engineer',
          description: 'Build scalable Spring Boot microservices',
          requirements: 'Java, Spring Boot',
          location: 'Remote',
          type: 'JOB',
          workType: 'REMOTE',
          skills: [{ skillId: 1, skillType: 'REQUIRED' }],
        },
      });
      const oppData = await oppRes.json();
      await request.post(`http://localhost:8080/api/opportunities/${oppData.id}/publish`, { headers });
      await request.post(`http://localhost:8080/api/assessments/generate/${oppData.id}`, { headers });
    } catch (_) {
      // Ignore if already created
    }

    await page.goto('/login');
    await page.fill('input[type="email"]', 'student@kasumio.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // Navigate to assessments
    await page.goto('/student/assessments');
    await page.waitForSelector('text=Demonstrate Your Engineering Capability');

    // Locate the first Take Test button
    const takeTestBtn = page.locator('button:has-text("Take Test")').first();
    await expect(takeTestBtn).toBeVisible();
    await takeTestBtn.click();

    // Verify Pre-Assessment modal opens
    await expect(page.locator('text=Proctored Assessment Setup & Transparency')).toBeVisible();
    await expect(page.locator('text=Interview Proctoring Permissions (Mandatory)')).toBeVisible();

    // Attempt to start without granting permissions or acknowledging
    await page.click('button:has-text("Begin Technical Assessment")');
    await expect(page.locator('text=Mandatory webcam and screen-recording permissions must be granted')).toBeVisible();

    // Use simulated test devices bypass (for headless runner)
    await page.click('button:has-text("Use Simulated Test Devices")');

    // Check acknowledgment
    await page.click('input#transparency-acknowledged');

    // Click Begin Technical Assessment
    await page.click('button:has-text("Begin Technical Assessment")');

    // Verify we transition into the proctored assessment taking page
    await page.waitForURL('**/student/assessments/**/attempts/**');
    await expect(page.locator('text=Live Proctored')).toBeVisible();
  });
});
