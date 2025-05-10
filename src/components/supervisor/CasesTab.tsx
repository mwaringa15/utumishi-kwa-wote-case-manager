
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Search, User } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
  const [localSearch, setLocalSearch] = useState("");
  const [sortColumn, setSortColumn] = useState("lastUpdated");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  // Local filter based on search term
  const localFilteredCases = filteredCases.filter(caseItem => 
    caseItem.id.toLowerCase().includes(localSearch.toLowerCase()) ||
    caseItem.crimeReport?.title.toLowerCase().includes(localSearch.toLowerCase()) ||
    caseItem.assignedOfficerName?.toLowerCase().includes(localSearch.toLowerCase())
  );
  
  // Sort function
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
  
  // Get progress badge color
  const getProgressColor = (progress: string) => {
    switch (progress) {
      case "Completed": return "bg-green-100 text-green-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Pending Review": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-semibold">All Cases ({localFilteredCases.length})</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search cases..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("id")}
              >
                <div className="flex items-center gap-1">
                  Case ID
                  {sortColumn === "id" && (
                    sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("title")}
              >
                <div className="flex items-center gap-1">
                  Title
                  {sortColumn === "title" && (
                    sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("officer")}
              >
                <div className="flex items-center gap-1">
                  Officer
                  {sortColumn === "officer" && (
                    sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("progress")}
              >
                <div className="flex items-center gap-1">
                  Status
                  {sortColumn === "progress" && (
                    sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("lastUpdated")}
              >
                <div className="flex items-center gap-1">
                  Last Updated
                  {sortColumn === "lastUpdated" && (
                    sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
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
            ) : localFilteredCases.length > 0 ? (
              localFilteredCases.map((caseItem) => (
                <tr key={caseItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {caseItem.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {caseItem.crimeReport?.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {caseItem.crimeReport?.crimeType || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {caseItem.assignedOfficerName ? (
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <span>{caseItem.assignedOfficerName}</span>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50">
                        Unassigned
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getProgressColor(caseItem.progress)}>
                      {caseItem.progress}
                    </Badge>
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
