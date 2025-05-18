
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface CaseCompletionData {
  name: string;
  completed: number;
  inProgress: number;
  pending: number;
}

interface CaseCompletionChartProps {
  data: CaseCompletionData[];
  title?: string;
  description?: string;
  isLoading?: boolean;
}

export function CaseCompletionChart({ 
  data, 
  title = "Case Completion Status", 
  description = "Overview of case statuses by month", 
  isLoading = false 
}: CaseCompletionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            <div className="animate-pulse text-gray-400">Loading statistics...</div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex justify-center items-center h-[300px]">
            <div className="text-gray-400">No data available</div>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" stackId="a" name="Completed" fill="#4ade80" />
                <Bar dataKey="inProgress" stackId="a" name="In Progress" fill="#facc15" />
                <Bar dataKey="pending" stackId="a" name="Pending" fill="#fb923c" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
