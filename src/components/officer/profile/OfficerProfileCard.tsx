
import { OfficerStatus } from "@/types";
import { UserCircle, Shield, Mail, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OfficerProfile } from "./ProfileContainer";

interface OfficerProfileCardProps {
  profile: OfficerProfile;
  onStatusUpdate: (newStatus: OfficerStatus) => Promise<void>;
  statusLoading: boolean;
  viewMode?: 'full' | 'compact';
}

export const OfficerProfileCard = ({ 
  profile, 
  onStatusUpdate,
  statusLoading,
  viewMode = 'full'
}: OfficerProfileCardProps) => {
  // Display badge with appropriate color based on status
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'on_duty':
        return <Badge className="bg-green-500">On Duty</Badge>;
      case 'on_leave':
        return <Badge className="bg-amber-500">On Leave</Badge>;
      case 'off_duty':
        return <Badge className="bg-gray-500">Off Duty</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // For compact mode (used in supervisor view)
  if (viewMode === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="bg-gray-200 rounded-full p-3 mr-4">
                <UserCircle className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium text-lg">{profile.full_name}</h3>
                <p className="text-gray-500">{profile.email}</p>
                {profile.station && (
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                    <span>{profile.station}</span>
                  </div>
                )}
                <div className="mt-2">
                  {getStatusBadge(profile.status)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full mode (default officer profile view)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Your profile details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 pb-2">
          <div className="bg-gray-200 rounded-full p-3">
            <UserCircle className="h-8 w-8 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{profile.full_name}</h3>
            {getStatusBadge(profile.status)}
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">{profile.role}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">{profile.email}</span>
          </div>
          {profile.station && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">{profile.station}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t p-4">
        <div className="w-full">
          <h4 className="font-medium text-sm mb-2">Update Your Status</h4>
          <div className="flex gap-3">
            <Select 
              disabled={statusLoading}
              defaultValue={profile.status}
              onValueChange={(value) => onStatusUpdate(value as OfficerStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="on_duty">On Duty</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
                <SelectItem value="off_duty">Off Duty</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
