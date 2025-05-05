
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/auth/useAuth";
import { useAuthActions } from "@/hooks/auth/useAuthActions";

interface UserMenuProps {
  user: { name?: string; role?: string } | null;
  dashboardLink: string;
  isMobile?: boolean;
  onClose?: () => void;
}

export const UserMenu = ({ user, dashboardLink, isMobile = false, onClose }: UserMenuProps) => {
  const navigate = useNavigate();
  const { logout } = useAuthActions();

  const handleLogout = async () => {
    await logout();
    navigate("/");
    if (onClose) onClose();
  };

  if (isMobile) {
    return (
      <div className="space-y-2 pt-2 border-t">
        <div className="font-medium text-kenya-black mb-2">
          {user?.name || user?.role}
        </div>
        
        <Link
          to="/profile"
          className="block font-medium hover:text-kenya-green"
          onClick={onClose}
        >
          Profile
        </Link>
        
        <Link
          to={dashboardLink}
          className="block font-medium hover:text-kenya-green"
          onClick={onClose}
        >
          Dashboard
        </Link>
        
        <button
          onClick={handleLogout}
          className="block w-full text-left font-medium text-red-500 hover:text-red-700"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center">
          <User className="h-4 w-4 mr-2" />
          {user?.name || user?.role}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Link to={dashboardLink} className="w-full">Dashboard</Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem>
          <Link to="/profile" className="w-full">Profile</Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="text-red-500" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          <span className="w-full">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
