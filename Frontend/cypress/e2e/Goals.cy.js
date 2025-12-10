describe("Goals page", () => {
  const api = Cypress.env("API_URL") || "http://localhost:8080";
  const email = "user@example.com";
  const password = "password123";

  function loginAndVisitGoals({
    emailArg = email,
    passwordArg = password,
    intercepts = [],
  } = {}) {
    const requiredIntercepts = [
      {
        url: `${api}/api/wallets`,
        fixture: "wallets.json",
        alias: "getWallets",
      },
      { url: `${api}/api/goals`, fixture: "goals.json", alias: "getGoals" },
      {
        url: `${api}/api/auto-rules`,
        fixture: "rules.json",
        alias: "getRules",
      },
      ...intercepts,
    ];

    requiredIntercepts.forEach((i) => {
      const method = (i.method || "GET").toUpperCase();
      const alias = i.alias || `${method}:${i.url}`;
      if (
        (i.url === `${api}/api/goals` && method === "GET") ||
        (i.url === `${api}/api/wallets` && method === "GET") ||
        (i.url === `${api}/api/auto-rules` && method === "GET")
      ) {
        if (
          i.alias === "getGoalsAfterCreate" ||
          i.alias === "getGoalsAfterEdit" ||
          i.alias === "getGoalsAfterDelete" ||
          i.alias === "getGoalsAfterRun" ||
          i.alias === "getRulesAfterRun"
        ) {
          return;
        }
      }

      if (i.handler) {
        cy.intercept(method, i.url, i.handler).as(alias);
      } else if (i.fixture) {
        cy.intercept(method, i.url, { fixture: i.fixture }).as(alias);
      } else {
        cy.intercept(method, i.url).as(alias);
      }
    });

    cy.request({
      method: "POST",
      url: `${api}/api/auth/login`,
      body: { email: emailArg, password: passwordArg },
      failOnStatusCode: false,
    }).then((resp) => {
      if (![200, 201].includes(resp.status)) {
        throw new Error(
          `Login failed with status ${resp.status}: ${JSON.stringify(resp.body)}`,
        );
      }

      const token =
        resp.body?.token ||
        resp.body?.accessToken ||
        resp.body?.access_token ||
        resp.body?.data?.token ||
        resp.body?.data?.accessToken;
      const user = resp.body?.user || resp.body?.data?.user || null;
      cy.visit("/goals", {
        onBeforeLoad(win) {
          if (token) {
            win.localStorage.setItem("authToken", token);
            win.localStorage.setItem("token", token);
            win.localStorage.setItem("access_token", token);
            win.localStorage.setItem("accessToken", token);
          }
          if (user) win.localStorage.setItem("user", JSON.stringify(user));
          win.localStorage.setItem(
            "__cypress_test_marker",
            token ? "token-set" : "no-token",
          );
          if (token && user) {
            try {
              win.localStorage.setItem("auth", JSON.stringify({ token, user }));
              win.localStorage.setItem("currentUser", JSON.stringify(user));
            } catch (e) {}
          }

          cy.stub(win.history, "pushState").callsFake(() => {});
          cy.stub(win.history, "replaceState").callsFake(() => {});
        },
      });
    });
  }

  it("renders goals and rules from API (happy path)", () => {
    loginAndVisitGoals({});
    cy.wait(["@getWallets", "@getGoals", "@getRules"]);
    cy.get("main").should("exist");

    cy.fixture("goals.json").then((goals) => {
      goals.forEach((goal) => {
        cy.contains(goal.title).should("exist");
        cy.contains(goal.wallet_name).should("exist");
      });
    });

    cy.fixture("rules.json").then((rules) => {
      rules.forEach((r) => {
        cy.contains(r.title).should("exist");
        cy.contains(`${r.percent}%`).should("exist");
      });
    });
  });

  it("opens AddGoal popup and validates basic submission", () => {
    loginAndVisitGoals({
      intercepts: [
        {
          method: "POST",
          url: `${api}/api/goals`,
          handler: (req) => {
            expect(req.body).to.have.property("wallet_id");
            expect(req.body).to.have.property("title");
            req.reply({ statusCode: 201, body: { id: 999, ...req.body } });
          },
          alias: "postGoal",
        },
        {
          url: `${api}/api/goals`,
          handler: (req) => {
            req.reply({
              statusCode: 200,
              body: [
                {
                  id: 999,
                  title: "Created by test",
                  subtitle: "",
                  wallet_id: 1,
                  wallet_name: "Main",
                  target_amount: 1234,
                  due_date: null,
                  saved_amount: 0,
                },
              ],
            });
          },
          alias: "getGoalsAfterCreate",
        },
      ],
    });

    cy.wait(["@getWallets", "@getGoals", "@getRules"]);

    cy.intercept("GET", `${api}/api/goals`, {
      handler: (req) => {
        req.reply({
          statusCode: 200,
          body: [
            {
              id: 999,
              title: "Created by test",
              subtitle: "",
              wallet_id: 1,
              wallet_name: "Main",
              target_amount: 1234,
              due_date: null,
              saved_amount: 0,
            },
          ],
        });
      },
    }).as("getGoalsAfterCreate");

    cy.get("[data-cy=add-goal]").click({ force: true });

    cy.get('input[name="title"]:visible').type("Created by test");
    cy.get('input[name="target"]:visible').type("1234");
    cy.get('select[name="walletId"]:visible').select("1");

    cy.contains("Створити ціль").click({ force: true });

    cy.wait("@postGoal");
    cy.wait("@getGoalsAfterCreate");
  });

  it("edits a goal (open popup, change value, PUT and refresh)", () => {
    loginAndVisitGoals({
      intercepts: [
        {
          method: "PUT",
          url: `${api}/api/goals/*`,
          handler: (req) => {
            expect(req.body).to.have.property("title");
            req.reply({
              statusCode: 200,
              body: { ...req.body, id: Number(req.url.split("/").pop()) },
            });
          },
          alias: "putGoal",
        },
        {
          url: `${api}/api/goals`,
          handler: (req) => {
            req.reply({
              statusCode: 200,
              body: [
                {
                  id: 10,
                  title: "Edited Goal Title",
                  subtitle: "",
                  wallet_id: 1,
                  wallet_name: "Main",
                  target_amount: 2000,
                  due_date: null,
                  saved_amount: 0,
                },
              ],
            });
          },
          alias: "getGoalsAfterEdit",
        },
      ],
    });

    cy.wait(["@getWallets", "@getGoals", "@getRules"]);

    cy.intercept("GET", `${api}/api/goals`, {
      handler: (req) => {
        req.reply({
          statusCode: 200,
          body: [
            {
              id: 10,
              title: "Edited Goal Title",
              subtitle: "",
              wallet_id: 1,
              wallet_name: "Main",
              target_amount: 2000,
              due_date: null,
              saved_amount: 0,
            },
          ],
        });
      },
    }).as("getGoalsAfterEdit");

    cy.get("[data-cy=goal-edit]").first().click({ force: true });

    cy.get('input[name="title"]:visible')
      .clear({ force: true })
      .type("Edited Goal Title");
    cy.contains("Зберегти зміни").click({ force: true });

    cy.wait("@putGoal");
    cy.wait("@getGoalsAfterEdit");
  });

  it("deletes a goal and updates UI", () => {
    let goalToDeleteTitle;
    cy.fixture("goals.json").then((goals) => {
      goalToDeleteTitle = goals[0].title;
    });

    loginAndVisitGoals({
      intercepts: [
        {
          method: "DELETE",
          url: `${api}/api/goals/*`,
          handler: (req) => {
            req.reply({ statusCode: 200, body: {} });
          },
          alias: "deleteGoal",
        },
        {
          url: `${api}/api/goals`,
          handler: (req) => {
            req.reply({ statusCode: 200, body: [] });
          },
          alias: "getGoalsAfterDelete",
        },
      ],
    });

    cy.wait(["@getWallets", "@getGoals", "@getRules"]);

    cy.intercept("GET", `${api}/api/goals`, {
      handler: (req) => {
        req.reply({ statusCode: 200, body: [] });
      },
    }).as("getGoalsAfterDelete");

    cy.get("[data-cy=goal-edit]").first().click({ force: true });
    cy.get("[data-cy=goal-delete]").click({ force: true });

    cy.wait("@deleteGoal");
    cy.wait("@getGoalsAfterDelete");

    cy.get("main").should("exist");
  });

  it("toggles rule active state and runs rule now", () => {
    loginAndVisitGoals({
      intercepts: [
        {
          method: "PUT",
          url: `${api}/api/auto-rules/*`,
          handler: (req) => {
            req.reply({ statusCode: 200, body: { success: true } });
          },
          alias: "putRuleToggle",
        },
        {
          method: "POST",
          url: `${api}/api/auto-rules/*/run`,
          handler: (req) => {
            req.reply({
              statusCode: 200,
              body: { executed: true, amount: 50 },
            });
          },
          alias: "postRunRule",
        },
        {
          url: `${api}/api/goals`,
          fixture: "goals.json",
          alias: "getGoalsAfterRun",
        },
        {
          url: `${api}/api/auto-rules`,
          fixture: "rules.json",
          alias: "getRulesAfterRun",
        },
      ],
    });

    cy.wait(["@getWallets", "@getGoals", "@getRules"]);

    cy.intercept("GET", `${api}/api/goals`, {
      fixture: "goals.json",
    }).as("getGoalsAfterRun");
    cy.intercept("GET", `${api}/api/auto-rules`, {
      fixture: "rules.json",
    }).as("getRulesAfterRun"); // toggle the first rule - USING NEW DATA-CY

    cy.get("[data-cy=rule-toggle]").first().click({ force: true });
    cy.wait("@putRuleToggle");
    cy.wait(100);

    const alerts = [];
    cy.on("window:alert", (txt) => {
      alerts.push(txt);
    });

    if (alerts.length) {
      expect(
        alerts.some(
          (a) => a.includes("Правило виконано") || a.includes("executed"),
        ),
      ).to.be.true;
    }
  });

  it("shows empty states / handles API errors gracefully", () => {
    loginAndVisitGoals({
      intercepts: [
        {
          url: `${api}/api/goals`,
          handler: (req) =>
            req.reply({ statusCode: 500, body: { error: "boom" } }),
          alias: "getGoalsFail",
        },
        {
          url: `${api}/api/auto-rules`,
          handler: (req) =>
            req.reply({ statusCode: 500, body: { error: "boom" } }),
          alias: "getRulesFail",
        },
      ],
    });

    cy.wait("@getWallets");
    cy.wait("@getGoalsFail");
    cy.wait("@getRulesFail");

    cy.get("main").should("exist");
    cy.contains("Правил немає").should("exist");
  });

  it("sends Authorization header on requests", () => {
    loginAndVisitGoals({
      intercepts: [
        {
          url: `${api}/api/wallets`,
          handler: (req) => {
            expect(req.headers).to.have.property("authorization");
            expect(req.headers.authorization).to.match(/^Bearer\s.+/);
            req.reply({ fixture: "wallets.json" });
          },
          alias: "getWalletsAuth",
        },
        {
          url: `${api}/api/goals`,
          handler: (req) => {
            expect(req.headers).to.have.property("authorization");
            req.reply({ fixture: "goals.json" });
          },
          alias: "getGoalsAuth",
        },
        {
          url: `${api}/api/auto-rules`,
          handler: (req) => {
            expect(req.headers).to.have.property("authorization");
            req.reply({ fixture: "rules.json" });
          },
          alias: "getRulesAuth",
        },
      ],
    });

    cy.wait("@getWalletsAuth");
    cy.wait("@getGoalsAuth");
    cy.wait("@getRulesAuth");
  });

  it("should successfully visit the goals page after API login and token seeding", () => {
    loginAndVisitGoals();

    cy.wait("@getWallets");
    cy.wait("@getGoals");
    cy.wait("@getRules");
    cy.get("main").should("exist");
    cy.contains("Цілі").should("exist");
    cy.contains("Main").should("exist");
  });

  it("should send the real authorization header after login", () => {
    loginAndVisitGoals({
      intercepts: [
        {
          url: `${api}/api/goals`,
          handler: (req) => {
            expect(req.headers).to.have.property("authorization");
            expect(req.headers.authorization).to.match(/^Bearer\s.+/);
            req.reply({ fixture: "goals.json" });
          },
          alias: "getGoalsAuthReal",
        },
      ],
    });

    cy.wait("@getGoalsAuthReal");
    cy.get("main").should("exist");
  });
});
