
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { CrimeReportFormValues } from "./types";

interface AdditionalInfoFieldProps {
  control: Control<CrimeReportFormValues>;
}

export function AdditionalInfoField({ control }: AdditionalInfoFieldProps) {
  return (
    <FormField
      control={control}
      name="additionalInfo"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Additional Information (Optional)</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Any other details you'd like to share" 
              {...field} 
              rows={3}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
