
import { HomeIcon, ClipboardList, Users2, AlertCircle, BarChart3 } from "lucide-react";
import { useLocation } from "react-router-dom";
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
  
  // Check if the user is a Commander, Administrator, or OCS to show analytics
  const isCommanderOrAdmin = user?.role === "Commander" || 
                             user?.role === "Administrator" || 
                             user?.role === "OCS";

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
                  <a href="/supervisor-dashboard">
                    <HomeIcon />
                    <span>Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/cases")}>
                  <a href="/cases">
                    <ClipboardList />
                    <span>Cases</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/reports")}>
                  <a href="/reports">
                    <AlertCircle />
                    <span>Reports</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/officers")}>
                  <a href="/officers">
                    <Users2 />
                    <span>Officers</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {isCommanderOrAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/analytics")}>
                    <a href="/analytics">
                      <BarChart3 />
                      <span>Analytics</span>
                    </a>
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
