import React, { useContext } from 'react';
import { AuthProvider, AuthContext } from '../../../src/components/AuthProvider/AuthProvider';

const TestComponent = () => {
  const { user, login, logout, loading, accessToken } = useContext(AuthContext);

  return (
    <div>
      {loading && <span data-cy="loading">Loading...</span>}
      {user ? <span data-cy="user">{user.email}</span> : <span data-cy="no-user">No User</span>}
      <span data-cy="token">{accessToken || 'no-token'}</span>
      <button
        data-cy="login-btn"
        onClick={() => login('test@example.com', 'password').catch(() => {})}
      >
        Login
      </button>
      <button data-cy="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    cy.window().then((win) => win.localStorage.clear());
  });

  it('shows loading initially and then no user', () => {
    cy.window().then((win) => {
      cy.stub(win, 'fetch').resolves({
        ok: false,
        json: async () => ({}),
      });
    });

    cy.mount(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    cy.get('[data-cy=loading]').should('exist');
    cy.get('[data-cy=no-user]').should('exist');
    cy.get('[data-cy=token]').should('contain', 'no-token');
  });

  it('verifies token on mount and sets user if valid', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'valid-token');

      cy.stub(win, 'fetch').resolves({
        ok: true,
        json: async () => ({ email: 'tokenuser@example.com' }),
      });
    });

    cy.mount(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    cy.get('[data-cy=loading]').should('not.exist');
    cy.get('[data-cy=user]').should('contain', 'tokenuser@example.com');
    cy.get('[data-cy=token]').should('contain', 'valid-token');
  });

  it('logs in successfully', () => {
    cy.window().then((win) => {
      cy.stub(win, 'fetch').resolves({
        ok: true,
        json: async () => ({
          accessToken: 'token123',
          user: { email: 'test@example.com' },
        }),
      });
    });

    cy.mount(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    cy.get('[data-cy=login-btn]').click();

    cy.get('[data-cy=token]').should('contain', 'token123');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.equal('token123');
    });
  });

  it('handles failed login', () => {
    cy.window().then((win) => {
      cy.stub(win, 'fetch').resolves({
        ok: false,
        json: async () => ({ error: 'Invalid credentials' }),
      });
    });

    cy.mount(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    cy.get('[data-cy=login-btn]').click();
    
    cy.get('[data-cy=no-user]').should('exist');
    cy.get('[data-cy=token]').should('contain', 'no-token');
  });

  it('logs out successfully', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'token123');

      cy.stub(win, 'fetch').resolves({
        ok: true,
        json: async () => ({ email: 'test@example.com' }),
      });
    });

    cy.mount(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    cy.get('[data-cy=logout-btn]').click();

    cy.get('[data-cy=no-user]').should('exist');
    cy.get('[data-cy=token]').should('contain', 'no-token');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null;
    });
  });
});
