
import { User } from "@/types";

interface SupervisorDashboardHeaderProps {
  user: User | null;
}

export function SupervisorDashboardHeader({ user }: SupervisorDashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold text-kenya-black mb-1">Supervisor Dashboard</h1>
        <p className="text-gray-600">Welcome, {user?.name}</p>
      </div>
    </div>
  );
}
