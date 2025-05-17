
import { HomeIcon, ClipboardList, Users2, AlertCircle, BarChart3 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  Sidebar, 
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel
} from "@/components/ui/sidebar";

export function SupervisorSidebar() {
  const location = useLocation();
  const { user } = useAuth();
  
  // Check if the current path is active
  const isActive = (path: string) => location.pathname === path;
  
  // Only show analytics for supervisor role
  const showAnalytics = user?.role === "supervisor";

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center px-3 py-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-kenya-green text-white">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div className="ml-3 flex flex-col">
            <span className="text-sm font-medium">Police System</span>
            <span className="text-xs text-muted-foreground">{user?.role}</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/supervisor-dashboard")}>
                  <Link to="/supervisor-dashboard">
                    <HomeIcon />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/supervisor-dashboard/cases")}>
                  <Link to="/supervisor-dashboard/cases">
                    <ClipboardList />
                    <span>Cases</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/supervisor-dashboard/reports")}>
                  <Link to="/supervisor-dashboard/reports">
                    <AlertCircle />
                    <span>Reports</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/supervisor-dashboard/officers")}>
                  <Link to="/supervisor-dashboard/officers">
                    <Users2 />
                    <span>Officers</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {showAnalytics && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/supervisor-dashboard/analytics")}>
                    <Link to="/supervisor-dashboard/analytics">
                      <BarChart3 />
                      <span>Analytics</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="py-2 px-3">
          <p className="text-xs text-muted-foreground">
            © Kenya Police Service {new Date().getFullYear()}
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
