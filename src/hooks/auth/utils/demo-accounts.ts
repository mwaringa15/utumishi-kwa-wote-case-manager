
import { User } from "@/types";
import { getRedirectPathForRole } from "./role-utils";

interface DemoAccount {
  user: User;
  redirectPath: string;
}

// Collection of demo accounts users can use
const demoAccounts: Record<string, { password: string } & DemoAccount> = {
  "leah@judiciary.go.ke": {
    password: "password123",
    user: {
      id: "demo-judiciary-id",
      name: "Leah Judiciary",
      email: "leah@judiciary.go.ke",
      role: "judiciary",
      createdAt: new Date().toISOString(),
    },
    redirectPath: "/judiciary-dashboard",
  },
  
  "officer@police.go.ke": {
    password: "password123",
    user: {
      id: "demo-officer-id",
      name: "Officer Demo",
      email: "officer@police.go.ke",
      role: "officer",
      createdAt: new Date().toISOString(),
      badgeNumber: "KPS-12345",
      assignedCases: 5,
    },
    redirectPath: "/officer-dashboard",
  },
  
  "supervisor@supervisor.go.ke": {
    password: "password123",
    user: {
      id: "demo-supervisor-id",
      name: "Supervisor Demo",
      email: "supervisor@supervisor.go.ke",
      role: "supervisor",
      createdAt: new Date().toISOString(),
    },
    redirectPath: "/supervisor-dashboard",
  },
  
  "public@example.com": {
    password: "password123",
    user: {
      id: "demo-public-id",
      name: "Public User",
      email: "public@example.com",
      role: "public",
      createdAt: new Date().toISOString(),
    },
    redirectPath: "/dashboard",
  },
};

/**
 * Checks if provided credentials match a demo account
 * @returns Demo account information if credentials match, null otherwise
 */
export function checkForDemoAccount(email: string, password: string): DemoAccount | null {
  const lowerEmail = email.toLowerCase();
  const account = demoAccounts[lowerEmail];
  
  if (account && account.password === password) {
    return {
      user: account.user,
      redirectPath: getRedirectPathForRole(account.user.role),
    };
  }
  
  return null;
}
