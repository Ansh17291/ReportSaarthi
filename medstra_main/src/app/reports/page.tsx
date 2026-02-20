"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/animations/fade-in";
import { FileText, Download, Share2, Calendar } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

const ReportsPage = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const fetchReports = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/reports?userId=${user.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch reports");
        }
        const data = await response.json();
        setReports(data.reports);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && user) {
      fetchReports();
    }
  }, [user, isLoaded]);

  if (!isLoaded) {
    return <div>Loading user...</div>;
  }

  if (loading) {
    return <div>Loading reports...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Medical Reports</h1>
            <p className="text-muted-foreground">
              View and manage your assessment reports
            </p>
          </div>
          <Button asChild>
            <Link href="/assessment/select">New Assessment</Link>
          </Button>
        </div>

        <div className="grid gap-6">
          {reports.map((report, index) => {
            const parser = new DOMParser();
            const patientDoc = parser.parseFromString(report.patientReport, "text/html");
            const underwritingDoc = parser.parseFromString(report.underwritingReport, "text/html");
            const patientTitle = patientDoc.querySelector("h1")?.textContent;
            const underwritingTitle = underwritingDoc.querySelector("h1")?.textContent;

            return (
              <FadeIn key={index}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-semibold">
                      {patientTitle || "Patient Report"}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date().toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Risk Assessment Score:</span>
                          <span className="text-green-600">{report.riskAssessmentScore}%</span>
                        </div>
                      </div>
                      <Button variant="outline" asChild>
                        <Link href={`/reports/${index}`}>
                          View Full Report
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage; 