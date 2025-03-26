import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface EmergencyAlertProps {
  title: string;
  message: string;
  type: "error" | "warning" | "info";
  actions?: {
    primary: {
      label: string;
      onClick: () => void;
    };
    secondary?: {
      label: string;
      onClick: () => void;
    };
  };
  className?: string;
  isPulsing?: boolean;
}

export function EmergencyAlert({
  title,
  message,
  type,
  actions,
  className,
  isPulsing = false,
}: EmergencyAlertProps) {
  const backgroundColors = {
    error: "bg-error-light",
    warning: "bg-warning-light",
    info: "bg-info-light",
  };

  const buttonColors = {
    error: {
      primary: "bg-error-dark hover:bg-error",
      secondary: "text-error",
    },
    warning: {
      primary: "bg-warning-dark hover:bg-warning",
      secondary: "text-warning",
    },
    info: {
      primary: "bg-info-dark hover:bg-info",
      secondary: "text-info",
    },
  };

  return (
    <div 
      className={cn(
        backgroundColors[type], 
        "text-white p-4 rounded-lg shadow-md mb-4", 
        isPulsing && "animate-pulse",
        className
      )}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-medium">{title}</h3>
          <div className="mt-2">
            <p className="text-sm">{message}</p>
          </div>
          {actions && (
            <div className="mt-4 flex">
              {actions.secondary && (
                <Button
                  variant="outline"
                  className={cn(
                    "mr-3 bg-white hover:bg-gray-100", 
                    buttonColors[type].secondary
                  )}
                  onClick={actions.secondary.onClick}
                >
                  {actions.secondary.label}
                </Button>
              )}
              <Button
                className={cn(buttonColors[type].primary)}
                onClick={actions.primary.onClick}
              >
                {actions.primary.label}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
