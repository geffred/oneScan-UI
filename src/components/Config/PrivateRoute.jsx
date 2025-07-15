// src/components/PrivateRoute.js
import { jwtDecode } from "jwt-decode";
import { Navigate, Outlet } from "react-router-dom";

const isTokenValid = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

const PrivateRoute = () => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  return isTokenValid(token) ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
