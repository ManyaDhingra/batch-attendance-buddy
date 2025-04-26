
import { useAuth } from "@/context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar, CheckSquare, Layers, LogOut, User, Users } from "lucide-react";

export const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  
  const adminLinks = [
    { name: "Dashboard", path: "/admin", icon: Layers },
    { name: "Batches", path: "/admin/batches", icon: Calendar },
    { name: "Students", path: "/admin/students", icon: Users },
    { name: "Attendance", path: "/admin/attendance", icon: CheckSquare },
  ];
  
  const studentLinks = [
    { name: "Dashboard", path: "/student", icon: Layers },
    { name: "My Attendance", path: "/student/attendance", icon: CheckSquare },
  ];
  
  const links = isAdmin() ? adminLinks : studentLinks;

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col h-screen">
      <div className="p-4">
        <h2 className="text-xl font-bold">Attendance Buddy</h2>
      </div>
      
      <div className="flex-1 mt-8">
        <nav className="space-y-1 px-2">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center py-2 px-4 rounded-md transition-colors",
                location.pathname === link.path
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "hover:bg-sidebar-accent/50"
              )}
            >
              <link.icon className="mr-3 h-5 w-5" />
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
            <User className="h-6 w-6" />
          </div>
          <div className="ml-3">
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm opacity-75">{user?.role}</p>
          </div>
        </div>
        
        <Button
          variant="outline"
          className="w-full border-sidebar-border hover:bg-sidebar-accent justify-start"
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
};
