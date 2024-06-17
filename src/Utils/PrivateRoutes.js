import { Outlet, Navigate } from "react-router-dom";
import { useContext } from "react";
import AppContext from "../Utils/AppContext";

const PrivateRoutes = () => {
  let { user } = useContext(AppContext);

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoutes;
