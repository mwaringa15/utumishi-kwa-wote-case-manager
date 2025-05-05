
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Case } from "@/types";
import CaseCard from "@/components/CaseCard";
import { Button } from "@/components/ui/button";

interface CasesTabProps {
  cases: Case[];
  isLoading: boolean;
}

export function CasesTab({ cases, isLoading }: CasesTabProps) {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Recent Cases</h2>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-pulse text-gray-400">Loading cases...</div>
        </div>
      ) : cases.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cases.map((caseItem) => (
            <CaseCard key={caseItem.id} caseData={caseItem} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">You don't have any cases yet</p>
          <Button 
            onClick={() => navigate("/report-crime")}
            className="bg-kenya-green hover:bg-kenya-green/90 text-white"
          >
            Report a new crime
          </Button>
        </div>
      )}
    </div>
  );
}
