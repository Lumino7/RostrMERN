import React, { useContext, Suspense } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import "./App.css";
import NavBar from "./shared/components/NavBar";
import AuthPage from "./user/pages/AuthPage";
import SchedulePage from "./shift/pages/SchedulePage";
import { RostrContext, RostrProvider } from "./shared/context/rostr-context";

const RostrRoutes = () => {
  const { token } = useContext(RostrContext);

  if (token) {
    return (
      <Routes>
        <Route path="/auth" element={<Navigate to="/schedule" replace />} />
        <Route path="/schedule" element={<SchedulePage />} />
      </Routes>
    );
  } else {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }
};

function App() {
  return (
    <Router>
      <RostrProvider>
        <RostrRoutes />
      </RostrProvider>
    </Router>
  );
}

export default App;
