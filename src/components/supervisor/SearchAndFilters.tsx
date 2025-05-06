
import { useState } from "react";
import { Filter, Search, ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchAndFiltersProps {
  searchTerm: string;
  sortField: string;
  sortDirection: "asc" | "desc";
  setSearchTerm: (term: string) => void;
  toggleSort: (field: string) => void;
  setSortDirection: (direction: "asc" | "desc") => void;
}

export function SearchAndFilters({
  searchTerm,
  sortField,
  sortDirection,
  setSearchTerm,
  toggleSort,
  setSortDirection,
}: SearchAndFiltersProps) {
  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search cases by title, officer, type or ID..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select 
              value={sortField} 
              onValueChange={(value) => toggleSort(value)}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lastUpdated">Date Updated</SelectItem>
                <SelectItem value="caseId">Case ID</SelectItem>
                <SelectItem value="crimeType">Crime Type</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="officer">Officer</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
            >
              {sortDirection === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
