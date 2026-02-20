"use client";

import { motion } from "framer-motion";
import { Heart, Activity, Brain } from "lucide-react";

interface HealthMetric {
  icon: any;
  label: string;
  value: string;
  status: "normal" | "warning" | "critical";
}

interface HealthMetricsProps {
  metrics: HealthMetric[];
}

export function HealthMetrics({ metrics }: HealthMetricsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "text-green-500";
      case "warning":
        return "text-yellow-500";
      case "critical":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-card rounded-lg p-4 border"
        >
          <div className="flex items-center gap-3 mb-2">
            <metric.icon className={`h-5 w-5 ${getStatusColor(metric.status)}`} />
            <span className="text-sm font-medium">{metric.label}</span>
          </div>
          <div className={`text-xl font-bold ${getStatusColor(metric.status)}`}>
            {metric.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
} 