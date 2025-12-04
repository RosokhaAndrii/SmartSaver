import React from "react";
import { mount } from "cypress/react";
import Header from '/Projects/SmartSaver/Frontend/src/layouts/Header/Header'
import { AuthContext } from "../../../src/components/AuthProvider/AuthProvider"; 
import { MemoryRouter } from "react-router";

describe("<Header /> (component)", () => {
  it("renders title and buttons", () => {
    const logout = cy.stub().as("logout");

    mount(
      <AuthContext.Provider value={{ logout }}>
        <MemoryRouter>
          <Header pageName="My page" />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    cy.contains("My page").should("exist");

    cy.get("button")
      .filter((i, el) => el.className.includes("menuBtn") || el.getAttribute("aria-label") === "menu")
      .should("exist")
      .first();

    cy.get("button").contains("Вийти").should("exist");
    cy.get("button[aria-label='Опції']").should("exist");
  });


  it("menu/options buttons are clickable (no errors)", () => {
    const logout = cy.stub();

    mount(
      <AuthContext.Provider value={{ logout }}>
        <MemoryRouter>
          <Header pageName="Page" />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    cy.get("button").filter((i, el) => el.className.includes("menuBtn")).click({ force: true });
    cy.get("button[aria-label='Опції']").click({ force: true });

    cy.wrap(null).then(() => {
      expect(logout).to.not.have.been.called;
    });
  });
});
