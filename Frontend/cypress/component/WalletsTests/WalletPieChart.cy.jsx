import React from "react";
import { mount } from "cypress/react";
import WalletsPiChart from "../../../src/pages/Wallets/components/WalletsPiChart/WalletsPiChart";
function fmt(n) {
  if (n == null) return "-";
  return (
    new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n) +
    "$"
  );
}

function hexToRgbString(hex) {
  if (!hex) return null;
  const h = hex.replace("#", "");
  const bigint = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16,
  );
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgb(${r}, ${g}, ${b})`;
}

describe("WalletsPiChart (Cypress component) - fixed assertions", () => {
  const baseSegments = [
    {
      id: "s1",
      label: "Main",
      value: 100,
      color: "#FF9F1C",
      wallets: ["Main account"],
    },
    {
      id: "s2",
      label: "Savings",
      value: 200,
      color: "#17E66A",
      wallets: ["Savings A", "Savings B"],
    },
    { id: "s3", label: "Other", value: 50, color: "#FF1E2D" },
  ];

  it("renders pie segments, legend and total correctly", () => {
    mount(
      <div style={{ width: 600 }}>
        <WalletsPiChart segments={baseSegments} />
      </div>,
    );

    const total = baseSegments.reduce(
      (s, it) => s + (Number(it.value) || 0),
      0,
    );

    cy.get("[data-cy=pie-segment]", { timeout: 10000 }).should(
      "have.length",
      baseSegments.length,
    );

    cy.get("ul").find("li").should("have.length", baseSegments.length);

    cy.contains("Загальна сума:").should("exist");
    cy.contains(fmt(total)).should("exist");

    cy.get("ul li")
      .first()
      .within(() => {
        cy.get("span")
          .first()
          .should(($dot) => {
            const styleBg =
              $dot.prop("style").background || $dot.css("background");
            const expectedRgb = hexToRgbString(baseSegments[0].color);
            expect(styleBg).to.include(expectedRgb.replace(/\s+/g, " "));
          });

        const pct = Math.round((baseSegments[0].value / total) * 100);
        cy.contains(baseSegments[0].label).should("exist");
        cy.contains(`${pct}%`).should("exist");
        cy.contains(fmt(baseSegments[0].value)).should("exist");
      });
  });

  it('renders wallets as pills under the legend by default (walletsPosition="under")', () => {
    mount(
      <div style={{ width: 600 }}>
        <WalletsPiChart segments={baseSegments} walletsPosition="under" />
      </div>,
    );

    cy.get("ul li")
      .eq(1)
      .within(() => {
        cy.contains("Savings A").should("exist");
        cy.contains("Savings B").should("exist");
      });
  });

  it('renders wallets inline when walletsPosition="beside"', () => {
    mount(
      <div style={{ width: 600 }}>
        <WalletsPiChart segments={baseSegments} walletsPosition="beside" />
      </div>,
    );

    cy.get("ul li")
      .eq(1)
      .within(() => {
        cy.contains("Savings A, Savings B").should("exist");
      });
  });

  it("handles empty segments and null values (component maps null -> 0)", () => {
    mount(
      <div style={{ width: 600 }}>
        <WalletsPiChart segments={[]} />
      </div>,
    );

    cy.get("[data-cy=pie-segment]", { timeout: 10000 }).should(
      "have.length",
      0,
    );
    cy.contains("0$").should("exist");

    mount(
      <div style={{ width: 600, marginTop: 20 }}>
        <WalletsPiChart
          segments={[{ id: "n1", label: "NullVal", value: null }]}
        />
      </div>,
    );

    cy.contains("NullVal").should("exist");
    cy.get("ul li")
      .first()
      .within(() => {
        cy.contains("0%").should("exist");
        cy.contains("0$").should("exist");
      });
  });
});
