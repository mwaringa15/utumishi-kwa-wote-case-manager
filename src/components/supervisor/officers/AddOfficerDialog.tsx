
import { User } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

interface AddOfficerDialogProps {
  availableOfficers: User[];
}

export const AddOfficerDialog = ({ availableOfficers }: AddOfficerDialogProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Officer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Available Officers</DialogTitle>
        </DialogHeader>
        {availableOfficers.length > 0 ? (
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {availableOfficers.map(officer => (
                  <tr key={officer.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{officer.name}</td>
                    <td className="px-4 py-3">{officer.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-1 text-xs ${
                        officer.status === 'on_duty' ? 'bg-green-100 text-green-800' : 
                        officer.status === 'on_leave' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {officer.status === 'on_duty' ? 'On Duty' : 
                         officer.status === 'on_leave' ? 'On Leave' : 
                         'Off Duty'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            No available officers found for this station
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
