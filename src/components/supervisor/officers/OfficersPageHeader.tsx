
import { BackButton } from "@/components/ui/back-button";
import { SupervisorProfileCard } from "./SupervisorProfileCard";
import { AddOfficerDialog } from "./AddOfficerDialog";
import { User } from "@/types";

interface OfficersPageHeaderProps {
  stationName: string;
  stationId: string | null;
  supervisorProfile: {
    name: string;
    email: string;
    station: string;
  } | null;
  availableOfficers: User[];
  onOfficerAdded?: () => void;
}

export const OfficersPageHeader = ({ 
  stationName, 
  stationId,
  supervisorProfile,
  availableOfficers,
  onOfficerAdded
}: OfficersPageHeaderProps) => {
  return (
    <div className="mb-6">
      <BackButton />
      <div className="flex justify-between items-center mt-4">
        <div>
          <h1 className="text-2xl font-bold">Officer Management</h1>
          <p className="text-gray-500">View and manage officers in {stationName || 'Loading...'}</p>
          <SupervisorProfileCard profile={supervisorProfile} />
        </div>
        <AddOfficerDialog 
          availableOfficers={availableOfficers} 
          stationId={stationId}
          onOfficerAdded={onOfficerAdded}
        />
      </div>
    </div>
  );
};
