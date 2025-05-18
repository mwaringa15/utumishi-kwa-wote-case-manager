
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { StatsOverview } from "./StatsOverview";
import { AssignedCasesTab } from "./AssignedCasesTab";
import { PendingReportsTab } from "./PendingReportsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, UserCircle, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCasesAndReports } from "@/hooks/officer/useCasesAndReports";
import { Button } from "@/components/ui/button";
import CrimeReportForm from "@/components/CrimeReportForm";
import { BackButton } from "@/components/ui/back-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface OfficerDashboardProps {
  stationName?: string;
}

const OfficerDashboard = ({ stationName = "Unknown Station" }: OfficerDashboardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const { 
    assignedCases, 
    pendingReports, 
    officerReports,
    isLoading, 
    stats,
    handleUpdateStatus,
    handleUpdateProgress,
    handleAssignReport,
    handleEvidenceUploaded,
    handleUploadEvidence
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

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-kenya-black mb-1">Officer Dashboard</h1>
            <div className="flex items-center">
              <p className="text-gray-600">
                Welcome, Officer {user?.name}
              </p>
              {stationName && (
                <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-200">
                  {stationName} Station
                </Badge>
              )}
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-3">
            <Button 
              variant="outline"
              onClick={() => navigate("/officer-profile")}
              className="flex items-center gap-2"
            >
              <UserCircle className="h-4 w-4" />
              Profile
            </Button>
            
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
              className="flex items-center gap-2 bg-kenya-green hover:bg-kenya-green/90 text-white"
            >
              <FileText className="h-4 w-4" />
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
            <TabsTrigger value="my-reports">My Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="assigned">
            <AssignedCasesTab 
              cases={filteredCases} 
              isLoading={isLoading} 
              onUpdateStatus={handleUpdateStatus}
              onUpdateProgress={handleUpdateProgress}
              onEvidenceUploaded={handleEvidenceUploaded}
              onUploadEvidence={handleUploadEvidence}
            />
          </TabsContent>
          
          <TabsContent value="pending">
            <PendingReportsTab 
              reports={pendingReports} 
              isLoading={isLoading} 
              onAssign={handleAssignReport} 
            />
          </TabsContent>

          <TabsContent value="my-reports">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">My Crime Reports</h2>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-pulse text-gray-400">Loading reports...</div>
                </div>
              ) : officerReports && officerReports.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {officerReports.map((report) => (
                    <div key={report.id} className="bg-white border rounded-lg shadow-sm p-4">
                      <h3 className="font-semibold text-lg">{report.title}</h3>
                      <div className="mt-2 text-sm text-gray-500">
                        <p><span className="font-medium">Status:</span> {report.status}</p>
                        <p><span className="font-medium">Date:</span> {new Date(report.createdAt).toLocaleDateString()}</p>
                        <p><span className="font-medium">Location:</span> {report.location}</p>
                        <p><span className="font-medium">Type:</span> {report.crimeType || report.category}</p>
                      </div>
                      <div className="mt-3 border-t pt-3 text-sm">
                        <p className="line-clamp-2">{report.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">You haven't created any crime reports yet</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default OfficerDashboard;
