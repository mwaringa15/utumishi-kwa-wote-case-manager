
import React from "react";
import { Case } from "@/types";
import { BackButton } from "@/components/ui/back-button";

interface CaseHeaderProps {
  caseData: Case;
  onBack: () => void;
}

export function CaseHeader({ caseData, onBack }: CaseHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <div>
        <div className="flex items-center">
          <BackButton className="mr-2" />
          <h1 className="text-2xl font-bold text-kenya-black">{caseData.crimeReport?.title}</h1>
        </div>
        <p className="text-gray-600 ml-12">Case ID: {caseData.id}</p>
      </div>
      
      <div className="mt-4 sm:mt-0 flex items-center">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mr-3 ${
          caseData.progress === "Completed" ? "bg-green-100 text-green-800" :
          caseData.progress === "In Progress" ? "bg-blue-100 text-blue-800" :
          caseData.progress === "Pending Review" ? "bg-purple-100 text-purple-800" :
          "bg-gray-100 text-gray-800"
        }`}>
          {caseData.progress}
        </span>
        
        {caseData.submittedToJudiciary && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
            Judiciary: {caseData.judiciaryStatus || "Pending"}
          </span>
        )}
      </div>
    </div>
  );
}
