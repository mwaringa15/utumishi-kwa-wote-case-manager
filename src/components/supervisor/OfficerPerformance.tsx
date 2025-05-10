
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/types";

interface OfficerPerformanceProps {
  officers: User[];
  isLoading: boolean;
}

export function OfficerPerformance({ officers, isLoading }: OfficerPerformanceProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Officer Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-40 flex items-center justify-center">
            <p className="text-muted-foreground animate-pulse">Loading officer data...</p>
          </div>
        ) : officers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Officer</TableHead>
                <TableHead>Cases Assigned</TableHead>
                <TableHead>Resolved</TableHead>
                <TableHead className="text-right">Completion Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {officers.map((officer) => {
                // Demo data - in a real app, this would come from the database
                const resolvedCases = Math.floor(Math.random() * (officer.assignedCases || 0));
                const completionRate = officer.assignedCases ? 
                  Math.round((resolvedCases / officer.assignedCases) * 100) : 0;
                
                return (
                  <TableRow key={officer.id}>
                    <TableCell className="font-medium">{officer.name}</TableCell>
                    <TableCell>{officer.assignedCases || 0}</TableCell>
                    <TableCell>{resolvedCases}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Progress value={completionRate} className="h-2 w-20" />
                        <span className="text-xs w-8">{completionRate}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No officer data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
