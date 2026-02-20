import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PreAssessmentProps {
  onBack: () => void;
  onNext: (data: { 
    height: string; 
    weight: string; 
    smoker: string; 
    exerciseFrequency: string;
    medicalReportText?: string;
  }) => void;
}

export function PreAssessment({ onBack, onNext }: PreAssessmentProps) {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [smoker, setSmoker] = useState("no");
  const [exerciseFrequency, setExerciseFrequency] = useState("");
  const [medicalReportText, setMedicalReportText] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<{
    message: string;
    type: "success" | "error" | "loading" | null;
  }>({ message: "", type: null });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus({ message: "Processing medical report...", type: "loading" });

    // Create FormData object
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Extract text from document
      const response = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setMedicalReportText(data.text);
      setUploadStatus({ 
        message: "Medical report processed successfully!", 
        type: "success" 
      });
    } catch (error) {
      console.error("Error processing document:", error);
      setUploadStatus({ 
        message: "Error processing medical report. Please try again.", 
        type: "error" 
      });
    }
  };

  const handleContinue = () => {
    if (!height || !weight || !exerciseFrequency) {
      alert("Please fill in all required fields.");
      return;
    }
    console.log(medicalReportText);
    
    // Proceed to the next step with the collected data
    onNext({ 
      height, 
      weight, 
      smoker, 
      exerciseFrequency,
      medicalReportText: medicalReportText || ""
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Pre-Assessment Questionnaire</h2>
        <p className="text-muted-foreground">
          Please provide accurate information to help us conduct a thorough assessment.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="height">Height (cm) <span className="text-red-500">*</span></Label>
          <Input
            id="height"
            type="number"
            placeholder="Enter your height"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="weight">Weight (kg) <span className="text-red-500">*</span></Label>
          <Input
            id="weight"
            type="number"
            placeholder="Enter your weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label>Do you smoke? <span className="text-red-500">*</span></Label>
          <RadioGroup value={smoker} onValueChange={setSmoker}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="smoke-yes" />
              <Label htmlFor="smoke-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="smoke-no" />
              <Label htmlFor="smoke-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="exercise">Exercise Frequency <span className="text-red-500">*</span></Label>
          <Select value={exerciseFrequency} onValueChange={setExerciseFrequency}>
            <SelectTrigger id="exercise">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">2-3 times a week</SelectItem>
              <SelectItem value="occasional">Occasionally</SelectItem>
              <SelectItem value="never">Never</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Medical Reports (Optional)</Label>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.txt,image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="medical-report"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById("medical-report")?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Medical Report (PDF/Images)
              </Button>
            </div>
            {uploadStatus.type && (
              <Alert>
                <AlertDescription className={
                  uploadStatus.type === "success" ? "text-green-600" :
                  uploadStatus.type === "error" ? "text-red-600" :
                  "text-orange-600"
                }>
                  {uploadStatus.message}
                </AlertDescription>
              </Alert>
            )}
            <p className="text-sm text-muted-foreground">
              Supported formats: PDF, Word documents, images (JPG, PNG, etc.)
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
} 