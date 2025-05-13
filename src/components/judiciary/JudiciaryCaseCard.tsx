
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Case, JudiciaryStatus } from "@/types";
import DialogReturnCase from "./DialogReturnCase"; // Import the separated dialog

interface JudiciaryCaseCardProps {
  caseItem: Case;
  onUpdateStatus: (caseId: string, newStatus: JudiciaryStatus, notes?: string) => void;
}

const JudiciaryCaseCard: React.FC<JudiciaryCaseCardProps> = ({ caseItem, onUpdateStatus }) => {
  return (
    <Card className="p-4">
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
            <Button size="sm" onClick={() => onUpdateStatus(caseItem.id, "Accepted")}>
              Accept Case
            </Button>
            <DialogReturnCase caseItem={caseItem} onReturn={onUpdateStatus} />
          </>
        )}
        {caseItem.judiciaryStatus === "Accepted" && (
           <p className="text-sm text-green-600">This case is under court process.</p>
        )}
         {caseItem.judiciaryStatus === "Returned" && (
           <DialogReturnCase caseItem={caseItem} onReturn={onUpdateStatus} isResubmit={true} />
        )}
      </div>
    </Card>
  );
};

export default JudiciaryCaseCard;
