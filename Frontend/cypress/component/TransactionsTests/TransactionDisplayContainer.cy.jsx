import React from 'react';
import { mount } from 'cypress/react';
import TransactionDisplayContainer from '../../../src/pages/Transactions/components/TransactionsDisplayContainer/TransactionDisplayContainer';
function formatAmountForTest(n) {
  if (n == null || Number.isNaN(Number(n))) return '-';
  const abs = Math.abs(Number(n));
  const formatted = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(abs);
  return (Number(n) < 0 ? '-' : '') + formatted + '$';
}

describe('TransactionDisplayContainer (Cypress component)', () => {
  const txs = [
    { id: 'a', title: 'T1', wallet: 'Main', amount: 100, date: '2025-12-01' },
    { id: 'b', title: 'T2', wallet: 'Savings', amount: -50, date: '2025-12-02', checked: true },
  ];

  it('renders title, count and total correctly', () => {
    mount(<TransactionDisplayContainer transactions={txs} />);

    cy.contains('Транзакції').should('exist');

    cy.get('[aria-live="polite"]').first().should('contain.text', '2');

    const expected = formatAmountForTest(100 + (-50));
    cy.contains(expected).should('exist');
  });

  it('shows the selected block when items are checked and delete calls handler', () => {
    const onDeleteSelected = cy.stub().as('onDelete');
    mount(<TransactionDisplayContainer transactions={txs} onDeleteSelected={onDeleteSelected} />);

    cy.get('[aria-live="polite"]').eq(1).should('contain.text', '1'); // second aria-live is selectedNumber

    cy.contains('Видалити').should('exist').click();
    cy.get('@onDelete').should('have.been.calledOnce');
    cy.get('@onDelete').its('firstCall.args.0').should('deep.equal', ['b']);
  });

  it('forwards onToggle to child TransactionItem when checkbox clicked', () => {
    const onToggle = cy.stub().as('onToggle');

    mount(<TransactionDisplayContainer transactions={txs} onToggle={onToggle} />);

    cy.get('[data-id="a"]').within(() => {
      cy.get('input[type="checkbox"]').click();
    });

    cy.get('@onToggle').should('have.been.calledOnce');
    cy.get('@onToggle').its('firstCall.args').should('deep.equal', ['a']);
  });

  it('forwards onMenu to child TransactionItem when menu clicked', () => {
    const onMenu = cy.stub().as('onMenu');

    mount(<TransactionDisplayContainer transactions={txs} onMenu={onMenu} />);

    cy.get('[data-id="b"]').within(() => {
      cy.get('button[aria-label="Options"]').click();
    });

    cy.get('@onMenu').should('have.been.calledOnce');
    cy.get('@onMenu').its('firstCall.args').should('deep.equal', ['b']);
  });

  it('renders empty state correctly (no transactions)', () => {
    mount(<TransactionDisplayContainer transactions={[]} />);

    cy.contains('Транзакції').should('exist');
    cy.get('[aria-live="polite"]').first().should('contain.text', '0');
    cy.contains(formatAmountForTest(0)).should('exist');
    cy.get('[data-id]').should('not.exist');
  });
});
