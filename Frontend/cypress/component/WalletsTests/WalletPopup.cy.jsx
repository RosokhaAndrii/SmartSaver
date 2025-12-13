import React from 'react';
import { mount } from 'cypress/react'; 
import WalletPopup from '../../../src/pages/Wallets/components/WalletPopup/WalletPopup';

const walletTypes = [
  { id: 'bank', label: 'Банк' },
  { id: 'cash', label: 'Готівка' },
];

describe('WalletPopup (component)', () => {
  it('does not render when open is false', () => {
    mount(
      <WalletPopup
        open={false}
        onClose={cy.stub().as('onClose')}
        walletTypes={walletTypes}
      />
    );


    cy.get('[data-cy=wallet-popup]').should('not.exist');
  });

  it('renders when open is true and focuses first input', () => {
    mount(
      <WalletPopup
        open={true}
        onClose={cy.stub().as('onClose')}
        walletTypes={walletTypes}
      />
    );

    cy.get('[data-cy=wallet-popup]').should('exist').and('be.visible');
    cy.get('[data-cy=wallet-title-input]').should('have.focus');
  });

  it('pre-fills form when initial prop provided (edit mode)', () => {
    const initial = { id: '10', title: ' My wallet ', amount: 123, type: 'cash' };

    mount(
      <WalletPopup
        open={true}
        onClose={cy.stub().as('onClose')}
        walletTypes={walletTypes}
        initial={initial}
      />
    );

    cy.get('[data-cy=wallet-title-input]').should('have.value', ' My wallet ');
    cy.get('[data-cy=wallet-amount-input]').should('have.value', '123');
    cy.get('[data-cy=wallet-type-select]').should('have.value', 'cash');

    cy.contains('Редагувати гаманець').should('exist');
  });

  it('calls onCreate with correct payload on submit (create mode)', () => {
    const onClose = cy.stub().as('onClose');
    const onCreate = cy.stub().as('onCreate');

    mount(
      <WalletPopup
        open={true}
        onClose={onClose}
        onCreate={onCreate}
        walletTypes={walletTypes}
      />
    );

    cy.get('[data-cy=wallet-title-input]').type('  New Wallet  ');
    cy.get('[data-cy=wallet-amount-input]').clear().type('500');
    cy.get('[data-cy=wallet-type-select]').select('bank');

    cy.get('[data-cy=wallet-save]').click();

    cy.wrap(onCreate).should('have.been.calledOnce');
    cy.wrap(onCreate).its('firstCall.args.0').then((payload) => {
      expect(payload).to.include({ title: 'New Wallet', type: 'bank' });
      expect(payload.amount).to.equal(500);
      expect(payload.id).to.be.oneOf([undefined, null]); 
    });

    cy.wrap(onClose).should('have.been.calledOnce');
  });

  it('calls onUpdate with correct payload on submit (edit mode)', () => {
    const initial = { id: '20', title: 'Old', amount: 10, type: 'bank' };
    const onClose = cy.stub().as('onClose');
    const onUpdate = cy.stub().as('onUpdate');

    mount(
      <WalletPopup
        open={true}
        onClose={onClose}
        onUpdate={onUpdate}
        initial={initial}
        walletTypes={walletTypes}
      />
    );

    cy.get('[data-cy=wallet-title-input]').clear().type('Updated Title');
    cy.get('[data-cy=wallet-amount-input]').clear().type('250');

    cy.get('[data-cy=wallet-save]').click();

    cy.wrap(onUpdate).should('have.been.calledOnce');
    cy.wrap(onUpdate).its('firstCall.args.0').then((payload) => {
      expect(payload.id).to.equal('20');
      expect(payload.title).to.equal('Updated Title');
      expect(payload.amount).to.equal(250);
    });

    cy.wrap(onClose).should('have.been.calledOnce');
  });

  it('does not submit when title is empty or whitespace', () => {
    const onClose = cy.stub().as('onClose');
    const onCreate = cy.stub().as('onCreate');

    mount(
      <WalletPopup
        open={true}
        onClose={onClose}
        onCreate={onCreate}
        walletTypes={walletTypes}
      />
    );

    cy.get('[data-cy=wallet-save]').click();
    cy.wrap(onCreate).should('not.have.been.called');
    cy.wrap(onClose).should('not.have.been.called');

    cy.get('[data-cy=wallet-title-input]').type('   ');
    cy.get('[data-cy=wallet-save]').click();
    cy.wrap(onCreate).should('not.have.been.called');
  });

  it('calls onDelete and onClose when delete clicked in edit mode', () => {
    const initial = { id: '99', title: 'ToDelete', amount: 1, type: 'bank' };
    const onClose = cy.stub().as('onClose');
    const onDelete = cy.stub().as('onDelete');

    mount(
      <WalletPopup
        open={true}
        onClose={onClose}
        onDelete={onDelete}
        initial={initial}
        walletTypes={walletTypes}
      />
    );

    cy.contains('Видалити').click();

    cy.wrap(onDelete).should('have.been.calledOnceWith', '99');
    cy.wrap(onClose).should('have.been.calledOnce');
  });

  it('clicking overlay calls onClose; clicking inside dialog does not', () => {
    const onClose = cy.stub().as('onClose');

    mount(
      <WalletPopup
        open={true}
        onClose={onClose}
        walletTypes={walletTypes}
      />
    );

    cy.get('[data-cy=wallet-popup]').click('topLeft'); // likely outside modal
    cy.wrap(onClose).should('have.been.called');

    cy.wrap(null).then(() => {
      onClose.resetHistory();
      mount(
        <WalletPopup
          open={true}
          onClose={onClose}
          walletTypes={walletTypes}
        />
      );
    });

    cy.get('[role="dialog"]').click('center');
    cy.wrap(onClose).should('not.have.been.called');
  });
});
