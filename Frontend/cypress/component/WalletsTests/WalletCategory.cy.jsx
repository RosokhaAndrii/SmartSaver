import React from 'react';
import { mount } from 'cypress/react';
import WalletCategory from '../../../src/pages/Wallets/components/WalletCategory/WalletCategory';
describe('WalletCategory (Cypress component)', () => {
  it('renders plain text label and total', () => {
    mount(<WalletCategory categoryLabel="Income" totalSum="350$" />);

    cy.contains('Income').should('exist');
    cy.contains('350$').should('exist');
  });

  it('renders when numeric total is passed', () => {
    mount(<WalletCategory categoryLabel="Expenses" totalSum={123} />);

    cy.contains('Expenses').should('exist');
    cy.contains('123').should('exist');
  });

  it('accepts React nodes as props (e.g. rich label)', () => {
    mount(
      <WalletCategory
        categoryLabel={<span data-cy="label-node"><strong>My <em>Label</em></strong></span>}
        totalSum={<span data-cy="sum-node">420$</span>}
      />
    );

    cy.get('[data-cy=label-node]').should('exist').within(() => {
      cy.get('strong').should('exist');
      cy.contains('Label').should('exist');
    });

    cy.get('[data-cy=sum-node]').should('contain', '420$');
  });

  it('renders nothing visible for missing props (does not crash)', () => {
    mount(<WalletCategory />);

    cy.get('div').should('exist');
    cy.contains('Загальна').should('not.exist'); 
  });
});
