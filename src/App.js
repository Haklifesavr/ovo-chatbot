import { Button } from "@chakra-ui/react";
import Login from "./components/Login/Login";
import {
  Navigate,
  Route,
  BrowserRouter,
  Routes,
  Router,
} from "react-router-dom";
import Home from "./components/Home/home";
import { Provider } from "./Utils/AppContext";
import PrivateRoutes from "./Utils/PrivateRoutes";

function App() {
  return (
    <div className="App">
      <Provider>
        <Routes>
          {/* Private Routes */}
          <Route element={<PrivateRoutes />}>
            <Route exact path="/" element={<Home />} />
          </Route>

          {/* Standard Routes */}
          <Route exact path="/login" element={<Login />} />
        </Routes>
      </Provider>
    </div>
  );
}

export default App;
