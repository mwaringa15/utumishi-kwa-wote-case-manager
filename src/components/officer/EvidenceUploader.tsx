
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface EvidenceUploaderProps {
  caseId: string;
  onComplete: () => void;
}

export function EvidenceUploader({ caseId, onComplete }: EvidenceUploaderProps) {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }

    if (!description) {
      setError("Please provide a description of the evidence");
      return;
    }

    if (!user?.id) {
      setError("You must be logged in to upload evidence");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Generate a unique file path
      const filePath = `evidence/${caseId}/${Date.now()}_${selectedFile.name}`;
      
      // Upload file to Supabase Storage
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('case-evidence')
        .upload(filePath, selectedFile);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL for the file
      const { data: urlData } = supabase.storage
        .from('case-evidence')
        .getPublicUrl(filePath);
        
      const fileUrl = urlData?.publicUrl;
      
      if (!fileUrl) {
        throw new Error("Failed to get public URL for the uploaded file");
      }
      
      // Record the evidence in the database
      const { error: evidenceError } = await supabase
        .from('evidence')
        .insert({
          case_id: caseId,
          file_url: fileUrl,
          description,
          uploaded_by: user.id
        });
        
      if (evidenceError) throw evidenceError;
      
      // Add case history record
      await supabase
        .from('case_history')
        .insert({
          case_id: caseId,
          updated_by: user.id,
          update_note: `Evidence uploaded: ${selectedFile.name} - ${description}`
        });
      
      // Update the case status to indicate evidence was added
      const { error: caseUpdateError } = await supabase
        .from('cases')
        .update({ 
          updated_at: new Date().toISOString() 
        })
        .eq('id', caseId);
        
      if (caseUpdateError) {
        console.error("Error updating case timestamp:", caseUpdateError);
      }
      
      setUploadSuccess(true);
      
      setTimeout(() => {
        onComplete();
      }, 1500);
      
    } catch (err: any) {
      console.error("Evidence upload error:", err);
      setError(err.message || "Failed to upload evidence. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {uploadSuccess ? (
        <Alert className="bg-green-50 border-green-200">
          <FileText className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">
            Evidence has been successfully uploaded and attached to the case
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div>
            <Label htmlFor="evidence-file">Select File</Label>
            <Input 
              id="evidence-file" 
              type="file" 
              onChange={handleFileChange}
              className="mt-1"
              disabled={isUploading}
            />
            {selectedFile && (
              <p className="text-sm text-gray-500 mt-1">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="evidence-description">Description</Label>
            <Textarea 
              id="evidence-description" 
              placeholder="Describe this evidence and how it relates to the case..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
              rows={4}
              disabled={isUploading}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onComplete} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile || !description || isUploading}>
              {isUploading ? (
                <>Uploading...</>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" /> 
                  Upload Evidence
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
