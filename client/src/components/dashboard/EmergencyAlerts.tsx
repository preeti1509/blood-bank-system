import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Notification } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";

export default function EmergencyAlerts() {
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);
  
  const { data: emergencyAlerts, isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications/unread'],
    select: (data) => data.filter(notification => 
      notification.type === "emergency" && !dismissedAlerts.includes(notification.id)
    ),
  });
  
  const handleDismiss = async (id: number) => {
    try {
      await apiRequest('PATCH', `/api/notifications/${id}/read`, {});
      setDismissedAlerts(prev => [...prev, id]);
    } catch (error) {
      console.error("Failed to dismiss notification:", error);
    }
  };
  
  const handleRespond = async (id: number, relatedId: number | null) => {
    // In a real app, this would navigate to the related request
    console.log(`Responding to emergency ${id} related to request ${relatedId}`);
  };
  
  if (isLoading) {
    return <div className="mt-6 h-20 animate-pulse bg-neutral-200 rounded-md"></div>;
  }
  
  if (!emergencyAlerts || emergencyAlerts.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-6">
      {emergencyAlerts.map(alert => (
        <div 
          key={alert.id}
          className="bg-status-error/10 border-l-4 border-status-error p-4 rounded-md flex items-start"
        >
          <span className="material-icons text-status-error mr-3">warning</span>
          <div>
            <h3 className="font-medium text-status-error">{alert.title}</h3>
            <p className="text-sm text-neutral-400">{alert.message}</p>
            <div className="mt-2 flex items-center space-x-2">
              <Button 
                size="sm" 
                className="bg-status-error hover:bg-status-error/90 text-white"
                onClick={() => handleRespond(alert.id, alert.relatedId)}
              >
                Respond Now
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-status-error border-status-error hover:bg-neutral-100"
              >
                View Details
              </Button>
            </div>
          </div>
          <button 
            className="ml-auto text-neutral-300"
            onClick={() => handleDismiss(alert.id)}
          >
            <span className="material-icons">close</span>
          </button>
        </div>
      ))}
    </div>
  );
}
