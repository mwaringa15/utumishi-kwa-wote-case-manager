
import { Badge } from "@/components/ui/badge";

interface CaseStatusBadgeProps {
  progress: string;
}

export function CaseStatusBadge({ progress }: CaseStatusBadgeProps) {
  const getProgressColor = (progress: string) => {
    switch (progress) {
      case "Completed": return "bg-green-100 text-green-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Pending Review": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Badge className={getProgressColor(progress)}>
      {progress}
    </Badge>
  );
}
