import React from "react";
import { mount } from "cypress/react";
import MonthNav from "../../../src/pages/Home/components/MonthNav/MonthNav";
function monthLabel(date) {
  const monthNames = [
    "січ", "лют", "бер", "кві", "тра", "чер",
    "лип", "сер", "вер", "жов", "лис", "гру"
  ];
  return `${monthNames[date.getMonth()]}. ${date.getFullYear()}`;
}

describe("MonthNav component", () => {
  it("renders the month label for given month/year", () => {
    mount(<MonthNav month={12} year={2025} />);

    const expected = monthLabel(new Date(2025, 11, 1)); // month param is 1-based
    cy.get(".monthLabel, [class*='monthLabel']").should("contain.text", expected);
  });

  it("calls onChange with previous month correctly", () => {
    const onChange = cy.stub().as("onChange");
    mount(<MonthNav month={1} year={2025} onChange={onChange} />);

    cy.get('button[aria-label="Previous month"]').click();
    cy.get("@onChange").should("have.been.calledOnce");
    cy.get("@onChange").then((stub) => {
      const arg = stub.getCall(0).args[0];
      expect(arg).to.deep.equal({ month: 12, year: 2024 });
    });
  });

  it("calls onChange with next month correctly", () => {
    const onChange = cy.stub().as("onChange");
    mount(<MonthNav month={12} year={2025} onChange={onChange} />);

    cy.get('button[aria-label="Next month"]').click();
    cy.get("@onChange").should("have.been.calledOnce");
    cy.get("@onChange").then((stub) => {
      const arg = stub.getCall(0).args[0];
      expect(arg).to.deep.equal({ month: 1, year: 2026 });
    });
  });

  it("updates label after prop change (controlled scenario)", () => {
    const Wrapper = ({ initialMonth = 5, initialYear = 2023 }) => {
      const [m, setM] = React.useState(initialMonth);
      const [y, setY] = React.useState(initialYear);
      return (
        <div>
          <button id="inc" onClick={() => {
            const d = new Date(y, m - 1, 1);
            d.setMonth(d.getMonth() + 1);
            setM(d.getMonth() + 1);
            setY(d.getFullYear());
          }}>inc</button>

          <MonthNav month={m} year={y} />
        </div>
      );
    };

    mount(<Wrapper initialMonth={11} initialYear={2025} />);

    cy.get(".monthLabel, [class*='monthLabel']").should("contain.text", monthLabel(new Date(2025, 10, 1)));

    cy.get("#inc").click();
    cy.get(".monthLabel, [class*='monthLabel']").should("contain.text", monthLabel(new Date(2025, 11, 1)));
  });

  it("buttons have accessible aria-labels", () => {
    mount(<MonthNav month={6} year={2024} />);
    cy.get('button[aria-label="Previous month"]').should("exist");
    cy.get('button[aria-label="Next month"]').should("exist");
  });
});
