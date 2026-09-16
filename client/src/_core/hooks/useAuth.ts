import { useState, useEffect } from "react";
import { toast } from "sonner";
import { db, User } from "../../lib/mockDb";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedId = localStorage.getItem("dh_auth_id");
    if (storedId) {
      const u = db.getUser(storedId);
      if (u) {
        setUser(u);
        setIsAuthenticated(true);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (role: "subscriber" | "admin" = "subscriber") => {
    const users = db.getUsers();
    const mockUser = users.find(u => u.role === role) || users[0];

    localStorage.setItem("dh_auth_id", mockUser.id);
    setUser(mockUser);
    setIsAuthenticated(true);
    toast.success(`Welcome back, ${mockUser.name}.`);
  };

  const logout = () => {
    localStorage.removeItem("dh_auth_id");
    setUser(null);
    setIsAuthenticated(false);
    toast.success("Logged out successfully.");
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
