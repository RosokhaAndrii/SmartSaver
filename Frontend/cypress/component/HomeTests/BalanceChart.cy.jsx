import React from 'react';
import { mount } from 'cypress/react';
import BalanceChart from '../../../src/pages/Home/components/BalanceChart/BalanceChart';

const sampleData = [
  { date: '2025-12-01', balance: 4800 },
  { date: '2025-12-10', balance: 4900 },
  { date: '2025-12-20', balance: 5000 },
];

describe('BalanceChart (component)', () => {
  it('renders header with date and current balance', () => {
    mount(
      <div style={{ width: 700, height: 400 }}>
        <BalanceChart currentBalance={5000} date={'2025-12-20'} changePercentage={2.3} data={sampleData} />
      </div>
    );

    cy.contains('Баланс - 2025-12-20').should('exist');
    cy.contains('5000$').should('exist');

    cy.contains('З попереднього дня').should('exist');
  });

  it('shows positive arrow and percentage when changePercentage >= 0', () => {
    mount(
      <div style={{ width: 700, height: 400 }}>
        <BalanceChart currentBalance={1234} date={'2025-12-02'} changePercentage={5} data={sampleData} />
      </div>
    );

    cy.contains('З попереднього дня')
      .parent()
      .find('span')
      .should('exist')
      .invoke('text')
      .then((txt) => {
        expect(txt).to.contain('▲');
        expect(txt).to.contain('5%');
      });

    cy.contains('З попереднього дня')
      .parent()
      .find('span')
      .invoke('attr', 'class')
      .should('match', /positiveChange/);
  });

  it('shows negative arrow and percentage when changePercentage < 0', () => {
    mount(
      <div style={{ width: 700, height: 400 }}>
        <BalanceChart currentBalance={800} date={'2025-12-02'} changePercentage={-3.5} data={sampleData} />
      </div>
    );

    cy.contains('З попереднього дня')
      .parent()
      .find('span')
      .should('exist')
      .invoke('text')
      .then((txt) => {
        expect(txt).to.contain('▼');
        expect(txt).to.contain('3.5%');
      });

    cy.contains('З попереднього дня')
      .parent()
      .find('span')
      .invoke('attr', 'class')
      .should('match', /negativeChange/);
  });

  it('renders the chart SVG elements (svg, path, circle)', () => {
    mount(
      <div style={{ width: 700, height: 400 }}>
        <BalanceChart currentBalance={5000} date={'2025-12-20'} changePercentage={0} data={sampleData} />
      </div>
    );

    cy.get('svg').should('exist');

    cy.get('svg').find('path').its('length').should('be.gte', 1);

    cy.get('svg').find('circle').its('length').should('be.gte', 1);
  });
});
