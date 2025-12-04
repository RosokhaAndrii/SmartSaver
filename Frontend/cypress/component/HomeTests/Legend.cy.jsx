import React from "react";
import { mount } from "cypress/react";
import Legend from "../../../src/pages/Home/components/Legend/Legend";
describe("<Legend />", () => {
  const sampleData = [
    { name: "Food", value: 120, color: "#ff0000" },
    { name: "Transport", value: 80, color: "#00ff00" },
    { name: "Shopping", value: 50, color: "#0000ff" },
  ];

  it("renders a list item for each data entry", () => {
    mount(<Legend data={sampleData} />);

    cy.get("li").should("have.length", sampleData.length);
  });

  it("displays correct text content for each item", () => {
    mount(<Legend data={sampleData} />);

    sampleData.forEach((item) => {
      cy.contains(`${item.name} - ${item.value}$`).should("exist");
    });
  });

  it("applies the correct dot color", () => {
    mount(<Legend data={sampleData} />);

    sampleData.forEach((item, index) => {
      cy.get("li")
        .eq(index)
        .find("span")
        .should("have.css", "background-color", convertHexToRgb(item.color));
    });
  });

  function convertHexToRgb(hex) {
    const h = hex.replace("#", "");
    const bigint = parseInt(h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgb(${r}, ${g}, ${b})`;
  }
});
