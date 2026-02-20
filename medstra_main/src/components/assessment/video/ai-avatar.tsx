"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Brain, Heart, Lungs, Activity, Stethoscope } from "lucide-react";

interface AIAvatarProps {
  currentPhase: "intro" | "cardio" | "respiratory" | "neuro" | "summary";
  onPhaseComplete: () => void;
}

export function AIAvatar({ currentPhase, onPhaseComplete }: AIAvatarProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const phaseConfig = {
    intro: {
      icon: Stethoscope,
      color: "text-primary",
      message: "Hello, I'm your AI Medical Examiner. Let's begin your assessment.",
    },
    cardio: {
      icon: Heart,
      color: "text-red-500",
      message: "I'll now assess your cardiovascular health. Please follow my instructions.",
    },
    respiratory: {
      icon: Lungs,
      color: "text-blue-500",
      message: "Let's evaluate your respiratory function. Take a deep breath.",
    },
    neuro: {
      icon: Brain,
      color: "text-purple-500",
      message: "Now for your neurological assessment. Please focus on the screen.",
    },
    summary: {
      icon: Activity,
      color: "text-green-500",
      message: "Thank you. I'm analyzing your results.",
    },
  };

  const currentConfig = phaseConfig[currentPhase];

  return (
    <div className="relative aspect-video bg-gradient-to-b from-muted/50 to-muted rounded-xl overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="text-center p-8"
        >
          <div className="mb-6">
            <motion.div
              className={`mx-auto w-20 h-20 rounded-full ${currentConfig.color} bg-background flex items-center justify-center`}
              animate={{
                scale: isAnalyzing ? [1, 1.1, 1] : 1,
              }}
              transition={{ repeat: isAnalyzing ? Infinity : 0, duration: 2 }}
            >
              <currentConfig.icon className="w-10 h-10" />
            </motion.div>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.p
              key={currentPhase}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-lg font-medium"
            >
              {currentConfig.message}
            </motion.p>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
} 