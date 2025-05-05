
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

export const Logo = () => {
  return (
    <Link to="/" className="flex items-center">
      <Shield className="h-8 w-8 text-kenya-green mr-2" />
      <span className="font-bold text-xl text-kenya-black">KPCMS</span>
    </Link>
  );
};
