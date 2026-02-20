"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Steps } from "@/components/assessment/steps";
import { useState, useEffect } from "react";
import { ConsentForm } from "@/components/assessment/consent-form";
import { PreAssessment } from "@/components/assessment/pre-assessment";
import { VideoAssessment } from "@/components/assessment/video-assessment";
import { ReviewSubmit } from "@/components/assessment/review-submit";
import { AnimatePresence, motion } from "framer-motion";
import { FadeIn } from "@/components/animations/fade-in";
import { useSearchParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Language } from "@/components/assessment/video/InteractiveAvatar";
const steps = [
  {
    id: 1,
    name: "Consent",
    description: "Review and accept terms",
  },
  {
    id: 2,
    name: "Pre-Assessment",
    description: "Basic health information",
  },
  {
    id: 3,
    name: "Video Assessment",
    description: "AI-powered examination",
  },
  {
    id: 4,
    name: "Review & Submit",
    description: "Verify and complete",
  },
];

export default function AssessmentPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const searchParams = useSearchParams();
  const router = useRouter();
  const assessmentType = searchParams.get("type");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [smoker, setSmoker] = useState("no");
  const [exerciseFrequency, setExerciseFrequency] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(Language.English);
  const [medicalReportText, setMedicalReportText] = useState<string>("");

  useEffect(() => {
    // If no assessment type is selected, redirect to select page
    if (!assessmentType) {
      router.push("/assessment/select");
    }
  }, [assessmentType, router]);

  // If no type is selected, don't render the assessment
  if (!assessmentType) return null;

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <h1 className="text-3xl font-bold mb-8">Medical Assessment</h1>
            {/* Show the selected assessment type */}
            <p className="text-muted-foreground mb-8">
              Type:{" "}
              {assessmentType.charAt(0).toUpperCase() + assessmentType.slice(1)}{" "}
              Assessment
            </p>
          </FadeIn>

          <Steps steps={steps} currentStep={currentStep} />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 3 ? (
                <VideoAssessment
                  onBack={() => setCurrentStep(2)}
                  onNext={() => setCurrentStep(4)}
                  preAssessmentData={{
                    height,
                    weight,
                    smoker,
                    exerciseFrequency,
                    medicalReportText
                  }}
                  assessmentType={assessmentType}
                  selectedLanguage={selectedLanguage}
                />
              ) : (
                <Card className="overflow-hidden">
                  <CardContent className="p-6">
                    {currentStep === 1 && (
                      <ConsentForm onNext={(language) => {
                        setCurrentStep(2);
                        setSelectedLanguage(language);
                      }} />
                    )}
                    {currentStep === 2 && (
                      <PreAssessment
                        onBack={() => setCurrentStep(1)}
                        onNext={(data) => {
                          setHeight(data.height);
                          setWeight(data.weight);
                          setSmoker(data.smoker);
                          setExerciseFrequency(data.exerciseFrequency);
                          setCurrentStep(3);
                          setMedicalReportText(data.medicalReportText || "");
                        }}
                      />
                    )}
                    {currentStep === 4 && (
                      <ReviewSubmit
                        onBack={() => setCurrentStep(3)}
                        onSubmit={() => console.log("Assessment submitted")}
                      />
                    )}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </ProtectedRoute>
  );
}
