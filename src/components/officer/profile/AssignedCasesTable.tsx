
import { Case, CaseProgress } from "@/types";
import { CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface AssignedCasesTableProps {
  cases: Case[];
}

export const AssignedCasesTable = ({ cases }: AssignedCasesTableProps) => {
  const navigate = useNavigate();
  
  // Display badge with appropriate color based on case priority
  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-500">High</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500">Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-500">Low</Badge>;
      default:
        return <Badge className="bg-gray-500">Normal</Badge>;
    }
  };

  // Display badge with appropriate color based on case status/progress
  const getProgressBadge = (progress?: string) => {
    switch (progress) {
      case 'Completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'In Progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'Pending Review':
        return <Badge className="bg-purple-100 text-purple-800">Pending Review</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{progress}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assigned Cases</CardTitle>
        <CardDescription>
          Cases currently assigned to you ({cases.length})
        </CardDescription>
      </CardHeader>
      <CardContent>
        {cases.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((caseItem) => (
                <TableRow key={caseItem.id}>
                  <TableCell className="font-medium">{caseItem.id.substring(0, 8)}...</TableCell>
                  <TableCell>{caseItem.crimeReport?.title || "Unknown"}</TableCell>
                  <TableCell>{getProgressBadge(caseItem.progress)}</TableCell>
                  <TableCell>{getPriorityBadge(caseItem.priority)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <CalendarClock className="h-3 w-3 text-gray-500" />
                      <span className="text-sm text-gray-500">
                        {new Date(caseItem.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate(`/case/${caseItem.id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No cases assigned to you yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};
