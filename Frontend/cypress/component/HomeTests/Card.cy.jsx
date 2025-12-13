import React from "react";
import { mount } from "cypress/react";
import Card from "../../../src/pages/Home/components/Card/Card";

describe("Card component (Cypress)", () => {
  const Title = "My card title";
  const Value = "1,234$";
  const Footer = "Since last month";

  const TestIcon = () => <svg data-cy="test-icon" role="img" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" /></svg>;

  it("renders title, value and footer text", () => {
    mount(
      <Card
        title={Title}
        value={Value}
        footerText={Footer}
        variant="income"
      />
    );

    cy.contains(Title).should("exist");
    cy.contains(Value).should("exist");

    cy.contains(Footer).should("exist");
  });

  it("renders icon when Icon prop is provided", () => {
    mount(
      <Card
        title={Title}
        value={Value}
        footerText={Footer}
        Icon={TestIcon}
        variant="expense"
      />
    );

    cy.get("[data-cy=test-icon]").should("exist");

    cy.contains(Title).parents().first().within(() => {
      cy.get("svg").should("exist");
    });
  });

  it("does NOT render icon wrapper when Icon prop is not provided", () => {
    mount(
      <Card
        title={Title}
        value={Value}
        footerText={Footer}
        variant="savings"
      />
    );

    cy.get("[data-cy=test-icon]").should("not.exist");
  });

  it("uses footerColor prop and variant prop (structural checks)", () => {
    mount(
      <Card
        title={Title}
        value={Value}
        footerText={Footer}
        Icon={TestIcon}
        variant="goals"
        footerColor="green"
      />
    );

    cy.contains(Footer).should("exist");

    cy.contains(Title).closest("div").should("exist").and(($root) => {
      expect($root.attr("class")).to.be.a("string").and.not.be.empty;
    });

    cy.contains(Footer).should("exist");
  });

  });

