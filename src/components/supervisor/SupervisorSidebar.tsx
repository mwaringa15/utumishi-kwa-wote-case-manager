
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, Users, FileText, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarHeader, SidebarSection, SidebarFooter } from "@/components/ui/sidebar";

export function SupervisorSidebar() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  const navItems = [
    { 
      label: 'Dashboard', 
      icon: BarChart3, 
      path: '/supervisor-dashboard',
      active: isActive('/supervisor-dashboard')  
    },
    { 
      label: 'Cases', 
      icon: Folder, 
      path: '/supervisor-dashboard/cases',
      active: isActive('/supervisor-dashboard/cases')  
    },
    { 
      label: 'Reports', 
      icon: FileText, 
      path: '/supervisor-dashboard/reports',
      active: isActive('/supervisor-dashboard/reports')  
    },
    { 
      label: 'Officers', 
      icon: Users, 
      path: '/supervisor-dashboard/officers',
      active: isActive('/supervisor-dashboard/officers')  
    }
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="text-lg font-semibold">Supervisor</div>
      </SidebarHeader>
      
      <SidebarSection>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={item.active ? "secondary" : "ghost"}
              className="justify-start"
              asChild
            >
              <Link to={item.path}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
      </SidebarSection>
      
      <SidebarFooter>
        <div className="text-xs text-muted-foreground">
          Police Station Management
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
