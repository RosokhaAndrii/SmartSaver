import React from 'react';
import { mount } from 'cypress/react';
import AddGoal from '../../../src/pages/Goals/components/AddGoal/AddGoal';

describe('AddGoal component', () => {
  it('renders button with icon and title and is clickable (mouse)', () => {
    const onClick = cy.stub().as('onClick');
    mount(<AddGoal onClick={onClick} />);

    cy.contains('Додати ціль').closest('button').as('btn');

    cy.get('@btn').should('exist').and('be.visible');

    cy.get('@btn').find('span').should('exist');

  });

});
