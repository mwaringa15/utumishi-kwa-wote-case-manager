
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { IncidentDetailsFields } from "./IncidentDetailsFields";
import { AdditionalInfoField } from "./AdditionalInfoField";
import { SubmitReportButton } from "./SubmitReportButton";
import { crimeReportSchema, CrimeReportFormValues } from "./types";
import { useReportSubmission } from "./useReportSubmission";

interface ReportFormProps {
  onComplete?: () => void;
}

export function ReportForm({ onComplete }: ReportFormProps) {
  const { isSubmitting, handleSubmit } = useReportSubmission();
  
  const form = useForm<CrimeReportFormValues>({
    resolver: zodResolver(crimeReportSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      incidentDate: new Date().toISOString().split("T")[0],
      category: "",
      contactPhone: "",
      additionalInfo: "",
    },
  });

  const onSubmit = async (data: CrimeReportFormValues) => {
    const success = await handleSubmit(data);
    if (success) {
      form.reset();
      if (onComplete) {
        onComplete();
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <IncidentDetailsFields control={form.control} />
        <PersonalInfoFields control={form.control} />
        <AdditionalInfoField control={form.control} />
        <SubmitReportButton isSubmitting={isSubmitting} />
      </form>
    </Form>
  );
}
