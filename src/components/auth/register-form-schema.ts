
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
  if (email.endsWith("@police.go.ke")) {
    return "Officer";
  } else if (email.endsWith("@admin.police.go.ke")) {
    return "Administrator";
  } else if (email.endsWith("@commander.police.go.ke")) {
    return "Commander";
  } else if (email.endsWith("@ocs.police.go.ke")) {
    return "OCS";
  } else if (email.endsWith("@judiciary.go.ke")) {
    return "Judiciary";
  } else if (email.endsWith("@supervisor.go.ke")) {
    return "Supervisor"; // Using Supervisor role for supervisor emails
  } else {
    return "Public";
  }
};
