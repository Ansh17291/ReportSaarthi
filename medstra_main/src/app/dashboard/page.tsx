"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FadeIn } from "@/components/animations/fade-in";
import { SlideIn } from "@/components/animations/slide-in";
import {
  Activity,
  Calendar,
  Clock,
  FileText,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Mock data for demonstration
const recentAssessments = [
  {
    id: 1,
    date: "2024-02-20",
    status: "completed",
    type: "Annual Health Check",
    score: 92,
    recommendation: "No immediate action required",
  },
  {
    id: 2,
    date: "2024-02-15",
    status: "pending",
    type: "Cardiovascular Assessment",
    score: null,
    recommendation: "Awaiting review",
  },
];

const upcomingAssessments = [
  {
    id: 1,
    date: "2024-03-01",
    type: "Quarterly Review",
    reminder: true,
  },
];

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <FadeIn>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your medical assessments and view reports
            </p>
          </FadeIn>
          <SlideIn direction="left">
            <Button asChild>
              <Link href="/assessment" className="gap-2">
                <Plus className="h-4 w-4" />
                New Assessment
              </Link>
            </Button>
          </SlideIn>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4">
          {[
            {
              title: "Total Assessments",
              value: "12",
              icon: FileText,
              color: "text-blue-500",
            },
            {
              title: "Completed",
              value: "8",
              icon: CheckCircle2,
              color: "text-green-500",
            },
            {
              title: "Pending",
              value: "3",
              icon: Clock,
              color: "text-orange-500",
            },
            {
              title: "Health Score",
              value: "92%",
              icon: Activity,
              color: "text-purple-500",
            },
          ].map((stat, i) => (
            <SlideIn key={stat.title} delay={i * 0.1}>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                    <p className="text-sm font-medium">{stat.title}</p>
                  </div>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </CardContent>
              </Card>
            </SlideIn>
          ))}
        </div>

        {/* Recent Assessments */}
        <FadeIn>
          <Card>
            <CardHeader>
              <CardTitle>Recent Assessments</CardTitle>
              <CardDescription>
                Your latest medical examination results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentAssessments.map((assessment, i) => (
                  <motion.div
                    key={assessment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="flex items-start gap-4 p-4 rounded-lg border"
                  >
                    <div
                      className={cn(
                        "p-2 rounded-full",
                        assessment.status === "completed"
                          ? "bg-green-100 dark:bg-green-900"
                          : "bg-orange-100 dark:bg-orange-900"
                      )}
                    >
                      {assessment.status === "completed" ? (
                        <CheckCircle2
                          className={cn(
                            "h-5 w-5",
                            assessment.status === "completed"
                              ? "text-green-600 dark:text-green-400"
                              : "text-orange-600 dark:text-orange-400"
                          )}
                        />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{assessment.type}</h3>
                        <time className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(assessment.date).toLocaleDateString()}
                        </time>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {assessment.recommendation}
                      </p>
                      {assessment.score && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="text-sm font-medium">Health Score:</div>
                          <div className="text-sm text-green-600 dark:text-green-400">
                            {assessment.score}%
                          </div>
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/assessment/${assessment.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Upcoming Assessments */}
        <FadeIn>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Assessments</CardTitle>
              <CardDescription>Scheduled examinations</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingAssessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium">{assessment.type}</h3>
                      <time className="text-sm text-muted-foreground">
                        {new Date(assessment.date).toLocaleDateString()}
                      </time>
                    </div>
                  </div>
                  <Button asChild>
                    <Link href="/assessment">Start Assessment</Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
} 