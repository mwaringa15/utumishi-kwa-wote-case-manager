
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { StatsOverview } from "./StatsOverview";
import { AssignedCasesTab } from "./AssignedCasesTab";
import { PendingReportsTab } from "./PendingReportsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCasesAndReports } from "@/hooks/officer/useCasesAndReports";
import { Button } from "@/components/ui/button";
import CrimeReportForm from "@/components/CrimeReportForm";
import { BackButton } from "@/components/ui/back-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const OfficerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const { 
    assignedCases, 
    pendingReports, 
    isLoading, 
    stats,
    handleUpdateStatus,
    handleUpdateProgress,
    handleAssignReport,
    handleEvidenceUploaded
  } = useCasesAndReports(user);
  
  // Filter cases based on search term
  const filteredCases = assignedCases.filter(caseItem => 
    caseItem.crimeReport?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseItem.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <BackButton />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-kenya-black mb-1">Officer Dashboard</h1>
            <p className="text-gray-600">Welcome, Officer {user?.name}</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <Dialog open={openReportDialog} onOpenChange={setOpenReportDialog}>
              <DialogTrigger asChild>
                <Button className="bg-kenya-green hover:bg-kenya-green/90 text-white">
                  New Crime Report
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Crime Report</DialogTitle>
                </DialogHeader>
                <CrimeReportForm onComplete={() => setOpenReportDialog(false)} />
              </DialogContent>
            </Dialog>

            <Button 
              onClick={() => navigate("/officer-reports")}
              className="bg-kenya-green hover:bg-kenya-green/90 text-white"
            >
              View All Reports
            </Button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <StatsOverview stats={stats} />
        
        {/* Search and filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative grow max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <Tabs defaultValue="assigned" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="assigned">Assigned Cases</TabsTrigger>
            <TabsTrigger value="pending">Pending Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="assigned">
            <AssignedCasesTab 
              cases={filteredCases} 
              isLoading={isLoading} 
              onUpdateStatus={handleUpdateStatus}
              onUpdateProgress={handleUpdateProgress}
              onEvidenceUploaded={handleEvidenceUploaded}
            />
          </TabsContent>
          
          <TabsContent value="pending">
            <PendingReportsTab 
              reports={pendingReports} 
              isLoading={isLoading} 
              onAssign={handleAssignReport} 
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default OfficerDashboard;
