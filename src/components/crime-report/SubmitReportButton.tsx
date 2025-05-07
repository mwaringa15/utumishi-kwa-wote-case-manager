
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Report"
        )}
      </Button>
    </div>
  );
}
