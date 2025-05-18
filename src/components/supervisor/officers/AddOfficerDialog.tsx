
import { User, OfficerStatus } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddOfficerDialogProps {
  availableOfficers: User[];
  stationId: string | null;
  onOfficerAdded?: () => void;
}

export const AddOfficerDialog = ({ availableOfficers, stationId, onOfficerAdded }: AddOfficerDialogProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleAddOfficer = async () => {
    if (!selectedOfficerId || !stationId) {
      toast({
        title: "Selection required",
        description: "Please select an officer to add to this station.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Update the officer's station_id in the database
    const { error } = await supabase
      .from('users')
      .update({ station_id: stationId })
      .eq('id', selectedOfficerId);
      
    setIsLoading(false);
    
    if (error) {
      console.error("Error adding officer to station:", error);
      toast({
        title: "Failed to add officer",
        description: error.message,
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Officer added",
      description: "Officer has been successfully added to your station.",
      variant: "default"
    });
    
    // Close the dialog and trigger refresh
    setDialogOpen(false);
    if (onOfficerAdded) {
      onOfficerAdded();
    }
  };
  
  // Filter available officers to exclude those already assigned to this station
  const unassignedOfficers = availableOfficers.filter(officer => 
    !officer.station || officer.station === "Unassigned"
  );
  
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
          <DialogTitle>Add Officer to Station</DialogTitle>
        </DialogHeader>
        
        {unassignedOfficers.length > 0 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="officer-select" className="text-sm font-medium">
                Select Officer
              </label>
              <Select
                value={selectedOfficerId}
                onValueChange={setSelectedOfficerId}
              >
                <SelectTrigger id="officer-select" className="w-full">
                  <SelectValue placeholder="Select an officer" />
                </SelectTrigger>
                <SelectContent>
                  {unassignedOfficers.map(officer => (
                    <SelectItem key={officer.id} value={officer.id}>
                      {officer.name} ({officer.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleAddOfficer} 
                disabled={isLoading || !selectedOfficerId}
              >
                {isLoading ? "Adding..." : "Add to Station"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            No unassigned officers available to add to this station
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
