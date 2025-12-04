export function mockUseAuth(routes) {
  return cy.stub().callsFake((url, opts) => {
    const route = routes[url];
    if (!route) {
      throw new Error("No mock for URL " + url);
    }
    return Promise.resolve({   
      ok: true,
      json: () => Promise.resolve(route),
    });
  });
}
