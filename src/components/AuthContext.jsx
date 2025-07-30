import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token"),
    name: localStorage.getItem("name"),
    role: localStorage.getItem("role"),
    userId:localStorage.getItem("userId")
  });

  const login = ({ token, name, role,userId }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("name", name);
    localStorage.setItem("role", role);
    localStorage.setItem("userId",userId);
    setAuth({ token, name, role,userId });
  };

  const logout = () => {
    localStorage.clear();
    setAuth({ token: null, name: null, role: null,userId:null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
