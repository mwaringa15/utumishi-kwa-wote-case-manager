
import CaseCard from "@/components/CaseCard";
import { Case, CaseProgress, CaseStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EvidenceUploader } from "@/components/officer/EvidenceUploader";
import { useState } from "react";

interface AssignedCasesTabProps {
  cases: Case[];
  isLoading: boolean;
  onUpdateStatus: (caseId: string, newStatus: CaseStatus) => void;
  onUpdateProgress: (caseId: string, newProgress: CaseProgress) => void;
  onEvidenceUploaded: () => void;
}

export function AssignedCasesTab({ 
  cases, 
  isLoading, 
  onUpdateStatus, 
  onUpdateProgress,
  onEvidenceUploaded 
}: AssignedCasesTabProps) {
  const [selectedCaseForEvidence, setSelectedCaseForEvidence] = useState<string | null>(null);

  const handleEvidenceComplete = () => {
    setSelectedCaseForEvidence(null);
    onEvidenceUploaded();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Cases Assigned to You</h2>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-pulse text-gray-400">Loading cases...</div>
        </div>
      ) : cases.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cases.map((caseItem) => (
            <div key={caseItem.id} className="relative">
              <CaseCard 
                caseData={caseItem} 
                showActions={true}
                onUpdateStatus={onUpdateStatus}
                onUpdateProgress={onUpdateProgress}
              />
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="absolute top-4 right-4 bg-white"
                    onClick={() => setSelectedCaseForEvidence(caseItem.id)}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Evidence
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Evidence</DialogTitle>
                    <DialogDescription>
                      Attach evidence to case {caseItem.id}
                    </DialogDescription>
                  </DialogHeader>
                  <EvidenceUploader 
                    caseId={caseItem.id} 
                    onComplete={handleEvidenceComplete} 
                  />
                </DialogContent>
              </Dialog>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {cases.length === 0 ? "You don't have any assigned cases yet" : "No cases match your search criteria"}
          </p>
        </div>
      )}
    </div>
  );
}
