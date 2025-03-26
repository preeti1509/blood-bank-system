import React from "react";
import { cn, getInventoryLevelColor } from "@/lib/utils";
import { BloodType } from "@shared/schema";

interface BloodTypeCardProps {
  bloodType: BloodType;
  units: number;
  percentage: number;
  className?: string;
}

export function BloodTypeCard({ bloodType, units, percentage, className }: BloodTypeCardProps) {
  return (
    <div className={cn("bg-gray-50 p-4 rounded-lg text-center", className)}>
      <div className="text-xl font-bold text-primary">{bloodType}</div>
      <div className="mt-2 text-xl font-semibold text-gray-700">{units}</div>
      <div className="mt-1 text-xs text-gray-500">Units</div>
      <div className="mt-2 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full", getInventoryLevelColor(percentage))} 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
}
