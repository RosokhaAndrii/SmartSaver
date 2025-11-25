import { useContext } from "react";
import { AuthContext } from "../../components/AuthProvider/AuthProvider";
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};