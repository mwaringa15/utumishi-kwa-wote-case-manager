
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SupervisorSidebar } from "@/components/supervisor/SupervisorSidebar";
import { BackButton } from "@/components/ui/back-button";
import { OfficersTab } from "@/components/supervisor/OfficersTab";
import { useToast } from "@/hooks/use-toast";
import { useSupervisorOfficers } from "@/hooks/supervisor/useSupervisorOfficers";
import { fetchStationOfficersProfiles } from "@/hooks/supervisor/modules/fetchStationOfficersProfiles";
import { OfficerProfile } from "@/components/officer/profile/ProfileContainer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User } from "@/types";

const SupervisorOfficersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stationId, setStationId] = useState<string | null>(null);
  const [stationName, setStationName] = useState<string>("");
  const [officerProfiles, setOfficerProfiles] = useState<OfficerProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [supervisorProfile, setSupervisorProfile] = useState<{ name: string, email: string, station: string } | null>(null);
  const [availableOfficers, setAvailableOfficers] = useState<User[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { 
    officers, 
    stationName: hookStationName,
    stationId: hookStationId,
    refreshData 
  } = useSupervisorOfficers(user?.id);

  // If user is not logged in or not authorized, redirect
  useEffect(() => {
    if (!user || !["ocs", "commander", "administrator", "supervisor"].includes(user.role.toLowerCase())) {
      navigate('/dashboard');
      return;
    }

    // Get supervisor's station ID from localStorage or fetch it
    const getStationId = async () => {
      setIsLoading(true);
      
      try {
        console.log("Initial station ID check:", { 
          userId: user?.id, 
          storedStationId: localStorage.getItem('selected_station_id') 
        });
        
        let effectiveStationId = localStorage.getItem('selected_station_id');
        
        if (!effectiveStationId && user) {
          // Fetch from user profile
          const { data: userData, error } = await supabase
            .from('users')
            .select('station_id')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          
          if (userData?.station_id) {
            effectiveStationId = userData.station_id;
            localStorage.setItem('selected_station_id', userData.station_id);
          }
        }
        
        console.log("Effective station ID:", effectiveStationId);
        setStationId(effectiveStationId);
        
        // Get supervisor profile information
        if (user) {
          const { data: supervisorData, error: supervisorError } = await supabase
            .from('users')
            .select('full_name, email, station_id')
            .eq('id', user.id)
            .single();
            
          if (supervisorError) throw supervisorError;
          
          // Get station name
          if (supervisorData?.station_id) {
            const { data: stationData, error: stationError } = await supabase
              .from('stations')
              .select('name')
              .eq('id', supervisorData.station_id)
              .single();
              
            if (stationError) throw stationError;
            
            if (stationData) {
              console.log("Station name found:", stationData.name);
              setStationName(stationData.name);
              setSupervisorProfile({
                name: supervisorData.full_name || user.email,
                email: supervisorData.email || user.email,
                station: stationData.name
              });
            }
          }
        }
      } catch (error) {
        console.error("Error getting station ID:", error);
        toast({
          title: "Error",
          description: "Failed to get station information",
          variant: "destructive",
        });
      }
    };
    
    getStationId();
  }, [user, navigate, toast]);

  // Fetch officer profiles once we have the station ID
  useEffect(() => {
    const fetchOfficers = async () => {
      if (!stationId) return;
      
      setIsLoading(true);
      try {
        const profiles = await fetchStationOfficersProfiles(stationId);
        setOfficerProfiles(profiles);
        
        // Fetch available officers with the same station ID
        const { data: availableOfficersData, error: availableOfficersError } = await supabase
          .from('users')
          .select('id, full_name, email, role, status')
          .eq('station_id', stationId)
          .eq('role', 'officer');
          
        if (availableOfficersError) throw availableOfficersError;
        
        if (availableOfficersData) {
          const formattedAvailableOfficers = availableOfficersData.map(officer => ({
            id: officer.id,
            name: officer.full_name || officer.email,
            email: officer.email,
            role: officer.role,
            status: officer.status,
            station: stationName
          }));
          setAvailableOfficers(formattedAvailableOfficers);
        }
      } catch (error) {
        console.error("Error fetching officer profiles:", error);
        toast({
          title: "Error",
          description: "Failed to fetch officer profiles",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOfficers();
  }, [stationId, stationName, toast]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      
      <div className="flex-grow flex">
        <SidebarProvider>
          <SupervisorSidebar />
          <SidebarInset className="p-6">
            <div className="mb-6">
              <BackButton />
              <div className="flex justify-between items-center mt-4">
                <div>
                  <h1 className="text-2xl font-bold">Officer Management</h1>
                  <p className="text-gray-500">View and manage officers in {stationName || 'Loading...'}</p>
                  
                  {supervisorProfile && (
                    <div className="mt-2 text-sm text-gray-500">
                      <p>Supervisor: {supervisorProfile.name}</p>
                      <p>Email: {supervisorProfile.email}</p>
                      <p>Station: {supervisorProfile.station}</p>
                    </div>
                  )}
                </div>
                
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Add Officer
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Available Officers</DialogTitle>
                    </DialogHeader>
                    {availableOfficers.length > 0 ? (
                      <div className="max-h-[400px] overflow-y-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b">
                              <th className="px-4 py-2">Name</th>
                              <th className="px-4 py-2">Email</th>
                              <th className="px-4 py-2">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {availableOfficers.map(officer => (
                              <tr key={officer.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3">{officer.name}</td>
                                <td className="px-4 py-3">{officer.email}</td>
                                <td className="px-4 py-3">
                                  <span className={`inline-block rounded-full px-2 py-1 text-xs ${
                                    officer.status === 'on_duty' ? 'bg-green-100 text-green-800' : 
                                    officer.status === 'on_leave' ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {officer.status === 'on_duty' ? 'On Duty' : 
                                     officer.status === 'on_leave' ? 'On Leave' : 
                                     'Off Duty'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No available officers found for this station
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <OfficersTab 
              officers={officers}
              officerProfiles={officerProfiles}
              isLoading={isLoading}
              stationName={stationName}
            />
          </SidebarInset>
        </SidebarProvider>
      </div>
      
      <Footer />
    </div>
  );
};

export default SupervisorOfficersPage;
