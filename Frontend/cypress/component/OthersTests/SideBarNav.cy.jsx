// cypress/component/SideBarNav.cy.jsx
import React from "react";
import { MemoryRouter } from "react-router";
import { mount } from "cypress/react";
import SideBarNav from "../../../src/layouts/SideBarNav/SideBarNav";
describe("<SideBarNav />", () => {
  it("renders all navigation items", () => {
    mount(
      <MemoryRouter initialEntries={["/"]}>
        <SideBarNav />
      </MemoryRouter>,
    );

    cy.contains("Головна").should("exist");
    cy.contains("Транзакції").should("exist");
    cy.contains("Гаманці").should("exist");
    cy.contains("Цілі").should("exist");

    cy.contains("Налаштування").should("exist");
    cy.contains("Підтримка").should("exist");
  });

  it("contains correct links", () => {
    mount(
      <MemoryRouter initialEntries={["/"]}>
        <SideBarNav />
      </MemoryRouter>,
    );

    cy.get("a[href='/home']").should("exist");
    cy.get("a[href='/transactions']").should("exist");
    cy.get("a[href='/wallets']").should("exist");
    cy.get("a[href='/goals']").should("exist");
    cy.get("a[href='/settings']").should("exist");
    cy.get("a[href='/support']").should("exist");
  });
});
