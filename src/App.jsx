import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import { useAuth } from "./hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import RecordDetail from "./pages/RecordDetail";
import Records from "./pages/Records";
import Signup from "./pages/Signup";
import Users from "./pages/Users";
const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return null;
  return token ? children : <Navigate to="/login" replace />;
};
const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="app-shell">
      <Navbar onToggleMenu={() => setCollapsed((p) => !p)} />
      <div className="main-shell">
        <Sidebar collapsed={collapsed} />
        <div className="content-shell">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/records"
              element={
                <PrivateRoute>
                  <Records />
                </PrivateRoute>
              }
            />
            <Route
              path="/records/:id"
              element={
                <PrivateRoute>
                  <RecordDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/users"
              element={
                <PrivateRoute>
                  <Users />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default App;
