
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import CaseCard from "@/components/CaseCard";
import { Case } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { FileText, Clock } from "lucide-react";

interface CaseDetailsProps {
  caseData: Case;
}

export function CaseDetails({ caseData }: CaseDetailsProps) {
  // Format the case ID to be more user-friendly
  const formattedCaseId = caseData?.id ? caseData.id.substring(0, 8).toUpperCase() : "UNKNOWN";
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Case Information</h2>
        <span className="text-sm bg-gray-100 px-2 py-1 rounded">ID: {formattedCaseId}</span>
      </div>
      
      <CaseCard caseData={caseData} />
      
      <div className="mt-8 border-t pt-6">
        <h3 className="font-semibold mb-3">Case Timeline</h3>
        <div className="space-y-4">
          {/* Case Creation Entry */}
          <div className="flex">
            <div className="w-10 h-10 rounded-full bg-green-100 flex-shrink-0 flex items-center justify-center">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Case Created</p>
              <p className="text-xs text-gray-500">
                {caseData.crimeReport?.createdAt ? 
                  new Date(caseData.crimeReport.createdAt).toLocaleDateString() : 
                  "Unknown date"}
              </p>
              <p className="text-sm mt-1">
                A new case has been opened based on your crime report.
              </p>
            </div>
          </div>
          
          {/* Latest Update Entry */}
          <div className="flex">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                {caseData.assignedOfficerId ? 
                  `Officer ${caseData.assignedOfficerName || caseData.assignedOfficerId.substring(0, 8)}` : 
                  "Status Update"}
              </p>
              <p className="text-xs text-gray-500">
                {caseData.lastUpdated ? 
                  new Date(caseData.lastUpdated).toLocaleDateString() + 
                  ` (${formatDistanceToNow(new Date(caseData.lastUpdated), { addSuffix: true })})` : 
                  "Recently"}
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
      
      <div className="flex justify-between items-center mt-6 pt-4 border-t">
        <div className="text-sm text-gray-500">
          <p>Please quote your case ID when contacting us</p>
        </div>
        <Button 
          variant="outline"
          className="text-kenya-red"
          onClick={() => window.print()}
        >
          Print Report
        </Button>
      </div>
    </div>
  );
}
