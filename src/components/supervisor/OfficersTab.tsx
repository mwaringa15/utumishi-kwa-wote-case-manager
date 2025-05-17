
import { User as UserIcon, Users, MapPin, PhoneCall, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { User, OfficerStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { OfficerProfile } from "@/components/officer/profile/ProfileContainer";
import { OfficerProfileCard } from "@/components/officer/profile/OfficerProfileCard";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface OfficersTabProps {
  officers: User[];
  officerProfiles?: OfficerProfile[];
  isLoading: boolean;
  stationName?: string;
}

export function OfficersTab({ officers, officerProfiles = [], isLoading, stationName }: OfficersTabProps) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  
  // Use officer profiles if available, otherwise fall back to regular officers
  const displayOfficers = officerProfiles.length > 0
    ? officerProfiles
    : officers.map(o => ({
        id: o.id,
        full_name: o.name,
        email: o.email,
        role: o.role,
        status: o.status as OfficerStatus,
        station: o.station
      }));
      
  console.log("Officers to display:", displayOfficers);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {stationName 
            ? `Police Officers in ${stationName}` 
            : 'Police Officers'}
        </h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setViewMode('cards')}>
            <Users className="h-4 w-4 mr-2" />
            Cards
          </Button>
          <Button variant="outline" onClick={() => setViewMode('table')}>
            <Users className="h-4 w-4 mr-2" />
            Table
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Skeleton className="h-12 w-12 rounded-full mr-3" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-3/4 mb-2" />
                <div className="flex justify-end mt-4">
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        displayOfficers.length > 0 ? (
          <>
            {/* Card view */}
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayOfficers.map((officer) => (
                  <div key={officer.id} className="relative">
                    <OfficerProfileCard 
                      profile={officer}
                      onStatusUpdate={async () => {}}
                      statusLoading={false}
                      viewMode="compact"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="absolute top-4 right-4"
                      onClick={() => {
                        // If this is an actual officer, you could navigate to their profile
                        console.log("View officer:", officer.id);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-2" />
                      Details
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Table view */}
            {viewMode === 'table' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Station</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayOfficers.map((officer) => (
                    <TableRow key={officer.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <div className="bg-gray-200 rounded-full p-1 mr-2">
                            <UserIcon className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>{officer.full_name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{officer.email}</TableCell>
                      <TableCell>{officer.station || "Not assigned"}</TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            officer.status === "on_duty" ? "bg-green-100 text-green-800" :
                            officer.status === "on_leave" ? "bg-amber-100 text-amber-800" :
                            "bg-gray-100 text-gray-800"
                          }
                        >
                          {officer.status === "on_duty" ? "On Duty" : 
                          officer.status === "on_leave" ? "On Leave" : 
                          "Off Duty"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            console.log("View officer details:", officer.id);
                          }}
                        >
                          <Eye className="h-3 w-3 mr-2" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No officers found for this station</p>
          </div>
        )
      )}
    </div>
  );
}
