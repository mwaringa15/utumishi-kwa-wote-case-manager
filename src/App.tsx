
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/auth/AuthProvider";
import { ProtectedRoute } from "@/hooks/auth/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import OfficerDashboard from "./pages/OfficerDashboard";
import OfficerProfile from "./pages/OfficerProfile"; // Add import
import ReportCrime from "./pages/ReportCrime";
import TrackCase from "./pages/TrackCase";
import NotFound from "./pages/NotFound";
import FAQPage from "./pages/FAQPage";
import JudiciaryDashboard from "./pages/JudiciaryDashboard";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import CaseDetails from "./pages/CaseDetails";

// Login and Register pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/report-crime" element={<ReportCrime />} />
            <Route path="/track-case" element={<TrackCase />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/faq" element={<FAQPage />} />
            
            {/* Protected Routes - Public User */}
            <Route 
              path="/dashboard" 
              element={<ProtectedRoute element={<Dashboard />} redirectTo="/login" />} 
            />
            
            {/* Protected Routes - Officer */}
            <Route 
              path="/officer-dashboard" 
              element={<ProtectedRoute 
                element={<OfficerDashboard />} 
                allowedRoles={["Officer", "OCS", "Commander", "Administrator"]} 
                redirectTo="/dashboard" 
              />} 
            />
            <Route 
              path="/officer-profile" 
              element={<ProtectedRoute 
                element={<OfficerProfile />} 
                allowedRoles={["Officer", "OCS", "Commander", "Administrator"]} 
                redirectTo="/dashboard" 
              />} 
            />
            <Route 
              path="/case/:id" 
              element={<ProtectedRoute 
                element={<CaseDetails />} 
                allowedRoles={["Officer", "OCS", "Commander", "Administrator", "Judiciary"]} 
                redirectTo="/dashboard" 
              />} 
            />
            
            {/* Protected Routes - Supervisor (OCS/Commander/Admin) */}
            <Route 
              path="/supervisor-dashboard" 
              element={<ProtectedRoute 
                element={<SupervisorDashboard />} 
                allowedRoles={["OCS", "Commander", "Administrator", "Supervisor"]} 
                redirectTo="/dashboard" 
              />} 
            />
            
            {/* Protected Routes - Judiciary */}
            <Route 
              path="/judiciary-dashboard" 
              element={<ProtectedRoute 
                element={<JudiciaryDashboard />} 
                allowedRoles={["Judiciary"]} 
                redirectTo="/dashboard" 
              />} 
            />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
