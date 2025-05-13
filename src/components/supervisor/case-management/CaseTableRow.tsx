
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { Case, User as UserType } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CaseStatusBadge } from "./CaseStatusBadge";
import { OfficerSelectionDialog } from "./OfficerSelectionDialog";

interface CaseTableRowProps {
  caseItem: Case;
  officers: UserType[];
  handleAssignCase: (caseId: string, officerId: string, officerName: string) => void;
  handleSubmitToJudiciary: (caseId: string) => void;
}

export function CaseTableRow({ 
  caseItem, 
  officers,
  handleAssignCase,
  handleSubmitToJudiciary 
}: CaseTableRowProps) {
  const navigate = useNavigate();
  
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
        {caseItem.id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
        {caseItem.crimeReport?.title}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {caseItem.crimeReport?.crimeType || "N/A"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {caseItem.assignedOfficerName ? (
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
              <User className="h-4 w-4 text-gray-600" />
            </div>
            <span>{caseItem.assignedOfficerName}</span>
          </div>
        ) : (
          <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50">
            Unassigned
          </Badge>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <CaseStatusBadge progress={caseItem.progress} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(caseItem.lastUpdated).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/case/${caseItem.id}`)}
          >
            View
          </Button>
          
          <OfficerSelectionDialog 
            officers={officers} 
            caseId={caseItem.id}
            onAssign={handleAssignCase}
          />
          
          {caseItem.progress === "Completed" && !caseItem.submittedToJudiciary && (
            <Button 
              variant="default"
              size="sm"
              className="bg-kenya-black hover:bg-kenya-black/90"
              onClick={() => handleSubmitToJudiciary(caseItem.id)}
            >
              Submit to Judiciary
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
