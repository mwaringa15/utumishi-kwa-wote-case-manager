
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CaseCard from "@/components/CaseCard";
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
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Case, CaseProgress, CaseStatus } from "@/types";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  caseId: z.string().min(3, "Please enter a valid case ID")
});

type FormValues = z.infer<typeof formSchema>;

const TrackCase = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isSearching, setIsSearching] = useState(false);
  const [caseData, setCaseData] = useState<Case | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      caseId: searchParams.get("id") || "",
    },
  });
  
  // If we have an ID in the URL, automatically search for it
  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      handleSearch({ caseId: id });
    }
  }, [searchParams]);
  
  const handleSearch = async (data: FormValues) => {
    setIsSearching(true);
    
    try {
      // Fetch case data from Supabase
      const { data: caseResult, error: caseError } = await supabase
        .from('cases')
        .select(`
          *,
          crime_report:crime_report_id (
            id,
            title,
            description,
            status,
            created_at
          )
        `)
        .eq('id', data.caseId)
        .single();
      
      if (caseError || !caseResult) {
        toast({
          title: "Case not found",
          description: "We couldn't find a case with that ID. Please check and try again.",
          variant: "destructive",
        });
        setCaseData(null);
        setIsSearching(false);
        return;
      }
      
      // Convert the Supabase result to our Case type
      const foundCase: Case = {
        id: caseResult.id,
        crimeReportId: caseResult.crime_report_id,
        assignedOfficerId: caseResult.assigned_officer_id || undefined,
        progress: caseResult.progress as CaseProgress,
        lastUpdated: caseResult.last_updated,
        crimeReport: caseResult.crime_report ? {
          id: caseResult.crime_report.id,
          title: caseResult.crime_report.title,
          description: caseResult.crime_report.description,
          status: caseResult.crime_report.status as CaseStatus,
          createdAt: caseResult.crime_report.created_at,
        } : undefined
      };
      
      setCaseData(foundCase);
      
    } catch (error) {
      console.error("Error searching for case", error);
      toast({
        title: "Error",
        description: "There was a problem searching for your case",
        variant: "destructive",
      });
      setCaseData(null);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-kenya-red/10 rounded-lg flex items-center justify-center mr-3">
              <Search className="text-kenya-red h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-kenya-black">Track Your Case</h1>
          </div>
          
          <div className="mb-8">
            <p className="text-gray-600">
              Enter your case ID or reference number to check the status of your case. 
              This will show you the current progress of the investigation.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-4">
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
          
          {caseData && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Case Information</h2>
              <CaseCard caseData={caseData} />
              
              <div className="mt-8 border-t pt-6">
                <h3 className="font-semibold mb-3">Recent Updates</h3>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">Officer {caseData.assignedOfficerId?.substring(0, 8) || "Unassigned"}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(caseData.lastUpdated || "").toLocaleDateString()}
                      </p>
                      <p className="text-sm mt-1">
                        This case is currently {caseData.progress.toLowerCase()}.
                        {caseData.progress === "In Progress" && " Our team is actively investigating."}
                        {caseData.progress === "Completed" && " The investigation has been completed."}
                        {caseData.progress === "Pending" && " The case is waiting to be processed."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button 
                  variant="outline"
                  className="text-kenya-red"
                  onClick={() => window.print()}
                >
                  Print Report
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TrackCase;
