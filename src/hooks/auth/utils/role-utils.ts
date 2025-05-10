
import { UserRole } from "@/types";

/**
 * Determines a user's role based on their email domain
 */
export const determineRoleFromEmail = (email: string): UserRole => {
  if (email.endsWith("@admin.police.go.ke")) {
    return "Administrator";
  } else if (email.endsWith("@commander.police.go.ke")) {
    return "Commander";
  } else if (email.endsWith("@ocs.police.go.ke")) {
    return "OCS";
  } else if (email.endsWith("@police.go.ke")) {
    return "Officer";
  } else if (email.endsWith("@judiciary.go.ke")) {
    return "Judiciary";
  } else if (email.endsWith("@supervisor.go.ke")) {
    return "Supervisor";
  }
  return "Public";
};

/**
 * Determines a redirect path based on user role
 */
export const getRedirectPathForRole = (role: UserRole): string => {
  switch (role) {
    case "Officer":
      return "/officer-dashboard";
    case "OCS":
    case "Commander":
    case "Administrator":
      return "/supervisor-dashboard";
    case "Judiciary":
      return "/judiciary-dashboard";
    case "Supervisor":
      return "/supervisor-dashboard";
    default:
      return "/dashboard";
  }
};
