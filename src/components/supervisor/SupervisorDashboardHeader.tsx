
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SupervisorDashboardHeaderProps {
  user: User | null;
}

export function SupervisorDashboardHeader({ user }: SupervisorDashboardHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-kenya-black mb-1">Supervisor Dashboard</h1>
        <p className="text-gray-600">Welcome, {user?.name}</p>
      </div>
      <div className="flex gap-2 mt-4 sm:mt-0">
        <Button 
          variant="outline" 
          className="flex items-center"
          onClick={() => navigate("/track-case")}
        >
          <Search className="mr-2 h-4 w-4" />
          Track Case
        </Button>
        <Button 
          className="flex items-center bg-kenya-green hover:bg-kenya-green/90"
          onClick={() => navigate("/report-crime")}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Report
        </Button>
      </div>
    </div>
  );
}
