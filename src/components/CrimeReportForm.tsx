
import { ReportForm } from "./crime-report/ReportForm";

interface CrimeReportFormProps {
  onComplete?: () => void;
}

const CrimeReportForm = ({ onComplete }: CrimeReportFormProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-kenya-black mb-6">Report a Crime</h2>
      <ReportForm onComplete={onComplete} />
    </div>
  );
};

export default CrimeReportForm;
