
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CrimeReportForm from "@/components/CrimeReportForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Shield } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";

const ReportCrime = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      <Toaster />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-kenya-green/10 rounded-lg flex items-center justify-center mr-3">
              <Shield className="text-kenya-green h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-kenya-black">Report a Crime</h1>
          </div>
          
          <div className="mb-8">
            <p className="text-gray-600">
              Use this secure form to report a crime or incident to the Kenya Police Service. 
              All reports are reviewed by our officers and appropriate action will be taken.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <CrimeReportForm />
            </div>
            
            <div className="md:col-span-1">
              <Card className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-4">Important Information</h2>
                
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-medium text-kenya-black">Emergency Situations</h3>
                    <p className="text-gray-600 mt-1">
                      For emergencies requiring immediate police attention, please call 999 or 112.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-kenya-black">What Happens Next?</h3>
                    <p className="text-gray-600 mt-1">
                      After submitting your report, you will receive a confirmation with a reference number.
                      An officer will review your case and may contact you for additional information.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-kenya-black">False Reporting</h3>
                    <p className="text-gray-600 mt-1">
                      Filing a false police report is a criminal offense under Kenyan law.
                      Please ensure all information provided is accurate and truthful.
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-medium text-kenya-black mb-2">Need Help?</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Contact our support team for assistance with filing your report.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = "tel:0800000000"}
                  >
                    Call Support: 0800-000-000
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ReportCrime;
