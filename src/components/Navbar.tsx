
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  isLoggedIn?: boolean;
  userRole?: string;
}

const Navbar = ({ isLoggedIn = false, userRole = "Public" }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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
            <Link to="/" className="font-medium hover:text-kenya-green transition-colors">
              Home
            </Link>
            <Link to="/report-crime" className="font-medium hover:text-kenya-green transition-colors">
              Report a Crime
            </Link>
            <Link to="/track-case" className="font-medium hover:text-kenya-green transition-colors">
              Track a Case
            </Link>
            <Link to="/about" className="font-medium hover:text-kenya-green transition-colors">
              About Us
            </Link>
            
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {userRole}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link to="/dashboard" className="w-full">Dashboard</Link>
                  </DropdownMenuItem>
                  {(userRole === "Officer" || userRole === "OCS" || userRole === "Commander" || userRole === "Administrator") && (
                    <DropdownMenuItem>
                      <Link to="/officer-dashboard" className="w-full">Officer Portal</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <Link to="/profile" className="w-full">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/" className="w-full">Logout</Link>
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
            <Link
              to="/"
              className="block font-medium hover:text-kenya-green"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/report-crime"
              className="block font-medium hover:text-kenya-green"
              onClick={() => setIsMenuOpen(false)}
            >
              Report a Crime
            </Link>
            <Link
              to="/track-case"
              className="block font-medium hover:text-kenya-green"
              onClick={() => setIsMenuOpen(false)}
            >
              Track a Case
            </Link>
            <Link
              to="/about"
              className="block font-medium hover:text-kenya-green"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            
            {isLoggedIn ? (
              <div className="space-y-2 pt-2 border-t">
                <Link
                  to="/dashboard"
                  className="block font-medium hover:text-kenya-green"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {(userRole === "Officer" || userRole === "OCS" || userRole === "Commander" || userRole === "Administrator") && (
                  <Link
                    to="/officer-dashboard"
                    className="block font-medium hover:text-kenya-green"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Officer Portal
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="block font-medium hover:text-kenya-green"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/"
                  className="block font-medium hover:text-kenya-green"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Logout
                </Link>
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
