
import { User as UserIcon, Users, MapPin } from "lucide-react"; // Added MapPin
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User as UserType } from "@/types";

interface OfficersTabProps {
  officers: UserType[];
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-8">
            <div className="animate-pulse text-gray-400">Loading officers...</div>
          </div>
        ) : officers.length > 0 ? (
          officers.map((officer) => (
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
                      <div className="flex items-center mt-2"> {/* Adjusted margin-top */}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {officer.badgeNumber}
                        </span>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-sm text-gray-600">
                          {officer.assignedCases} active cases
                        </span>
                      </div>
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
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No officers found</p>
          </div>
        )}
      </div>
    </div>
  );
}
