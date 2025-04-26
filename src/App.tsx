
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { StrictMode } from "react";

import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import BatchesPage from "./pages/admin/Batches";
import StudentsPage from "./pages/admin/Students";
import AttendancePage from "./pages/admin/Attendance";
import StudentDashboard from "./pages/student/Dashboard";
import StudentAttendancePage from "./pages/student/Attendance";
import NotFound from "./pages/NotFound";

// Create a client
const queryClient = new QueryClient();

const App = () => {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <DataProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/batches" element={<BatchesPage />} />
                  <Route path="/admin/students" element={<StudentsPage />} />
                  <Route path="/admin/attendance" element={<AttendancePage />} />
                  
                  {/* Student Routes */}
                  <Route path="/student" element={<StudentDashboard />} />
                  <Route path="/student/attendance" element={<StudentAttendancePage />} />
                  
                  {/* Handle root redirects */}
                  <Route 
                    path="/admin/*" 
                    element={<Navigate to="/admin" replace />} 
                  />
                  <Route 
                    path="/student/*" 
                    element={<Navigate to="/student" replace />} 
                  />
                  
                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </DataProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </StrictMode>
  );
};

export default App;
