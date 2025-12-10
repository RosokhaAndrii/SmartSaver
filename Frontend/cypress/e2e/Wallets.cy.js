describe("Wallets page", () => {
  const api = Cypress.env("API_URL") || "http://localhost:8080";

  function visitWithToken({ intercepts = [] } = {}) {
    const defaultAuth = {
      method: "GET",
      url: "**/api/auth/me",
      handler: (req) => {
        req.reply({
          statusCode: 200,
          body: { id: 1, name: "user", email: "user@example.com" },
        });
      },
      alias: "getAuth",
    };

    const defaultWalletsGet = {
      url: "**/api/wallets*",
      fixture: "wallets.json",
      alias: "getWallets",
    };

    const hasAuthIntercept = intercepts.some(
      (i) => i.url && i.url.includes("/api/auth/me"),
    );
    const hasWalletsIntercept = intercepts.some(
      (i) =>
        i.url &&
        i.url.includes("/api/wallets") &&
        (i.method || "GET") === "GET",
    );

    const allIntercepts = [];
    if (!hasAuthIntercept) allIntercepts.push(defaultAuth);
    if (!hasWalletsIntercept) allIntercepts.push(defaultWalletsGet);
    allIntercepts.push(...intercepts);

    allIntercepts.forEach((i) => {
      const method = (i.method || "GET").toUpperCase();
      const alias = i.alias || `${method}:${i.url}`;
      if (i.handler) {
        cy.intercept(method, i.url, i.handler).as(alias);
      } else if (i.fixture) {
        cy.intercept(method, i.url, { fixture: i.fixture }).as(alias);
      } else {
        cy.intercept(method, i.url).as(alias);
      }
    });

    cy.visit("/wallets", {
      onBeforeLoad(win) {
        const token = "e2e-dummy-token";
        const user = { id: 1, name: "user", email: "user@example.com" };

        win.localStorage.setItem("authToken", token);
        win.localStorage.setItem("token", token);
        win.localStorage.setItem("access_token", token);
        win.localStorage.setItem("accessToken", token);
        win.localStorage.setItem("user", JSON.stringify(user));
        win.localStorage.setItem("currentUser", JSON.stringify(user));
        win.localStorage.setItem("__cypress_test_marker", "token-set");

        try {
          win.history.pushState = win.history.pushState.bind(win.history);
          win.history.replaceState = win.history.replaceState.bind(win.history);
        } catch (e) {}
      },
    });
  }

  beforeEach(() => {});

  it("renders wallets from API and shows chart + groups", () => {
    visitWithToken({});

    cy.wait("@getAuth", { timeout: 8000 });

    cy.wait("@getWallets", { timeout: 8000 });

    cy.get("main").should("exist");
    cy.contains("Main").should("exist");
    cy.contains("Savings").should("exist");
    cy.get("[data-cy=wallet-item]").should("have.length.gte", 1);
    cy.get("svg, canvas").should("exist");
  });

  it("creates a wallet (POST) and shows it in the list", () => {
    const CREATED_NAME = "Created Wallet";
    const CREATED_BALANCE = 500;
    const CREATED_TYPE = "bank";
    const CREATED_ID = 999;

    visitWithToken({
      intercepts: [
        {
          method: "POST",
          url: "**/api/wallets",
          handler: (req) => {
            expect(req.body).to.have.property("name");
            req.reply({
              statusCode: 201,
              body: {
                id: CREATED_ID,
                name: req.body.name,
                balance: req.body.balance,
                type: req.body.type,
              },
            });
          },
          alias: "postWallet",
        },
      ],
    });

    cy.wait("@getAuth", { timeout: 8000 });
    cy.wait("@getWallets", { timeout: 8000 }); // Wait for initial load

    cy.intercept("GET", "**/api/wallets*", (req) => {
      req.reply({
        statusCode: 200,
        body: [
          {
            id: CREATED_ID,
            name: CREATED_NAME,
            balance: CREATED_BALANCE,
            type: CREATED_TYPE,
          },
        ],
      });
    }).as("getWallets");

    cy.get("[data-cy=add-wallet]").click({ force: true });

    cy.get("[data-cy=wallet-title-input]").type(CREATED_NAME);
    cy.get("[data-cy=wallet-amount-input]").type(CREATED_BALANCE.toString());
    cy.get("[data-cy=wallet-type-select]").select("Банківський рахунок");

    cy.get("[data-cy=wallet-save]").click({ force: true });

    cy.wait("@postWallet", { timeout: 8000 });

    cy.wait("@getWallets", { timeout: 8000 });

    cy.contains(CREATED_NAME).should("exist");
    cy.contains(CREATED_BALANCE.toString()).should("exist");
  });

  it("edits a wallet (PUT) and updates UI", () => {
    const EDITED_NAME = "Edited Wallet";
    const EDITED_BALANCE = 777;
    const WALLET_ID = 10;
    const OLD_NAME = "Main Wallet";

    visitWithToken({
      intercepts: [
        {
          method: "PUT",
          url: "**/api/wallets/*",
          handler: (req) => {
            expect(req.body).to.have.property("name");
            const id = Number(req.url.split("/").pop());
            req.reply({
              statusCode: 200,
              body: {
                id,
                name: req.body.name,
                balance: req.body.balance,
                type: req.body.type,
              },
            });
          },
          alias: "putWallet",
        },
      ],
    });

    cy.wait("@getAuth", { timeout: 8000 });
    cy.wait("@getWallets", { timeout: 8000 });

    cy.intercept("GET", "**/api/wallets*", (req) => {
      req.reply({
        statusCode: 200,
        body: [
          {
            id: WALLET_ID,
            name: EDITED_NAME,
            balance: EDITED_BALANCE,
            type: "bank",
          },
        ],
      });
    }).as("getWallets");

    cy.get("[data-cy=wallet-item]")
      .first()
      .within(() => {
        cy.get("[data-cy=wallet-edit]").then(($els) => {
          if ($els.length) {
            cy.wrap($els.first()).click({ force: true });
          } else {
            cy.get('button[aria-label="Редагувати гаманець"]').click({
              force: true,
            });
          }
        });
      });

    cy.get("[data-cy=wallet-title-input]").clear().type(EDITED_NAME);
    cy.get("[data-cy=wallet-amount-input]")
      .clear()
      .type(EDITED_BALANCE.toString());

    cy.get("[data-cy=wallet-save]").click({ force: true });

    cy.wait("@putWallet", { timeout: 8000 });

    cy.wait("@getWallets", { timeout: 8000 });

    cy.contains(EDITED_NAME).should("exist");
    cy.contains(EDITED_BALANCE.toString()).should("exist");
  });

  it("deletes a wallet and removes it from UI", () => {
    visitWithToken({
      intercepts: [
        {
          method: "DELETE",
          url: "**/api/wallets/*",
          handler: (req) => {
            req.reply({ statusCode: 200, body: {} });
          },
          alias: "deleteWallet",
        },
      ],
    });

    cy.wait("@getAuth", { timeout: 8000 });
    cy.wait("@getWallets", { timeout: 8000 });

    cy.intercept("GET", "**/api/wallets*", (req) => {
      req.reply({ statusCode: 200, body: [] });
    }).as("getWallets");

    cy.get("[data-cy=wallet-item]")
      .first()
      .within(() => {
        cy.get("[data-cy=wallet-edit]").then(($els) => {
          if ($els.length) {
            cy.wrap($els.first()).click({ force: true });
          } else {
            cy.get('button[aria-label="Редагувати гаманець"]').click({
              force: true,
            });
          }
        });
      });

    cy.get("[data-cy=wallet-delete-btn]").click({ force: true });

    cy.wait("@deleteWallet", { timeout: 8000 });

    cy.wait("@getWallets", { timeout: 8000 });

    cy.fixture("wallets.json").then((list) => {
      if (list && list.length) {
        cy.contains(list[0].name).should("not.exist");
      }
    });
  });

  it("toggles hidden state (PUT) and updates UI", () => {
    visitWithToken({
      intercepts: [
        {
          method: "PUT",
          url: "**/api/wallets/*",
          handler: (req) => {
            const id = Number(req.url.split("/").pop());
            const payload = {
              id,
              name: req.body.name || "Toggled",
              balance: req.body.balance || 0,
              type: req.body.type || "bank",
              hidden: req.body.hidden,
            };
            req.reply({ statusCode: 200, body: payload });
          },
          alias: "putToggle",
        },
      ],
    });

    cy.wait("@getAuth", { timeout: 8000 });
    cy.wait("@getWallets", { timeout: 8000 });

    cy.intercept("GET", "**/api/wallets*", { fixture: "wallets.json" }).as(
      "getWallets",
    );

    cy.get("[data-cy=wallet-item]")
      .first()
      .within(() => {
        cy.get("[data-cy=wallet-toggle]").then(($els) => {
          if ($els.length) {
            cy.wrap($els.first()).click({ force: true });
          } else {
            cy.get("button[aria-pressed]").first().click({ force: true });
          }
        });
      });

    cy.wait("@putToggle", { timeout: 8000 });

    cy.wait("@getWallets", { timeout: 8000 });

    cy.get("[data-cy=wallet-item]").first().should("exist");
  });

  it("sends Authorization header on API requests", () => {
    visitWithToken({
      intercepts: [
        {
          url: "**/api/auth/me",
          handler: (req) =>
            req.reply({ statusCode: 200, body: { id: 1, name: "user" } }),
          alias: "getAuth",
        },
        {
          url: "**/api/wallets*",
          handler: (req) => {
            expect(req.headers).to.have.property("authorization");
            expect(req.headers.authorization).to.match(/^Bearer\s.+/);
            req.reply({ fixture: "wallets.json" });
          },
          alias: "getWalletsAuth",
        },
      ],
    });

    cy.wait("@getAuth", { timeout: 8000 });
    cy.wait("@getWalletsAuth", { timeout: 8000 });
  });
});
