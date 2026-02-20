"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Camera, Mic, MicOff, VideoOff, Maximize2, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import InteractiveAvatar from "@/components/assessment/video/InteractiveAvatar";
import { Language } from "@/components/assessment/video/InteractiveAvatar";
interface VideoAssessmentProps {
  onBack: () => void;
  onNext: () => void;
  assessmentType: string;
  preAssessmentData: {
    height: string;
    weight: string;
    smoker: string;
    exerciseFrequency: string;
    medicalReportText?: string;
  };
  selectedLanguage: Language;
}

export function VideoAssessment({ onBack, onNext, assessmentType, preAssessmentData, selectedLanguage }: VideoAssessmentProps) {
  const { height, weight, smoker, exerciseFrequency, medicalReportText } = preAssessmentData;

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isAssessmentStarted, setIsAssessmentStarted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAvatarVisible, setIsAvatarVisible] = useState(false);
  
  useEffect(() => {
    handleStartAssessment();
  }, []);

  const getAssessmentTitle = () => {
    switch (assessmentType) {
      case "cardiovascular":
        return "Cardiovascular Health Assessment";
      case "neurological":
        return "Neurological Screening";
      case "respiratory":
        return "Respiratory Function Assessment";
      case "comprehensive":
        return "Full Health Screening";
      default:
        return "Medical Assessment";
    }
  };

  const handleStartAssessment = async () => {
    setIsAssessmentStarted(true);
    setIsAvatarVisible(true);
  };

  const handleEndSession = () => {
    setIsAssessmentStarted(false);
    setIsAvatarVisible(false);
  };

  return (
    <motion.div
      layout
      className={cn(
        "space-y-6 transition-all duration-300",
        isFullscreen && "fixed inset-0 bg-background z-50 p-4"
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">{getAssessmentTitle()}</h2>
          <p className="text-muted-foreground">
            Our AI medical examiner will guide you through a series of questions and observations.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          {isFullscreen ? (
            <Minimize2 className="h-5 w-5" />
          ) : (
            <Maximize2 className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className={cn(
        "grid gap-6",
        isFullscreen ? "grid-cols-1 h-[calc(100vh-12rem)]" : "md:grid-cols-1"
      )}>
        {/* AI Assistant Preview */}
        {isAvatarVisible && <InteractiveAvatar preAssessmentData={
          {
            height: parseFloat(height),
            weight: parseFloat(weight),
            smoker: smoker === "yes",
            exerciseFrequency: exerciseFrequency,
            type: assessmentType,
            language: selectedLanguage,
            medicalReportText
          }
        } />}
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!isAssessmentStarted}>
          Continue
        </Button>
      </div>
    </motion.div>
  );
} 