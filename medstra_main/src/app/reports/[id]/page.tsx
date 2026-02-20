"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/fade-in";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";

interface Report {
  patientReport: string;
  underwritingReport: string;
  riskAssessmentScore: string;
}

export default function ReportPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isLoaded } = useUser();
  const params = useParams();

  useEffect(() => {
    const fetchReport = async () => {
      if (!user) return;
      
      try {
        const response = await fetch(`/api/reports?userId=${user.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch reports");
        }
        const data = await response.json();
        // Find the specific report using the ID from params
        const foundReport = data.reports[Number(params.id)];
        if (foundReport) {
          setReport(foundReport);
        }
      } catch (error) {
        console.error("Error fetching report:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && user) {
      fetchReport();
    }
  }, [user, isLoaded, params.id]);

  if (!isLoaded || loading) {
    return <div>Loading...</div>;
  }

  if (!report) {
    return <div>Report not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/reports">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Assessment Report</h1>
        </div>

        <div className="grid gap-8">
          <FadeIn>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">Risk Assessment Score</h2>
                <div className="text-4xl font-bold text-green-600">
                  {report.riskAssessmentScore}%
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Patient Report</h2>
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: report.patientReport }} 
                  />
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-4">Underwriting Report</h2>
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: report.underwritingReport }} 
                  />
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
} 