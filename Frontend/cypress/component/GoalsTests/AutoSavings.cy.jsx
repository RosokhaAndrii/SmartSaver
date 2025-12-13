import React from "react";
import { mount } from "cypress/react";
import AutoSavings from "../../../src/pages/Goals/components/AutoSavings/AutoSavings";

describe("AutoSavings (component)", () => {
  const baseProps = {
    id: "r-1",
    title: "Авто-збереження",
    subtitle: "Щомісячне відкладання",
    lines: ["Перерахунок 1", "Перерахунок 2"],
  };

  it("renders title, subtitle, status pill and listed lines", () => {
    const onToggle = cy.stub().as("onToggle");
    const onEdit = cy.stub().as("onEdit");

    mount(
      <AutoSavings
        {...baseProps}
        isActive={true}
        onToggle={onToggle}
        onEdit={onEdit}
        className="custom-class"
      />,
    );

    cy.get("article").should(
      "have.attr",
      "aria-labelledby",
      `rule-${baseProps.id}-label`,
    );
    cy.get(`h3#rule-${baseProps.id}-label`).should(
      "contain.text",
      baseProps.title,
    );

    cy.contains(baseProps.subtitle).should("exist");

    cy.get('[role="status"]')
      .should("contain.text", "Активне")
      .and("have.attr", "aria-checked", "true");

    cy.contains("Перерахунок 1").should("exist");
    cy.contains("Перерахунок 2").should("exist");

    cy.contains("Вимкнути").should("exist");

    cy.contains("Редагувати").should("exist");

    cy.get("article").should("have.class", "custom-class");

    cy.contains("Вимкнути").click();
    cy.get("@onToggle").should("have.been.calledOnce");

    cy.contains("Редагувати").click();
    cy.get("@onEdit").should("have.been.calledOnce");
  });

  it("shows placeholder when no lines and is not active, and toggle text is Увімкнути", () => {
    const onToggle = cy.stub().as("onToggle");

    mount(
      <AutoSavings
        id={42}
        title="Без опису"
        lines={[]}
        isActive={false}
        onToggle={onToggle}
      />,
    );

    cy.contains("Без опису").should("exist");

    cy.contains("Опис відсутній").should("exist");

    cy.get('[role="status"]')
      .should("contain.text", "Неактивне")
      .and("have.attr", "aria-checked", "false");

    cy.contains("Увімкнути").should("exist").click();
    cy.get("@onToggle").should("have.been.calledOnce");
  });

  it("handles numeric id and accessibility attributes correctly", () => {
    mount(<AutoSavings id={7} title="Numeric id" lines={[]} />);

    cy.get("article").should("have.attr", "aria-labelledby", "rule-7-label");
    cy.get("#rule-7-label").should("contain.text", "Numeric id");
  });
});
