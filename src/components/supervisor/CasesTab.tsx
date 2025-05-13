
import { useState, useMemo } from "react";
import { Case, User } from "@/types";
import { CaseSearchHeader } from "./case-management/CaseSearchHeader";
import { CasesTable } from "./case-management/CasesTable";

interface CasesTabProps {
  filteredCases: Case[];
  officers: User[];
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
  const [localSearch, setLocalSearch] = useState("");
  
  // Local filter based on search term
  const localFilteredCases = useMemo(() => {
    return filteredCases.filter(caseItem => 
      caseItem.id.toLowerCase().includes(localSearch.toLowerCase()) ||
      caseItem.crimeReport?.title.toLowerCase().includes(localSearch.toLowerCase()) ||
      caseItem.assignedOfficerName?.toLowerCase().includes(localSearch.toLowerCase())
    );
  }, [filteredCases, localSearch]);
  
  return (
    <div className="bg-white rounded-lg shadow">
      <CaseSearchHeader 
        localSearch={localSearch}
        setLocalSearch={setLocalSearch}
        caseCount={localFilteredCases.length}
      />
      
      <CasesTable 
        cases={localFilteredCases}
        officers={officers}
        isLoading={isLoading}
        handleAssignCase={handleAssignCase}
        handleSubmitToJudiciary={handleSubmitToJudiciary}
      />
    </div>
  );
}
