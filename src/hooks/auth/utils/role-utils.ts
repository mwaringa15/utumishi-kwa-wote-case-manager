
import { UserRole } from "@/types";

/**
 * Determines a user's role based on their email domain
 */
export const determineRoleFromEmail = (email: string): UserRole => {
  if (email.endsWith("@police.go.ke")) {
    return "officer";
  } else if (email.endsWith("@judiciary.go.ke")) {
    return "judiciary";
  } else if (email.endsWith("@supervisor.go.ke")) {
    return "supervisor";
  }
  return "public";
};

/**
 * Determines a redirect path based on user role
 */
export const getRedirectPathForRole = (role: UserRole): string => {
  switch (role) {
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
