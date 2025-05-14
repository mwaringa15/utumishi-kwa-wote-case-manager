import { StationCase, StationOfficer } from "@/components/supervisor/types";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface StationUnassignedCasesProps {
  station: string;
  unassignedCases: StationCase[];
  officers: StationOfficer[];
  loading: boolean;
  onAssign: (caseId: string, officerId: string) => Promise<boolean>;
}

export const StationUnassignedCases = ({ 
  station, 
  unassignedCases, 
  officers, 
  loading, 
  onAssign 
}: StationUnassignedCasesProps) => {
  const { toast } = useToast();
  const [assigningCaseId, setAssigningCaseId] = useState<string | null>(null);

  const handleAssignment = async (caseId: string, officerId: string) => {
    if (!officerId) return;
    
    setAssigningCaseId(caseId);
    try {
      const success = await onAssign(caseId, officerId);
      if (success) {
        const officer = officers.find(o => o.id === officerId);
        toast({
          title: "Case assigned",
          description: `Case successfully assigned to Officer ${officer?.name || 'Unknown'}`,
        });
      }
    } finally {
      setAssigningCaseId(null);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Unassigned Cases - {station} Station</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="animate-pulse p-8 text-center text-gray-400">Loading station cases...</div>
        ) : unassignedCases.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Assign</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {unassignedCases.map((caseItem) => (
                  <tr key={caseItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{caseItem.id.substring(0, 8)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{caseItem.reports?.title || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{caseItem.reports?.category || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Badge className={`
                        ${caseItem.priority === 'high' ? 'bg-red-100 text-red-800 hover:bg-red-200' : 
                          caseItem.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 
                          'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}>
                        {caseItem.priority || 'normal'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(caseItem.updated_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <select
                        className="border border-gray-300 rounded p-1 text-sm"
                        onChange={(e) => handleAssignment(caseItem.id, e.target.value)}
                        disabled={assigningCaseId === caseItem.id}
                        defaultValue=""
                      >
                        <option value="" disabled>Assign to...</option>
                        {officers
                          .filter(o => o.status === 'on_duty')
                          .map(officer => (
                            <option key={officer.id} value={officer.id}>
                              {officer.name} ({officer.assignedCases} cases)
                            </option>
                          ))}
                      </select>
                      {assigningCaseId === caseItem.id && (
                        <span className="ml-2 inline-block">
                          <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">No unassigned cases in {station} station</div>
        )}
      </div>
    </div>
  );
};
