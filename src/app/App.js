import React from 'react'
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components'
import { Helmet } from 'react-helmet'
import { base, light } from './themes'
import Nav from './components/Nav'
import ExampleUi from './components/ExampleUi'

// Creates a CSS reset and applies some basic styles to the document body
const GlobalStyle = createGlobalStyle(
  ({ theme: { fonts, colors, lineHeights } }) => `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    background: ${colors.background};
    color: ${colors.text};
    font-family: ${fonts.body};
    line-height: ${lineHeights.body};
  }
  a, a:visited {
    color: ${colors.primary};
  }
`
)

// The main component that will wrap our application
const Main = styled.main(
  ({ theme }) => `
  max-width ${theme.sizes.body};
  margin: 0 auto;
  padding: ${theme.space[4]};
`
)

const App = () => {
  const theme = {
    ...base,
    colors: light,
  }

  return (
    <>
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Nav />
        <Main>
          <h1 style={{ marginBottom: '32px' }}>Playwright demo</h1>
          <ExampleUi />
        </Main>
      </ThemeProvider>
    </>
  )
}

export default App
