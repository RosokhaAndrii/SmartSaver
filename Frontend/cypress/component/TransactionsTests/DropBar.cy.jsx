import React from "react";
import { mount } from "cypress/react";
import Dropbar from "../../../src/pages/Transactions/components/DropBar/DropBar";

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
function endOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}
function startOfQuarter(d) {
  const q = Math.floor(d.getMonth() / 3);
  return new Date(d.getFullYear(), q * 3, 1, 0, 0, 0, 0);
}
function endOfQuarter(d) {
  const q = Math.floor(d.getMonth() / 3);
  return new Date(d.getFullYear(), q * 3 + 3, 0, 23, 59, 59, 999);
}
function startOfHalf(d) {
  const isFirst = d.getMonth() < 6;
  return new Date(d.getFullYear(), isFirst ? 0 : 6, 1, 0, 0, 0, 0);
}
function endOfHalf(d) {
  const isFirst = d.getMonth() < 6;
  return new Date(d.getFullYear(), isFirst ? 6 : 12, 0, 23, 59, 59, 999);
}
function startOfYear(d) {
  return new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0);
}
function endOfYear(d) {
  return new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
}

function getPeriodRange(id, refDate) {
  switch (id) {
    case "month":
      return { start: startOfMonth(refDate), end: endOfMonth(refDate) };
    case "quarter":
      return { start: startOfQuarter(refDate), end: endOfQuarter(refDate) };
    case "half":
      return { start: startOfHalf(refDate), end: endOfHalf(refDate) };
    case "year":
      return { start: startOfYear(refDate), end: endOfYear(refDate) };
    default:
      return { start: startOfMonth(refDate), end: endOfMonth(refDate) };
  }
}

function addPeriod(id, refDate, delta) {
  const d = new Date(refDate);
  switch (id) {
    case "month":
      d.setMonth(d.getMonth() + delta);
      return d;
    case "quarter":
      d.setMonth(d.getMonth() + delta * 3);
      return d;
    case "half":
      d.setMonth(d.getMonth() + delta * 6);
      return d;
    case "year":
      d.setFullYear(d.getFullYear() + delta);
      return d;
    default:
      d.setMonth(d.getMonth() + delta);
      return d;
  }
}

describe("Dropbar (component) - Cypress", () => {
  const items = [
    { id: "month", label: "Місяць" },
    { id: "quarter", label: "Квартал" },
    { id: "half", label: "Півріччя" },
    { id: "year", label: "Рік" },
  ];

  it("renders selected label (defaults to first item) and opens menu, focuses first item", () => {
    mount(<Dropbar items={items} placeholder="Select period" />);

    cy.get('button[aria-haspopup="menu"]').should(
      "contain.text",
      items[0].label,
    );
    cy.get('button[aria-haspopup="menu"]').should("contain.text", "—"); // range dash present

    cy.get('button[aria-haspopup="menu"]').click();
    cy.get('[role="menu"]').should("exist");
    cy.get('[role="menuitem"]').first().should("exist").and("have.focus");
  });

  it("selecting an item emits onChange with id/label/start/end/refDate and focuses toggle", () => {
    const onChange = cy.stub().as("onChange");
    mount(<Dropbar items={items} onChange={onChange} />);

    cy.get('button[aria-haspopup="menu"]').click();
    cy.get('[role="menuitem"]').contains("Місяць").click();

    cy.get("@onChange").its("callCount").should("be.gte", 1);
    cy.get("@onChange").then((stub) => {
      expect(stub).to.exist;
      const call = stub.getCall(0);
      expect(call).to.exist;
      const payload = call.args[0];
      expect(payload).to.have.property("id", "month");
      expect(payload).to.have.property("label", "Місяць");
      expect(payload).to.have.property("refDate");

      const ref = new Date(payload.refDate);
      const expected = getPeriodRange("month", ref);
      expect(new Date(payload.start).getTime()).to.equal(
        expected.start.getTime(),
      );
      expect(new Date(payload.end).getTime()).to.equal(expected.end.getTime());
    });

    cy.get('button[aria-haspopup="menu"]').should("have.focus");
  });

  it("respects controlled value prop and shows selected label", () => {
    const onChange = cy.stub().as("onChange");
    mount(<Dropbar items={items} value="year" onChange={onChange} />);

    cy.get('button[aria-haspopup="menu"]').should("contain.text", "Рік");

    cy.get('button[aria-haspopup="menu"]').click();
    cy.get('[role="menuitem"]').contains("Місяць").click();
    cy.get("@onChange").its("callCount").should("be.gte", 1);
  });

  it("clicking outside closes the menu", () => {
    mount(<Dropbar items={items} />);
    cy.get('button[aria-haspopup="menu"]').click();
    cy.get('[role="menu"]').should("exist");

    cy.document().trigger("mousedown", { clientX: 0, clientY: 0 });

    cy.get('[role="menu"]').should("not.exist");
  });
});
