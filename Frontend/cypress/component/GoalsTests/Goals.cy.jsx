import React from "react";
import { mount } from "cypress/react";
import Goals from "../../../src/pages/Goals/Goals";
import { AuthContext } from "../../../src/components/AuthProvider/AuthProvider";

function makeAuthFetch({ wallets = [], goals = [], rules = [] } = {}) {
  return async (url, options) => {
    const u = String(url || "");
    if (u.includes("/api/wallets")) {
      return { ok: true, json: async () => wallets };
    }
    if (u.includes("/api/goals")) {
      return { ok: true, json: async () => goals };
    }
    if (u.includes("/api/auto-rules")) {
      return { ok: true, json: async () => rules };
    }
    return { ok: true, json: async () => [] };
  };
}

describe("<Goals /> smoke tests", () => {
  it("renders sections and action buttons (empty data)", () => {
    const authFetch = makeAuthFetch(); 
    mount(
      <AuthContext.Provider value={{ authFetch }}>
        <Goals />
      </AuthContext.Provider>
    );

    cy.contains("Цілі").should("exist");
    cy.contains("Автозаощадження").should("exist");
    cy.contains("Додати ціль").should("exist");
    cy.contains("Додати правило").should("exist");

    cy.get("[role=dialog]").should("not.exist");
  });

  it("renders goal cards and auto-savings rules from API", () => {
    const wallets = [
      { id: 11, name: "Main", currency: "USD", balance: 500 },
      { id: 22, name: "Savings", currency: "USD", balance: 1200 },
    ];

    const goals = [
      {
        id: 101,
        title: "Vacation",
        subtitle: "Trip",
        target_amount: 1000,
        wallet_id: 11,
        wallet_name: "Main",
        due_date: "2025-12-31",
        note: "Summer trip",
      },
    ];

    const rules = [
      {
        id: 201,
        title: "Monthly save",
        percent: 5,
        source_wallet_id: 11,
        target_wallet_id: 22,
        is_active: 1,
        schedule_cron: null,
        source_wallet_name: "Main",
        target_wallet_name: "Savings",
      },
    ];

    const authFetch = makeAuthFetch({ wallets, goals, rules });

    mount(
      <AuthContext.Provider value={{ authFetch }}>
        <Goals />
      </AuthContext.Provider>
    );

    cy.contains("h3", "Vacation", { timeout: 5000 }).should("exist");

    cy.contains("h3", "Vacation")
      .closest("article")
      .within(() => {
        cy.contains(/\b1[,\s\u00A0]?000\$/).should("exist");
      });

    cy.contains("Monthly save", { timeout: 5000 })
      .closest("article")
      .within(() => {
        cy.contains("5%").should("exist");
      });
  });

  it("opens GoalPopup and AutoRulePopup when Add buttons are clicked", () => {
    const wallets = [{ id: 1, name: "Main", currency: "USD", balance: 0 }];
    const authFetch = makeAuthFetch({ wallets, goals: [], rules: [] });

    mount(
      <AuthContext.Provider value={{ authFetch }}>
        <Goals />
      </AuthContext.Provider>
    );

    cy.contains("Додати ціль").should("be.visible").click();

    cy.get('[role="dialog"]', { timeout: 5000 }).should("exist");
    cy.contains(/Нова ціль|Редагувати ціль/).should("exist");

    cy.get('[role="dialog"]').within(($dlg) => {
      cy.wrap($dlg).contains("Скасувати").then(($btn) => {
        if ($btn && $btn.length) {
          cy.wrap($btn).click({ force: true });
        }
      });
    });

    cy.contains("Додати правило").should("be.visible").click();

    cy.get('[role="dialog"]', { timeout: 5000 }).should("exist");
    cy.contains(/Нове правило автозаощадження|Редагувати правило/).should("exist");

    cy.get('[role="dialog"]').within(($dlg) => {
      cy.wrap($dlg).contains("Скасувати").then(($btn) => {
        if ($btn && $btn.length) cy.wrap($btn).click({ force: true });
      });
    });
  });
});
