import express from 'express'
import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { ServerStyleSheet } from 'styled-components'
import { chromium } from 'playwright'
import App from '../app/App'

let browser
  //
;(async () => {
  browser = await chromium.launch({
    args: [
      '--allow-running-insecure-content', // https://source.chromium.org/search?q=lang:cpp+symbol:kAllowRunningInsecureContent&ss=chromium
      '--autoplay-policy=user-gesture-required', // https://source.chromium.org/search?q=lang:cpp+symbol:kAutoplayPolicy&ss=chromium
      '--disable-component-update', // https://source.chromium.org/search?q=lang:cpp+symbol:kDisableComponentUpdate&ss=chromium
      '--disable-domain-reliability', // https://source.chromium.org/search?q=lang:cpp+symbol:kDisableDomainReliability&ss=chromium
      '--disable-features=AudioServiceOutOfProcess,IsolateOrigins,site-per-process', // https://source.chromium.org/search?q=file:content_features.cc&ss=chromium
      '--disable-print-preview', // https://source.chromium.org/search?q=lang:cpp+symbol:kDisablePrintPreview&ss=chromium
      '--disable-setuid-sandbox', // https://source.chromium.org/search?q=lang:cpp+symbol:kDisableSetuidSandbox&ss=chromium
      '--disable-site-isolation-trials', // https://source.chromium.org/search?q=lang:cpp+symbol:kDisableSiteIsolation&ss=chromium
      '--disable-speech-api', // https://source.chromium.org/search?q=lang:cpp+symbol:kDisableSpeechAPI&ss=chromium
      '--disable-web-security', // https://source.chromium.org/search?q=lang:cpp+symbol:kDisableWebSecurity&ss=chromium
      '--disk-cache-size=33554432', // https://source.chromium.org/search?q=lang:cpp+symbol:kDiskCacheSize&ss=chromium
      '--enable-features=SharedArrayBuffer', // https://source.chromium.org/search?q=file:content_features.cc&ss=chromium
      '--hide-scrollbars', // https://source.chromium.org/search?q=lang:cpp+symbol:kHideScrollbars&ss=chromium
      '--ignore-gpu-blocklist', // https://source.chromium.org/search?q=lang:cpp+symbol:kIgnoreGpuBlocklist&ss=chromium
      '--in-process-gpu', // https://source.chromium.org/search?q=lang:cpp+symbol:kInProcessGPU&ss=chromium
      '--mute-audio', // https://source.chromium.org/search?q=lang:cpp+symbol:kMuteAudio&ss=chromium
      '--no-default-browser-check', // https://source.chromium.org/search?q=lang:cpp+symbol:kNoDefaultBrowserCheck&ss=chromium
      '--no-pings', // https://source.chromium.org/search?q=lang:cpp+symbol:kNoPings&ss=chromium
      '--no-sandbox', // https://source.chromium.org/search?q=lang:cpp+symbol:kNoSandbox&ss=chromium
      '--no-zygote', // https://source.chromium.org/search?q=lang:cpp+symbol:kNoZygote&ss=chromium
      '--use-gl=swiftshader', // https://source.chromium.org/search?q=lang:cpp+symbol:kUseGl&ss=chromium
      '--window-size=1920,1080', // https://source.chromium.org/search?q=lang:cpp+symbol:kWindowSize&ss=chromium
    ],
  })
})()

const app = express()

app.use(express.static('dist'))

app.get('/download-image', async (req, res) => {
  try {
    const page = await browser.newPage({
      viewport: {
        width: 1920,
        height: 1080,
      },
    })
    await page.goto('http://localhost:9000')
    const buf = await page.screenshot()
    await page.close()
    res.setHeader('Content-Type', 'image/png')
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
