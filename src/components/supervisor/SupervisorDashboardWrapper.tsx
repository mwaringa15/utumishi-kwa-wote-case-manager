
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SupervisorDashboard from "@/components/supervisor/SupervisorDashboard";
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
        // Get supervisor's station
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('station, full_name')
          .eq('id', user.id)
          .single();
        
        if (userError) throw userError;
        
        if (!userData || !userData.station) {
          toast({
            title: "Station not assigned",
            description: "You don't have a station assigned to your profile",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        // Get unassigned cases for this station
        const { data: unassignedCasesData, error: casesError } = await supabase
          .from('cases')
          .select(`
            id,
            status,
            priority,
            created_at,
            updated_at,
            report_id,
            station,
            reports (
              id,
              title,
              description,
              status,
              created_at,
              location,
              category
            )
          `)
          .eq('station', userData.station)
          .is('assigned_officer_id', null)
          .order('created_at', { ascending: false });
        
        if (casesError) throw casesError;
        
        // Get officers for this station
        const { data: officersData, error: officersError } = await supabase
          .from('users')
          .select('id, full_name, email, role, station, status')
          .eq('station', userData.station)
          .eq('role', 'Officer');
        
        if (officersError) throw officersError;
        
        // Count assigned cases for each officer
        const officersWithCaseCounts = await Promise.all(
          officersData.map(async (officer) => {
            const { count, error: countError } = await supabase
              .from('cases')
              .select('*', { count: 'exact', head: true })
              .eq('assigned_officer_id', officer.id);
            
            return {
              id: officer.id,
              name: officer.full_name,
              email: officer.email,
              role: officer.role,
              station: officer.station,
              status: officer.status,
              badgeNumber: `KP${Math.floor(10000 + Math.random() * 90000)}`, // Mock badge number
              assignedCases: count || 0
            };
          })
        );
        
        setStationData({
          station: userData.station,
          unassignedCases: unassignedCasesData,
          officers: officersWithCaseCounts
        });
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
        <SupervisorDashboard 
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
