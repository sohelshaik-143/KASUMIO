import { test, expect } from '@playwright/test';

test.describe('KASUMO Upgrade Verification Suite', () => {

  test('1. Student Portal UI Preserved and Functional', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 810 });
    await page.goto('/login');
    await page.waitForSelector('form');

    await page.fill('input[type="email"]', 'student@kasumio.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForURL('http://localhost:3000/');
    await expect(page.locator('text=Your Skill DNA')).toBeVisible({ timeout: 10000 });

    // Verify key student dashboard components are intact
    await expect(page.locator('text=Good Morning')).toBeVisible();
    await expect(page.locator('text=Your Skill Confidence')).toBeVisible();
    await expect(page.locator('text=Evidence Timeline')).toBeVisible();
    await expect(page.locator('text=Recommended Opportunities')).toBeVisible();
    await expect(page.locator('text=My Progress')).toBeVisible();
    await expect(page.locator('text=Quick Actions')).toBeVisible();

    // Take screenshot of student dashboard after upgrade
    await page.screenshot({
      path: 'tests/screenshots/student-dashboard-after.png',
      fullPage: false
    });

    // Check student profile photo upload UI
    await page.locator('aside nav').locator('text=Profile').click();
    await expect(page).toHaveURL(/.*\/profile/);
    await expect(page.locator('text=Change Photo')).toBeVisible({ timeout: 10000 });
  });

  test('2. Recruiter Portal New UI Matches Reference', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 810 });
    await page.goto('/login');
    await page.waitForSelector('form');

    await page.fill('input[type="email"]', 'recruiter@kasumio.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/');
    
    // Check Recruiter Welcome section
    await expect(page.locator('text=Welcome back, Arjun!')).toBeVisible();
    await expect(page.locator('text=Post a New Opportunity')).toBeVisible();

    // Check Stat cards matching reference image ff04c0bd.jpg
    await expect(page.locator('text=Total Candidates').first()).toBeVisible();
    await expect(page.locator('text=Shortlisted').first()).toBeVisible();
    await expect(page.locator('text=Applications').first()).toBeVisible();
    await expect(page.locator('text=Hired').first()).toBeVisible();

    // Check Candidate recommendations table
    await expect(page.locator('text=Top Recommended Candidates')).toBeVisible();
    await expect(page.locator('text=Job Post Performance')).toBeVisible();
    await expect(page.locator('text=Active Opportunities').first()).toBeVisible();
    await expect(page.locator('text=Recent Activity')).toBeVisible();
    await expect(page.locator('text=Find the Right Talent with KASUMO')).toBeVisible();

    // Check Recruiter Sidebar items
    const nav = page.locator('aside nav');
    await expect(nav.locator('text=Post Opportunity')).toBeVisible();
    await expect(nav.locator('text=Find Candidates')).toBeVisible();
    await expect(nav.locator('text=Shortlist')).toBeVisible();
    await expect(nav.locator('text=Messages')).toBeVisible();
    await expect(nav.locator('text=Analytics')).toBeVisible();
    await expect(nav.locator('text=My Organisation')).toBeVisible();
    await expect(nav.locator('text=Settings')).toBeVisible();
    await expect(page.locator('text=Backed by real skills and verified evidence.')).toBeVisible();

    // Take screenshot of new recruiter dashboard
    await page.screenshot({
      path: 'tests/screenshots/recruiter-dashboard-upgraded.png',
      fullPage: false
    });
  });

  test('3. Recruiter Navigation Links Work without 403 Access Restricted', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 810 });
    await page.goto('/login');
    await page.fill('input[type="email"]', 'recruiter@kasumio.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    const nav = page.locator('aside nav');

    // 1. Post Opportunity
    await nav.locator('text=Post Opportunity').click();
    await page.waitForURL('**/recruiter/opportunities/new');
    await expect(page.locator('text=Automated Role Specification').first()).toBeVisible();

    // 2. Find Candidates
    await nav.locator('text=Find Candidates').click();
    await page.waitForURL('**/recruiter/candidates');
    await expect(page.locator('text=Find Candidates').first()).toBeVisible();

    // 3. Talent Search
    await nav.locator('text=Talent Search').click();
    await page.waitForURL('**/recruiter/talent-search');
    await expect(page.locator('text=Talent Search & Code Intelligence').first()).toBeVisible();

    // 4. Shortlist
    await nav.locator('text=Shortlist').click();
    await page.waitForURL('**/recruiter/shortlist');
    await expect(page.locator('text=Shortlisted Candidates').first()).toBeVisible();

    // 5. Applications
    await nav.locator('text=Applications').click();
    await page.waitForURL('**/recruiter/applications');
    await expect(page.locator('text=Applicant Pipeline').first()).toBeVisible();

    // 6. Messages
    await nav.locator('text=Messages').click();
    await page.waitForURL('**/recruiter/messages');
    await expect(page.locator('text=Candidate Messages').first()).toBeVisible();

    // 7. Assessments
    await nav.locator('text=Assessments').click();
    await page.waitForURL('**/recruiter/assessments');
    await expect(page.locator('text=Technical Screening Assessments').first()).toBeVisible();

    // 8. Analytics
    await nav.locator('text=Analytics').click();
    await page.waitForURL('**/recruiter/analytics');
    await expect(page.locator('text=Recruitment Intelligence & Analytics').first()).toBeVisible();

    // 9. My Organisation
    await nav.locator('text=My Organisation').click();
    await page.waitForURL('**/recruiter/organization');
    await expect(page.locator('text=My Organisation').first()).toBeVisible();

    // 10. Settings (Recruiter photo upload)
    await nav.locator('text=Settings').click();
    await page.waitForURL('**/recruiter/settings');
    await expect(page.locator('text=Recruiter Profile & Settings').first()).toBeVisible();
    await expect(page.locator('text=Change Photo').first()).toBeVisible();

    // 11. Help & Support
    await nav.locator('text=Help & Support').click();
    await page.waitForURL('**/recruiter/help');
    await expect(page.locator('text=Hiring guidelines, verification standards').first()).toBeVisible();
  });

  test('4. Theme Switching Works Globally Across Portals', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 810 });
    await page.goto('/login');
    await page.fill('input[type="email"]', 'recruiter@kasumio.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // Click theme toggle button in header
    const themeBtn = page.locator('button[aria-label="Toggle light/dark theme"]');
    await expect(themeBtn).toBeVisible();
    await themeBtn.click();

    // Check if html class is dark
    const htmlClasses = await page.evaluate(() => document.documentElement.className);
    const isDark = htmlClasses.includes('dark');
    expect(isDark).toBeTruthy();

    // Verify localStorage persistence
    const savedTheme = await page.evaluate(() => localStorage.getItem('kasumo_theme'));
    expect(savedTheme).toBe('dark');

    // Screenshot dark mode recruiter dashboard
    await page.screenshot({
      path: 'tests/screenshots/recruiter-dashboard-dark.png',
      fullPage: false
    });

    // Toggle back to light
    await themeBtn.click();
    const lightClasses = await page.evaluate(() => document.documentElement.className);
    expect(lightClasses.includes('dark')).toBeFalsy();
  });

  test('5. DSA Assessment Experience has Real Code Editor & Timer', async ({ page, request, context }) => {
    await page.setViewportSize({ width: 1440, height: 810 });
    await context.grantPermissions(['camera', 'microphone']);

    // Ensure an opportunity and assessment exist via backend API
    let assessmentId = 1;
    try {
      const loginRes = await request.post('http://localhost:8080/api/auth/login', {
        data: { email: 'recruiter@kasumio.com', password: 'password123' },
      });
      const loginData = await loginRes.json();
      const headers = { Authorization: `Bearer ${loginData.token}` };

      const oppRes = await request.post('http://localhost:8080/api/opportunities', {
        headers,
        data: {
          title: 'Staff Systems Engineer',
          description: 'Distributed cache and memory performance engineering',
          requirements: 'Java, Algorithms, Concurrency',
          location: 'Remote',
          type: 'JOB',
          workType: 'REMOTE',
          skills: [{ skillId: 1, skillType: 'REQUIRED' }],
        },
      });
      const oppData = await oppRes.json();
      await request.post(`http://localhost:8080/api/opportunities/${oppData.id}/publish`, { headers });
      const assmRes = await request.post(`http://localhost:8080/api/assessments/generate/${oppData.id}`, { headers });
      const assmData = await assmRes.json();
      if (assmData?.id) assessmentId = assmData.id;
    } catch (_) {}

    // Login as student
    await page.goto('/login');
    await page.fill('input[type="email"]', 'student@kasumio.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/');

    // Navigate to student assessments
    await page.goto('/student/assessments');
    await page.waitForSelector('text=Demonstrate Your Engineering Capability', { timeout: 10000 });

    // Locate the Take Test button
    const takeTestBtn = page.locator('button:has-text("Take Test")').first();
    if (await takeTestBtn.isVisible()) {
      await takeTestBtn.click();
      await expect(page.locator('text=Proctored Assessment Setup & Transparency')).toBeVisible();

      // Click simulated devices bypass & acknowledge
      await page.click('button:has-text("Use Simulated Test Devices")');
      await page.click('input#transparency-acknowledged');
      await page.click('button:has-text("Begin Technical Assessment")');

      // Verify assessment page loaded
      await page.waitForURL('**/student/assessments/**/attempts/**');
      
      // Check countdown timer is visible
      await expect(page.locator('text=Time Left').first()).toBeVisible();

      // Check code editor textarea with line numbers
      const editor = page.locator('textarea[spellcheck="false"]');
      if (await editor.isVisible()) {
        const code = await editor.inputValue();
        // Solution must NOT be leaked
        expect(code).not.toContain('// Solution implemented:');
        expect(code).not.toContain('Map<Integer, Integer> map = new HashMap<>();');
      }

      // Capture screenshot of the upgraded assessment interface
      await page.screenshot({
        path: 'tests/screenshots/dsa-assessment-upgraded.png',
        fullPage: false
      });
    }
  });
});
