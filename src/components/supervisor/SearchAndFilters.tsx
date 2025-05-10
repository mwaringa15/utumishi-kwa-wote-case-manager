
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDownUp, Search, SlidersHorizontal } from "lucide-react";

interface SearchAndFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortField: string;
  sortDirection: "asc" | "desc";
  toggleSort: (field: string) => void;
  setSortDirection: (direction: "asc" | "desc") => void;
}

export function SearchAndFilters({
  searchTerm,
  setSearchTerm,
  sortField,
  sortDirection,
  toggleSort,
  setSortDirection,
}: SearchAndFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by case ID, title, officer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Select
              value={sortField}
              onValueChange={(value) => toggleSort(value)}
            >
              <SelectTrigger className="w-[160px]">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="caseId">Case ID</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="crimeType">Crime Type</SelectItem>
                <SelectItem value="officer">Officer</SelectItem>
                <SelectItem value="progress">Status</SelectItem>
                <SelectItem value="lastUpdated">Date Updated</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
            >
              <ArrowDownUp className={`h-4 w-4 transform transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`} />
            </Button>
          </div>
          
          <Button variant="outline">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            More Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
