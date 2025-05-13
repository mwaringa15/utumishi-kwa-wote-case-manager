
import { ChevronDown, ChevronUp } from "lucide-react";

interface CaseTableHeaderProps {
  column: string;
  label: string;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
}

export function CaseTableHeader({ 
  column, 
  label, 
  sortColumn, 
  sortDirection, 
  onSort 
}: CaseTableHeaderProps) {
  return (
    <th 
      scope="col" 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortColumn === column && (
          sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
        )}
      </div>
    </th>
  );
}
