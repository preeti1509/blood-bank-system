import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatRelativeTime } from "@/lib/utils";
import { Notification } from "@shared/schema";
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Clock, 
  Ban, 
  Eye, 
  Trash2 
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function NotificationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch all notifications
  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
  });
  
  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await apiRequest(
        "PATCH",
        `/api/notifications/${notificationId}/read`,
        {}
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to mark notification as read: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Filter notifications based on active tab
  const filteredNotifications = React.useMemo(() => {
    if (!notifications) return [];
    
    switch (activeTab) {
      case "unread":
        return notifications.filter(notification => !notification.isRead);
      case "alerts":
        return notifications.filter(notification => notification.type === "alert");
      case "warnings":
        return notifications.filter(notification => notification.type === "warning");
      case "info":
        return notifications.filter(notification => notification.type === "info");
      default:
        return notifications;
    }
  }, [notifications, activeTab]);
  
  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Get notification background color based on type
  const getNotificationColor = (type: string, isRead: boolean) => {
    if (isRead) {
      return "bg-gray-50";
    }
    
    switch (type) {
      case "alert":
        return "bg-red-50";
      case "warning":
        return "bg-yellow-50";
      case "info":
        return "bg-blue-50";
      default:
        return "bg-white";
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications?.filter(n => !n.isRead) || [];
      
      // Mark each unread notification as read
      for (const notification of unreadNotifications) {
        await markAsReadMutation.mutateAsync(notification.id);
      }
      
      toast({
        title: "Success",
        description: "All notifications have been marked as read.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read.",
        variant: "destructive",
      });
    }
  };
  
  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // Navigate to related entity if applicable
    if (notification.relatedEntityId && notification.relatedEntityType) {
      switch (notification.relatedEntityType) {
        case "request":
          // Navigate to the request in a real implementation
          break;
        case "inventory":
          // Navigate to inventory in a real implementation
          break;
        default:
          break;
      }
    }
  };
  
  // Get counts for notification tabs
  const getNotificationCounts = () => {
    if (!notifications) return { all: 0, unread: 0, alerts: 0, warnings: 0, info: 0 };
    
    return {
      all: notifications.length,
      unread: notifications.filter(n => !n.isRead).length,
      alerts: notifications.filter(n => n.type === "alert").length,
      warnings: notifications.filter(n => n.type === "warning").length,
      info: notifications.filter(n => n.type === "info").length,
    };
  };
  
  const notificationCounts = getNotificationCounts();
  
  return (
    <DashboardLayout title="Notifications">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <CardTitle>System Notifications</CardTitle>
              <CardDescription>
                Alerts, warnings, and important information
              </CardDescription>
            </div>
            
            {notificationCounts.unread > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark All as Read
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Mark All as Read</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to mark all {notificationCounts.unread} unread notifications as read?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={markAllAsRead}>
                      Mark All as Read
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="mt-4"
          >
            <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
              <TabsTrigger value="all" className="relative">
                All
                {notificationCounts.all > 0 && (
                  <Badge className="ml-2">{notificationCounts.all}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread" className="relative">
                Unread
                {notificationCounts.unread > 0 && (
                  <Badge className="ml-2">{notificationCounts.unread}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="alerts" className="relative">
                Alerts
                {notificationCounts.alerts > 0 && (
                  <Badge className="ml-2 bg-red-500">{notificationCounts.alerts}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="warnings" className="relative">
                Warnings
                {notificationCounts.warnings > 0 && (
                  <Badge className="ml-2 bg-yellow-500">{notificationCounts.warnings}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="info" className="relative">
                Info
                {notificationCounts.info > 0 && (
                  <Badge className="ml-2 bg-blue-500">{notificationCounts.info}</Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start p-4 border rounded-md">
                  <Skeleton className="h-6 w-6 rounded-full mr-3" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`flex items-start p-4 border rounded-md ${getNotificationColor(notification.type, notification.isRead)} cursor-pointer hover:bg-gray-100 transition-colors`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="mr-3 pt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className={`font-semibold ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatRelativeTime(notification.createdAt)}
                        </Badge>
                        {notification.isRead ? (
                          <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                            Read
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-500">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className={`text-sm mt-1 ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      {notification.relatedEntityType && (
                        <div className="flex items-center mr-4">
                          <span>
                            Related to: {notification.relatedEntityType} #{notification.relatedEntityId}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 ml-auto">
                        {!notification.isRead && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsReadMutation.mutate(notification.id);
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Mark as read
                          </Button>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Would implement delete functionality here in a real app
                          }}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
              <p className="text-gray-500 mt-1">
                {activeTab === "unread" 
                  ? "You have read all your notifications." 
                  : activeTab === "alerts" 
                  ? "No alerts to display."
                  : activeTab === "warnings"
                  ? "No warnings to display."
                  : "You don't have any notifications yet."}
              </p>
            </div>
          )}
        </CardContent>
        
        {notifications && notifications.length > 0 && (
          <CardFooter className="border-t py-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </div>
            
            <Button variant="ghost" size="sm">
              <Ban className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </CardFooter>
        )}
      </Card>
    </DashboardLayout>
  );
}
