
import { z } from "zod";

export const crimeReportSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  incidentDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date",
  }),
  category: z.string().min(1, "Please select a category"),
  contactPhone: z.string().optional(),
  additionalInfo: z.string().optional(),
});

export type CrimeReportFormValues = z.infer<typeof crimeReportSchema>;
