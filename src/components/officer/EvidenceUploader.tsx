
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Upload, X, FileText, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EvidenceUploaderProps {
  caseId: string;
  onComplete: () => void;
}

export function EvidenceUploader({ caseId, onComplete }: EvidenceUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') {
      return <FileText className="h-5 w-5 text-blue-600" />;
    } else if (['mp4', 'mov', 'avi', 'wmv'].includes(extension || '')) {
      return <Video className="h-5 w-5 text-blue-600" />;
    } else {
      return <Upload className="h-5 w-5 text-blue-600" />;
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Generate a unique file path
      const fileExt = file.name.split('.').pop();
      const filePath = `${caseId}/${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage (would be implemented in a real app)
      // const { data, error } = await supabase.storage.from('evidence').upload(filePath, file);
      
      // Mock successful upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, save the evidence record to the database
      const evidenceData = {
        case_id: caseId,
        description: description,
        file_url: `https://example.com/${filePath}`, // This would be the actual URL from storage
        file_type: file.type
      };
      
      // Mock database insertion
      console.log("Evidence data to be saved:", evidenceData);
      
      toast({
        title: "Evidence uploaded",
        description: `Evidence has been uploaded and associated with case ${caseId}`,
      });
      
      setFile(null);
      setDescription("");
      onComplete();
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your evidence",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
  };

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="evidence-description" className="text-sm font-medium">
          Evidence Description
        </label>
        <Textarea
          id="evidence-description"
          placeholder="Describe this evidence..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[80px]"
        />
      </div>
      
      {!file ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">Click to upload or drag and drop</p>
          <p className="mt-1 text-xs text-gray-400">PDF, Video (MP4, MOV), max 100MB</p>
          <Input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            accept="application/pdf,video/mp4,video/quicktime,video/x-msvideo,video/x-ms-wmv"
          />
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-md">
              {getFileIcon(file.name)}
            </div>
            <div className="ml-3 truncate">
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)}MB</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clearFile}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isUploading || !file}
          className="bg-kenya-green hover:bg-kenya-green/90"
        >
          {isUploading ? "Uploading..." : "Upload Evidence"}
        </Button>
      </div>
    </form>
  );
}
