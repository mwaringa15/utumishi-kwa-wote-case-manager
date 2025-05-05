
import React from "react";
import { MessageSquare } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Case, CaseProgress } from "@/types";

interface UpdateTabProps {
  caseData: Case;
  newUpdateText: string;
  setNewUpdateText: (text: string) => void;
  newProgress: CaseProgress;
  setNewProgress: (progress: CaseProgress) => void;
  handleAddUpdate: () => void;
  handleUpdateProgress: () => void;
}

export function UpdateTab({ 
  caseData, 
  newUpdateText, 
  setNewUpdateText, 
  newProgress, 
  setNewProgress, 
  handleAddUpdate, 
  handleUpdateProgress 
}: UpdateTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Case Update</CardTitle>
          <CardDescription>
            Add notes, observations, or other updates to the case file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="Enter your update here..."
            className="min-h-[150px]"
            value={newUpdateText}
            onChange={(e) => setNewUpdateText(e.target.value)}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setNewUpdateText("")}>
            Clear
          </Button>
          <Button onClick={handleAddUpdate}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Add Update
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Update Case Progress</CardTitle>
          <CardDescription>
            Update the current progress of this case
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Current Progress: <span className="font-semibold">{caseData.progress}</span>
            </label>
            
            <Select 
              value={newProgress} 
              onValueChange={(value: CaseProgress) => setNewProgress(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select new progress" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Pending Review">Pending Review</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleUpdateProgress}>
            Update Progress
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
