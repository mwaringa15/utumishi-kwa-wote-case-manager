
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { CrimeReportFormValues } from "./types";
import { useStations } from "@/hooks/useStations";
import { Skeleton } from "@/components/ui/skeleton";

interface IncidentDetailsFieldsProps {
  control: Control<CrimeReportFormValues>;
}

export function IncidentDetailsFields({ control }: IncidentDetailsFieldsProps) {
  const { data: stations, isLoading: isLoadingStations } = useStations();

  return (
    <>
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Report Title</FormLabel>
            <FormControl>
              <Input placeholder="Brief title describing the incident" {...field} />
            </FormControl>
            <FormDescription>
              Provide a short, descriptive title for your report
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Incident Location</FormLabel>
              <FormControl>
                <Input placeholder="Where did this occur?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="incidentDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Incident</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Crime Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select crime category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="theft">Theft/Robbery</SelectItem>
                  <SelectItem value="assault">Assault/Violence</SelectItem>
                  <SelectItem value="fraud">Fraud/Scam</SelectItem>
                  <SelectItem value="property">Property Damage</SelectItem>
                  <SelectItem value="traffic">Traffic Incident</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="stationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Police Station</FormLabel>
              {isLoadingStations ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select nearest police station" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {stations?.map(station => (
                      <SelectItem key={station.id} value={station.id}>
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FormDescription>Select the police station to handle your report</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Detailed Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Please provide detailed information about what happened" 
                {...field} 
                rows={5}
              />
            </FormControl>
            <FormDescription>
              Include details such as what happened, who was involved, and any other relevant information
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
