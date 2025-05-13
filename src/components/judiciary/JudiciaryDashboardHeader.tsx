
import React from 'react';

interface JudiciaryDashboardHeaderProps {
  userName?: string;
}

const JudiciaryDashboardHeader: React.FC<JudiciaryDashboardHeaderProps> = ({ userName }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold text-kenya-black">Judiciary Dashboard</h1>
      {userName && <p className="text-gray-600">Welcome, {userName}</p>}
    </div>
  );
};

export default JudiciaryDashboardHeader;
