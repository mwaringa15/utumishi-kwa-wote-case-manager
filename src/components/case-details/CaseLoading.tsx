
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface CaseLoadingProps {
  isLoggedIn: boolean;
  userRole?: string;
}

export function CaseLoading({ isLoggedIn, userRole }: CaseLoadingProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={isLoggedIn} userRole={userRole} />
      <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-kenya-green"></div>
      </div>
      <Footer />
    </div>
  );
}
