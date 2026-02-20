"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Shield, Stethoscope } from "lucide-react";
import { FadeIn } from "@/components/animations/fade-in";
import { SlideIn } from "@/components/animations/slide-in";
import { useLottie } from "lottie-react";
import medicalAnimation from "@/animations/medical-animation.json";

export default function Home() {
  const defaultOptions = {
    animationData: medicalAnimation,
    loop: true,
  };

  const { View } = useLottie(defaultOptions);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <SlideIn className="flex-1 space-y-6 max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Medstra Medical Assistant
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Experience the future of medical assessments with our AI-powered
                platform. Fast, accurate, and convenient insurance underwriting
                process.
                
              </p>
              <div className="flex gap-4 pt-4">
                <Button asChild size="lg" className="group">
                  <Link href="/assessment/select" className="gap-2">
                    Start Assessment
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/how-it-works">Learn More</Link>
                </Button>
              </div>
              <div className="flex gap-8 pt-8">
                {["HIPAA Compliant", "FDA Registered", "ISO Certified"].map(
                  (text, i) => (
                    <FadeIn key={text} delay={i * 0.2}>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        <span className="text-sm">{text}</span>
                      </div>
                    </FadeIn>
                  )
                )}
              </div>
            </SlideIn>
            <SlideIn direction="right" className="flex-1 relative max-w-xl">
              <div className="absolute inset-0 rounded-3xl -z-10" />
              <div className="w-full">{View}</div>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <FadeIn className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">
              Our advanced AI technology streamlines the medical examination
              process while maintaining the highest standards of accuracy and
              security.
            </p>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <FadeIn key={feature.title} delay={i * 0.2}>
                <FeatureCard {...feature} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <FadeIn>
            <h2 className="text-3xl font-bold text-center mb-16">
              Trusted by Industry Leaders
            </h2>
          </FadeIn>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, i) => (
              <SlideIn
                key={testimonial.author}
                direction={i % 2 ? "right" : "left"}
              >
                <TestimonialCard {...testimonial} />
              </SlideIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <FadeIn className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-primary-foreground/80 max-w-2xl mx-auto">
            Join thousands of healthcare professionals and insurance providers
            who trust our AI-powered medical examination platform.
          </p>
          <Button size="lg" variant="secondary" asChild className="group">
            <Link href="/assessment/select" className="gap-2">
              Start Your Assessment
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </FadeIn>
      </section>
    </div>
  );
}

const features = [
  {
    title: "Smart Assessment",
    description:
      "Complete your health assessment through natural conversation with our AI assistant",
    icon: <Stethoscope className="h-12 w-12 text-primary" />,
  },
  {
    title: "Real-time Analysis",
    description:
      "Advanced AI algorithms process your responses instantly for accurate evaluation",
    icon: <Shield className="h-12 w-12 text-primary" />,
  },
  {
    title: "Secure Reports",
    description:
      "Get comprehensive reports with bank-level security and HIPAA compliance",
    icon: <Shield className="h-12 w-12 text-primary" />,
  },
];

const testimonials = [
  {
    quote:
      "The virtual assessment platform has revolutionized our underwriting process, reducing processing time by 60% while maintaining accuracy.",
    author: "Dr. Sarah Johnson",
    role: "Chief Medical Officer, InsureTech Inc.",
    image: "/testi.jpg",
  },
  {
    quote:
      "Medstra's AI-powered assessments have significantly improved our customer experience while ensuring thorough medical evaluations.",
    author: "Michael Chen",
    role: "Head of Innovation, Global Insurance Group",
    image: "/testi.jpg",
  },
];

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <div className="mb-4 p-3 bg-primary/5 w-fit rounded-xl">{icon}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function TestimonialCard({
  quote,
  author,
  role,
  image,
}: {
  quote: string;
  author: string;
  role: string;
  image: string;
}) {
  return (
    <Card className="overflow-hidden border-none shadow-lg">
      <CardContent className="p-8">
        <div className="flex gap-4 items-start">
          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
            <Image src={image} alt={author} fill className="object-cover" />
          </div>
          <div>
            <blockquote className="text-lg mb-4 italic text-muted-foreground">
              &quot;{quote}&quot;
            </blockquote>
            <div>
              <p className="font-semibold">{author}</p>
              <p className="text-sm text-muted-foreground">{role}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
