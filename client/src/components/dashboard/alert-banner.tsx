import { Button } from "@/components/ui/button";
import { Alert } from "@shared/schema";
import { X } from "lucide-react";

interface AlertBannerProps {
  alert: Alert;
  onDismiss: () => void;
  onAction?: () => void;
  actionLabel?: string;
}

export default function AlertBanner({
  alert,
  onDismiss,
  onAction,
  actionLabel = "Take Action"
}: AlertBannerProps) {
  // Determine banner styling based on alert level
  const getBannerStyle = () => {
    switch (alert.level) {
      case "critical":
        return {
          bg: "bg-red-50",
          border: "border-red-400",
          icon: "warning",
          iconColor: "text-red-600"
        };
      case "warning":
        return {
          bg: "bg-amber-50",
          border: "border-amber-400",
          icon: "warning",
          iconColor: "text-amber-600"
        };
      default:
        return {
          bg: "bg-blue-50",
          border: "border-blue-400",
          icon: "info",
          iconColor: "text-blue-600"
        };
    }
  };

  const style = getBannerStyle();

  return (
    <div className={`${style.bg} border-l-4 ${style.border} p-4 mb-6 rounded-md shadow-sm`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className={`material-icons ${style.iconColor}`}>{style.icon}</span>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-gray-900">
            {alert.alert_type === "critical_shortage" 
              ? "Critical Inventory Alert" 
              : alert.alert_type === "expiring_soon" 
                ? "Expiration Warning" 
                : alert.alert_type === "new_request" 
                  ? "New Emergency Request" 
                  : "Alert"}
          </h3>
          <div className="mt-2 text-sm text-gray-600">
            <p>{alert.message}</p>
          </div>
          {onAction && (
            <div className="mt-4">
              <div className="-mx-2 -my-1.5 flex">
                <Button
                  onClick={onAction}
                  variant="outline"
                  size="sm"
                  className={`border-none ${style.bg.replace('50', '100')} hover:${style.bg.replace('50', '200')}`}
                >
                  {actionLabel}
                </Button>
              </div>
            </div>
          )}
        </div>
        <button 
          onClick={onDismiss} 
          className="ml-auto text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
