
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserRole, Case, OfficerStatus, CaseStatus, CaseProgress } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserCircle, CalendarClock, MapPin, Mail, Shield } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

interface OfficerProfile {
  id?: string;
  full_name: string;
  email: string;
  role: UserRole;
  station?: string;
  status: OfficerStatus;
}

const OfficerProfile = () => {
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

    const loadProfile = async () => {
      setLoading(true);
      try {
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
          station: profileData.station,
          status: profileData.status as OfficerStatus
        });

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
          assignedOfficerName: profileData.full_name || "",
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
      } catch (error) {
        console.error("Error loading officer profile:", error);
        toast({
          title: "Error loading profile",
          description: "Could not load your profile information",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, navigate, toast]);

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

  // Display badge with appropriate color based on status
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'on_duty':
        return <Badge className="bg-green-500">On Duty</Badge>;
      case 'on_leave':
        return <Badge className="bg-amber-500">On Leave</Badge>;
      case 'off_duty':
        return <Badge className="bg-gray-500">Off Duty</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Display badge with appropriate color based on case priority
  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-500">High</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500">Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-500">Low</Badge>;
      default:
        return <Badge className="bg-gray-500">Normal</Badge>;
    }
  };

  // Display badge with appropriate color based on case status/progress
  const getProgressBadge = (progress?: string) => {
    switch (progress) {
      case 'Completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'In Progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'Pending Review':
        return <Badge className="bg-purple-100 text-purple-800">Pending Review</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{progress}</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!user} userRole={user?.role} />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <BackButton />
        
        <h1 className="text-2xl font-bold mb-8">Officer Profile</h1>
        
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-pulse text-gray-500">Loading profile...</div>
          </div>
        ) : profile ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 pb-2">
                  <div className="bg-gray-200 rounded-full p-3">
                    <UserCircle className="h-8 w-8 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{profile.full_name}</h3>
                    {getStatusBadge(profile.status)}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{profile.role}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{profile.email}</span>
                  </div>
                  {profile.station && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{profile.station}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t p-4">
                <div className="w-full">
                  <h4 className="font-medium text-sm mb-2">Update Your Status</h4>
                  <div className="flex gap-3">
                    <Select 
                      disabled={statusLoading}
                      defaultValue={profile.status}
                      onValueChange={(value) => updateStatus(value as 'on_duty' | 'on_leave' | 'off_duty')}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="on_duty">On Duty</SelectItem>
                        <SelectItem value="on_leave">On Leave</SelectItem>
                        <SelectItem value="off_duty">Off Duty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardFooter>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Assigned Cases</CardTitle>
                <CardDescription>
                  Cases currently assigned to you ({assignedCases.length})
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assignedCases.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Case ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignedCases.map((caseItem) => (
                        <TableRow key={caseItem.id}>
                          <TableCell className="font-medium">{caseItem.id.substring(0, 8)}...</TableCell>
                          <TableCell>{caseItem.crimeReport?.title || "Unknown"}</TableCell>
                          <TableCell>{getProgressBadge(caseItem.progress)}</TableCell>
                          <TableCell>{getPriorityBadge(caseItem.priority)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <CalendarClock className="h-3 w-3 text-gray-500" />
                              <span className="text-sm text-gray-500">
                                {new Date(caseItem.lastUpdated).toLocaleDateString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => navigate(`/case/${caseItem.id}`)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No cases assigned to you yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Could not load profile information
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default OfficerProfile;
