
import { UserRole } from "@/types";

/**
 * Determines a user's role based on their email domain
 */
export const determineRoleFromEmail = (email: string): UserRole => {
  // Convert email to lowercase for case-insensitive comparison
  const lowercaseEmail = email.toLowerCase();
  
  if (lowercaseEmail.endsWith("@police.go.ke")) {
    return "officer";
  } else if (lowercaseEmail.endsWith("@judiciary.go.ke")) {
    return "judiciary";
  } else if (lowercaseEmail.endsWith("@supervisor.go.ke")) {
    return "supervisor";
  }
  return "public";
};

/**
 * Determines a redirect path based on user role
 */
export const getRedirectPathForRole = (role: UserRole): string => {
  // Ensure role is lowercase for consistent comparison
  const normalizedRole = role.toLowerCase() as UserRole;
  
  switch (normalizedRole) {
    case "officer":
      return "/officer-dashboard";
    case "judiciary":
      return "/judiciary-dashboard";
    case "supervisor":
      return "/supervisor-dashboard";
    default:
      return "/dashboard";
  }
};
