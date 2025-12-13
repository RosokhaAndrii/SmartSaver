import React from 'react';
import { mount } from 'cypress/react';
import TransactionItem from '../../../src/pages/Transactions/components/TransactionItem/TransactionItem';

function formatAmountForTest(n) {
  const formatted = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(n));
  return formatted;
}

function normalize(s) {
  return (s || '')
    .replace(/\u00A0/g, ' ') 
    .replace(/\s+/g, '')     
    .trim();
}

describe('TransactionItem (Cypress component)', () => {
  it('renders title, subtitle, date and formatted positive amount, and toggles checkbox', () => {
    const onToggle = cy.stub().as('onToggle');
    const onMenuClick = cy.stub().as('onMenu');

    mount(
      <TransactionItem
        id="tx-1"
        checked={false}
        onToggle={onToggle}
        avatar={null}
        title="Salary"
        subtitle="Company X"
        amount={350}
        currency="$"
        date="2025-12-03"
        onMenuClick={onMenuClick}
      />
    );

    cy.contains('Salary').should('exist');
    cy.contains('Company X').should('exist');
    cy.contains('2025-12-03').should('exist');

    const expectedFormatted = formatAmountForTest(350);
    const expectedFull = `+${'$'}${expectedFormatted}`; 

    cy.get('[aria-label="Amount positive"]').invoke('text').then((txt) => {
      expect(normalize(txt)).to.equal(normalize(expectedFull));
    });

    cy.get('[data-id="tx-1"]').within(() => {
      cy.get('[aria-hidden="true"]').should('exist');
    });

    cy.get('input[type="checkbox"]').should('have.attr', 'aria-checked', 'false');

    cy.get('input[type="checkbox"]').click();
    cy.get('@onToggle').should('have.been.calledOnce');
    cy.get('@onToggle').its('firstCall.args').should('deep.equal', ['tx-1']);
  });

  it('renders avatar node when provided', () => {
    const Avatar = () => <img data-cy="avatar-img" alt="avatar" src="/x.png" />;

    mount(
      <TransactionItem
        id="tx-2"
        title="T"
        amount={10}
        avatar={<Avatar />}
      />
    );

    cy.get('[data-cy=avatar-img]').should('exist').and('have.attr', 'src', '/x.png');
  });

  it('renders negative amount with minus sign and negative aria-label, and applies +/- semantics', () => {
    const negativeAmount = -1234.5;
    mount(
      <TransactionItem
        id="tx-3"
        title="Refund"
        amount={negativeAmount}
        currency="$"
        date="2025-12-04"
      />
    );

    const expectedFormatted = formatAmountForTest(negativeAmount); // absolute value
    const expectedFull = `-${'$'}${expectedFormatted}`;

    cy.get('[aria-label="Amount negative"]').invoke('text').then((txt) => {
      expect(normalize(txt)).to.equal(normalize(expectedFull));
    });

    cy.contains('Refund').should('exist');
    cy.contains('2025-12-04').should('exist');
  });

  it('kebab/menu button calls onMenuClick and does not bubble (menu handler invoked with id)', () => {
    const onMenuClick = cy.stub().as('onMenuClick');
    const outerClick = cy.stub().as('outer');

    const Wrapper = ({ children }) => <div onClick={() => outerClick()}>{children}</div>;

    mount(
      <Wrapper>
        <TransactionItem id="tx-4" title="X" amount={1} onMenuClick={onMenuClick} />
      </Wrapper>,
    );

    cy.get('button[aria-label="Options"]').click();
    cy.get('@onMenuClick').should('have.been.calledOnce');
    cy.get('@onMenuClick').its('firstCall.args').should('deep.equal', ['tx-4']);

    cy.get('@outer').should('not.have.been.called');
  });
});
