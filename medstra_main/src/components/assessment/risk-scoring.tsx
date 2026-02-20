"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Shield } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RiskFactor {
  category: string;
  level: "low" | "medium" | "high";
  score: number;
  description: string;
}

interface RiskScoringProps {
  overallScore: number;
  riskFactors: RiskFactor[];
}

export function RiskScoring({ overallScore, riskFactors }: RiskScoringProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "low":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "medium":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "high":
        return <Shield className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment Score</CardTitle>
          <CardDescription>
            Based on your medical examination results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`text-6xl font-bold ${getScoreColor(overallScore)}`}
            >
              {overallScore}
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Factors */}
      <div className="grid gap-4">
        {riskFactors.map((factor, index) => (
          <motion.div
            key={factor.category}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-4 p-4 rounded-lg border"
          >
            {getRiskIcon(factor.level)}
            <div>
              <h3 className="font-medium">{factor.category}</h3>
              <p className="text-sm text-muted-foreground">
                {factor.description}
              </p>
            </div>
            <div className={`ml-auto font-medium ${getScoreColor(factor.score)}`}>
              {factor.score}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 