
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User as UserType } from "@/types";

interface OfficerSelectionDialogProps {
  officers: UserType[];
  caseId: string;
  onAssign: (caseId: string, officerId: string, officerName: string) => void;
}

export function OfficerSelectionDialog({ officers, caseId, onAssign }: OfficerSelectionDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Assign
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Case to Officer</DialogTitle>
          <DialogDescription>
            Select an officer to assign to this case.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {officers.map((officer) => (
              <div 
                key={officer.id} 
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <div className="bg-gray-200 rounded-full p-2 mr-3">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium">{officer.name}</div>
                    <div className="text-sm text-gray-500">
                      Badge: {officer.badgeNumber} | Cases: {officer.assignedCases}
                    </div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => onAssign(caseId, officer.id, officer.name)}
                >
                  Assign
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
