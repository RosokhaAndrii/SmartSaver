describe('Home page', () => {
  const api = Cypress.env('API_URL') || 'http://localhost:8080';
  const email = 'user@example.com';
  const password = 'password123';

  function loginAndVisitHome({ emailArg = email, passwordArg = password, interceptFixture, interceptHandler } = {}) {
    if (interceptFixture) {
      cy.intercept('GET', '**/api/dashboard*', { fixture: interceptFixture }).as('getDashboard');
    } else if (interceptHandler) {
      cy.intercept('GET', '**/api/dashboard*', interceptHandler).as('getDashboardAuth');
    }

    cy.request({
      method: 'POST',
      url: `${api}/api/auth/login`,
      body: { email: emailArg, password: passwordArg },
      failOnStatusCode: false
    }).then((resp) => {
      if (![200, 201].includes(resp.status)) {
        throw new Error(`Login failed with status ${resp.status}: ${JSON.stringify(resp.body)}`);
      }

      const token = resp.body?.token || resp.body?.accessToken || resp.body?.access_token ||
                    resp.body?.data?.token || resp.body?.data?.accessToken;
      const user = resp.body?.user || resp.body?.data?.user || null;

      cy.visit('/home', {
        onBeforeLoad(win) {
          if (token) {
            win.localStorage.setItem('authToken', token);
            win.localStorage.setItem('token', token);
            win.localStorage.setItem('access_token', token);
            win.localStorage.setItem('accessToken', token);
          }
          if (user) win.localStorage.setItem('user', JSON.stringify(user));
          win.localStorage.setItem('__cypress_test_marker', token ? 'token-set' : 'no-token');
          if (token && user) {
            try {
              win.localStorage.setItem('auth', JSON.stringify({ token, user }));
              win.localStorage.setItem('currentUser', JSON.stringify(user));
            } catch (e) {}
          }
        }
      });
    });
  }

  it('shows loading state and then renders dashboard cards & spendings', () => {
    loginAndVisitHome({ interceptFixture: 'dashboard.json' });
    cy.wait('@getDashboard');

    cy.get('[data-cy=home-welcome]').should('be.visible');
    cy.get('[data-cy=card-income-value]').should('contain', '5000$');
    cy.get('[data-cy=card-expense-value]').should('contain', '1200$');
    cy.get('[data-cy=card-savings-value]').should('contain', '3250$');
    cy.get('[data-cy=card-goals-value]').should('contain', '2/5');
    cy.contains('Загальні витрати: 1200$').should('be.visible');
  });

  it('fetches new data when month is changed via MonthNav', () => {
    cy.intercept('GET', `${api}/api/dashboard?month=11&year=2025`, { fixture: 'dashboard-empty.json' }).as('getNov');
    cy.intercept('GET', `${api}/api/dashboard?month=12&year=2025`, { fixture: 'dashboard.json' }).as('getDec');

    loginAndVisitHome();

    cy.wait('@getDec');
    cy.get('[data-cy=card-income-value]').should('contain', '5000$');

    cy.get('[data-cy=month-prev]').click();
    cy.wait('@getNov');
    cy.get('[data-cy=card-income-value]').should('contain', '0$');
    cy.get('[data-cy=card-expense-value]').should('contain', '0$');
    cy.get('[data-cy=card-savings-value]').should('contain', '0$');

    cy.get('[data-cy=month-next]').click();
    cy.wait('@getDec');
    cy.get('[data-cy=card-income-value]').should('contain', '5000$');
  });

  it('handles failed dashboard and shows fallback values', () => {
    loginAndVisitHome({
      interceptHandler: (req) => req.reply({ statusCode: 500, body: { error: 'Server error' } })
    });
    cy.wait('@getDashboardAuth');

    cy.get('[data-cy=home-welcome]').should('be.visible');
    cy.get('[data-cy=card-income-value]').should('contain', '0$');
    cy.get('[data-cy=card-expense-value]').should('contain', '0$');
    cy.get('[data-cy=card-savings-value]').should('contain', '0$');
    cy.get('[data-cy=card-goals-value]').should('contain', '0/0');
  });

  it('sends Authorization header when requesting dashboard', () => {
    loginAndVisitHome({
      interceptHandler: (req) => {
        expect(req.headers).to.have.property('authorization');
        expect(req.headers.authorization).to.match(/^Bearer\s.+/);
        req.reply({ fixture: 'dashboard.json' });
      }
    });
    cy.wait('@getDashboardAuth');
  });
});
