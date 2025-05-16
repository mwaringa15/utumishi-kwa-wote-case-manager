
import { Case, CrimeReport, User } from "@/types";

export function sortData<T extends Case | CrimeReport | User>(
  data: T[], 
  field: keyof T, 
  direction: "asc" | "desc"
): T[] {
  return [...data].sort((a, b) => {
    const valA = a[field];
    const valB = b[field];

    if (valA === null || valA === undefined) return direction === 'asc' ? -1 : 1;
    if (valB === null || valB === undefined) return direction === 'asc' ? 1 : -1;

    if (typeof valA === 'string' && typeof valB === 'string') {
      return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    if (typeof valA === 'number' && typeof valB === 'number') {
      return direction === 'asc' ? valA - valB : valB - valA;
    }
    // Ensure Date objects are compared correctly
    if (valA instanceof Date && valB instanceof Date) {
      return direction === 'asc' ? valA.getTime() - valB.getTime() : valB.getTime() - valA.getTime();
    }
    // For dates as strings, convert to Date objects for comparison
    if (typeof valA === 'string' && typeof valB === 'string' && !isNaN(new Date(valA).getTime()) && !isNaN(new Date(valB).getTime())) {
      const dateA = new Date(valA).getTime();
      const dateB = new Date(valB).getTime();
      return direction === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    // Generic comparison for other types, ensure they are comparable
    if (typeof valA === typeof valB) {
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
}

export function filterCases(cases: Case[], searchTerm: string): Case[] {
  if (!searchTerm) return cases;
  
  return cases.filter(c => 
    (c.crimeReport?.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     c.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );
}

export function filterReports(reports: CrimeReport[], searchTerm: string): CrimeReport[] {
  if (!searchTerm) return reports;
  
  return reports.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()));
}

export function filterOfficers(officers: User[], searchTerm: string): User[] {
  if (!searchTerm) return officers;
  
  return officers.filter(o => 
    (o.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     o.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );
}

export function calculateStats(cases: Case[], pendingReports: CrimeReport[], officers: User[]) {
  return {
    totalCases: cases.length,
    pendingReports: pendingReports.length,
    activeCases: cases.filter(c => c.status !== 'Closed' && c.status !== 'Rejected').length,
    completedCases: cases.filter(c => c.status === 'Closed' || c.status === 'Rejected').length,
    totalOfficers: officers.length,
  };
}
