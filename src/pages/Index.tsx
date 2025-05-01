
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileText, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      <Hero />
      
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 bg-kenya-green/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="text-kenya-green h-6 w-6" />
                </div>
                <CardTitle>Report a Crime</CardTitle>
                <CardDescription>Securely submit crime reports online</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Easily file police reports from anywhere, at any time. Your reports are securely processed and assigned for investigation.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 bg-kenya-red/10 rounded-lg flex items-center justify-center mb-4">
                  <Search className="text-kenya-red h-6 w-6" />
                </div>
                <CardTitle>Track Your Case</CardTitle>
                <CardDescription>Monitor investigation progress</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Follow the status of your case in real-time. Get updates on investigation progress and stay informed throughout the process.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 bg-kenya-black/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="text-kenya-black h-6 w-6" />
                </div>
                <CardTitle>Officer Portal</CardTitle>
                <CardDescription>Dedicated tools for officers</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Police officers have access to a specialized portal for managing cases, updating investigations, and collaborating with colleagues.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">About Kenya Police Case Management System</h2>
            <p className="text-gray-600 mb-8">
              The Kenya Police Case Management System (KPCMS) is a digital platform designed to streamline the reporting, 
              investigation, and management of criminal cases across Kenya. Our mission is to enhance transparency, 
              efficiency, and accountability in the police service.
            </p>
            <div className="flex justify-center">
              <div className="text-xl font-semibold text-kenya-red italic">
                "Utumishi Kwa Wote"
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-kenya-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Submit Report</h3>
                <p className="text-gray-600">
                  File a detailed report through our secure online platform
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-kenya-red rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Case Assignment</h3>
                <p className="text-gray-600">
                  Your case is reviewed and assigned to an officer for investigation
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-kenya-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
                <p className="text-gray-600">
                  Follow your case status and receive updates throughout the investigation
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
