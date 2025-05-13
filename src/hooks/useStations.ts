
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Station } from "@/components/crime-report/types";

export function useStations() {
  return useQuery({
    queryKey: ["stations"],
    queryFn: async (): Promise<Station[]> => {
      const { data, error } = await supabase
        .from("stations")
        .select("id, name")
        .order("name");
      
      if (error) {
        console.error("Error fetching stations:", error);
        throw new Error("Failed to fetch stations");
      }
      
      return data || [];
    }
  });
}
