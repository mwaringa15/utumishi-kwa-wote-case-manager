
import { User } from "lucide-react";
import { CrimeReport, User as UserType } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Report ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Submitted
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  <div className="animate-pulse text-gray-400">Loading reports...</div>
                </td>
              </tr>
            ) : pendingReports.length > 0 ? (
              pendingReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.crimeType || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.location || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {}}
                      >
                        View
                      </Button>
                      
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
                            <div className="space-y-4">
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
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No pending reports found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
