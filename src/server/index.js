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
  browser = await chromium.launch()
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
