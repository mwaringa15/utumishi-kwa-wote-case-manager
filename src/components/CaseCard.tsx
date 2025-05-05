
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Case, CaseProgress, CaseStatus } from "@/types";

interface CaseCardProps {
  caseData: Case;
  showActions?: boolean;
  onUpdateStatus?: (id: string, status: CaseStatus) => void;
  onUpdateProgress?: (id: string, progress: CaseProgress) => void;
}

const CaseCard = ({ 
  caseData, 
  showActions = false,
  onUpdateStatus,
  onUpdateProgress
}: CaseCardProps) => {
  // Function to get status badge color
  const getStatusColor = (status: CaseStatus) => {
    switch (status) {
      case "Submitted": return "bg-blue-500";
      case "Under Investigation": return "bg-amber-500";
      case "Closed": return "bg-green-500";
      case "Rejected": return "bg-red-500";
      case "Submitted to Judiciary": return "bg-purple-500";
      case "Under Court Process": return "bg-indigo-500";
      case "Returned from Judiciary": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };
  
  // Function to get progress badge color
  const getProgressColor = (progress: CaseProgress) => {
    switch (progress) {
      case "Pending": return "bg-gray-500";
      case "In Progress": return "bg-kenya-red";
      case "Pending Review": return "bg-purple-500";
      case "Completed": return "bg-kenya-green";
      default: return "bg-gray-500";
    }
  };

  // Helper function to get next status
  const getNextStatus = (currentStatus: CaseStatus): CaseStatus => {
    if (currentStatus === "Submitted") return "Under Investigation";
    if (currentStatus === "Under Investigation") return "Closed";
    return "Submitted";
  };

  // Helper function to get next progress
  const getNextProgress = (currentProgress: CaseProgress): CaseProgress => {
    if (currentProgress === "Pending") return "In Progress";
    if (currentProgress === "In Progress") return "Completed";
    if (currentProgress === "Completed") return "Pending";
    return "Pending";
  };

  return (
    <Card className="w-full shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">
            {caseData.crimeReport?.title || "Case Report"}
          </CardTitle>
          <div className="flex space-x-2">
            {caseData.crimeReport?.status && (
              <Badge className={getStatusColor(caseData.crimeReport.status)}>
                {caseData.crimeReport.status}
              </Badge>
            )}
            <Badge className={getProgressColor(caseData.progress)}>
              {caseData.progress}
            </Badge>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Case ID: {caseData.id || "Unknown"}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-2">
          <p className="text-sm text-gray-700 line-clamp-2">
            {caseData.crimeReport?.description || "No description available"}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Last Updated:</span>{" "}
              {new Date(caseData.lastUpdated || Date.now()).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Assigned Officer:</span>{" "}
              {caseData.assignedOfficerId || "Pending Assignment"}
            </div>
          </div>
        </div>
      </CardContent>
      
      {showActions && (
        <CardFooter className="flex justify-end space-x-2 pt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onUpdateProgress?.(
              caseData.id, 
              getNextProgress(caseData.progress)
            )}
          >
            Update Progress
          </Button>
          <Button 
            size="sm" 
            className="bg-kenya-green hover:bg-kenya-green/90 text-white"
            onClick={() => caseData.crimeReport?.status && onUpdateStatus?.(
              caseData.id, 
              getNextStatus(caseData.crimeReport.status)
            )}
          >
            Update Status
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default CaseCard;
