
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  color?: string;
}

export function StatCard({ title, value, icon, color = "bg-blue-500" }: StatCardProps) {
  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className={`${color} p-2 rounded-full text-white`}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
