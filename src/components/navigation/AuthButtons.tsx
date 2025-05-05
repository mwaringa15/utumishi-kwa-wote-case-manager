
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface AuthButtonsProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export const AuthButtons = ({ isMobile = false, onClose }: AuthButtonsProps) => {
  if (isMobile) {
    return (
      <div className="space-y-2 pt-2 border-t">
        <Link
          to="/login"
          className="block font-medium hover:text-kenya-green"
          onClick={onClose}
        >
          Login
        </Link>
        <Link
          to="/register"
          className="block font-medium hover:text-kenya-green"
          onClick={onClose}
        >
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Link to="/login">
        <Button variant="outline">Login</Button>
      </Link>
      <Link to="/register">
        <Button className="bg-kenya-green hover:bg-kenya-green/90 text-white">Register</Button>
      </Link>
    </div>
  );
};
