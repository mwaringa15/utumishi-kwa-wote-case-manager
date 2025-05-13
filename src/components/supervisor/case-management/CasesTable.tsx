
import { useState } from "react";
import { Case, User } from "@/types";
import { CaseTableHeader } from "./CaseTableHeader";
import { CaseTableRow } from "./CaseTableRow";

interface CasesTableProps {
  cases: Case[];
  officers: User[];
  isLoading: boolean;
  handleAssignCase: (caseId: string, officerId: string, officerName: string) => void;
  handleSubmitToJudiciary: (caseId: string) => void;
}

export function CasesTable({ 
  cases, 
  officers, 
  isLoading, 
  handleAssignCase, 
  handleSubmitToJudiciary 
}: CasesTableProps) {
  const [sortColumn, setSortColumn] = useState("lastUpdated");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  // Sort function
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <CaseTableHeader 
              column="id" 
              label="Case ID" 
              sortColumn={sortColumn} 
              sortDirection={sortDirection} 
              onSort={handleSort}
            />
            <CaseTableHeader 
              column="title" 
              label="Title" 
              sortColumn={sortColumn} 
              sortDirection={sortDirection} 
              onSort={handleSort}
            />
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <CaseTableHeader 
              column="officer" 
              label="Officer" 
              sortColumn={sortColumn} 
              sortDirection={sortDirection} 
              onSort={handleSort}
            />
            <CaseTableHeader 
              column="progress" 
              label="Status" 
              sortColumn={sortColumn} 
              sortDirection={sortDirection} 
              onSort={handleSort}
            />
            <CaseTableHeader 
              column="lastUpdated" 
              label="Last Updated" 
              sortColumn={sortColumn} 
              sortDirection={sortDirection} 
              onSort={handleSort}
            />
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
          ) : cases.length > 0 ? (
            cases.map((caseItem) => (
              <CaseTableRow 
                key={caseItem.id}
                caseItem={caseItem}
                officers={officers}
                handleAssignCase={handleAssignCase}
                handleSubmitToJudiciary={handleSubmitToJudiciary}
              />
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
  );
}
