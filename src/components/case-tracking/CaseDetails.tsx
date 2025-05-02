
import { Button } from "@/components/ui/button";
import CaseCard from "@/components/CaseCard";
import { Case } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface CaseDetailsProps {
  caseData: Case;
}

export function CaseDetails({ caseData }: CaseDetailsProps) {
  return (
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
  );
}
