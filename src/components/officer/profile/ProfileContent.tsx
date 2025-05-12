
import { Case, OfficerStatus } from "@/types";
import { OfficerProfile } from "./ProfileContainer";
import { OfficerProfileCard } from "./OfficerProfileCard";
import { AssignedCasesTable } from "./AssignedCasesTable";

interface ProfileContentProps {
  profile: OfficerProfile;
  assignedCases: Case[];
  onStatusUpdate: (status: OfficerStatus) => Promise<void>;
  statusLoading: boolean;
}

export const ProfileContent: React.FC<ProfileContentProps> = ({ 
  profile, 
  assignedCases, 
  onStatusUpdate, 
  statusLoading 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <OfficerProfileCard 
          profile={profile}
          onStatusUpdate={onStatusUpdate}
          statusLoading={statusLoading}
        />
      </div>

      <div className="lg:col-span-2">
        <AssignedCasesTable cases={assignedCases} />
      </div>
    </div>
  );
};
