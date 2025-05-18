
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
import { Badge } from "@/components/ui/badge";

interface OfficerSelectionDialogProps {
  officers: UserType[];
  caseId: string;
  stationName?: string;
  onAssign: (caseId: string, officerId: string, officerName: string) => void;
}

export function OfficerSelectionDialog({ officers, caseId, stationName, onAssign }: OfficerSelectionDialogProps) {
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
            {stationName ? 
              `Select an officer from ${stationName} station to assign to this case.` :
              `Select an officer to assign to this case.`
            }
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {officers.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No officers available {stationName ? `in ${stationName} station` : ''}.
            </div>
          ) : (
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
                        Badge: {officer.badgeNumber} | Cases: {officer.assignedCases || 0}
                      </div>
                      <div className="mt-1">
                        <Badge variant="outline" className="text-xs">
                          {officer.station || "No station"}
                        </Badge>
                        <Badge 
                          className={
                            officer.status === "on_duty" ? "bg-green-100 text-green-800 ml-2 text-xs" :
                            officer.status === "on_leave" ? "bg-amber-100 text-amber-800 ml-2 text-xs" :
                            "bg-gray-100 text-gray-800 ml-2 text-xs"
                          }
                        >
                          {officer.status === "on_duty" ? "On Duty" : 
                          officer.status === "on_leave" ? "On Leave" : 
                          "Off Duty"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => onAssign(caseId, officer.id, officer.name)}
                    disabled={officer.status !== "on_duty"}
                  >
                    Assign
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
