
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { Case, User as UserType } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface CasesTabProps {
  filteredCases: Case[];
  officers: UserType[];
  isLoading: boolean;
  handleAssignCase: (caseId: string, officerId: string, officerName: string) => void;
  handleSubmitToJudiciary: (caseId: string) => void;
}

export function CasesTab({ 
  filteredCases, 
  officers,
  isLoading, 
  handleAssignCase,
  handleSubmitToJudiciary
}: CasesTabProps) {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Case ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Officer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center">
                  <div className="animate-pulse text-gray-400">Loading cases...</div>
                </td>
              </tr>
            ) : filteredCases.length > 0 ? (
              filteredCases.map((caseItem) => (
                <tr key={caseItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {caseItem.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {caseItem.crimeReport?.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {caseItem.crimeReport?.crimeType || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {caseItem.assignedOfficerName || "Unassigned"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      caseItem.progress === "Completed" ? "bg-green-100 text-green-800" :
                      caseItem.progress === "In Progress" ? "bg-blue-100 text-blue-800" :
                      caseItem.progress === "Pending Review" ? "bg-purple-100 text-purple-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {caseItem.progress}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(caseItem.lastUpdated).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/case/${caseItem.id}`)}
                      >
                        View
                      </Button>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Assign
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Assign Case to Officer</DialogTitle>
                            <DialogDescription>
                              Select an officer to assign to this case.
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
                                    onClick={() => handleAssignCase(caseItem.id, officer.id, officer.name)}
                                  >
                                    Assign
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {caseItem.progress === "Completed" && !caseItem.submittedToJudiciary && (
                        <Button 
                          variant="default"
                          size="sm"
                          className="bg-kenya-black hover:bg-kenya-black/90"
                          onClick={() => handleSubmitToJudiciary(caseItem.id)}
                        >
                          Submit to Judiciary
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No cases found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
