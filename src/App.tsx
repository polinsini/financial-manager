import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { selectUser } from "./store/slices/authSlice";
import { NavBar } from "./components/NavBar";
import { Notification } from "./components/Notification";
import { AuthPage } from "./pages/Auth";
import { DashboardPage } from "./pages/Dashboard";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { useEffect } from "react";
import { initAuth } from "./store/slices/authSlice";
import { HomePage } from "./pages/Home";
import { TransactionPage } from "./pages/TransactionPage";
import { ProfilePage } from "./pages/Profile";
import { handleGoogleRedirectResult } from "./store/slices/authSlice";
export const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  useEffect(() => {
  dispatch(handleGoogleRedirectResult()).finally(() => {
      dispatch(initAuth());
    });
  }, [dispatch]);

  return (
    <Router>
      <div className="min-h-screen bg-[#000300]">
        <NavBar />
        <Notification />
        <Routes>
          <Route
            path="/auth"
            element={!user ? <AuthPage /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/dashboard"
            element={user ? <DashboardPage /> : <Navigate to="/auth" />}
          />
          <Route
            path="/transaction/:id"
            element={user ? <TransactionPage /> : <Navigate to="/auth" />}
          />
          <Route
            path="/analytics"
            element={user ? <AnalyticsPage /> : <Navigate to="/auth" />}
          />
          <Route
            path="/profile"
            element={user ? <ProfilePage /> : <Navigate to="/auth" />}
          />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
};
