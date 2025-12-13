import React from "react";
import { mount } from "cypress/react";
import Filter from "../../../src/pages/Transactions/components/Filter/Filter";

describe("<Filter />", () => {
  const defaults = {
    category: "",
    dateFrom: "",
    dateTo: "",
    notes: "",
    wallet: "",
    type: "all",
  };

  it("renders with default values", () => {
    mount(<Filter />);
    cy.get('input[name="category"]').should("have.value", "");
    cy.get('input[name="dateFrom"]').should("have.value", "");
    cy.get('input[name="dateTo"]').should("have.value", "");
    cy.get('input[name="notes"]').should("have.value", "");
    cy.get('input[name="wallet"]').should("have.value", "");
    cy.get('input[type="radio"][value="all"]').should("be.checked");
  });




  it("respects controlled value prop", () => {
    const Wrapper = () => {
      const [val, setVal] = React.useState({ category: "" });
      return (
        <>
          <button id="update" onClick={() => setVal({ category: "Updated" })}>
            Update
          </button>
          <Filter value={val} />
        </>
      );
    };

    mount(<Wrapper />);
    cy.get('input[name="category"]').should("have.value", "");
    cy.get("#update").click();
    cy.get('input[name="category"]').should("have.value", "Updated");
  });
});
