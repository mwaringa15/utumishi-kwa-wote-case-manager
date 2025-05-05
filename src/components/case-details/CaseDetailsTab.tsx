
import React from "react";
import { MapPin, User, Clock } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Case, CaseUpdate } from "@/types";

interface CaseDetailsTabProps {
  caseData: Case;
  caseUpdates: CaseUpdate[];
  onViewAllUpdates: () => void;
  canEditCase: boolean;
  onNavigateToTab: (tabId: string) => void;
}

export function CaseDetailsTab({
  caseData,
  caseUpdates,
  onViewAllUpdates,
  canEditCase,
  onNavigateToTab
}: CaseDetailsTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <CrimeReportCard caseData={caseData} />
        
        {caseData.crimeReport?.victimName && (
          <VictimInfoCard caseData={caseData} />
        )}
        
        <UpdatesCard 
          caseUpdates={caseUpdates} 
          onViewAllUpdates={onViewAllUpdates} 
        />
      </div>
      
      <div>
        <CaseInfoCard caseData={caseData} />
        
        {caseData.judiciaryCaseNotes && (
          <JudiciaryNotesCard notes={caseData.judiciaryCaseNotes} />
        )}
        
        {canEditCase && (
          <ActionsCard onNavigateToTab={onNavigateToTab} />
        )}
      </div>
    </div>
  );
}

// Crime Report Card Component
interface CrimeReportCardProps {
  caseData: Case;
}

function CrimeReportCard({ caseData }: CrimeReportCardProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Crime Report Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Description</h3>
          <p className="mt-1 text-gray-800">{caseData.crimeReport?.description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Crime Type</h3>
            <p className="mt-1 text-gray-800">{caseData.crimeReport?.crimeType || "Not specified"}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className="mt-1 text-gray-800">{caseData.crimeReport?.status}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Date Reported</h3>
            <p className="mt-1 text-gray-800">
              {new Date(caseData.crimeReport?.createdAt || "").toLocaleDateString()}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Location</h3>
            <p className="mt-1 text-gray-800 flex items-center">
              <MapPin className="h-4 w-4 mr-1 text-gray-400" />
              {caseData.crimeReport?.location || "Not specified"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Victim Information Card Component
interface VictimInfoCardProps {
  caseData: Case;
}

function VictimInfoCard({ caseData }: VictimInfoCardProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Victim Information</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Name</h3>
          <p className="mt-1 text-gray-800">{caseData.crimeReport?.victimName}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Contact</h3>
          <p className="mt-1 text-gray-800">{caseData.crimeReport?.victimContact || "Not provided"}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Updates Card Component
interface UpdatesCardProps {
  caseUpdates: CaseUpdate[];
  onViewAllUpdates: () => void;
}

function UpdatesCard({ caseUpdates, onViewAllUpdates }: UpdatesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Updates</CardTitle>
      </CardHeader>
      <CardContent>
        {caseUpdates.length > 0 ? (
          <div className="space-y-4">
            {caseUpdates.slice(0, 3).map(update => (
              <div key={update.id} className="border-l-4 border-kenya-green pl-4 py-1">
                <p className="text-gray-800">{update.content}</p>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <User className="h-4 w-4 mr-1" />
                  <span>{update.officerName}</span>
                  <span className="mx-2">•</span>
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{new Date(update.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No updates yet</p>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={onViewAllUpdates}
        >
          View All Updates
        </Button>
      </CardFooter>
    </Card>
  );
}

// Case Information Card Component
interface CaseInfoCardProps {
  caseData: Case;
}

function CaseInfoCard({ caseData }: CaseInfoCardProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Case Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Assigned Officer</h3>
          <p className="mt-1 text-gray-800 flex items-center">
            <User className="h-4 w-4 mr-1 text-gray-400" />
            {caseData.assignedOfficerName || "Not assigned"}
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
          <p className="mt-1 text-gray-800 flex items-center">
            <Clock className="h-4 w-4 mr-1 text-gray-400" />
            {new Date(caseData.lastUpdated).toLocaleDateString()}
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Progress</h3>
          <p className="mt-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              caseData.progress === "Completed" ? "bg-green-100 text-green-800" :
              caseData.progress === "In Progress" ? "bg-blue-100 text-blue-800" :
              caseData.progress === "Pending Review" ? "bg-purple-100 text-purple-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {caseData.progress}
            </span>
          </p>
        </div>
        
        {caseData.submittedToJudiciary && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Judiciary Status</h3>
            <p className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                caseData.judiciaryStatus === "Accepted" ? "bg-green-100 text-green-800" :
                caseData.judiciaryStatus === "Returned" ? "bg-red-100 text-red-800" :
                "bg-amber-100 text-amber-800"
              }`}>
                {caseData.judiciaryStatus || "Pending"}
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Judiciary Notes Card Component
interface JudiciaryNotesCardProps {
  notes: string;
}

function JudiciaryNotesCard({ notes }: JudiciaryNotesCardProps) {
  return (
    <Card className="mb-6 border-amber-200">
      <CardHeader className="bg-amber-50 border-b border-amber-100">
        <CardTitle className="text-amber-900 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Judiciary Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-2">
        <p className="text-amber-800">{notes}</p>
      </CardContent>
    </Card>
  );
}

// Actions Card Component
interface ActionsCardProps {
  onNavigateToTab: (tabId: string) => void;
}

function ActionsCard({ onNavigateToTab }: ActionsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center"
          onClick={() => onNavigateToTab('notes-tab')}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Add Update
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center"
        >
          <Paperclip className="h-4 w-4 mr-2" />
          Add Evidence
        </Button>
      </CardContent>
    </Card>
  );
}

// Fix missing import
import { MessageSquare, Paperclip, AlertCircle } from "lucide-react";
