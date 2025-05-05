
import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface CaseNotFoundProps {
  isLoggedIn: boolean;
  userRole?: string;
  onBack: () => void;
}

export function CaseNotFound({ isLoggedIn, userRole, onBack }: CaseNotFoundProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={isLoggedIn} userRole={userRole} />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Case Not Found</h2>
          <p className="text-gray-600 mb-6">
            The case you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
