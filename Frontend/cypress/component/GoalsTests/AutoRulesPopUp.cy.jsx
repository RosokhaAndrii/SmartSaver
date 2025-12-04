import React from 'react';
import { mount } from 'cypress/react';
import AutoRulePopup from '../../../src/pages/Goals/components/AutoRulePopup/AutoRulePopup';

const wallets = [
  { id: '1', label: 'Main', currency: 'USD' },
  { id: '2', label: 'Savings', currency: 'USD' },
];

describe('AutoRulePopup (component)', () => {
  it('does not render when open is false', () => {
    mount(
      <AutoRulePopup
        open={false}
        onClose={cy.stub().as('onClose')}
        onSave={cy.stub().as('onSave')}
        wallets={wallets}
      />
    );

    cy.get('[role="dialog"]').should('not.exist');
  });

  it('renders when open and focuses first input', () => {
    const onClose = cy.stub().as('onClose');
    mount(
      <AutoRulePopup
        open={true}
        onClose={onClose}
        onSave={cy.stub().resolves()}
        wallets={wallets}
      />
    );

    cy.get('[role="dialog"]').should('exist');
    cy.get('input[name="title"]', { timeout: 5000 }).should('exist');
    cy.wait(30);
    cy.get('input[name="title"]').should('have.focus');
  });



  it('shows save error when onSave rejects and does not call onClose', () => {
    const onSave = cy.stub().rejects(new Error('Boom')).as('onSave');
    const onClose = cy.stub().as('onClose');

    mount(
      <AutoRulePopup
        open={true}
        onClose={onClose}
        onSave={onSave}
        wallets={wallets}
      />
    );

    cy.get('input[name="title"]').clear().type('Failing rule');
    cy.get('input[name="percent"]').clear().type('5');
    cy.get('select[name="sourceWalletId"]').select(wallets[0].id);
    cy.get('select[name="targetWalletId"]').select(wallets[1].id);

    cy.get('button[type="submit"]').scrollIntoView().click({ force: true });
    cy.contains(/Помилка при збереженні правила|Boom/, { timeout: 10000 }).should('exist')

    cy.get('@onClose').should('not.have.been.called');
  });

  it('shows edit UI for initialRule and delete button calls onDelete then onClose', () => {
    const initial = {
      id: 'rule-1',
      title: 'Existing rule',
      percent: 7,
      sourceWalletId: wallets[0].id,
      targetWalletId: wallets[1].id,
      isActive: true,
    };

    const onSave = cy.stub().resolves().as('onSave');
    const onDelete = cy.stub().resolves().as('onDelete');
    const onClose = cy.stub().as('onClose');

    mount(
      <AutoRulePopup
        open={true}
        onClose={onClose}
        onSave={onSave}
        onDelete={onDelete}
        initialRule={initial}
        wallets={wallets}
      />
    );

    cy.contains('Редагувати правило').should('exist');

    cy.get('button').contains('Видалити').scrollIntoView().click({ force: true });

    cy.get('@onDelete', { timeout: 10000 }).should('have.been.calledOnce');
    cy.get('@onClose', { timeout: 10000 }).should('have.been.calledOnce');
  });
});
