
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface CrimeStatistic {
  name: string;
  value: number;
  color: string;
}

interface CrimeStatisticsChartProps {
  data: CrimeStatistic[];
  title?: string;
  description?: string;
  isLoading?: boolean;
}

export function CrimeStatisticsChart({ 
  data, 
  title = "Crime Type Distribution", 
  description = "Distribution of crime reports by type", 
  isLoading = false 
}: CrimeStatisticsChartProps) {
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
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} reports`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
