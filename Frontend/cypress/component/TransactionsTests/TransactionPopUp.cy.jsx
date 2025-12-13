import React from "react";
import { mount } from "cypress/react";
import TransactionPopup from "../../../src/pages/Transactions/components/TransactionPopup/TransactionPopup";

function formatDisplayDate(iso) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}.${mm}.${yy}`;
}

const categories = [
  { id: "c-exp-1", label: "Food", type: "expense" },
  { id: "c-inc-1", label: "Salary", type: "income" },
  { id: "c-both-1", label: "Transfer", type: "both" },
];

const wallets = [
  { id: "w-1", label: "Main account" },
  { id: "w-2", label: "Savings" },
];

describe("TransactionPopup (Cypress component) - stable", () => {
  it("renders when open and focuses amount input", () => {
    mount(
      <TransactionPopup
        open={true}
        onClose={cy.stub().as("onClose")}
        categories={categories}
        wallets={wallets}
      />,
    );

    cy.get('input[name="amount"]', { timeout: 5000 }).should("exist");
    cy.wait(50);
    cy.get('input[name="amount"]').should("be.focused");

    cy.get('[role="dialog"]').should(
      "have.attr",
      "aria-label",
      "Додати транзакцію",
    );
    cy.get("h2").should("contain.text", "Нова транзакція");

    cy.get('button[type="submit"]').contains("Додати").should("exist");
  });

  it("shows validation error if amount is missing/invalid/zero", () => {
    const onClose = cy.stub().as("onClose");

    mount(
      <TransactionPopup
        open={true}
        onClose={onClose}
        categories={categories}
        wallets={wallets}
      />,
    );

    cy.get('input[name="amount"]').clear();
    cy.get('button[type="submit"]').scrollIntoView().click({ force: true });

    cy.contains("Введіть коректну суму").should("exist");

    cy.get('input[name="amount"]').clear().type("0");
    cy.get('button[type="submit"]').scrollIntoView().click({ force: true });
    cy.contains("Введіть коректну суму").should("exist");

    cy.get('input[name="amount"]').clear().type("abc");
    cy.get('button[type="submit"]').scrollIntoView().click({ force: true });
    cy.contains("Введіть коректну суму").should("exist");
  });

  it("submits a new transaction via onAdd and closes on success", () => {
    const onAdd = cy.stub().resolves().as("onAdd");
    const onClose = cy.stub().as("onClose");

    mount(
      <TransactionPopup
        open={true}
        onClose={onClose}
        onAdd={onAdd}
        categories={categories}
        wallets={wallets}
      />,
    );

    cy.get('input[name="amount"]').clear().type("123.45");

    cy.get('select[name="category"]').select("c-exp-1");
    cy.get('select[name="wallet"]').select("w-2");

    cy.get('input[name="date"]').clear().type("2025-12-03");
    cy.get('textarea[name="note"]').clear().type("Lunch");

    cy.get('button[type="submit"]')
      .contains("Додати")
      .scrollIntoView()
      .click({ force: true });

    cy.get("@onAdd").should("have.been.calledOnce");
    cy.get("@onAdd").then((stub) => {
      const tx = stub.getCall(0).args[0];
      expect(tx).to.have.property("amount", -123.45);
      expect(tx).to.have.property("category", "c-exp-1");
      expect(tx).to.have.property("walletId", "w-2");
      expect(tx).to.have.property("note", "Lunch");
      expect(tx).to.have.property("date", formatDisplayDate("2025-12-03"));
      expect(tx).to.have.property("type", "expense");
    });

    cy.get("@onClose").should("have.been.calledOnce");
  });

  it("edits existing transaction and calls onSave then closes", () => {
    const initialTx = {
      id: "tx-42",
      amount: -50,
      category: "c-exp-1",
      walletId: "w-1",
      note: "Initial note",
      date: "03.12.2025",
      type: "expense",
    };

    const onSave = cy.stub().resolves().as("onSave");
    const onClose = cy.stub().as("onClose");

    mount(
      <TransactionPopup
        open={true}
        onClose={onClose}
        onSave={onSave}
        initialTransaction={initialTx}
        categories={categories}
        wallets={wallets}
      />,
    );

    cy.get('[role="dialog"]').should(
      "have.attr",
      "aria-label",
      "Редагувати транзакцію",
    );
    cy.get("h2").should("contain.text", "Редагувати транзакцію");

    cy.get('input[name="amount"]').should("have.value", "50");

    cy.get('input[name="amount"]').clear().type("75");
    cy.get('textarea[name="note"]').clear().type("Updated");

    cy.get('button[type="submit"]')
      .contains("Зберегти")
      .scrollIntoView()
      .click({ force: true });

    cy.get("@onSave").should("have.been.calledOnce");
    cy.get("@onSave").then((s) => {
      const tx = s.getCall(0).args[0];
      expect(tx).to.have.property("id", "tx-42");
      expect(tx).to.have.property("amount", -75);
      expect(tx).to.have.property("note", "Updated");
      expect(tx).to.have.property("type", "expense");
    });

    cy.get("@onClose").should("have.been.calledOnce");
  });

  it("switching type updates category list and default category", () => {
    mount(
      <TransactionPopup
        open={true}
        onClose={cy.stub().as("onClose")}
        categories={categories}
        wallets={wallets}
      />,
    );

    cy.get('select[name="category"]').within(() => {
      cy.contains("Food").should("exist");
      cy.contains("Transfer").should("exist");
      cy.contains("Salary").should("not.exist");
    });

    cy.contains("Дохід").click();

    cy.get('select[name="category"]').within(() => {
      cy.contains("Salary").should("exist");
    });

    cy.get('select[name="category"]').should(($sel) => {
      expect($sel.val()).to.not.be.oneOf([null, ""]);
    });
  });

  it("shows save error message if onAdd/onSave throws", () => {
    const onAdd = cy.stub().rejects(new Error("Boom")).as("onAdd");
    const onClose = cy.stub().as("onClose");

    mount(
      <TransactionPopup
        open={true}
        onClose={onClose}
        onAdd={onAdd}
        categories={categories}
        wallets={wallets}
      />,
    );

    cy.get('input[name="amount"]').clear().type("10");
    cy.get('select[name="category"]').select("c-exp-1");
    cy.get('button[type="submit"]').scrollIntoView().click({ force: true });

    cy.contains(/Помилка при збереженні|Boom/).should("exist");

    cy.get("@onClose").should("not.have.been.called");
  });
});
