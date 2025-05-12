
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export const ProfileLoadingState: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
      <div className="lg:col-span-2">
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  </div>
);
