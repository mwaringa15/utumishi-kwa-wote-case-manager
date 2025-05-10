
import { Case } from "@/types";

/**
 * Filters and sorts case data based on search term and sort options
 */
export const filterAndSortCases = (
  allCases: Case[],
  searchTerm: string,
  sortField: string,
  sortDirection: "asc" | "desc"
): Case[] => {
  let filtered = [...allCases];
  
  // Apply search filter
  if (searchTerm) {
    filtered = filtered.filter(caseItem => 
      caseItem.crimeReport?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.crimeReport?.crimeType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.assignedOfficerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  // Apply sorting
  filtered.sort((a, b) => {
    let valueA, valueB;
    
    switch (sortField) {
      case "caseId":
        valueA = a.id;
        valueB = b.id;
        break;
      case "crimeType":
        valueA = a.crimeReport?.crimeType || "";
        valueB = b.crimeReport?.crimeType || "";
        break;
      case "title":
        valueA = a.crimeReport?.title || "";
        valueB = b.crimeReport?.title || "";
        break;
      case "officer":
        valueA = a.assignedOfficerName || "";
        valueB = b.assignedOfficerName || "";
        break;
      case "progress":
        valueA = a.progress || "";
        valueB = b.progress || "";
        break;
      default:
        valueA = a.lastUpdated || "";
        valueB = b.lastUpdated || "";
    }
    
    if (sortDirection === "asc") {
      return valueA.localeCompare(valueB);
    } else {
      return valueB.localeCompare(valueA);
    }
  });
  
  return filtered;
};
