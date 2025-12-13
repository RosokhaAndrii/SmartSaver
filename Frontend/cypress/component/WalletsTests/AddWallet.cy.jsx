import React from "react";
import { mount } from "cypress/react";
import AddWallet from "../../../src/pages/Wallets/components/AddWallet/AddWallet";
describe("AddWallet (Cypress component)", () => {
  it("renders the add button with icon and title, and calls onClick when clicked", () => {
    const onClick = cy.stub().as("onClick");

    mount(<AddWallet onClick={onClick} />);
    cy.get("[data-cy=add-wallet-button]").as("btn").should("exist");

    cy.get("@btn")
      .should("have.prop", "tagName")
      .should("match", /button/i);
    cy.get("@btn").should("have.attr", "type", "button");

    cy.get("@btn").contains("Додати гаманець").should("be.visible");

    cy.get("@btn").find("span").first().should("exist");

    cy.get("@btn").click();
    cy.get("@onClick").should("have.been.calledOnce");
  });
});
