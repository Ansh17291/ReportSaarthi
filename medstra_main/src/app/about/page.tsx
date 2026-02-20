"use client";

import { FadeIn } from "@/components/animations/fade-in";
import { SlideIn } from "@/components/animations/slide-in";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Users, Building2, Globe2 } from "lucide-react";
import Image from "next/image";

const stats = [
  {
    value: "50K+",
    label: "Assessments Completed",
    icon: Users,
  },
  {
    value: "98%",
    label: "Accuracy Rate",
    icon: Award,
  },
  {
    value: "200+",
    label: "Insurance Partners",
    icon: Building2,
  },
  {
    value: "20+",
    label: "Countries Served",
    icon: Globe2,
  },
];

const team = [
  {
    name: "Dr. Sarah Chen",
    role: "Chief Medical Officer",
    image: "/team/sarah.jpg",
    bio: "Leading expert in AI healthcare with 15+ years of experience",
  },
  // Add more team members...
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Hero Section */}
        <FadeIn>
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">About Medstra</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Revolutionizing medical assessments through artificial
              intelligence
            </p>
          </div>
        </FadeIn>

        {/* Mission Statement */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <SlideIn>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">Our Mission</h2>
              <p className="text-lg text-muted-foreground">
                To make comprehensive medical assessments accessible, accurate,
                and efficient through cutting-edge AI technology while
                maintaining the highest standards of healthcare privacy and
                security.
              </p>
            </div>
          </SlideIn>
          <SlideIn direction="right">
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <Image
                src="/images/about.png"
                alt="Medical Technology"
                fill
                className="object-cover"
              />
            </div>
          </SlideIn>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.1}>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <stat.icon className="h-6 w-6 text-primary mx-auto" />
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>

        {/* Values */}
        <FadeIn>
          <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {["Innovation", "Privacy", "Accuracy"].map((value) => (
              <Card key={value}>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold text-center">{value}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
