import express from 'express'
import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { ServerStyleSheet } from 'styled-components'
import puppeteer from 'puppeteer'
import App from '../app/App'

let browser
  //
;(async () => {
  browser = await puppeteer.launch({
    args: [
      '--autoplay-policy=user-gesture-required',
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-breakpad',
      '--disable-client-side-phishing-detection',
      '--disable-component-update',
      '--disable-default-apps',
      '--disable-dev-shm-usage',
      '--disable-domain-reliability',
      '--disable-extensions',
      '--disable-features=AudioServiceOutOfProcess',
      '--disable-hang-monitor',
      '--disable-ipc-flooding-protection',
      '--disable-notifications',
      '--disable-offer-store-unmasked-wallet-cards',
      '--disable-popup-blocking',
      '--disable-print-preview',
      '--disable-prompt-on-repost',
      '--disable-renderer-backgrounding',
      '--disable-setuid-sandbox',
      '--disable-speech-api',
      '--disable-sync',
      '--hide-scrollbars',
      '--ignore-gpu-blacklist',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-default-browser-check',
      '--no-first-run',
      '--no-pings',
      '--no-sandbox',
      '--no-zygote',
      '--password-store=basic',
      '--use-gl=swiftshader',
      '--use-mock-keychain',
    ],
    headless: true,
    defaultViewport: {
      width: 1600,
      height: 900,
    },
  })
})()

const app = express()

app.use(express.static('dist'))

app.get('/download-image', async (req, res) => {
  try {
    const timings = []
    const init = Date.now()

    let t0 = init
    const page = await browser.newPage()
    timings.push(`newPage:${Date.now() - t0}ms`)

    t0 = Date.now()
    await page.goto('http://localhost:9000', { waitUntil: 'domcontentloaded' })
    timings.push(`goto:${Date.now() - t0}ms`)

    t0 = Date.now()
    const buf = await page.screenshot({
      type: 'jpeg',
      quality: 100,
    })
    timings.push(`screenshot:${Date.now() - t0}ms`)

    t0 = Date.now()
    await page.close()
    timings.push(`close:${Date.now() - t0}ms`)

    res.setHeader('Content-Type', 'image/png')
    res.setHeader('x-response-time', `${Date.now() - init}ms`)
    res.setHeader('x-puppeteer-timings', timings.join('; '))
    res.write(buf)
    res.end()
  } catch (e) {
    res.status(500).send(e.message)
  }
})

app.get('*', (req, res) => {
  let app = ''
  let styles = ''
  const sheet = new ServerStyleSheet()
  try {
    app = ReactDOMServer.renderToString(
      sheet.collectStyles(
        <StaticRouter location={req.url}>
          <App />
        </StaticRouter>
      )
    )
    styles = sheet.getStyleTags()
  } catch (e) {
    console.error(e)
  } finally {
    sheet.seal()
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>Playwright demo</title>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚀</text></svg>" />
        <script src="/app.js" async defer></script>
        ${styles}
      </head>
      <body>
        <div id="root">${app}</div>
      </body>
    </html>`

  res.send(html)
})

app.listen(9000, () => {
  console.log('React app running at http://localhost:9000 🚀')
})
