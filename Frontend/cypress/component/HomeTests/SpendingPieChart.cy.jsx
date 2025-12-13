import React from 'react';
import { mount } from 'cypress/react';
import SpendingPieChart from '../../../src/pages/Home/components/SpendingPieChart/SpendingPieChart';
function hexToRgb(hex) {
  const c = hex.replace('#', '');
  const n = parseInt(c, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgb(${r}, ${g}, ${b})`;
}

describe('SpendingPieChart (component)', () => {
  const sampleData = [
    { name: 'Food', value: 100, color: '#FF9800' },
    { name: 'Rent', value: 300, color: '#4CAF50' },
    { name: 'Other', value: 50, color: '#F44336' },
  ];

  function mountChart(node) {
    mount(<div style={{ width: 600 }}>{node}</div>);
  }

  it('renders pie sectors and legend items for provided data', () => {
    mountChart(<SpendingPieChart data={sampleData} />);

    cy.wait(50);

        cy.get('path.recharts-sector').should('have.length', sampleData.length);

    cy.get('ul').find('li').should('have.length', sampleData.length);

    cy.get('ul')
      .find('li')
      .first()
      .should('contain.text', 'Food - 100$');
  });

  it('renders fallback "Немає даних" when given empty data', () => {
    mountChart(<SpendingPieChart data={[]} />);
    cy.wait(50);

    cy.get('path.recharts-sector').should('have.length', 1);
    cy.get('ul').find('li').should('have.length', 1);
    cy.get('ul').find('li').first().should('contain.text', 'Немає даних - 1$');
  });

  it('applies provided colors to legend dots / cells', () => {
    mountChart(<SpendingPieChart data={sampleData} />);
    cy.wait(50);

    cy.get('ul').find('li').first().within(() => {
      cy.get('span')
        .first()
        .should(($dot) => {
          const bg = $dot.prop('style').backgroundColor || $dot.css('background-color') || $dot.css('background');
          expect(bg).to.equal(hexToRgb(sampleData[0].color));
        });
    });

    cy.get('path.recharts-sector').should('have.length', sampleData.length);
  });
});
