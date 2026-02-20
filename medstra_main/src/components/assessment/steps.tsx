"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Step {
  id: number;
  name: string;
  description?: string;
}

interface StepsProps {
  steps: Step[];
  currentStep: number;
}

export function Steps({ steps, currentStep }: StepsProps) {
  return (
    <nav aria-label="Progress" className="py-8">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className={cn(
              stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20 w-full" : "",
              "relative"
            )}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {step.id < currentStep ? (
                  // Completed step
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="relative h-12 w-12 flex items-center justify-center rounded-full bg-primary"
                  >
                    <Check className="h-6 w-6 text-white" aria-hidden="true" />
                    <span className="sr-only">{step.name}</span>
                  </motion.div>
                ) : step.id === currentStep ? (
                  // Current step
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="relative h-12 w-12 flex items-center justify-center rounded-full border-4 border-primary bg-card"
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                    <span className="sr-only">{step.name}</span>
                  </motion.div>
                ) : (
                  // Upcoming step
                  <div className="relative h-12 w-12 flex items-center justify-center rounded-full border-2 border-muted-foreground/20 bg-card">
                    <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
                    <span className="sr-only">{step.name}</span>
                  </div>
                )}
              </div>
              {stepIdx !== steps.length - 1 && (
                <>
                  {/* Line connecting steps */}
                  <div
                    className={cn(
                      "absolute top-6 left-12 -ml-px h-0.5 w-full",
                      step.id < currentStep ? "bg-primary" : "bg-muted"
                    )}
                  />
                </>
              )}
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-center">
                <span
                  className={cn(
                    "text-sm font-medium",
                    step.id <= currentStep
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {step.name}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
} 