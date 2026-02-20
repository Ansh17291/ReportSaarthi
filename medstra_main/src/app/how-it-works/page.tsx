"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/animations/fade-in";
import { SlideIn } from "@/components/animations/slide-in";
import { ArrowRight, Brain, Heart, Shield, Stethoscope, FileText, Lock } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    title: "AI-Powered Assessment",
    description: "Our advanced AI examiner conducts a thorough medical evaluation through natural conversation",
    icon: Brain,
  },
  {
    title: "Real-time Analysis",
    description: "Advanced algorithms process health data instantly for accurate evaluation",
    icon: Heart,
  },
  {
    title: "Secure Report Generation",
    description: "Comprehensive medical reports with HIPAA-compliant security",
    icon: FileText,
  },
];

const features = [
  {
    title: "HIPAA Compliance",
    description: "All data is encrypted and handled according to healthcare privacy standards",
    icon: Lock,
  },
  {
    title: "Medical Accuracy",
    description: "AI models trained on extensive medical datasets for precise assessments",
    icon: Stethoscope,
  },
  {
    title: "Insurance Integration",
    description: "Seamless integration with major insurance providers",
    icon: Shield,
  },
];

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Hero Section */}
        <FadeIn>
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">How It Works</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of medical assessments with our AI-powered platform
            </p>
          </div>
        </FadeIn>

        {/* Process Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <SlideIn key={step.title} delay={i * 0.1}>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="p-3 bg-primary/10 w-fit rounded-lg">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 0.1}>
              <div className="space-y-3">
                <div className="p-2 bg-muted w-fit rounded-lg">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* CTA Section */}
        <FadeIn>
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold">Ready to Get Started?</h2>
            <Button asChild size="lg">
              <Link href="/assessment/select" className="gap-2">
                Start Assessment
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </FadeIn>
      </div>
    </div>
  );
} 