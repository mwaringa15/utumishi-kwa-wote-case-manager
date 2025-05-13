
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CaseSearchHeaderProps {
  localSearch: string;
  setLocalSearch: (value: string) => void;
  caseCount: number;
}

export function CaseSearchHeader({ localSearch, setLocalSearch, caseCount }: CaseSearchHeaderProps) {
  return (
    <div className="p-4 border-b">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-semibold">All Cases ({caseCount})</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search cases..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );
}
