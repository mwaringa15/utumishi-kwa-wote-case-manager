
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  caseId: z.string().min(3, "Please enter a valid case ID")
});

export type CaseSearchFormValues = z.infer<typeof formSchema>;

interface CaseSearchFormProps {
  defaultCaseId?: string;
  isSearching: boolean;
  onSearch: (data: CaseSearchFormValues) => Promise<void>;
}

export function CaseSearchForm({ defaultCaseId = "", isSearching, onSearch }: CaseSearchFormProps) {
  const form = useForm<CaseSearchFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      caseId: defaultCaseId,
    },
  });
  
  return (
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSearch)} className="space-y-4">
          <FormField
            control={form.control}
            name="caseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Case ID / Reference Number</FormLabel>
                <div className="flex space-x-2">
                  <FormControl>
                    <Input placeholder="Enter case ID or reference number" {...field} />
                  </FormControl>
                  <Button 
                    type="submit" 
                    className="bg-kenya-green hover:bg-kenya-green/90 text-white px-8"
                    disabled={isSearching}
                  >
                    {isSearching ? "Searching..." : "Track"}
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      
      <div className="text-sm text-gray-500 mt-4">
        <p>Enter your case ID to track the status of your report</p>
      </div>
    </div>
  );
}
