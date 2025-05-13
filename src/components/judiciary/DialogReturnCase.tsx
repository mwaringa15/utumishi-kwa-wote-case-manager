
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Case, JudiciaryStatus } from "@/types";

export interface DialogReturnCaseProps {
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

export default DialogReturnCase;
