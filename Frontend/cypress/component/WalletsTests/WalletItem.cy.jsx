import React from "react";
import { mount } from "cypress/react";
import WalletItem from "../../../src/pages/Wallets/components/WalletItem/WalletItem";

describe("WalletItem (Cypress component)", () => {
  it("renders and reacts to clicks", () => {
    const onToggleHidden = cy.stub().as("onToggleHidden");
    const onEdit = cy.stub().as("onEdit");

    mount(
      <WalletItem
        id="w-1"
        title="Main account"
        amount={250}
        hidden={false}
        onToggleHidden={onToggleHidden}
        onEdit={onEdit}
      />,
    );

    cy.get("[data-cy=wallet-item]").should("exist");

    cy.contains("Main account").should("exist");
    cy.contains("250$").should("exist");

    
    cy.get('button[aria-label="Приховати гаманець"]').as("toggleBtn").should("have.attr", "aria-pressed", "false");

    cy.get("@toggleBtn").click();
    cy.get("@onToggleHidden").should("have.been.calledOnce");
    cy.get("@onToggleHidden").its("firstCall.args").should("deep.equal", ["w-1", true]);

    cy.get('button[aria-label="Редагувати гаманець"]').click();
    cy.get("@onEdit").should("have.been.calledOnce");
    cy.get("@onEdit").its("firstCall.args").should("deep.equal", ["w-1"]);
  });

  it("shows switch in 'on' state when hidden=true", () => {
    mount(
      <WalletItem
        id="w-2"
        title="Hidden wallet"
        amount="0"
        hidden={true}
        onToggleHidden={cy.stub().as("onToggleHidden")}
        onEdit={cy.stub().as("onEdit")}
      />,
    );

    cy.get('button[aria-pressed="true"]').should("exist");
    cy.get('button[aria-label="Показати гаманець"]').should('exist');
  });
});
