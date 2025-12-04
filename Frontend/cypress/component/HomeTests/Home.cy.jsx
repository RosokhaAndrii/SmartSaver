import React from 'react';
import { mount } from 'cypress/react';
import Home from '../../../src/pages/Home/Home';
import { AuthContext } from '../../../src/components/AuthProvider/AuthProvider';

const mockDashboard = {
  monthly_income: 1200,
  monthly_expense: 350,
  total_balance: 5000,
  goals: { completed: 2, total: 5 },
  spendings_by_category: [
    { name: 'Food', value: 150, color: '#FF9800' },
    { name: 'Transport', value: 100, color: '#4CAF50' },
  ],
  balance_history: [
    { date: '2025-01-01', balance: 4800 },
    { date: '2025-02-01', balance: 5000 },
  ],
  period: { start: '2025-02-01', end: '2025-02-28' },
};

function mountWithAuth(dashboard = mockDashboard) {
  const authFetch = async (url) => {
    if (String(url).includes('/api/dashboard')) {
      return { ok: true, json: async () => dashboard };
    }
    return { ok: true, json: async () => [] };
  };

  mount(
    <AuthContext.Provider value={{ authFetch }}>
      <Home />
    </AuthContext.Provider>,
  );
}

describe('Home page (component smoke tests)', () => {
  it('shows loading then renders page title and the 4 summary cards', () => {
    mountWithAuth();

    cy.contains('Завантаження...').should('exist');

    cy.contains('Аналітика та грошовий потік', { timeout: 5000 }).should('exist');

    cy.contains('Місячний дохід').should('exist');
    cy.contains('Місячні витрати').should('exist');
    cy.contains('Заощадження').should('exist');
    cy.contains('Прогрес цілей').should('exist');

    cy.contains(`${mockDashboard.monthly_income}$`).should('exist');
    cy.contains(`${mockDashboard.monthly_expense}$`).should('exist');
    cy.contains(`${mockDashboard.total_balance}$`).should('exist');

    cy.contains(`${mockDashboard.goals.completed}/${mockDashboard.goals.total}`).should('exist');
  });

  it('renders MonthNav and the charts (SpendingPieChart + BalanceChart)', () => {
    mountWithAuth();

    cy.get('button[aria-label="Previous month"]').should('exist');
    cy.get('button[aria-label="Next month"]').should('exist');

    cy.contains('Загальні витрати:').should('exist');

    mockDashboard.spendings_by_category.forEach((item) => {
      cy.contains(`${item.name} - ${item.value}$`).should('exist');
    });

    cy.contains(`${mockDashboard.total_balance}$`).should('exist');
  });
});
