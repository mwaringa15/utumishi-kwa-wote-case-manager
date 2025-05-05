
import React from "react";
import { 
  Calendar, 
  MessageSquare, 
  Paperclip,
  CheckCircle2,
  AlertCircle,
  User,
  Clock
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineIcon,
  TimelineBody,
} from "@/components/ui/timeline";
import { Case, CaseUpdate } from "@/types";

interface TimelineTabProps {
  caseData: Case;
  caseUpdates: CaseUpdate[];
}

export function TimelineTab({ caseData, caseUpdates }: TimelineTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Case Timeline</CardTitle>
        <CardDescription>
          A chronological history of all updates, evidence, and status changes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {caseUpdates.length > 0 ? (
          <Timeline>
            {caseUpdates.map((update, index) => (
              <TimelineItem key={update.id} className="relative">
                {index < caseUpdates.length - 1 && <TimelineConnector />}
                <TimelineHeader>
                  <TimelineIcon>
                    {update.type === "Progress Update" ? (
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    ) : update.type === "Evidence Added" ? (
                      <Paperclip className="h-4 w-4 text-green-600" />
                    ) : update.type === "Status Change" ? (
                      <CheckCircle2 className="h-4 w-4 text-amber-600" />
                    ) : update.type === "Case Priority Change" ? (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    ) : (
                      <Calendar className="h-4 w-4 text-gray-600" />
                    )}
                  </TimelineIcon>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">
                      {update.type}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(update.timestamp).toLocaleString()}
                    </p>
                  </div>
                </TimelineHeader>
                <TimelineBody>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-800">{update.content}</p>
                    {update.attachmentName && (
                      <div className="mt-2 flex items-center p-2 bg-gray-50 rounded border border-gray-200">
                        <Paperclip className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600">{update.attachmentName}</span>
                      </div>
                    )}
                    <div className="mt-2 text-sm text-gray-500 flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {update.officerName}
                    </div>
                  </div>
                </TimelineBody>
              </TimelineItem>
            ))}
            
            <TimelineItem className="relative">
              <TimelineHeader>
                <TimelineIcon>
                  <Calendar className="h-4 w-4 text-gray-600" />
                </TimelineIcon>
                <div className="ml-4">
                  <p className="font-medium text-gray-900">
                    Case Created
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(caseData.crimeReport?.createdAt || "").toLocaleString()}
                  </p>
                </div>
              </TimelineHeader>
              <TimelineBody>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-800">Case opened based on crime report: {caseData.crimeReport?.title}</p>
                </div>
              </TimelineBody>
            </TimelineItem>
          </Timeline>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No timeline events yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
