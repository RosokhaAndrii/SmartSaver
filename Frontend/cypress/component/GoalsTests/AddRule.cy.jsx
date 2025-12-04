import React from 'react';
import { mount } from 'cypress/react';
import AddRule from '../../../src/pages/Goals/components/AddRule/AddRule';
describe('AddRule component', () => {
  it('renders button with icon and title and is clickable (mouse)', () => {
    const onClick = cy.stub().as('onClick');
    mount(<AddRule onClick={onClick} />);

    cy.contains('Додати правило').closest('button').as('btn');

    cy.get('@btn').should('exist').and('be.visible');

    cy.get('@btn').find('span').should('exist');

    cy.get('@btn').click();
    cy.get('@onClick').should('have.been.calledOnce');
  });

});
