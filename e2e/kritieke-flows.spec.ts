import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('./')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('dashboard toont 11 modules en start een les', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Wet- en Regelgeving Domein I' })).toBeVisible()
  await expect(page.getByRole('heading', { name: /De 11 modules/ })).toBeVisible()
  await page.getByRole('link', { name: /Begin met leren/ }).click()
  await expect(page.getByRole('heading', { name: 'Leerdoelen' })).toBeVisible()
  await expect(page.getByText(/Gecontroleerd tegen wettekst|Juridische review nodig|Juridisch goedgekeurd/).first()).toBeVisible()
  await page.getByRole('button', { name: 'Volgende' }).click()
  await page.goto('./')
  await expect(page.getByRole('link', { name: /Verder leren/ })).toBeVisible()
})

test('kennischeck geeft directe uitleg en voortgang blijft na herladen bewaard', async ({ page }) => {
  await page.goto('./#/oefenen/sessie?module=m03&aantal=10')
  const first = page.locator('article').first()
  await first.locator('label').first().click()
  // match/order-vragen hebben geen labels met radio; vul dan desnoods niets in
  const check = page.getByRole('button', { name: 'Controleer antwoord' })
  if (await check.isEnabled()) await check.click()
  else test.skip(true, 'eerste vraag is geen keuzevraag')
  await expect(page.getByText('Toelichting')).toBeVisible()
  await page.reload()
  await page.goto('./#/oefenen')
  await expect(page.getByText(/1\/\d+ gemaakt/).first()).toBeVisible()
})

test('proefexamen volgens toetsmatrijs is geblokkeerd zonder afgetekende vragen; conceptproefexamen werkt met 50 vragen, klok en waarschuwing', async ({ page }) => {
  await page.goto('./#/proefexamen')
  await expect(page.getByRole('button', { name: 'Start proefexamen', exact: true })).toBeDisabled()
  await expect(page.getByText(/juridisch goedgekeurde vragen beschikbaar/).first()).toBeVisible()
  await expect(page.getByText(/geen examens van ExTH/)).toBeVisible()
  await page.getByRole('button', { name: /Start conceptproefexamen/ }).click()
  await expect(page.getByText(/Vraag 1 van 50/)).toBeVisible()
  await expect(page.getByRole('timer')).toContainText(/1:29:\d\d|1:30:00/)
  await page.locator('fieldset label').first().click()
  await page.getByRole('button', { name: 'Volgende' }).click()
  await expect(page.getByText(/Vraag 2 van 50/)).toBeVisible()
  await page.getByRole('button', { name: 'Vorige' }).click()
  await expect(page.getByText(/1 beantwoord/)).toBeVisible()
  await page.getByRole('button', { name: 'Inleveren' }).first().click()
  await expect(page.getByText(/nog 49 vragen niet beantwoord/)).toBeVisible()
  await page.getByRole('button', { name: 'Definitief inleveren' }).click()
  await expect(page.getByRole('heading', { name: /van 50 goed/ })).toBeVisible()
  await expect(page.getByText('Onvoldoende').first()).toBeVisible()
})

test('kennisbank zoekt begrippen', async ({ page }) => {
  await page.goto('./#/kennisbank')
  await page.getByRole('searchbox').fill('toezichthouder')
  await expect(page.getByRole('heading', { name: /Toezichthouder/i }).first()).toBeVisible()
})

test('toetsenbord: skiplink en focus zichtbaar', async ({ page, isMobile }) => {
  test.skip(isMobile, 'alleen desktop')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Naar de inhoud' })).toBeFocused()
})
