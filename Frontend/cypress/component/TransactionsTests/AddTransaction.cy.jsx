import React from 'react';
import { mount } from 'cypress/react';
import AddTransaction from '../../../src/pages/Transactions/components/AddTransaction/AddTransaction';

describe('AddTransaction (Cypress component)', () => {
  it('renders the button with icon and title and calls onClick on click', () => {
    const onClick = cy.stub().as('onClick');

    mount(<AddTransaction onClick={onClick} />);

    cy.get('button').as('btn').should('exist');
    cy.get('@btn').contains('Додати транзакцію').should('be.visible');

    cy.get('@btn').find('span').first().should('exist');

    cy.get('@btn').click();
    cy.get('@onClick').should('have.been.calledOnce');
  });
});