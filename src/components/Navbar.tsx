
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";
import { useAuthActions } from "@/hooks/auth/useAuthActions";
import { Logo } from "@/components/navigation/Logo";
import { NavLinks } from "@/components/navigation/NavLinks";
import { AuthButtons } from "@/components/navigation/AuthButtons";
import { UserMenu } from "@/components/navigation/UserMenu";

interface NavbarProps {
  isLoggedIn?: boolean;
  userRole?: string;
}

const Navbar = ({ isLoggedIn = false, userRole = "Public" }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
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
  const dashboardLink = getDashboardLink();
  
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLinks links={navLinks} />
            
            {isLoggedIn ? (
              <UserMenu user={user} dashboardLink={dashboardLink} />
            ) : (
              <AuthButtons />
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
            <NavLinks 
              links={navLinks} 
              isMobile={true} 
              onClickMobile={() => setIsMenuOpen(false)} 
            />
            
            {isLoggedIn ? (
              <UserMenu 
                user={user} 
                dashboardLink={dashboardLink} 
                isMobile={true} 
                onClose={() => setIsMenuOpen(false)} 
              />
            ) : (
              <AuthButtons 
                isMobile={true} 
                onClose={() => setIsMenuOpen(false)} 
              />
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
