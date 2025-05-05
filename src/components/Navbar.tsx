
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Shield, User, FileText, Search, HelpCircle, LogOut } from "lucide-react";
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

interface NavbarProps {
  isLoggedIn?: boolean;
  userRole?: string;
}

const Navbar = ({ isLoggedIn = false, userRole = "Public" }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const { logout } = useAuthActions();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Get appropriate dashboard link based on role
  const getDashboardLink = () => {
    if (!isLoggedIn) return "/login";
    
    switch (userRole) {
      case "Officer":
        return "/officer-dashboard";
      case "OCS":
      case "Commander":
      case "Administrator":
        return "/supervisor-dashboard";
      case "Judiciary":
        return "/judiciary-dashboard";
      default:
        return "/dashboard";
    }
  };

  // Nav links based on user role
  const getNavLinks = () => {
    const links = [];
    
    // Common links for all users
    links.push({ title: "Home", path: "/" });
    
    if (!isLoggedIn || userRole === "Public") {
      links.push(
        { title: "Report a Crime", path: "/report-crime" },
        { title: "Track a Case", path: "/track-case" },
        { title: "FAQs", path: "/faq" }
      );
    }
    
    if (isLoggedIn) {
      links.push({ title: "Dashboard", path: getDashboardLink() });
    }
    
    return links;
  };

  const navLinks = getNavLinks();
  
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Shield className="h-8 w-8 text-kenya-green mr-2" />
              <span className="font-bold text-xl text-kenya-black">KPCMS</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`font-medium transition-colors ${
                  location.pathname === link.path 
                    ? "text-kenya-green" 
                    : "hover:text-kenya-green"
                }`}
              >
                {link.title}
              </Link>
            ))}
            
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {user?.name || userRole}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link to={getDashboardLink()} className="w-full">Dashboard</Link>
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
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-kenya-green hover:bg-kenya-green/90 text-white">Register</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-kenya-black hover:text-kenya-green focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block font-medium ${
                  location.pathname === link.path 
                    ? "text-kenya-green" 
                    : "hover:text-kenya-green"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.title}
              </Link>
            ))}
            
            {isLoggedIn ? (
              <div className="space-y-2 pt-2 border-t">
                <div className="font-medium text-kenya-black">
                  {user?.name || userRole}
                </div>
                
                <Link
                  to="/profile"
                  className="block font-medium hover:text-kenya-green"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left font-medium text-red-500 hover:text-red-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-2 border-t">
                <Link
                  to="/login"
                  className="block font-medium hover:text-kenya-green"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block font-medium hover:text-kenya-green"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
