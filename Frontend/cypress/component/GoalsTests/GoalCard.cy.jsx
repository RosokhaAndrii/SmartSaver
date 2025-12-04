import React from 'react';
import { mount } from 'cypress/react';
import GoalCard from '../../../src/pages/Goals/components/GoalCard/GoalCard';

describe('GoalCard (component)', () => {
  it('renders title, subtitle, amounts, percent text and progress width', () => {
    mount(
      <GoalCard
        title="New Phone"
        subtitle="Saving for phone"
        current={25}
        target={100}
        walletLabel="Main"
        daysLeft="10 дн."
      />
    );

    cy.contains('New Phone').should('exist');
    cy.contains('Saving for phone').should('exist');

    cy.contains('$').should('exist'); 
    cy.contains('New Phone').closest('article').within(() => {
      cy.get('span').contains(/\d+/).should('exist');
    });

    cy.contains('25% досягнуто').should('exist');

    cy.contains('New Phone').closest('article').within(() => {
      cy.get('[style]').should(($els) => {
        const found = Array.from($els).some((el) =>
          /width:\s*25%/.test(el.getAttribute('style') || '')
        );
        expect(found).to.be.true;
      });
    });


    cy.contains("Прив'язано до гаманця:").should('exist');
    cy.contains('Залишилось:').should('exist');
    cy.contains('10 дн.').should('exist');
  });

  it('shows checked/completed icon when checked prop is true', () => {
    mount(<GoalCard title="Done" checked={true} />);

    cy.get('span[title="Завершено"]').should('exist');
  });

  it('calls onEdit when Edit button is clicked', () => {
    const onEdit = cy.stub().as('onEdit');

    mount(
      <GoalCard
        title="Vacation"
        current={40}
        target={200}
        onEdit={onEdit}
      />
    );

    const ariaLabel = 'Редагувати Vacation';
    cy.get(`button[aria-label="${ariaLabel}"]`).as('editBtn').should('exist').and('be.visible');

    cy.get('@editBtn').click();
    cy.get('@onEdit').should('have.been.calledOnce');
  });

  it('renders "-" when numeric amounts are null/undefined', () => {
    mount(<GoalCard title="EmptyGoal" current={null} target={100} />);

    cy.contains('EmptyGoal').closest('article').within(() => {
      cy.get('span').contains('-').should('exist');
    });
  });

  it('does not render subtitle when not provided', () => {
    mount(<GoalCard title="NoSubtitle" />);

    cy.contains('NoSubtitle').should('exist');
    cy.get('article').should(($a) => {
      expect($a.text()).to.not.contain('subtitle');
    });
  });
});
