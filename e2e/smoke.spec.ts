import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('onlyTime_hasSeenOnboarding', 'true')
  })
})

test('core flow: configure, add expense, delete with undo', async ({ page }) => {
  await page.goto('/only-time/')

  // Navigate to Settings and configure minimum hourly rate
  await page.getByRole('button', { name: 'Einstellungen' }).click()

  const netInput = page.getByPlaceholder('z.B. 5500')
  await netInput.fill('5000')

  // Back to Status screen
  await page.getByRole('button', { name: 'Status' }).click()

  // Add expense via manual form
  await page.getByRole('button', { name: /Manuelle Eingabe/ }).click()

  // Modal amount field — placeholder 0.00
  await page.getByPlaceholder('0.00').fill('42.50')
  const titleField = page.getByPlaceholder(/Mittagessen/)
  await titleField.fill('Smoke-Test Ausgabe')

  const saveButton = page.getByRole('button', { name: /^Speichern$/ })
  await saveButton.scrollIntoViewIfNeeded()
  await saveButton.click()

  // Expense row appears (exact title in the list; toast also contains the title)
  const expenseRow = page.getByText('Smoke-Test Ausgabe', { exact: true })
  await expect(expenseRow).toBeVisible()

  // CHF amount displayed (locale may format as 42,50 or 42.50)
  const amountMatcher = /42[.,]50/
  await expect(page.getByText(amountMatcher).first()).toBeVisible()

  // Delete → undo via toast
  await page.getByRole('button', { name: 'Delete' }).first().click()

  // Expense row is gone (toast message may still briefly include the title, so be exact)
  await expect(page.getByText('Smoke-Test Ausgabe', { exact: true })).toHaveCount(0)

  // Undo toast
  const undoButton = page.getByRole('button', { name: 'Rückgängig' })
  await expect(undoButton).toBeVisible()
  await undoButton.click()

  // Expense is restored
  await expect(page.getByText('Smoke-Test Ausgabe', { exact: true })).toBeVisible()
})
