const { chromium } = require('playwright')
const fs = require('fs')

//
;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto('http://localhost:9000')
  const buf = await page.pdf({ printBackground: true })
  fs.writeFileSync('out.pdf', buf)
  await browser.close()
})()
