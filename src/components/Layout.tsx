
import { useAuth } from "@/context/AuthContext";
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireStudent?: boolean;
}

export const Layout = ({ 
  children, 
  requireAuth = false, 
  requireAdmin = false, 
  requireStudent = false 
}: LayoutProps) => {
  const { isAuthenticated, isLoading, isAdmin, isStudent } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role permissions
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  if (requireStudent && !isStudent()) {
    return <Navigate to="/" replace />;
  }

  // If authenticated and has the right role, show the layout with sidebar
  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    );
  }

  // For public pages, show without sidebar
  return <div className="min-h-screen">{children}</div>;
};
