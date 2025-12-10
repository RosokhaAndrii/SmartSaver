describe('Auth Page', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/auth/login').as('loginReq')
    cy.intercept('GET', '/api/dashboard*').as('dashboardReq')
  })

  it('allows a user to login and shows the home UI', () => {
    cy.visit('/auth')

    cy.get('[data-cy=email]').should('be.visible')
    cy.get('[data-cy=password]').should('be.visible')
    cy.get('[data-cy=login-button]').should('be.enabled')

    cy.get('[data-cy=email]').type('user@example.com')
    cy.get('[data-cy=password]').type('password123')
    cy.get('[data-cy=login-button]').click()

    cy.wait('@loginReq').its('response.statusCode').should('eq', 200)

    cy.wait('@dashboardReq').its('response.statusCode').should(status => {
      expect([200, 304]).to.include(status)
    })

    cy.get('[data-cy=home-welcome]', { timeout: 10000 }).should('be.visible')
  })

  it('shows an error message on invalid login', () => {
    cy.intercept('POST', '/api/auth/login').as('loginReqInvalid')

    cy.visit('/auth')
    cy.get('[data-cy=email]').type('invalid@example.com')
    cy.get('[data-cy=password]').type('wrongpassword')
    cy.get('[data-cy=login-button]').click()

    cy.wait('@loginReqInvalid').its('response.statusCode').should('eq', 401)

    cy.get('[data-cy=login-error]').should('be.visible')
  })
})
