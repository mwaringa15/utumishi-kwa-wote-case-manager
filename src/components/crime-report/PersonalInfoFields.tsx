
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { CrimeReportFormValues } from "./types";

interface PersonalInfoFieldsProps {
  control: Control<CrimeReportFormValues>;
}

export function PersonalInfoFields({ control }: PersonalInfoFieldsProps) {
  return (
    <FormField
      control={control}
      name="contactPhone"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Contact Phone (Optional)</FormLabel>
          <FormControl>
            <Input placeholder="Your phone number for follow-up" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
