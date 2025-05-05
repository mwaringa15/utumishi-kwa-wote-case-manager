
import { Link, useLocation } from "react-router-dom";

interface NavLinkProps {
  title: string;
  path: string;
  onClick?: () => void;
}

export const NavLink = ({ title, path, onClick }: NavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === path;
  
  return (
    <Link 
      to={path} 
      className={`font-medium transition-colors ${
        isActive ? "text-kenya-green" : "hover:text-kenya-green"
      }`}
      onClick={onClick}
    >
      {title}
    </Link>
  );
};

interface NavLinksProps {
  links: Array<{ title: string; path: string }>;
  isMobile?: boolean;
  onClickMobile?: () => void;
}

export const NavLinks = ({ links, isMobile = false, onClickMobile }: NavLinksProps) => {
  return (
    <>
      {links.map((link) => (
        <div key={link.path} className={isMobile ? "block mb-4" : ""}>
          <NavLink 
            title={link.title} 
            path={link.path} 
            onClick={isMobile ? onClickMobile : undefined}
          />
        </div>
      ))}
    </>
  );
};
