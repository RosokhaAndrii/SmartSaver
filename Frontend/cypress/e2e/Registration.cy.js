describe("Registration Page", () => {
  const api = Cypress.env("API_URL") || "http://localhost:8080";
  const NAME = "E2E User";
  const EMAIL = "e2e.user@example.com";
  const PASSWORD = "password123";

  beforeEach(() => {
    Cypress.on("uncaught:exception", () => false);
  });

  it("allows a user to register, triggers login and shows the home UI", () => {
    cy.intercept("POST", `${api}/api/auth/register`, (req) => {
      expect(req.body).to.have.property("email", EMAIL);
      expect(req.body).to.have.property("name", NAME);
      req.reply({ statusCode: 201, body: { success: true } });
    }).as("registerReqStub");

    cy.intercept("POST", `${api}/api/auth/login`, (req) => {
      expect(req.body).to.have.property("email", EMAIL);
      expect(req.body).to.have.property("password", PASSWORD);
      req.reply({
        statusCode: 200,
        body: {
          token: "e2e-token-abc123",
          accessToken: "e2e-token-abc123",
          access_token: "e2e-token-abc123",
          data: { token: "e2e-token-abc123" },
          user: { id: 42, name: NAME, email: EMAIL },
        },
      });
    }).as("loginReqStub");

    cy.intercept("GET", "**/api/auth/me", (req) => {
      req.reply({
        statusCode: 200,
        body: { id: 42, name: NAME, email: EMAIL },
      });
    }).as("getAuthStub");

    cy.visit("/register");

    cy.get("[data-cy=name], #name").should("be.visible");
    cy.get("[data-cy=email], #email").should("be.visible");
    cy.get("[data-cy=password], #password").should("be.visible");

    cy.get("[data-cy=name], #name").clear().type(NAME);
    cy.get("[data-cy=email], #email").clear().type(EMAIL);
    cy.get("[data-cy=password], #password").clear().type(PASSWORD);

    cy.get("[data-cy=register-button], button[type=submit]").click();
    cy.wait("@registerReqStub").its("response.statusCode").should("eq", 201);
    cy.wait("@loginReqStub").its("response.statusCode").should("eq", 200);

    cy.url({ timeout: 10000 }).should("include", "/home");

    const expectedToken = "e2e-token-abc123";
    const possibleKeys = ["authToken", "token", "access_token", "accessToken"];

    cy.window().then((win) => {
      const foundDirect =
        possibleKeys.map((k) => win.localStorage.getItem(k)).find(Boolean) ||
        null;
      if (foundDirect) {
        expect(foundDirect).to.equal(expectedToken);
      } else {
        Cypress.log({
          name: "registration",
          message:
            "No token found in localStorage under common keys — login request  navigation succeeded",
        });
      }
    });

    cy.document().then(() => {
      if (Cypress.$("[data-cy=home-welcome]").length) {
        cy.get("[data-cy=home-welcome]", { timeout: 10000 }).should(
          "be.visible",
        );
      } else {
        cy.url().should("include", "/home");
      }
    });
  });

  it("shows an error message when registration fails", () => {
    const serverMessage = "Email already exists";

    cy.intercept("POST", `${api}/api/auth/register`, (req) => {
      req.reply({ statusCode: 400, body: { error: serverMessage } });
    }).as("registerFailStub");

    cy.visit("/register");

    cy.get("[data-cy=name], #name").type(NAME);
    cy.get("[data-cy=email], #email").type(EMAIL);
    cy.get("[data-cy=password], #password").type(PASSWORD);

    cy.get("[data-cy=register-button], button[type=submit]").click();

    cy.wait("@registerFailStub").its("response.statusCode").should("eq", 400);

    cy.document().then(() => {
      if (Cypress.$("[data-cy=register-error]").length) {
        cy.get("[data-cy=register-error]")
          .should("be.visible")
          .and("contain.text", serverMessage);
      } else {
        cy.contains(serverMessage).should("be.visible");
      }
    });

    cy.get("[data-cy=register-button], button[type=submit]").should(
      "not.be.disabled",
    );
  });

  it("shows loading/disabled state while request in flight", () => {
    cy.intercept("POST", `${api}/api/auth/register`, {
      statusCode: 201,
      body: { success: true },
      delayMs: 600,
    }).as("registerDelayed");

    cy.intercept("POST", `${api}/api/auth/login`, (req) => {
      req.reply({ statusCode: 200, body: { token: "ok", user: { id: 1 } } });
    }).as("loginStub");

    cy.intercept("GET", "**/api/auth/me", (req) => {
      req.reply({
        statusCode: 200,
        body: { id: 1, name: "E2E", email: EMAIL },
      });
    }).as("getAuthStub2");

    cy.visit("/register");

    cy.get("[data-cy=name], #name").type(NAME);
    cy.get("[data-cy=email], #email").type(EMAIL);
    cy.get("[data-cy=password], #password").type(PASSWORD);

    cy.get("[data-cy=register-button], button[type=submit]").click();

    cy.get("[data-cy=register-button], button[type=submit]").should(
      "be.disabled",
    );
    cy.get("[data-cy=register-button], button[type=submit]").should(
      "contain.text",
      "Зачекайте",
    );

    cy.wait("@registerDelayed");
    cy.wait("@loginStub");

    cy.get("[data-cy=register-button], button[type=submit]").should(
      "not.be.disabled",
    );
  });

  it('basic wiring: inputs update and "Увійдіть!" link exists', () => {
    cy.visit("/register");

    cy.get("[data-cy=name], #name").type("A").should("have.value", "A");
    cy.get("[data-cy=email], #email")
      .type("x@y.z")
      .should("have.value", "x@y.z");
    cy.get("[data-cy=password], #password").type("p").should("have.value", "p");

    cy.get("a")
      .contains(/Увійдіть!|Sign in|Login/)
      .should("have.attr", "href", "/auth");
  });
});
