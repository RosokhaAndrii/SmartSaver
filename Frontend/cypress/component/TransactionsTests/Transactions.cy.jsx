import React from "react";
import { mount } from "cypress/react";
import Transactions from "../../../src/pages/Transactions/Transactions";
import { AuthContext } from "../../../src/components/AuthProvider/AuthProvider";

const mountWithAuth = (ui) => {
  const authFetch = async () => ({ ok: true, json: async () => [] });
  return mount(<AuthContext.Provider value={{ authFetch }}>{ui}</AuthContext.Provider>);
};

describe("<Transactions /> — smoke", () => {
  it("renders the layout: filter (aside) is present", () => {
    mountWithAuth(<Transactions />);
    cy.get("aside").first().within(() => {
      cy.get("input, select, h1, h2, div").first().should("exist");
    });
  });



  it("renders AddTransaction button", () => {
    mountWithAuth(<Transactions />);
    cy.contains("Додати транзакцію").should("exist");
  });

  it("does not show the transaction popup by default", () => {
    mountWithAuth(<Transactions />);
    cy.contains("Нова транзакція").should("not.exist");
    cy.contains("Редагувати транзакцію").should("not.exist");
  });
});
