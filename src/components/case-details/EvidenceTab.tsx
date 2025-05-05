
import React from "react";
import { FileText, ArrowUpFromLine } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EvidenceTabProps {
  canEditCase: boolean;
}

export function EvidenceTab({ canEditCase }: EvidenceTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Evidence & Attachments</span>
          {canEditCase && (
            <Button size="sm">
              <ArrowUpFromLine className="h-4 w-4 mr-2" />
              Upload Evidence
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Documents, photos, and other evidence related to this case
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-white rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No evidence has been uploaded yet</p>
          {canEditCase && (
            <Button className="mt-4">
              <ArrowUpFromLine className="h-4 w-4 mr-2" />
              Upload Evidence
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
