import React from "react";
import { mount } from "cypress/react";
import GoalPopup from "../../../src/pages/Goals/components/GoalsPopup/GoalPopup";

const wallets = [
  { id: 1, label: "Main", currency: "USD" },
  { id: 2, label: "Savings", currency: "USD" },
];

describe("GoalPopup (component)", () => {
  it("does not render when open=false", () => {
    mount(
      <GoalPopup
        open={false}
        onClose={cy.stub()}
        onSave={cy.stub().resolves()}
        wallets={wallets}
      />,
    );
    cy.get('[role="dialog"]').should("not.exist");
  });

  it("renders when open and focuses first input", () => {
    const onClose = cy.stub().as("onClose");
    mount(
      <GoalPopup
        open={true}
        onClose={onClose}
        onSave={cy.stub().resolves()}
        wallets={wallets}
      />,
    );

    cy.get('[role="dialog"]')
      .should("exist")
      .and("have.attr", "aria-label", "Додати ціль");

    cy.get('input[name="title"]', { timeout: 5000 }).should("exist");
    cy.wait(30);
    cy.get('input[name="title"]').should("have.focus");
  });

  it("submits data via onSave and closes on success", () => {
    const onSave = cy.stub().resolves().as("onSave");
    const onClose = cy.stub().as("onClose");

    mount(
      <GoalPopup
        open={true}
        onClose={onClose}
        onSave={onSave}
        wallets={wallets}
      />,
    );

    cy.get('input[name="title"]').clear().type("New Goal");
    cy.get('input[name="subtitle"]').clear().type("Optional");
    cy.get('input[name="target"]').clear().type("250");
    cy.get('select[name="walletId"]').select(String(wallets[1].id)); // select wallet id 2
    cy.get('input[name="deadline"]').clear().type("2025-12-31");
    cy.get('textarea[name="note"]').clear().type("Some note");

    cy.get('button[type="submit"]').scrollIntoView().click({ force: true });

    cy.get("@onSave").should("have.been.calledOnce");
    cy.get("@onSave").then((s) => {
      const payload = s.getCall(0).args[0];
      expect(payload).to.have.property("title", "New Goal");
      expect(payload).to.have.property("subtitle", "Optional");
      expect(payload).to.have.property("target", 250);
      expect(payload).to.have.property("walletId", String(wallets[1].id));
      expect(payload).to.have.property("note", "Some note");
    });

    cy.get("@onClose").should("have.been.calledOnce");
  });

  it("shows save error message when onSave rejects", () => {
    const onSave = cy.stub().rejects(new Error("Boom")).as("onSave");
    const onClose = cy.stub().as("onClose");

    mount(
      <GoalPopup
        open={true}
        onClose={onClose}
        onSave={onSave}
        wallets={wallets}
      />,
    );

    cy.get('input[name="title"]').clear().type("Fail Goal");
    cy.get('input[name="target"]').clear().type("100");
    cy.get('button[type="submit"]').scrollIntoView().click({ force: true });

    cy.contains(/Помилка при збереженні цілі|Boom/).should("exist");

    cy.get("@onClose").should("not.have.been.called");
  });
});
