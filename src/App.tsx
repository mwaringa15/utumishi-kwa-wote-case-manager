
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "@/pages/Dashboard";
import ReportCrime from "@/pages/ReportCrime";
import OfficerDashboard from "@/pages/OfficerDashboard";
import JudiciaryDashboard from "@/pages/JudiciaryDashboard";
import SupervisorDashboard from "@/pages/SupervisorDashboard";
import SupervisorOfficers from "@/pages/SupervisorOfficers";
import SupervisorReports from "@/pages/SupervisorReports";
import SupervisorCases from "@/pages/SupervisorCases";
import OfficerCaseDetails from "./pages/OfficerCaseDetails";
import JudiciaryCase from "./pages/JudiciaryCase";
import TrackCase from "./pages/TrackCase";
import OfficerProfile from "./pages/OfficerProfile";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/track-case" element={<TrackCase />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/report-crime" element={<ProtectedRoute><ReportCrime /></ProtectedRoute>} />
            
            {/* Role-Based Routes */}
            <Route path="/officer-dashboard" element={<RoleBasedRoute allowedRoles={["officer"]}><OfficerDashboard /></RoleBasedRoute>} />
            <Route path="/officer-dashboard/case/:id" element={<RoleBasedRoute allowedRoles={["officer"]}><OfficerCaseDetails /></RoleBasedRoute>} />
            <Route path="/officer-profile" element={<RoleBasedRoute allowedRoles={["officer"]}><OfficerProfile /></RoleBasedRoute>} />
            
            <Route path="/judiciary-dashboard" element={<RoleBasedRoute allowedRoles={["judiciary"]}><JudiciaryDashboard /></RoleBasedRoute>} />
            <Route path="/judiciary-dashboard/case/:id" element={<RoleBasedRoute allowedRoles={["judiciary"]}><JudiciaryCase /></RoleBasedRoute>} />
            
            <Route path="/supervisor-dashboard" element={<RoleBasedRoute allowedRoles={["supervisor"]}><SupervisorDashboard /></RoleBasedRoute>} />
            <Route path="/supervisor-dashboard/officers" element={<RoleBasedRoute allowedRoles={["supervisor"]}><SupervisorOfficers /></RoleBasedRoute>} />
            <Route path="/supervisor-dashboard/reports" element={<RoleBasedRoute allowedRoles={["supervisor"]}><SupervisorReports /></RoleBasedRoute>} />
            <Route path="/supervisor-dashboard/cases" element={<RoleBasedRoute allowedRoles={["supervisor"]}><SupervisorCases /></RoleBasedRoute>} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
