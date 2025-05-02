
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useTrackCase } from "@/hooks/useTrackCase";
import { CaseSearchForm } from "@/components/case-tracking/CaseSearchForm";
import { CaseDetails } from "@/components/case-tracking/CaseDetails";
import { Toaster } from "@/components/ui/toaster";

const TrackCase = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { isSearching, caseData, handleSearch, error } = useTrackCase();
  
  // If we have an ID in the URL, automatically search for it only once on initial load
  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      // Only search if we have a valid ID
      handleSearch({ caseId: id });
    }
  }, [searchParams.get("id")]); // Only re-run if the ID in the URL changes

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      <Toaster />
      
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
          
          <CaseSearchForm 
            defaultCaseId={searchParams.get("id") || ""} 
            isSearching={isSearching} 
            onSearch={handleSearch} 
          />
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
              <p>{error}</p>
              <p className="text-sm mt-1">Please check the case ID and try again.</p>
            </div>
          )}
          
          {caseData && <CaseDetails caseData={caseData} />}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TrackCase;
