import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AuthLayout from "./layouts/AuthLayout";
import AppLayout from "./layouts/AppLayout";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import HomePage from "./pages/HomePage";

import ContractListPage from "./pages/contracts/ContractListPage";
import ContractDetailPage from "./pages/contracts/ContractDetailPage";
import ContractRegisterPage from "./pages/contracts/ContractRegisterPage";

import ChatbotPage from "./pages/chatbot/ChatbotPage";
import SuggestionPage from "./pages/suggestions/SuggestionPage";
import DashboardPage from "./pages/dashboard/DashboardPage";

function RequireAuth({ children }) {
  const token = localStorage.getItem("accessToken");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnly({ children }) {
  const token = localStorage.getItem("accessToken");
  if (token) return <Navigate to="/home" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 공개 영역 */}
        <Route
          element={
            <PublicOnly>
              <AuthLayout />
            </PublicOnly>
          }
        >
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/oauth/callback/:provider" element={<OAuthCallbackPage />} />
        </Route>

        {/* 로그인 후 영역 */}
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route path="/home" element={<HomePage />} />
          <Route path="/contracts" element={<ContractListPage />} />
          <Route path="/contracts/register" element={<ContractRegisterPage />} />
          <Route path="/contracts/:id" element={<ContractDetailPage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/suggestions" element={<SuggestionPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
