describe("Transactions page", () => {
  const api = Cypress.env("API_URL") || "http://localhost:8080";

  function visitWithToken({ intercepts = [] } = {}) {
    const defaultAuth = {
      method: "GET",
      url: "**/api/auth/me",
      handler: (req) =>
        req.reply({
          statusCode: 200,
          body: { id: 1, name: "user", email: "user@example.com" },
        }),
      alias: "getAuth",
    };

    const defaultWallets = {
      url: `${api}/api/wallets`,
      fixture: "wallets.json",
      alias: "getWallets",
    };
    const defaultCategories = {
      url: `${api}/api/categories`,
      fixture: "categories.json",
      alias: "getCategories",
    };
    const defaultTx = {
      url: `${api}/api/transactions`,
      fixture: "transactions.json",
      alias: "getTx",
    };

    const hasAuth = intercepts.some(
      (i) => i.url && i.url.includes("/api/auth/me"),
    );
    const allIntercepts = hasAuth ? intercepts : [defaultAuth, ...intercepts];

    const ensure = (arr, def) => {
      if (!arr.some((i) => i.url === def.url)) {
        arr.unshift(def);
      }
    };

    ensure(allIntercepts, defaultWallets);
    ensure(allIntercepts, defaultCategories);
    ensure(allIntercepts, defaultTx);

    allIntercepts.forEach((i) => {
      const method = (i.method || "GET").toUpperCase();
      const alias = i.alias || `${method}:${i.url}`;
      if (i.handler) cy.intercept(method, i.url, i.handler).as(alias);
      else if (i.fixture)
        cy.intercept(method, i.url, { fixture: i.fixture }).as(alias);
      else cy.intercept(method, i.url).as(alias);
    });

    cy.visit("/transactions", {
      onBeforeLoad(win) {
        const token = "e2e-dummy-token";
        const user = { id: 1, name: "e2e", email: "user@example.com" };
        win.localStorage.setItem("authToken", token);
        win.localStorage.setItem("token", token);
        win.localStorage.setItem("access_token", token);
        win.localStorage.setItem("accessToken", token);
        win.localStorage.setItem("user", JSON.stringify(user));
        win.localStorage.setItem("currentUser", JSON.stringify(user));
        win.localStorage.setItem("__cypress_test_marker", "token-set");
        try {
          win.history.pushState = win.history.pushState.bind(win.history);
        } catch (e) {}
        try {
          win.history.replaceState = win.history.replaceState.bind(win.history);
        } catch (e) {}
      },
    });
  }

  function maybeSelect(selectSelector, valueOrText) {
    return cy.get("body").then(() => {
      const $sels = Cypress.$(selectSelector);
      if (!$sels.length) return;
      for (let i = 0; i < $sels.length; i += 1) {
        const $sel = Cypress.$($sels[i]);
        const $optByVal = $sel.find(`option[value="${valueOrText}"]`);
        if ($optByVal.length) {
          cy.wrap($sels[i]).select($optByVal.first().val());
          return;
        }
        const $optByText = $sel
          .find("option")
          .filter(
            (j, el) => (el.textContent || "").trim() === String(valueOrText),
          );
        if ($optByText.length) {
          cy.wrap($sels[i]).select($optByText.first().val());
          return;
        }
        const $optByPartial = $sel
          .find("option")
          .filter((j, el) =>
            (el.textContent || "").includes(String(valueOrText)),
          );
        if ($optByPartial.length) {
          cy.wrap($sels[i]).select($optByPartial.first().val());
          return;
        }
      }
    });
  }

  function maybeClickButtonByText(matcher) {
    return cy.get("body").then(() => {
      const $btns = Cypress.$("button");
      let found = null;
      $btns.each((i, el) => {
        const t = (el.textContent || "").trim();
        if (matcher instanceof RegExp ? matcher.test(t) : t === matcher) {
          found = el;
          return false;
        }
      });
      if (found) cy.wrap(found).click({ force: true });
    });
  }

  it("renders transactions, wallets and categories (happy path)", () => {
    visitWithToken({});

    cy.wait("@getAuth", { timeout: 8000 });
    cy.wait(["@getWallets", "@getCategories", "@getTx"], { timeout: 8000 }); // NOTE: Using non-glob aliases here

    cy.get("main").should("exist");

    cy.fixture("transactions.json").then((txs) => {
      if (!txs || !txs.length) return;
      const tx = txs[0];

      const visibleText = tx.description || tx.wallet_name;
      cy.get(".txRow, [data-cy=tx-item]").should("be.visible");
    });
  });

  it("filters transactions by wallet, notes and type", () => {
    visitWithToken({
      intercepts: [
        { url: "**/api/wallets", fixture: "wallets.json", alias: "getWallets" },
        {
          url: "**/api/categories",
          fixture: "categories.json",
          alias: "getCategories",
        },
        {
          url: "**/api/transactions",
          fixture: "transactions.json",
          alias: "getTx",
        },
      ],
    });

    cy.wait("@getAuth");
    cy.wait("@getWallets");
    cy.wait("@getCategories");
    cy.wait("@getTx");

    cy.get("main").should("exist");

    cy.get("body").then(() => {
      if (Cypress.$('input[placeholder="Гаманець"]').length)
        cy.get('input[placeholder="Гаманець"]').clear().type("Main");
      else maybeSelect("select", "Main");
    });

    cy.get("body").then(() => {
      if (Cypress.$('input[placeholder="Пошук по нотатках"]').length)
        cy.get('input[placeholder="Пошук по нотатках"]').clear().type("Lunch");
    });

    cy.get("body").then(() => {
      maybeSelect("select", "expense");
    });

    cy.get("main").should("exist");
  });

  it("adds a new transaction (POST) and shows it in the list", () => {
    const NEW_TX_AMOUNT = "42";
    const NEW_TX_DATE = "2025-12-01";
    const NEW_TX_NOTE = "Created by test";
    const WALLET_ID = "1";

    visitWithToken({
      intercepts: [
        {
          method: "POST",
          url: "**/api/transactions",
          handler: (req) => {
            expect(req.body).to.have.property("wallet_id");
            req.reply({
              statusCode: 201,
              body: {
                id: 9999,
                amount: req.body.amount,
                date: req.body.date,
                description: NEW_TX_NOTE,
                wallet_name: "Main",
              },
            });
          },
          alias: "postTx",
        },
      ],
    });

    cy.wait("@getAuth");
    cy.wait("@getWallets");
    cy.wait("@getCategories");
    cy.wait("@getTx");

    cy.intercept("GET", "**/api/transactions*", (req) => {
      req.reply({
        statusCode: 200,
        body: [
          {
            id: 9999,
            amount: NEW_TX_AMOUNT,
            description: NEW_TX_NOTE,
            wallet_name: "Main",
          },
        ],
      });
    }).as("getTx");

    cy.contains(/Додати транзакцію|Add transaction/i).click({ force: true });

    cy.get('input[name="amount"]')
      .should("be.visible")
      .clear()
      .type(NEW_TX_AMOUNT);
    cy.get('input[name="date"]').clear().type(NEW_TX_DATE);

    maybeSelect('select[name="wallet"]', WALLET_ID);
    maybeSelect('select[name="category"]', "10"); // category select

    cy.get('textarea[name="note"]').clear().type(NEW_TX_NOTE);

    maybeClickButtonByText(/Створити|Create|Save/);

    cy.wait("@postTx", { timeout: 8000 });
    cy.wait("@getTx", { timeout: 8000 });

    cy.contains(NEW_TX_NOTE).should("exist");
    cy.contains(NEW_TX_AMOUNT).should("exist");
  });

  it("edits an existing transaction (PUT) and updates UI", () => {
    const EDITED_AMOUNT = "77";
    const EDITED_NOTE = "Edited by test";

    visitWithToken({
      intercepts: [
        { url: "**/api/wallets", fixture: "wallets.json", alias: "getWallets" },
        {
          url: "**/api/categories",
          fixture: "categories.json",
          alias: "getCategories",
        },
        {
          url: "**/api/transactions",
          fixture: "transactions.json",
          alias: "getTx",
        },

        {
          method: "PUT",
          url: "**/api/transactions/*",
          handler: (req) => {
            const id = Number(req.url.split("/").pop());
            req.reply({
              statusCode: 200,
              body: {
                id,
                amount: EDITED_AMOUNT,
                description: EDITED_NOTE,
                wallet_name: "Main",
              },
            });
          },
          alias: "putTx",
        },
      ],
    });

    cy.wait("@getAuth");
    cy.wait("@getWallets");
    cy.wait("@getCategories");
    cy.wait("@getTx");

    cy.intercept("GET", "**/api/transactions*", (req) => {
      req.reply({
        statusCode: 200,
        body: [
          {
            id: 1,
            amount: EDITED_AMOUNT,
            description: EDITED_NOTE,
            wallet_name: "Main",
          },
        ],
      });
    }).as("getTx");

    cy.get(".txRow, [data-cy=tx-item]").first().click({ force: true });
  });

  it("deletes transactions and updates the UI (DELETE)", () => {
    const TX_DESC_TO_DELETE = "Lunch"; // Assuming this is the description of the first transaction

    visitWithToken({
      intercepts: [
        { url: "**/api/wallets", fixture: "wallets.json", alias: "getWallets" },
        {
          url: "**/api/categories",
          fixture: "categories.json",
          alias: "getCategories",
        },
        {
          url: "**/api/transactions",
          fixture: "transactions.json",
          alias: "getTx",
        },

        {
          method: "DELETE",
          url: "**/api/transactions/*",
          handler: (req) => req.reply({ statusCode: 200, body: {} }),
          alias: "deleteTx",
        },
      ],
    });

    cy.wait("@getAuth");
    cy.wait("@getWallets");
    cy.wait("@getCategories");
    cy.wait("@getTx");

    cy.on("window:confirm", () => true);

    cy.intercept("GET", "**/api/transactions*", (req) => {
      req.reply({ statusCode: 200, body: [] }); // Returns empty list
    }).as("getTx");

    cy.get(".txRow, [data-cy=tx-item]")
      .first()
      .should("be.visible")
      .click({ force: true });

    maybeClickButtonByText(/Видалити|Delete/i);

    cy.wait("@deleteTx", { timeout: 8000 });
    cy.wait("@getTx", { timeout: 8000 }); // Wait for refresh

    cy.contains(TX_DESC_TO_DELETE).should("not.exist");
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
          url: "**/api/wallets",
          handler: (req) => {
            expect(req.headers).to.have.property("authorization");
            expect(req.headers.authorization).to.match(/^Bearer\s.+/);
            req.reply({ fixture: "wallets.json" });
          },
          alias: "getWalletsAuth",
        },

        {
          url: "**/api/categories",
          handler: (req) => {
            expect(req.headers).to.have.property("authorization");
            expect(req.headers.authorization).to.match(/^Bearer\s.+/);
            req.reply({ fixture: "categories.json" });
          },
          alias: "getCategoriesAuth",
        },

        {
          url: "**/api/transactions",
          handler: (req) => {
            expect(req.headers).to.have.property("authorization");
            expect(req.headers.authorization).to.match(/^Bearer\s.+/);
            req.reply({ fixture: "transactions.json" });
          },
          alias: "getTxAuth",
        },
      ],
    });

    cy.wait("@getAuth", { timeout: 8000 });
    cy.wait("@getWalletsAuth", { timeout: 8000 });
    cy.wait("@getCategoriesAuth", { timeout: 8000 });
    cy.wait("@getTxAuth", { timeout: 8000 });
  });
});
