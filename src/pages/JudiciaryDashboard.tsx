import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { Case, CaseProgress, CaseStatus, JudiciaryStatus, CrimeReport } from "@/types"; // Added CrimeReport
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { BackButton } from "@/components/ui/back-button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const JudiciaryDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<JudiciaryStatus>("Pending Review");

  // Mock data (replace with API call later)
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockCases: Case[] = [
        {
          id: "JUD001",
          crimeReportId: "CR001",
          assignedOfficerId: "OFF001",
          assignedOfficerName: "John Doe",
          progress: "Completed" as CaseProgress, // Case is completed by officer
          status: "Submitted to Judiciary" as CaseStatus, // Actual status of the case
          lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          submittedToJudiciary: true,
          judiciaryStatus: "Pending Review" as JudiciaryStatus,
          crimeReport: {
            id: "CR001",
            title: "High Profile Robbery Case",
            description: "Armed robbery at Central Bank, suspects apprehended.",
            status: "Submitted to Judiciary" as CaseStatus, // Report status matches case
            createdById: "System",
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            crimeType: "Robbery",
            location: "Central Bank, Main Street",
          },
        },
        {
          id: "JUD002",
          crimeReportId: "CR002",
          assignedOfficerId: "OFF002",
          assignedOfficerName: "Jane Smith",
          progress: "Completed" as CaseProgress,
          status: "Under Court Process" as CaseStatus, // Case accepted and is under court process
          lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          submittedToJudiciary: true,
          judiciaryStatus: "Accepted" as JudiciaryStatus,
          crimeReport: {
            id: "CR002",
            title: "Cybercrime Investigation",
            description: "Large scale data breach from a tech company.",
            status: "Under Court Process" as CaseStatus,
            createdById: "System",
            createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            crimeType: "Cybercrime",
            location: "Tech Corp HQ",
          },
        },
        {
          id: "JUD003",
          crimeReportId: "CR003",
          assignedOfficerId: "OFF003",
          assignedOfficerName: "Mike Brown",
          progress: "Completed" as CaseProgress,
          status: "Returned from Judiciary" as CaseStatus, // Case returned for more info
          lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          submittedToJudiciary: true,
          judiciaryStatus: "Returned" as JudiciaryStatus,
          judiciaryCaseNotes: "Insufficient evidence provided. Please gather more witness testimonies.",
          crimeReport: {
            id: "CR003",
            title: "Fraudulent Insurance Claim",
            description: "Suspected fraudulent claim filed for property damage.",
            status: "Returned from Judiciary" as CaseStatus,
            createdById: "System",
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            crimeType: "Fraud",
            location: "InsureCorp Office",
          },
        },
      ];
      setCases(mockCases);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleUpdateJudiciaryStatus = (caseId: string, newStatus: JudiciaryStatus, notes?: string) => {
    setCases(prevCases =>
      prevCases.map(c => {
        if (c.id === caseId) {
          let caseNewStatus: CaseStatus = c.status; // Default to current status
          if (newStatus === "Accepted") caseNewStatus = "Under Court Process";
          else if (newStatus === "Returned") caseNewStatus = "Returned from Judiciary";
          // "Pending Review" doesn't change the top-level CaseStatus from "Submitted to Judiciary"

          return {
            ...c,
            judiciaryStatus: newStatus,
            status: caseNewStatus, // Update the main case status
            judiciaryCaseNotes: notes || c.judiciaryCaseNotes,
            lastUpdated: new Date().toISOString(),
            crimeReport: c.crimeReport ? { ...c.crimeReport, status: caseNewStatus } : undefined,
          };
        }
        return c;
      })
    );
    toast({
      title: `Case ${caseId} status updated`,
      description: `Status changed to ${newStatus}. ${notes ? "Notes added." : ""}`,
    });
  };

  const filteredCases = cases.filter(c => c.judiciaryStatus === activeTab);

  if (!user || user.role !== "Judiciary") {
    navigate("/login");
    return null;
  }
    
  // JSX for the component
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <BackButton />
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-kenya-black">Judiciary Dashboard</h1>
          <p className="text-gray-600">Welcome, {user?.name}</p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as JudiciaryStatus)} className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-3">
            <TabsTrigger value="Pending Review">Pending Review</TabsTrigger>
            <TabsTrigger value="Accepted">Accepted Cases</TabsTrigger>
            <TabsTrigger value="Returned">Returned Cases</TabsTrigger>
          </TabsList>

          {["Pending Review", "Accepted", "Returned"].map(tabStatus => (
            <TabsContent key={tabStatus} value={tabStatus}>
              <Card>
                <CardHeader>
                  <CardTitle>{tabStatus} Cases</CardTitle>
                  <CardDescription>
                    Cases currently marked as {tabStatus.toLowerCase()}.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p>Loading cases...</p>
                  ) : filteredCases.length === 0 ? (
                    <p>No cases to display in this category.</p>
                  ) : (
                    <div className="space-y-4">
                      {filteredCases.map(caseItem => (
                        <Card key={caseItem.id} className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{caseItem.crimeReport?.title}</h3>
                              <p className="text-sm text-gray-500">Case ID: {caseItem.id}</p>
                              <p className="text-sm text-gray-500">Officer: {caseItem.assignedOfficerName || "N/A"}</p>
                            </div>
                            <Badge variant={
                              caseItem.judiciaryStatus === "Accepted" ? "default" :
                              caseItem.judiciaryStatus === "Returned" ? "destructive" :
                              "outline"
                            }>
                              {caseItem.judiciaryStatus}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm">{caseItem.crimeReport?.description}</p>
                          {caseItem.judiciaryCaseNotes && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                              <p className="text-sm font-semibold">Judiciary Notes:</p>
                              <p className="text-sm text-yellow-700">{caseItem.judiciaryCaseNotes}</p>
                            </div>
                          )}
                          <div className="mt-4 flex space-x-2">
                            {caseItem.judiciaryStatus === "Pending Review" && (
                              <>
                                <Button size="sm" onClick={() => handleUpdateJudiciaryStatus(caseItem.id, "Accepted")}>
                                  Accept Case
                                </Button>
                                <DialogReturnCase caseItem={caseItem} onReturn={handleUpdateJudiciaryStatus} />
                              </>
                            )}
                            {caseItem.judiciaryStatus === "Accepted" && (
                               <p className="text-sm text-green-600">This case is under court process.</p>
                            )}
                             {caseItem.judiciaryStatus === "Returned" && (
                               <DialogReturnCase caseItem={caseItem} onReturn={handleUpdateJudiciaryStatus} isResubmit={true} />
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

interface DialogReturnCaseProps {
  caseItem: Case;
  onReturn: (caseId: string, newStatus: JudiciaryStatus, notes: string) => void;
  isResubmit?: boolean;
}

const DialogReturnCase: React.FC<DialogReturnCaseProps> = ({ caseItem, onReturn, isResubmit }) => {
  const [notes, setNotes] = useState(caseItem.judiciaryCaseNotes || "");
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = () => {
    onReturn(caseItem.id, "Returned", notes);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          {isResubmit ? "Update Return Notes" : "Return Case"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isResubmit ? "Update Notes for Returned Case" : "Return Case to Investigating Team"}</DialogTitle>
          <DialogDescription>
            Provide clear reasons and instructions for returning case: {caseItem.crimeReport?.title} (ID: {caseItem.id})
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="Enter notes for the investigating team..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
        />
        <Button onClick={handleSubmit} className="mt-4">
          {isResubmit ? "Update Notes" : "Return Case with Notes"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default JudiciaryDashboard;
