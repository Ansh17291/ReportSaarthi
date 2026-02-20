"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Download, Share2, FileText } from "lucide-react";

interface ReportSection {
  title: string;
  content: string | React.ReactNode;
}

interface MedicalReportProps {
  patientInfo: {
    name: string;
    date: string;
    assessmentType: string;
  };
  sections: ReportSection[];
  recommendations: string[];
  onDownload: () => void;
  onShare: () => void;
}

export function MedicalReport({
  patientInfo,
  sections,
  recommendations,
  onDownload,
  onShare,
}: MedicalReportProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Medical Assessment Report</CardTitle>
              <CardDescription>
                Generated on {new Date(patientInfo.date).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={onDownload}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={onShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Patient Information */}
            <div className="p-4 rounded-lg bg-muted">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Patient Name</div>
                  <div className="font-medium">{patientInfo.name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Assessment Type</div>
                  <div className="font-medium">{patientInfo.assessmentType}</div>
                </div>
              </div>
            </div>

            {/* Report Sections */}
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <h3 className="text-lg font-semibold">{section.title}</h3>
                <div className="text-muted-foreground">{section.content}</div>
              </motion.div>
            ))}

            {/* Recommendations */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Recommendations</h3>
              <ul className="space-y-2">
                {recommendations.map((rec, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4 text-primary" />
                    <span>{rec}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 