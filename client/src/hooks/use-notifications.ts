import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Notification, InsertNotification } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface UseNotificationsReturn {
  notifications: Notification[] | undefined;
  isLoading: boolean;
  isError: boolean;
  unreadNotifications: Notification[] | undefined;
  emergencyNotifications: Notification[] | undefined;
  warningNotifications: Notification[] | undefined;
  infoNotifications: Notification[] | undefined;
  getNotificationById: (id: number) => Notification | undefined;
  createNotification: (data: InsertNotification) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export function useNotifications(userId?: number): UseNotificationsReturn {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Query key for notifications
  const notificationsKey = userId 
    ? [`/api/notifications/user/${userId}`]
    : ['/api/notifications'];
  
  // Get all notifications
  const { data: notifications, isLoading, isError } = useQuery<Notification[]>({
    queryKey: notificationsKey,
  });
  
  // Create filtered notification selectors
  const unreadNotifications = notifications?.filter(n => !n.isRead);
  const emergencyNotifications = notifications?.filter(n => n.type === "alert" && !n.isRead);
  const warningNotifications = notifications?.filter(n => n.type === "warning" && !n.isRead);
  const infoNotifications = notifications?.filter(n => n.type === "info" && !n.isRead);
  
  // Get notification by ID
  const getNotificationById = (id: number): Notification | undefined => {
    return notifications?.find(n => n.id === id);
  };
  
  // Create notification mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertNotification) => {
      const response = await apiRequest("POST", "/api/notifications", data);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate notifications queries
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: [`/api/notifications/user/${userId}`] });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create notification: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PATCH", `/api/notifications/${id}/read`, {});
      return response.json();
    },
    onSuccess: () => {
      // Invalidate notifications queries
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: [`/api/notifications/user/${userId}`] });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to mark notification as read: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Create notification wrapper
  const createNotification = async (data: InsertNotification): Promise<void> => {
    await createMutation.mutateAsync(data);
  };
  
  // Mark notification as read wrapper
  const markAsRead = async (id: number): Promise<void> => {
    await markAsReadMutation.mutateAsync(id);
  };
  
  // Mark all notifications as read
  const markAllAsRead = async (): Promise<void> => {
    if (!unreadNotifications || unreadNotifications.length === 0) return;
    
    // Mark each unread notification as read
    for (const notification of unreadNotifications) {
      await markAsReadMutation.mutateAsync(notification.id);
    }
    
    toast({
      title: "Success",
      description: "All notifications have been marked as read."
    });
  };
  
  return {
    notifications,
    isLoading,
    isError,
    unreadNotifications,
    emergencyNotifications,
    warningNotifications,
    infoNotifications,
    getNotificationById,
    createNotification,
    markAsRead,
    markAllAsRead
  };
}
