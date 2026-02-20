"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/animations/fade-in";
import { SlideIn } from "@/components/animations/slide-in";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Heart,
  Brain,
  Activity,
  Shield,
  Clock,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const assessmentTypes = [
  {
    id: "cardiovascular",
    title: "Cardiovascular Health",
    description: "Comprehensive heart health assessment",
    duration: "20-25 minutes",
    icon: Heart,
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950",
  },
  {
    id: "neurological",
    title: "Neurological Screening",
    description: "Cognitive and nervous system evaluation",
    duration: "15-20 minutes",
    icon: Brain,
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950",
  },
  {
    id: "respiratory",
    title: "Respiratory Function",
    description: "Lung capacity and breathing assessment",
    duration: "15-20 minutes",
    icon: Heart,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950",
  },
  {
    id: "comprehensive",
    title: "Full Health Screening",
    description: "Complete medical examination",
    duration: "45-50 minutes",
    icon: Activity,
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950",
  },
];

export default function SelectAssessmentPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <FadeIn>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Select Assessment Type</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the type of medical assessment that best suits your
              insurance requirements. Each assessment is tailored to provide
              accurate and comprehensive evaluation.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-6">
          {assessmentTypes.map((type, i) => (
            <SlideIn key={type.id} delay={i * 0.1}>
              <Link href={`/assessment?type=${type.id}`}>
                <Card className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div
                        className={cn(
                          "p-3 rounded-xl",
                          type.bgColor,
                          type.color
                        )}
                      >
                        <type.icon className="h-6 w-6" />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {type.duration}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="mb-2">{type.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {type.description}
                        </p>
                      </div>
                      <motion.div
                        initial={{ x: 0 }}
                        whileHover={{ x: 5 }}
                        className="text-primary"
                      >
                        <ArrowRight className="h-5 w-5" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </SlideIn>
          ))}
        </div>

        {/* Insurance Requirements */}
        <FadeIn>
          <Card className="mt-8 border-dashed">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Shield className="h-5 w-5" />
                <p className="text-sm">
                  All assessments comply with standard insurance requirements
                  and are HIPAA compliant. Results can be shared directly with
                  your insurance provider.
                </p>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Quick Assessment Option */}
        <div className="text-center pt-8">
          <Button variant="outline" asChild>
            <Link href="/assessment/quick" className="gap-2">
              Start Quick Assessment
              <Clock className="h-4 w-4" />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Not sure what you need? Take our 5-minute quick assessment
          </p>
        </div>
      </div>
    </div>
  );
}
