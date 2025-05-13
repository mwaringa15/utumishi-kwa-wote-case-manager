
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import JudiciaryCaseCard from "@/components/judiciary/JudiciaryCaseCard";
import { Case, JudiciaryStatus } from "@/types";

interface JudiciaryCaseTabsProps {
  activeTab: JudiciaryStatus;
  setActiveTab: (value: JudiciaryStatus) => void;
  isLoading: boolean;
  filteredCases: Case[];
  onUpdateStatus: (caseId: string, newStatus: JudiciaryStatus, notes?: string) => void;
}

const tabStatuses: JudiciaryStatus[] = ["Pending Review", "Accepted", "Returned"];

const JudiciaryCaseTabs: React.FC<JudiciaryCaseTabsProps> = ({
  activeTab,
  setActiveTab,
  isLoading,
  filteredCases,
  onUpdateStatus,
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-6 grid w-full grid-cols-3">
        {tabStatuses.map(status => (
          <TabsTrigger key={status} value={status}>{status}</TabsTrigger>
        ))}
      </TabsList>

      {tabStatuses.map(tabStatus => (
        <TabsContent key={tabStatus} value={tabStatus}>
          <Card>
            <CardHeader>
              <CardTitle>{tabStatus} Cases</CardTitle>
              <CardDescription>
                Cases currently marked as {tabStatus.toLowerCase()}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading cases...</p>
              ) : filteredCases.length === 0 ? (
                <p>No cases to display in this category.</p>
              ) : (
                <div className="space-y-4">
                  {filteredCases.map(caseItem => (
                    <JudiciaryCaseCard 
                      key={caseItem.id} 
                      caseItem={caseItem} 
                      onUpdateStatus={onUpdateStatus} 
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default JudiciaryCaseTabs;
