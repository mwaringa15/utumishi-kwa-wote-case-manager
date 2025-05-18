
import { useState } from "react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { EvidenceUploader } from "@/components/officer/EvidenceUploader";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface AssignedCasesTabProps {
  cases: Case[];
  isLoading: boolean;
  onUpdateStatus: (caseId: string, newStatus: CaseStatus) => void;
  onUpdateProgress: (caseId: string, newProgress: CaseProgress) => void;
  onEvidenceUploaded: () => void;
  onUploadEvidence?: (caseId: string, file: File, description: string) => Promise<boolean>;
}

export function AssignedCasesTab({ 
  cases, 
  isLoading, 
  onUpdateStatus, 
  onUpdateProgress,
  onEvidenceUploaded,
  onUploadEvidence
}: AssignedCasesTabProps) {
  const [selectedCaseForEvidence, setSelectedCaseForEvidence] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [evidenceDescription, setEvidenceDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);

  const handleEvidenceComplete = () => {
    setSelectedCaseForEvidence(null);
    onEvidenceUploaded();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadEvidence = async () => {
    if (!selectedCaseForEvidence || !selectedFile || !onUploadEvidence) {
      return;
    }

    setIsUploading(true);
    try {
      const success = await onUploadEvidence(
        selectedCaseForEvidence, 
        selectedFile, 
        evidenceDescription
      );

      if (success) {
        setEvidenceDialogOpen(false);
        setSelectedFile(null);
        setEvidenceDescription("");
        onEvidenceUploaded();
      }
    } finally {
      setIsUploading(false);
    }
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
              <div className="flex justify-between items-start mb-2">
                <div className="flex-grow">
                  <CaseCard 
                    caseData={caseItem} 
                    showActions={true}
                    onUpdateStatus={onUpdateStatus}
                    onUpdateProgress={onUpdateProgress}
                  />
                </div>
                <div className="ml-2">
                  <Dialog open={evidenceDialogOpen && selectedCaseForEvidence === caseItem.id} 
                    onOpenChange={(open) => {
                      setEvidenceDialogOpen(open);
                      if (!open) {
                        setSelectedFile(null);
                        setEvidenceDescription("");
                        setSelectedCaseForEvidence(null);
                      }
                    }}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedCaseForEvidence(caseItem.id);
                          setEvidenceDialogOpen(true);
                        }}
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
                      
                      <div className="space-y-4 py-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                          <Label htmlFor="evidence-file">Select File</Label>
                          <Input 
                            id="evidence-file" 
                            type="file" 
                            onChange={handleFileChange}
                          />
                        </div>
                        
                        <div className="grid w-full gap-1.5">
                          <Label htmlFor="evidence-description">Description</Label>
                          <Textarea 
                            id="evidence-description" 
                            placeholder="Describe this evidence..."
                            value={evidenceDescription}
                            onChange={(e) => setEvidenceDescription(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button 
                          variant="secondary" 
                          onClick={() => setEvidenceDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleUploadEvidence}
                          disabled={!selectedFile || isUploading}
                        >
                          {isUploading ? "Uploading..." : "Upload Evidence"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
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
