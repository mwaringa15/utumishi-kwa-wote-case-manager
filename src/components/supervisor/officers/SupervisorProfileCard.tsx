
interface SupervisorProfileProps {
  profile: {
    name: string;
    email: string;
    station: string;
  } | null;
}

export const SupervisorProfileCard = ({ profile }: SupervisorProfileProps) => {
  if (!profile) return null;
  
  return (
    <div className="mt-2 text-sm text-gray-500">
      <p>Supervisor: {profile.name}</p>
      <p>Email: {profile.email}</p>
      <p>Station: {profile.station}</p>
    </div>
  );
};
