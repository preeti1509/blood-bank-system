import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: number;
    timeframe: string;
  };
  bgColor?: string;
  iconColor?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  change,
  bgColor = "bg-primary-light bg-opacity-20",
  iconColor = "text-primary",
  className,
}: StatCardProps) {
  const isPositiveChange = change && change.value > 0;
  const isNegativeChange = change && change.value < 0;
  const isNoChange = change && change.value === 0;

  return (
    <div className={cn("bg-white rounded-lg shadow p-5", className)}>
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={cn("p-2 rounded-lg", bgColor)}>
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
      </div>
      {change && (
        <div className="mt-2 flex items-center text-sm">
          {isPositiveChange && (
            <span className="text-success font-medium flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                  clipRule="evenodd"
                />
              </svg>
              {`+${change.value}%`}
            </span>
          )}
          {isNegativeChange && (
            <span className="text-error font-medium flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
                  clipRule="evenodd"
                />
              </svg>
              {`${change.value}%`}
            </span>
          )}
          {isNoChange && <span className="text-gray-500">No change</span>}
          <span className="text-gray-500 ml-1">from {change.timeframe}</span>
        </div>
      )}
    </div>
  );
}
