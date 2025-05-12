
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SupervisorDashboardContent from "@/components/supervisor/SupervisorDashboardContent";
import { StationData } from "@/components/supervisor/types";

const SupervisorDashboardWrapper = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stationData, setStationData] = useState<StationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const fetchSupervisorData = async () => {
      setLoading(true);
      try {
        // Mock the station data for development purposes
        // In a real app, we would fetch this from the database
        const mockStationData: StationData = {
          station: "Central Station", // Use a static station for now
          unassignedCases: [
            {
              id: "case-001",
              report_id: "report-001",
              status: "Pending",
              priority: "high",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              station: "Central Station",
              reports: {
                id: "report-001",
                title: "Burglary at Main Street",
                description: "Break-in reported at 123 Main Street",
                status: "Submitted",
                created_at: new Date().toISOString(),
                location: "123 Main Street",
                category: "Burglary"
              }
            },
            {
              id: "case-002",
              report_id: "report-002",
              status: "Pending",
              priority: "medium",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              station: "Central Station",
              reports: {
                id: "report-002",
                title: "Stolen Vehicle",
                description: "Vehicle reported stolen from parking lot",
                status: "Submitted",
                created_at: new Date().toISOString(),
                location: "456 Oak Avenue",
                category: "Theft"
              }
            }
          ],
          officers: [
            {
              id: "officer-001",
              name: "John Doe",
              email: "john.doe@police.gov",
              role: "Officer",
              station: "Central Station",
              status: "on_duty",
              badgeNumber: "KP12345",
              assignedCases: 3
            },
            {
              id: "officer-002",
              name: "Jane Smith",
              email: "jane.smith@police.gov",
              role: "Officer",
              station: "Central Station",
              status: "on_duty",
              badgeNumber: "KP67890",
              assignedCases: 2
            },
            {
              id: "officer-003",
              name: "David Wilson",
              email: "david.wilson@police.gov",
              role: "Officer",
              station: "Central Station",
              status: "on_leave",
              badgeNumber: "KP54321",
              assignedCases: 0
            }
          ]
        };
        
        setStationData(mockStationData);
      } catch (error) {
        console.error("Error fetching supervisor data:", error);
        toast({
          title: "Error fetching data",
          description: "Could not load station-specific data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSupervisorData();
  }, [user, navigate, toast]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      
      <div className="flex-grow flex">
        <SupervisorDashboardContent 
          user={user}
          stationData={stationData}
          loading={loading}
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default SupervisorDashboardWrapper;
