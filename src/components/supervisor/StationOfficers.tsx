
import { StationOfficer } from "@/components/supervisor/types";

interface StationOfficersProps {
  station: string;
  officers: StationOfficer[];
  loading: boolean;
}

export const StationOfficers = ({ station, officers, loading }: StationOfficersProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Officers - {station} Station</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full animate-pulse p-8 text-center text-gray-400">Loading station officers...</div>
        ) : officers.length > 0 ? (
          officers.map(officer => (
            <div key={officer.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start gap-3">
                <div className="bg-gray-200 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">{officer.name}</h3>
                  <p className="text-sm text-gray-500">{officer.email}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                      ${officer.status === 'on_duty' ? 'bg-green-100 text-green-800' : 
                        officer.status === 'on_leave' ? 'bg-amber-100 text-amber-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {officer.status === 'on_duty' ? 'On Duty' : 
                       officer.status === 'on_leave' ? 'On Leave' : 'Off Duty'}
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                      {officer.assignedCases} cases
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-8 text-center text-gray-500">No officers assigned to {station} station</div>
        )}
      </div>
    </div>
  );
};
