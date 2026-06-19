import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Animals from "./pages/Animals";
import AnimalDetail from "./pages/AnimalDetail";
import AnimalHistory from "./pages/AnimalHistory";
import CreateAnimal from "./pages/CreateAnimal";
import Profile from "./pages/Profile";
import ReportSighting from "./pages/ReportSighting";
import Welcome from "./pages/Welcome";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/animals" element={<Animals />} />
      <Route path="/animals/new" element={<CreateAnimal />} />
      <Route path="/animals/:animalId" element={<AnimalDetail />} />
      <Route path="/animals/:animalId/history" element={<AnimalHistory />} />
      <Route path="/report" element={<ReportSighting />} />
      <Route path="/report/:animalId" element={<ReportSighting />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
