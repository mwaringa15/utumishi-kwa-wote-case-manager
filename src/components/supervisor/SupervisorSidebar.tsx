
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { Shield, CircleUser, FileText, Folder, BarChart3, Users, MessageSquare, Settings, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function SupervisorSidebar() {
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };
  
  return (
    <Sidebar className="border-r bg-background pb-20">
      <SidebarHeader>
        <div className="px-4 py-4">
          <div className="flex items-center px-2 py-1">
            <Shield className="h-5 w-5 mr-2 text-kenya-green" />
            <h3 className="font-semibold text-lg tracking-tight">
              KPCMS Supervisor
            </h3>
          </div>
        </div>
      </SidebarHeader>
      <ScrollArea className="px-2">
        <div className="space-y-1 p-2">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <NavLink 
              to="/supervisor-dashboard" 
              className={({isActive}) => isActive ? "bg-accent text-accent-foreground" : ""}
              end
            >
              <BarChart3 className="h-4 w-4 mr-3" />
              Dashboard
            </NavLink>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <NavLink 
              to="/supervisor-dashboard/cases" 
              className={({isActive}) => isActive ? "bg-accent text-accent-foreground" : ""}
            >
              <Folder className="h-4 w-4 mr-3" />
              Cases
            </NavLink>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <NavLink 
              to="/supervisor-dashboard/reports"
              className={({isActive}) => isActive ? "bg-accent text-accent-foreground" : ""}
            >
              <FileText className="h-4 w-4 mr-3" />
              Reports
            </NavLink>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <NavLink 
              to="/supervisor-dashboard/officers"
              className={({isActive}) => isActive ? "bg-accent text-accent-foreground" : ""}
            >
              <Users className="h-4 w-4 mr-3" />
              Officers
            </NavLink>
          </Button>
        </div>
      </ScrollArea>
      <SidebarFooter>
        <div className="px-2 py-2 space-y-1">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <NavLink 
              to="/supervisor-profile"
              className={({isActive}) => isActive ? "bg-accent text-accent-foreground" : ""}
            >
              <CircleUser className="h-4 w-4 mr-3" />
              My Profile
            </NavLink>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <NavLink 
              to="/supervisor-settings"
              className={({isActive}) => isActive ? "bg-accent text-accent-foreground" : ""}
            >
              <Settings className="h-4 w-4 mr-3" />
              Settings
            </NavLink>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
