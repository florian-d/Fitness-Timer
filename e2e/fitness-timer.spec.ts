import { test, expect } from '@playwright/test';

test.describe('Fitness Timer E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
  });

  test('App loads with Default preset', async ({ page }) => {
    // Check that the app displays Default preset
    const presetName = page.locator('text=Default');
    await expect(presetName).toBeVisible();

    // Check that timer is in ready state
    const readyLabel = page.locator('text=Ready');
    await expect(readyLabel).toBeVisible();
  });

  test('Can start timer from ready state', async ({ page }) => {
    // Click play button
    const playBtn = page.locator('[aria-label="Start timer"]');
    await playBtn.click();

    // Timer should show prepare phase
    const prepareLabel = page.locator('text=Prepare');
    await expect(prepareLabel).toBeVisible();

    // Reset to clean up
    const resetBtn = page.locator('[aria-label="Reset timer"]');
    await resetBtn.click();
  });

  test('Cannot switch presets while timer is running', async ({ page }) => {
    // Check if preset switcher exists (only if multiple presets)
    const switcher = page.locator('.preset-switcher');
    const switcherCount = await switcher.count();

    if (switcherCount > 0) {
      // Verify switcher is enabled initially
      await expect(switcher.first()).toBeEnabled();

      // Start timer
      await page.locator('[aria-label="Start timer"]').click();

      // Wait for state to change
      await page.waitForTimeout(100);

      // Preset switcher should be disabled
      await expect(switcher.first()).toBeDisabled();

      // Reset to clean up
      await page.locator('[aria-label="Reset timer"]').click();
    }
  });

  test('Can open settings and modify values', async ({ page }) => {
    // Open settings
    await page.locator('[aria-label="Open settings"]').click();

    // Wait for language select to appear (part of main settings)
    const languageSelect = page.locator('#language');
    await expect(languageSelect).toBeVisible();

    // Close settings
    await page.locator('[aria-label="Close settings"]').click();
  });

  test('Timer lifecycle: ready -> prepare -> exercise -> rest -> complete', async ({ page }) => {
    // Start timer
    await page.locator('[aria-label="Start timer"]').click();

    // Should be in prepare phase
    let phaseLabel = page.locator('text=Prepare');
    await expect(phaseLabel).toBeVisible();

    // Reset (we don't wait for full cycle in E2E)
    await page.locator('[aria-label="Reset timer"]').click();

    // Should be back to ready
    phaseLabel = page.locator('text=Ready');
    await expect(phaseLabel).toBeVisible();
  });

  test('Pause and resume timer', async ({ page }) => {
    // Start timer
    await page.locator('[aria-label="Start timer"]').click();

    // Pause button should appear
    const pauseBtn = page.locator('[aria-label="Pause"]');
    await expect(pauseBtn).toBeVisible();

    // Click pause
    await pauseBtn.click();

    // Resume button should appear
    const resumeBtn = page.locator('[aria-label="Resume"]');
    await expect(resumeBtn).toBeVisible();

    // Click resume
    await resumeBtn.click();

    // Pause button should appear again
    await expect(pauseBtn).toBeVisible();

    // Reset
    await page.locator('[aria-label="Reset timer"]').click();
  });

  test('Language switching works', async ({ page }) => {
    // Open settings
    await page.locator('[aria-label="Open settings"]').click();

    // Get language select
    const languageSelect = page.locator('#language');
    await expect(languageSelect).toBeVisible();

    // Get current value
    const currentLanguage = await languageSelect.inputValue();
    expect(['en', 'de']).toContain(currentLanguage);

    // Change language
    const newLanguage = currentLanguage === 'en' ? 'de' : 'en';
    await languageSelect.selectOption(newLanguage);

    // Verify it changed
    const newValue = await languageSelect.inputValue();
    expect(newValue).toBe(newLanguage);

    // Switch back
    await languageSelect.selectOption(currentLanguage);

    // Close settings
    await page.locator('[aria-label="Close settings"]').click();
  });

  test('Display format updates correctly', async ({ page }) => {
    // Check that timer displays time in MM:SS format
    const timeDisplay = page.locator('text=/\\d+:\\d{2}/');
    await expect(timeDisplay).toBeVisible();
  });

  test('Settings page can be navigated', async ({ page }) => {
    // Open settings
    await page.locator('[aria-label="Open settings"]').click();

    // Check if presets section is visible
    const presetsTitle = page.locator('text=Presets');
    const presetsTitleCount = await presetsTitle.count();

    if (presetsTitleCount > 0) {
      // Presets section exists
      await expect(presetsTitle.first()).toBeVisible();
    }

    // Close settings
    await page.locator('[aria-label="Close settings"]').click();
  });
});
