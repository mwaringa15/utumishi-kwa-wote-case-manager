
import { StationCase, StationOfficer } from "@/components/supervisor/types";

interface StationUnassignedCasesProps {
  station: string;
  unassignedCases: StationCase[];
  officers: StationOfficer[];
  loading: boolean;
  onAssign: (caseId: string, officerId: string, officerName: string) => void;
}

export const StationUnassignedCases = ({ 
  station, 
  unassignedCases, 
  officers, 
  loading, 
  onAssign 
}: StationUnassignedCasesProps) => {
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{caseItem.reports.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{caseItem.reports.category || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${caseItem.priority === 'high' ? 'bg-red-100 text-red-800' : 
                          caseItem.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-blue-100 text-blue-800'}`}>
                        {caseItem.priority || 'normal'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(caseItem.updated_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <select
                        className="border border-gray-300 rounded p-1 text-sm"
                        onChange={(e) => {
                          const officerId = e.target.value;
                          if (officerId) {
                            const officer = officers.find(o => o.id === officerId);
                            if (officer) {
                              onAssign(caseItem.id, officerId, officer.name);
                            }
                          }
                        }}
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
