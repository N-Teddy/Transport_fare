import { BrowserRouter, Route, Routes } from "react-router-dom"
import DocumentRegistrationPage from "./pages/DocumentRegistrationPage"
import VehicleRegistrationPage from "./pages/VehicleRegistrationPage"
import RegistrationPage from "./pages/RegistrationPage"
import AuthPage from "./pages/AuthPage"
import Dashboard from "./pages/Dashboard"
import TripPage from "./pages/TripPage"



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register/vehicle" element={<VehicleRegistrationPage />} />
        <Route path="/register/documents" element={<DocumentRegistrationPage />} />
        <Route path="/register/driver" element={<RegistrationPage />} />
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trip" element={<TripPage />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
