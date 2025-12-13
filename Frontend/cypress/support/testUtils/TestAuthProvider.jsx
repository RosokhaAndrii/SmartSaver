import React from 'react';
import { AuthContext } from '../../../src/components/AuthProvider/AuthProvider';

export function TestAuthProvider({ children }) {
  const auth = {
    authFetch: (url, opts) => fetch(url, opts), // або кастомний stub
  };

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
