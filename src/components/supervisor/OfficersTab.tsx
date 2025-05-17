
import { User as UserIcon, Users, MapPin, PhoneCall } from "lucide-react";
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

interface OfficersTabProps {
  officers: User[];
  isLoading: boolean;
}

export function OfficersTab({ officers, isLoading }: OfficersTabProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Police Officers</h2>
        <Button>
          <Users className="h-4 w-4 mr-2" />
          Manage Officers
        </Button>
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
        officers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {officers.map((officer) => (
              <Card key={officer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="bg-gray-200 rounded-full p-3 mr-4">
                        <UserIcon className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{officer.name}</h3>
                        <p className="text-gray-500">{officer.email}</p>
                        {officer.station && (
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                            <span>{officer.station}</span>
                          </div>
                        )}
                        <div className="flex items-center mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {officer.badgeNumber || 'No Badge'}
                          </span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-sm text-gray-600">
                            {officer.assignedCases} active cases
                          </span>
                        </div>
                        <Badge 
                          className={`mt-2 ${
                            officer.status === "on_duty" ? "bg-green-100 text-green-800" :
                            officer.status === "on_leave" ? "bg-amber-100 text-amber-800" :
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {officer.status === "on_duty" ? "On Duty" : 
                          officer.status === "on_leave" ? "On Leave" : 
                          "Off Duty"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      View Cases
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No officers found for this station</p>
          </div>
        )
      )}
      
      {/* Table view for larger screens */}
      {!isLoading && officers.length > 0 && (
        <div className="hidden xl:block mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Badge Number</TableHead>
                <TableHead>Station</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Active Cases</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {officers.map((officer) => (
                <TableRow key={officer.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <div className="bg-gray-200 rounded-full p-1 mr-2">
                        <UserIcon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        {officer.name}
                        <div className="text-xs text-gray-500">{officer.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{officer.badgeNumber}</TableCell>
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
                  <TableCell>{officer.assignedCases}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">View Cases</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
