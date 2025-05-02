
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
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

type FormValues = z.infer<typeof formSchema>;

const CrimeReportForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      incidentDate: new Date().toISOString().split("T")[0],
      category: "",
      contactPhone: "",
      additionalInfo: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    console.log("Submitting form data:", data);
    
    try {
      // First, create the crime report
      const { data: crimeReport, error: crimeReportError } = await supabase
        .from('crime_reports')
        .insert({
          title: data.title,
          description: data.description,
          location: data.location,
          incident_date: data.incidentDate,
          category: data.category,
          contact_phone: data.contactPhone || null,
          additional_info: data.additionalInfo || null,
          status: 'Submitted'
        })
        .select()
        .single();
      
      if (crimeReportError) {
        console.error("Error creating crime report:", crimeReportError);
        throw new Error(crimeReportError.message);
      }
      
      console.log("Created crime report:", crimeReport);

      // Then, create a case linked to this crime report
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .insert({
          crime_report_id: crimeReport.id,
          progress: 'Pending',
          last_updated: new Date().toISOString()
        })
        .select()
        .single();
      
      if (caseError) {
        console.error("Error creating case:", caseError);
        throw new Error(caseError.message);
      }
      
      console.log("Created case:", caseData);
      
      // Format case ID for display
      const formattedCaseId = caseData.id.substring(0, 8).toUpperCase();
      
      toast({
        title: "Crime report submitted successfully!",
        description: `Your report has been filed with reference ID: ${formattedCaseId}`,
      });
      
      // Redirect to the tracking page with the case ID
      navigate(`/track-case?id=${caseData.id}`);
      
      form.reset();
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error submitting report",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-kenya-black mb-6">Report a Crime</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Report Title</FormLabel>
                <FormControl>
                  <Input placeholder="Brief title describing the incident" {...field} />
                </FormControl>
                <FormDescription>
                  Provide a short, descriptive title for your report
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incident Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Where did this occur?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="incidentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Incident</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Crime Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select crime category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="theft">Theft/Robbery</SelectItem>
                    <SelectItem value="assault">Assault/Violence</SelectItem>
                    <SelectItem value="fraud">Fraud/Scam</SelectItem>
                    <SelectItem value="property">Property Damage</SelectItem>
                    <SelectItem value="traffic">Traffic Incident</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Detailed Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Please provide detailed information about what happened" 
                    {...field} 
                    rows={5}
                  />
                </FormControl>
                <FormDescription>
                  Include details such as what happened, who was involved, and any other relevant information
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Your phone number for follow-up" {...field} />
                </FormControl>
                <FormDescription>
                  This will be used only for case follow-up
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
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
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="bg-kenya-green hover:bg-kenya-green/90 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CrimeReportForm;
