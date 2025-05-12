
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchAndFilters } from "@/components/supervisor/SearchAndFilters";
import { CasesTab } from "@/components/supervisor/CasesTab";
import { PendingReportsTab } from "@/components/supervisor/PendingReportsTab";
import { OfficersTab } from "@/components/supervisor/OfficersTab";
import { Case, CrimeReport, User } from "@/types";

interface SupervisorTabsProps {
  searchTerm: string;
  sortField: string;
  sortDirection: "asc" | "desc";
  setSearchTerm: (term: string) => void;
  toggleSort: (field: string) => void;
  setSortDirection: (direction: "asc" | "desc") => void;
  filteredCases: Case[];
  pendingReports: CrimeReport[];
  officers: User[];
  isLoading: boolean;
  handleAssignCase: (caseId: string, officerId: string, officerName: string) => void;
  handleCreateCase: (reportId: string, officerId: string, officerName: string) => void;
  handleSubmitToJudiciary: (caseId: string) => void;
}

export const SupervisorTabs = ({
  searchTerm,
  sortField,
  sortDirection,
  setSearchTerm,
  toggleSort,
  setSortDirection,
  filteredCases,
  pendingReports,
  officers,
  isLoading,
  handleAssignCase,
  handleCreateCase,
  handleSubmitToJudiciary
}: SupervisorTabsProps) => {
  return (
    <>
      <SearchAndFilters
        searchTerm={searchTerm}
        sortField={sortField}
        sortDirection={sortDirection}
        setSearchTerm={setSearchTerm}
        toggleSort={toggleSort}
        setSortDirection={setSortDirection}
      />
      
      <Tabs defaultValue="cases" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="cases">All Cases</TabsTrigger>
          <TabsTrigger value="pending">Pending Reports</TabsTrigger>
          <TabsTrigger value="officers">All Officers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cases">
          <CasesTab 
            filteredCases={filteredCases}
            officers={officers}
            isLoading={isLoading}
            handleAssignCase={handleAssignCase}
            handleSubmitToJudiciary={handleSubmitToJudiciary}
          />
        </TabsContent>
        
        <TabsContent value="pending">
          <PendingReportsTab 
            pendingReports={pendingReports}
            officers={officers}
            isLoading={isLoading}
            handleCreateCase={handleCreateCase}
          />
        </TabsContent>
        
        <TabsContent value="officers">
          <OfficersTab 
            officers={officers}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </>
  );
};
