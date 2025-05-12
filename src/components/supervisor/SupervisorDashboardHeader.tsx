
import { User } from "@/types";
import { UserCircle } from "lucide-react";

interface SupervisorDashboardHeaderProps {
  user: User | null;
  station?: string | null;
}

export function SupervisorDashboardHeader({ user, station }: SupervisorDashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold text-kenya-black mb-1">Supervisor Dashboard</h1>
        <p className="text-gray-600 flex items-center gap-2">
          Welcome, {user?.name}
          {station && (
            <>
              <span className="inline-block w-1 h-1 rounded-full bg-gray-400"></span>
              <span className="text-sm font-medium bg-blue-50 text-blue-800 px-2 py-0.5 rounded">
                {station} Station
              </span>
            </>
          )}
        </p>
      </div>
      <div className="mt-4 sm:mt-0">
        <button 
          onClick={() => window.location.href = "/supervisor-profile"}
          className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 shadow hover:bg-gray-50 border border-gray-200"
        >
          <UserCircle className="h-5 w-5 text-gray-600" />
          <span>Profile</span>
        </button>
      </div>
    </div>
  );
}
