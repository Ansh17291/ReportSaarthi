import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, AlertTriangle, Link } from "lucide-react";

interface ReviewSubmitProps {
  onBack: () => void;
  onSubmit: () => void;
}

export function ReviewSubmit({ onBack }: ReviewSubmitProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Review & Submit</h2>
        <p className="text-muted-foreground">
          Please review your assessment information before final submission.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
            <CardDescription>Personal and physical details</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-muted-foreground">Height</dt>
                <dd className="text-sm font-medium">175 cm</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Weight</dt>
                <dd className="text-sm font-medium">70 kg</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">
                  Smoking Status
                </dt>
                <dd className="text-sm font-medium">Non-smoker</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">
                  Exercise Frequency
                </dt>
                <dd className="text-sm font-medium">2-3 times a week</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Assessment Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Assessment Results</CardTitle>
            <CardDescription>AI-powered examination findings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-sm">
                  Cardiovascular Assessment Complete
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-sm">Respiratory Assessment Complete</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span className="text-sm">
                  Additional blood pressure check recommended
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirmation */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              By submitting this assessment, you confirm that all provided
              information is accurate to the best of your knowledge. The results
              will be shared with your insurance provider for underwriting
              purposes.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button>
          {/* <Link href="/report">Submit Assessment</Link> */}
          Submit Assessment
        </Button>
      </div>
    </div>
  );
}
