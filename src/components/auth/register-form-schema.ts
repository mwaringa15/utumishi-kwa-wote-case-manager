
import { z } from "zod";
import { UserRole } from "@/types";

// Form schema for validation
export const registerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  confirmPassword: z.string(),
  nationalId: z.string().optional(),
  phone: z.string().optional(),
  stationId: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

// Helper function to determine user role based on email
export const determineUserRole = (email: string): UserRole => {
  if (email.endsWith("@police.go.ke")) {
    return "officer";
  } else if (email.endsWith("@admin.police.go.ke")) {
    return "supervisor";
  } else if (email.endsWith("@commander.police.go.ke")) {
    return "supervisor";
  } else if (email.endsWith("@ocs.police.go.ke")) {
    return "supervisor";
  } else if (email.endsWith("@judiciary.go.ke")) {
    return "judiciary";
  } else if (email.endsWith("@supervisor.go.ke")) {
    return "supervisor";
  } else {
    return "public";
  }
};

export interface RegisterFormProps {
  onRegister?: (userData: {
    name: string;
    email: string;
    password: string;
    nationalId?: string;
    phone?: string;
    stationId?: string;
    role?: UserRole;
  }) => Promise<void>;
}
