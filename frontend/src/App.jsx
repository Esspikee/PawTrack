import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import Codex from "./pages/Codex";
import CodexAchievements from "./pages/CodexAchievements";
import CodexBestiary from "./pages/CodexBestiary";
import CodexBreedCategory from "./pages/CodexBreedCategory";
import CodexBreedDetails from "./pages/CodexBreedDetails";
import Login from "./pages/Login";
import LoginForm from "./pages/LoginForm";
import Notifications from "./pages/Notifications";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Animals from "./pages/Animals";
import AnimalDetail from "./pages/AnimalDetail";
import AnimalHistory from "./pages/AnimalHistory";
import CreateAnimal from "./pages/CreateAnimal";
import Profile from "./pages/Profile";
import ReportSighting from "./pages/ReportSighting";
import Settings from "./pages/Settings";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/login-form" element={<LoginForm />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/animals" element={<Animals />} />
      <Route path="/animals/new" element={<ProtectedRoute><CreateAnimal /></ProtectedRoute>} />
      <Route path="/animals/:animalId" element={<AnimalDetail />} />
      <Route path="/animals/:animalId/history" element={<AnimalHistory />} />
      <Route path="/report" element={<ProtectedRoute><ReportSighting /></ProtectedRoute>} />
      <Route path="/report/:animalId" element={<ProtectedRoute><ReportSighting /></ProtectedRoute>} />
      <Route path="/codex" element={<ProtectedRoute><Codex /></ProtectedRoute>} />
      <Route path="/codex/bestiary" element={<ProtectedRoute><CodexBestiary /></ProtectedRoute>} />
      <Route path="/codex/bestiary/:category" element={<ProtectedRoute><CodexBreedCategory /></ProtectedRoute>} />
      <Route path="/codex/bestiary/:category/:breedId" element={<ProtectedRoute><CodexBreedDetails /></ProtectedRoute>} />
      <Route path="/codex/achievements" element={<ProtectedRoute><CodexAchievements /></ProtectedRoute>} />
      <Route path="/achievements" element={<Navigate to="/codex/achievements" replace />} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
