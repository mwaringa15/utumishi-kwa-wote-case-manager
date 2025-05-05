
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CrimeReport } from "@/types";
import { Button } from "@/components/ui/button";

interface ReportsTabProps {
  reports: CrimeReport[];
  isLoading: boolean;
}

export function ReportsTab({ reports, isLoading }: ReportsTabProps) {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">My Reports</h2>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-pulse text-gray-400">Loading reports...</div>
        </div>
      ) : reports.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {report.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.createdAt || "").toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                      ${report.status === 'Submitted' ? 'bg-blue-100 text-blue-800' : 
                        report.status === 'Under Investigation' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button 
                      variant="ghost" 
                      onClick={() => navigate(`/track-case?id=${report.id}`)}
                      className="text-kenya-green hover:text-kenya-green/80"
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">You haven't submitted any reports yet</p>
          <Button 
            onClick={() => navigate("/report-crime")}
            className="bg-kenya-green hover:bg-kenya-green/90 text-white"
          >
            Submit your first report
          </Button>
        </div>
      )}
    </div>
  );
}
