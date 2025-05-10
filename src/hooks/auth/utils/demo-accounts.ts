
import { User } from "@/types";

interface DemoLoginResult {
  user: {
    id: string;
    email: string;
    role: User["role"];
  };
  redirectPath: string;
}

/**
 * Checks if the login credentials match any demo accounts
 * @returns Demo account data if credentials match a demo account, null otherwise
 */
export const checkForDemoAccount = (
  email: string,
  password: string
): DemoLoginResult | null => {
  // Demo judiciary account
  if (email === "leah@judiciary.go.ke" && password === "password123") {
    return {
      user: {
        id: "demo-judiciary-id",
        email: "leah@judiciary.go.ke",
        role: "Judiciary"
      },
      redirectPath: "/judiciary-dashboard"
    };
  }

  // Demo police officer account
  if (email === "officer@police.go.ke" && password === "password123") {
    return {
      user: {
        id: "demo-officer-id",
        email: "officer@police.go.ke",
        role: "Officer"
      },
      redirectPath: "/officer-dashboard"
    };
  }

  // Demo supervisor account
  if (email === "supervisor@supervisor.go.ke" && password === "password123") {
    return {
      user: {
        id: "demo-supervisor-id",
        email: "supervisor@supervisor.go.ke",
        role: "Supervisor"
      },
      redirectPath: "/supervisor-dashboard"
    };
  }

  // Demo public user account
  if (email === "public@example.com" && password === "password123") {
    return {
      user: {
        id: "demo-public-id",
        email: "public@example.com",
        role: "Public"
      },
      redirectPath: "/dashboard"
    };
  }

  return null;
};
