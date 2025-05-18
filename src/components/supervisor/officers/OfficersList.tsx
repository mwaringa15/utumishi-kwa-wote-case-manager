
import { OfficerProfile } from "@/components/officer/profile/ProfileContainer";
import { User, OfficerStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface OfficersListProps {
  officers: User[];
  officerProfiles: OfficerProfile[];
  isLoading: boolean;
  stationName: string;
}

export const OfficersList = ({
  officers,
  officerProfiles,
  isLoading,
  stationName,
}: OfficersListProps) => {
  if (isLoading) {
    return (
      <div className="p-4 rounded-md bg-muted">
        <p className="text-center">Loading officers...</p>
      </div>
    );
  }

  // If no station name is provided, show a warning
  if (!stationName || stationName === "No Station Selected") {
    return (
      <Alert variant="warning" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Station Selection Required</AlertTitle>
        <AlertDescription>
          Please select your station to view and manage officers. Log out and log in again to select a station.
        </AlertDescription>
      </Alert>
    );
  }

  // Priority use officers from the stationId query if available
  const displayOfficers = officers.length > 0 ? officers : officerProfiles;

  if (displayOfficers.length === 0) {
    return (
      <div className="p-4 rounded-md bg-muted">
        <p className="text-center">No officers found for {stationName || 'this station'}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {displayOfficers.map((officer) => (
        <div key={officer.id} className="p-4 bg-white rounded-lg shadow">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium">{officer.name || officer.full_name}</h3>
              <p className="text-sm text-gray-500">{officer.email}</p>
            </div>
            <Badge variant={officer.status === 'on_duty' ? 'default' : 'secondary'}>
              {officer.status === 'on_duty' ? 'On Duty' : 
               officer.status === 'on_leave' ? 'On Leave' : 'Off Duty'}
            </Badge>
          </div>
          <div className="mt-2">
            <p className="text-sm">
              <span className="font-medium">Cases:</span> {officer.assignedCases || 0}
            </p>
            <p className="text-sm">
              <span className="font-medium">Badge:</span> {officer.badgeNumber || 'N/A'}
            </p>
            <p className="text-sm">
              <span className="font-medium">Station:</span> {officer.station || stationName || 'Not assigned'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
