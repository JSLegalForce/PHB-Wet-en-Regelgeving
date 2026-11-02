import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const pages = ['#/', '#/leren', '#/leren/m02', '#/les/m02-l02', '#/les/m02-l02?scherm=6', '#/oefenen', '#/proefexamen', '#/kennisbank', '#/docent', '#/over']

for (const p of pages) {
  test(`geen ernstige toegankelijkheidsfouten op ${p}`, async ({ page }) => {
    await page.goto('./' + p)
    await page.waitForLoadState('networkidle')
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    const serious = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    expect(serious.map((v) => `${v.id}: ${v.nodes.length}× ${v.nodes[0]?.target}`)).toEqual([])
  })
}
