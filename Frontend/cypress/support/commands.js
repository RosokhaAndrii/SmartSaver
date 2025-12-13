// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('loginByApi', (email, password) => {
  const api = Cypress.env('API_URL') || 'http://localhost:8080'
  const appOrigin = Cypress.config('baseUrl') || 'http://localhost:5173'

  cy.session([email], () => {
    cy.request({
      method: 'POST',
      url: `${api}/api/auth/login`,
      body: { email, password },
      failOnStatusCode: false
    }).then((resp) => {
      cy.log('login resp.status: ' + resp.status)
      cy.log('login resp.body: ' + JSON.stringify(resp.body))
      cy.log('login resp.headers: ' + JSON.stringify(resp.headers))

      if (![200, 201].includes(resp.status)) {
        throw new Error(
          `Login request failed with status ${resp.status}. Response body: ${JSON.stringify(resp.body)}`
        )
      }

      const tokenCandidates = [
        resp.body && resp.body.token,
        resp.body && resp.body.accessToken,
        resp.body && resp.body.access_token,
        resp.body && resp.body.data && resp.body.data.token,
        resp.body && resp.body.data && resp.body.data.accessToken
      ].filter(Boolean)

      const token = tokenCandidates[0]

      if (token) {
        return cy.visit(appOrigin + '/', {
          onBeforeLoad(win) {
            win.localStorage.setItem('authToken', token)
          }
        }).then(() => {
          return cy.get('body').should('exist')
        })
      }

      const setCookieHeader = resp.headers && (resp.headers['set-cookie'] || resp.headers['Set-Cookie'])
      if (setCookieHeader) {
        cy.log('Server set cookie(s): ' + JSON.stringify(setCookieHeader))
        return cy.visit(appOrigin + '/').then(() => cy.get('body').should('exist'))
      }

      throw new Error(
        `Could not find authentication token or cookie in login response. Response body: ${JSON.stringify(resp.body)}, headers: ${JSON.stringify(resp.headers)}`
      )
    })
  }, {
    validate: () => {
      const apiUrl = api
      return cy.window().then(win => {
        const lsToken =
          win.localStorage.getItem('authToken') ||
          win.localStorage.getItem('token') ||
          win.localStorage.getItem('JWT') ||
          win.localStorage.getItem('access_token')

        if (lsToken) {
          return cy.request({
            method: 'GET',
            url: `${apiUrl}/api/auth/me`,
            failOnStatusCode: false,
            headers: { Authorization: `Bearer ${lsToken}` }
          }).then(r => r.status === 200)
        } else {
          return cy.request({
            method: 'GET',
            url: `${apiUrl}/api/auth/me`,
            failOnStatusCode: false
          }).then(r => r.status === 200)
        }
      })
    }
  })
})


