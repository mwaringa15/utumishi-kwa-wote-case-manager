
import { Search, User, CalendarClock, MapPin } from "lucide-react";
import { useState } from "react";
import { CrimeReport, User as UserType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

interface PendingReportsTabProps {
  pendingReports: CrimeReport[];
  officers: UserType[];
  isLoading: boolean;
  handleCreateCase: (reportId: string, officerId: string, officerName: string) => void;
}

export function PendingReportsTab({ 
  pendingReports, 
  officers, 
  isLoading,
  handleCreateCase 
}: PendingReportsTabProps) {
  const [localSearch, setLocalSearch] = useState("");
  
  // Local filter based on search term
  const filteredReports = pendingReports.filter(report => 
    report.id.toLowerCase().includes(localSearch.toLowerCase()) ||
    report.title.toLowerCase().includes(localSearch.toLowerCase()) ||
    report.crimeType?.toLowerCase().includes(localSearch.toLowerCase()) ||
    report.location?.toLowerCase().includes(localSearch.toLowerCase())
  );
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-semibold">Pending Reports ({filteredReports.length})</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search reports..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="p-6 text-center">
          <div className="animate-pulse text-gray-400">Loading reports...</div>
        </div>
      ) : filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {filteredReports.map(report => (
            <Card key={report.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900 line-clamp-1">{report.title}</h3>
                      <p className="text-xs text-gray-500">{report.id}</p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                      {report.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="px-4 py-3">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <div className="text-gray-500 w-24">Type:</div>
                      <div className="font-medium">{report.crimeType || "N/A"}</div>
                    </div>
                    
                    <div className="flex items-start text-sm">
                      <div className="text-gray-500 w-24 mt-1"><MapPin className="h-4 w-4 inline mr-1" /></div>
                      <div className="line-clamp-1">{report.location || "Unknown location"}</div>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <div className="text-gray-500 w-24"><CalendarClock className="h-4 w-4 inline mr-1" /></div>
                      <div>{new Date(report.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-between">
                    <Button variant="outline" size="sm">View Details</Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm"
                          className="bg-kenya-green hover:bg-kenya-green/90"
                        >
                          Create Case
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Case & Assign Officer</DialogTitle>
                          <DialogDescription>
                            Select an officer to handle this case.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                            {officers.map((officer) => (
                              <div 
                                key={officer.id} 
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                              >
                                <div className="flex items-center">
                                  <div className="bg-gray-200 rounded-full p-2 mr-3">
                                    <User className="h-5 w-5 text-gray-600" />
                                  </div>
                                  <div>
                                    <div className="font-medium">{officer.name}</div>
                                    <div className="text-sm text-gray-500">
                                      Badge: {officer.badgeNumber} | Cases: {officer.assignedCases}
                                    </div>
                                  </div>
                                </div>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleCreateCase(report.id, officer.id, officer.name)}
                                >
                                  Assign
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-gray-500">No pending reports found</p>
        </div>
      )}
    </div>
  );
}
