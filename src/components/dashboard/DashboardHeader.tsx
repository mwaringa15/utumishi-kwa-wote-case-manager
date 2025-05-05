
import { Button } from "@/components/ui/button";
import { FileText, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  userName?: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold text-kenya-black mb-1">My Dashboard</h1>
        <p className="text-gray-600">Welcome back, {userName}</p>
      </div>
      <div className="mt-4 sm:mt-0 flex gap-2">
        <Button 
          onClick={() => navigate("/report-crime")}
          className="bg-kenya-red hover:bg-kenya-red/90 text-white flex items-center"
        >
          <FileText className="mr-2 h-4 w-4" />
          Report Crime
        </Button>
        <Button 
          onClick={() => navigate("/track-case")}
          variant="outline"
          className="flex items-center"
        >
          <Search className="mr-2 h-4 w-4" />
          Track Case
        </Button>
      </div>
    </div>
  );
}
