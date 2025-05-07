
import { Button } from "@/components/ui/button";

interface SubmitReportButtonProps {
  isSubmitting: boolean;
}

export function SubmitReportButton({ isSubmitting }: SubmitReportButtonProps) {
  return (
    <div className="flex justify-end">
      <Button 
        type="submit" 
        className="bg-kenya-green hover:bg-kenya-green/90 text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Report"}
      </Button>
    </div>
  );
}
