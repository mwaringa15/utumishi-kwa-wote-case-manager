
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserRole, Case, OfficerStatus, CaseStatus, CaseProgress } from "@/types";
import { BackButton } from "@/components/ui/back-button";
import { OfficerProfileCard } from "@/components/officer/profile/OfficerProfileCard";
import { AssignedCasesTable } from "@/components/officer/profile/AssignedCasesTable";

export interface OfficerProfile {
  id?: string;
  full_name: string;
  email: string;
  role: UserRole;
  station?: string;
  status: OfficerStatus;
}

export const ProfileContainer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<OfficerProfile | null>(null);
  const [assignedCases, setAssignedCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadProfileData = async () => {
      setLoading(true);
      try {
        await loadOfficerProfile();
        await loadAssignedCases();
      } catch (error) {
        console.error("Error loading profile data:", error);
        toast({
          title: "Error loading profile",
          description: "Could not load your profile information",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [user, navigate, toast]);

  const loadOfficerProfile = async () => {
    if (!user) return;
    
    // Fetch officer profile from users table
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    // Cast the role and status to the correct types
    setProfile({
      id: profileData.id,
      full_name: profileData.full_name,
      email: profileData.email,
      role: profileData.role as UserRole,
      status: profileData.status as OfficerStatus
    });

    return profileData;
  };

  const loadAssignedCases = async () => {
    if (!user) return;

    // Fetch assigned cases
    const { data: casesData, error: casesError } = await supabase
      .from('cases')
      .select(`
        id,
        status,
        priority,
        created_at,
        updated_at,
        report_id,
        reports (title, description)
      `)
      .eq('assigned_officer_id', user.id)
      .order('updated_at', { ascending: false });

    if (casesError) {
      throw casesError;
    }

    // Format the case data to match our Case type
    const formattedCases = casesData.map(caseItem => ({
      id: caseItem.id,
      crimeReportId: caseItem.report_id,
      assignedOfficerId: user.id,
      assignedOfficerName: profile?.full_name || "",
      progress: caseItem.status as CaseProgress,
      lastUpdated: caseItem.updated_at,
      priority: caseItem.priority as "high" | "medium" | "low",
      crimeReport: caseItem.reports ? {
        id: caseItem.report_id,
        title: caseItem.reports.title || "Unknown",
        description: caseItem.reports.description || "",
        status: caseItem.status as CaseStatus,
        createdById: "",
        createdAt: caseItem.created_at,
        location: "",
        crimeType: ""
      } : undefined
    }));

    setAssignedCases(formattedCases);
  };

  const updateStatus = async (newStatus: OfficerStatus) => {
    if (!user?.id || !profile) return;
    
    setStatusLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setProfile({ ...profile, status: newStatus });
      
      toast({
        title: "Status updated",
        description: `Your status has been updated to ${newStatus.replace('_', ' ')}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error updating status",
        description: "Could not update your status",
        variant: "destructive",
      });
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <BackButton />
        
        <h1 className="text-2xl font-bold mb-8">Officer Profile</h1>
        
        {loading ? (
          <ProfileLoadingState />
        ) : profile ? (
          <ProfileContent 
            profile={profile} 
            assignedCases={assignedCases} 
            onStatusUpdate={updateStatus}
            statusLoading={statusLoading}
          />
        ) : (
          <ProfileErrorState />
        )}
      </div>
      
      <Footer />
    </div>
  );
};

const ProfileLoadingState = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-pulse text-gray-500">Loading profile...</div>
  </div>
);

const ProfileErrorState = () => (
  <div className="text-center py-8 text-gray-500">
    Could not load profile information
  </div>
);

interface ProfileContentProps {
  profile: OfficerProfile;
  assignedCases: Case[];
  onStatusUpdate: (status: OfficerStatus) => Promise<void>;
  statusLoading: boolean;
}

const ProfileContent = ({ profile, assignedCases, onStatusUpdate, statusLoading }: ProfileContentProps) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-1">
      <OfficerProfileCard 
        profile={profile}
        onStatusUpdate={onStatusUpdate}
        statusLoading={statusLoading}
      />
    </div>

    <div className="lg:col-span-2">
      <AssignedCasesTable cases={assignedCases} />
    </div>
  </div>
);
