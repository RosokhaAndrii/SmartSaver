import React from "react";
import { mount } from "cypress/react";
import { TestAuthProvider } from "../../support/testUtils/TestAuthProvider.jsx";
import Wallets from "../../../src/pages/Wallets/Wallets.jsx";

const mockWallets = [
  { id: "1", name: "Main account", balance: 100, type: "bank", hidden: false },
  { id: "2", name: "Savings", balance: 250, type: "savings", hidden: true },
];

describe("Wallets (component)", () => {
  beforeEach(() => {
    cy.intercept("GET", "http://localhost:8080/api/wallets", {
      statusCode: 200,
      body: mockWallets,
    }).as("getWallets");

    cy.intercept("PUT", /\/api\/wallets\/.*/, (req) => {
      req.reply((res) => {
        res.send({
          statusCode: 200,
          body: { ...req.body, id: req.url.split("/").pop() },
        });
      });
    }).as("putWallet");

    cy.intercept("POST", "http://localhost:8080/api/wallets", (req) => {
      const created = { ...req.body, id: "new-1" };
      req.reply({ statusCode: 201, body: created });
    }).as("postWallet");
  });

  it("loads wallets from the API and shows items & chart segments", () => {
    mount(
      <TestAuthProvider>
        <Wallets />
      </TestAuthProvider>,
    );

    cy.wait("@getWallets");

    cy.contains("Main account").should("exist");
    cy.contains("Savings").should("exist");

    cy.get("[data-cy=wallet-item]").should("have.length", 2);
    cy.get("[data-cy=pie-segment]").should("have.length", 1);
  });

  it("creates a new wallet via the popup", () => {
    mount(
      <TestAuthProvider>
        <Wallets />
      </TestAuthProvider>,
    );
    cy.wait("@getWallets");

    cy.get("[data-cy=add-wallet-button]").click();

    cy.get("[data-cy=wallet-popup]").should("exist").and("be.visible");

    cy.get("[data-cy=wallet-title-input]").type("New Wallet");
    cy.get("[data-cy=wallet-amount-input]").clear().type("500");
    cy.get("[data-cy=wallet-type-select]").select("bank");

    cy.get("[data-cy=wallet-save]").click();

    cy.wait("@postWallet")
      .its("response.statusCode")
      .should("be.oneOf", [200, 201]);

    cy.contains("New Wallet").should("exist");
    cy.get("[data-cy=wallet-item]").should("have.length", 3);
  });
});
