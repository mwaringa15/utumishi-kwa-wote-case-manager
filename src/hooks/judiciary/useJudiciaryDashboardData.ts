
import { useState, useEffect, useMemo } from "react";
import { Case, CaseProgress, CaseStatus, JudiciaryStatus, CrimeReport } from "@/types";
import { useToast } from "@/hooks/use-toast"; // Corrected import path

export const useJudiciaryDashboardData = () => {
  const { toast } = useToast();
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<JudiciaryStatus>("Pending Review");

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockCases: Case[] = [
        {
          id: "JUD001",
          crimeReportId: "CR001",
          assignedOfficerId: "OFF001",
          assignedOfficerName: "John Doe",
          progress: "Completed" as CaseProgress,
          status: "Submitted to Judiciary" as CaseStatus,
          lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          submittedToJudiciary: true,
          judiciaryStatus: "Pending Review" as JudiciaryStatus,
          crimeReport: {
            id: "CR001",
            title: "High Profile Robbery Case",
            description: "Armed robbery at Central Bank, suspects apprehended.",
            status: "Submitted to Judiciary" as CaseStatus,
            createdById: "System",
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            crimeType: "Robbery",
            location: "Central Bank, Main Street",
          },
        },
        {
          id: "JUD002",
          crimeReportId: "CR002",
          assignedOfficerId: "OFF002",
          assignedOfficerName: "Jane Smith",
          progress: "Completed" as CaseProgress,
          status: "Under Court Process" as CaseStatus,
          lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          submittedToJudiciary: true,
          judiciaryStatus: "Accepted" as JudiciaryStatus,
          crimeReport: {
            id: "CR002",
            title: "Cybercrime Investigation",
            description: "Large scale data breach from a tech company.",
            status: "Under Court Process" as CaseStatus,
            createdById: "System",
            createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            crimeType: "Cybercrime",
            location: "Tech Corp HQ",
          },
        },
        {
          id: "JUD003",
          crimeReportId: "CR003",
          assignedOfficerId: "OFF003",
          assignedOfficerName: "Mike Brown",
          progress: "Completed" as CaseProgress,
          status: "Returned from Judiciary" as CaseStatus,
          lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          submittedToJudiciary: true,
          judiciaryStatus: "Returned" as JudiciaryStatus,
          judiciaryCaseNotes: "Insufficient evidence provided. Please gather more witness testimonies.",
          crimeReport: {
            id: "CR003",
            title: "Fraudulent Insurance Claim",
            description: "Suspected fraudulent claim filed for property damage.",
            status: "Returned from Judiciary" as CaseStatus,
            createdById: "System",
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            crimeType: "Fraud",
            location: "InsureCorp Office",
          },
        },
      ];
      setCases(mockCases);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleUpdateJudiciaryStatus = (caseId: string, newStatus: JudiciaryStatus, notes?: string) => {
    setCases(prevCases =>
      prevCases.map(c => {
        if (c.id === caseId) {
          let caseNewStatus: CaseStatus = c.status;
          if (newStatus === "Accepted") caseNewStatus = "Under Court Process";
          else if (newStatus === "Returned") caseNewStatus = "Returned from Judiciary";

          return {
            ...c,
            judiciaryStatus: newStatus,
            status: caseNewStatus,
            judiciaryCaseNotes: notes || c.judiciaryCaseNotes,
            lastUpdated: new Date().toISOString(),
            crimeReport: c.crimeReport ? { ...c.crimeReport, status: caseNewStatus } : undefined,
          };
        }
        return c;
      })
    );
    toast({
      title: `Case ${caseId} status updated`,
      description: `Status changed to ${newStatus}. ${notes ? "Notes added." : ""}`,
    });
  };

  const filteredCases = useMemo(() => cases.filter(c => c.judiciaryStatus === activeTab), [cases, activeTab]);

  return {
    cases,
    isLoading,
    activeTab,
    setActiveTab,
    handleUpdateJudiciaryStatus,
    filteredCases,
  };
};
