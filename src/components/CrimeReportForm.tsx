
import { ReportForm } from "./crime-report/ReportForm";
import { BackButton } from "@/components/ui/back-button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface CrimeReportFormProps {
  onComplete?: () => void;
}

const CrimeReportForm = ({ onComplete }: CrimeReportFormProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <BackButton />
        <h2 className="text-2xl font-bold text-kenya-black mt-2">Report a Crime</h2>
      </div>
      
      <Alert variant="warning" className="mb-6">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          After submitting your report, you'll be automatically redirected to track your case.
        </AlertDescription>
      </Alert>
      
      <ReportForm onComplete={onComplete} />
    </div>
  );
};

export default CrimeReportForm;
