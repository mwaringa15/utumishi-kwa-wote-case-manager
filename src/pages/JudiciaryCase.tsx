
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const JudiciaryCase = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-2xl font-bold mb-4">Judiciary Case Review</h1>
        <p>Case ID: {id}</p>
        {/* Judiciary case content will go here */}
      </div>
      
      <Footer />
    </div>
  );
};

export default JudiciaryCase;
