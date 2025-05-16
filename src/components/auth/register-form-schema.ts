
import { z } from "zod";
import { UserRole } from "@/types";

export const registerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  nationalId: z.string().min(6, "National ID must be at least 6 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export interface RegisterFormProps {
  onRegister?: (data: { 
    name: string; 
    email: string; 
    password: string; 
    nationalId?: string; 
    phone?: string; 
    role?: UserRole 
  }) => Promise<void>;
}

export const determineUserRole = (email: string): UserRole => {
  let role: UserRole;
  
  if (email.endsWith("@police.go.ke")) {
    role = "Officer";
  } else if (email.endsWith("@admin.police.go.ke")) {
    role = "Administrator";
  } else if (email.endsWith("@commander.police.go.ke")) {
    role = "Commander";
  } else if (email.endsWith("@ocs.police.go.ke")) {
    role = "OCS";
  } else if (email.endsWith("@judiciary.go.ke")) {
    role = "Judiciary";
  } else if (email.endsWith("@supervisor.go.ke")) {
    role = "Supervisor";
  } else {
    role = "Public";
  }
  
  // Return the role as is - the normalization to lowercase will happen in the hooks
  return role;
};
