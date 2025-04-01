import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Alert, alertTypeEnum, BloodType, bloodTypeEnum } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatDateString } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertAlertSchema } from "@shared/schema";

export default function Alerts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  // Fetch alerts
  const { data: alerts, isLoading } = useQuery<Alert[]>({
    queryKey: ['/api/alerts'],
  });

  // Create alert mutation
  const createAlertMutation = useMutation({
    mutationFn: async (alertData: Omit<Alert, 'id' | 'created_at'>) => {
      const response = await apiRequest('POST', '/api/alerts', alertData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Alert created",
        description: "The alert has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      setShowAddModal(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create alert: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Update alert mutation
  const updateAlertMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Alert> }) => {
      const response = await apiRequest('PATCH', `/api/alerts/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Alert updated",
        description: "The alert has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update alert: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Filter alerts based on search and active status
  const filteredAlerts = alerts?.filter(
    alert => 
      (alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
       alert.alert_type.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (!showActiveOnly || alert.is_active)
  ) || [];

  // Toggle alert active status
  const handleToggleActive = (id: number, currentStatus: boolean) => {
    updateAlertMutation.mutate({ 
      id, 
      data: { is_active: !currentStatus } 
    });
  };

  // Form schema for creating alerts
  const alertFormSchema = insertAlertSchema.extend({
    expires_in_days: z.string().optional(),
  });

  // Alert form
  const form = useForm<z.infer<typeof alertFormSchema>>({
    resolver: zodResolver(alertFormSchema),
    defaultValues: {
      alert_type: undefined,
      message: "",
      level: "info",
      is_active: true,
    },
  });

  const onSubmit = (data: z.infer<typeof alertFormSchema>) => {
    // Calculate expiry date if provided
    let expiresAt: Date | undefined;
    if (data.expires_in_days) {
      const days = parseInt(data.expires_in_days);
      if (!isNaN(days)) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);
      }
    }
    
    // Handle the "none" value for blood_type
    let bloodType = data.blood_type;
    if (bloodType === "none") {
      bloodType = undefined;
    }
    
    // Submit alert without the custom field
    const { expires_in_days, blood_type, ...alertData } = data;
    
    createAlertMutation.mutate({
      ...alertData,
      blood_type: bloodType,
      expires_at: expiresAt,
    });
  };

  // Get color for alert level
  const getAlertLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-amber-100 text-amber-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  // Get icon for alert type
  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'critical_shortage': return 'warning';
      case 'expiring_soon': return 'schedule';
      case 'new_request': return 'local_hospital';
      case 'donation_needed': return 'favorite';
      default: return 'notifications';
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Alerts & Notifications</h1>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <span className="material-icons mr-1">add_alert</span>
          Create Alert
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Alert Management</CardTitle>
            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="active-only"
                  checked={showActiveOnly}
                  onCheckedChange={setShowActiveOnly}
                />
                <label 
                  htmlFor="active-only" 
                  className="text-sm font-medium cursor-pointer"
                >
                  Show active alerts only
                </label>
              </div>
              <div className="relative w-64">
                <Input
                  type="text"
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <span className="material-icons absolute left-3 top-2 text-gray-400">search</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alert Type</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.length > 0 ? (
                    filteredAlerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <span className={`material-icons mr-2 ${
                              alert.level === 'critical' ? 'text-red-600' : 
                              alert.level === 'warning' ? 'text-amber-600' : 'text-blue-600'
                            }`}>
                              {getAlertTypeIcon(alert.alert_type)}
                            </span>
                            <span className="capitalize">
                              {alert.alert_type.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAlertLevelColor(alert.level)}`}>
                            {alert.level.charAt(0).toUpperCase() + alert.level.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{alert.message}</TableCell>
                        <TableCell>{alert.blood_type || 'N/A'}</TableCell>
                        <TableCell>{formatDateString(alert.created_at)}</TableCell>
                        <TableCell>{alert.expires_at ? formatDateString(alert.expires_at) : 'Never'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            alert.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {alert.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleToggleActive(alert.id, alert.is_active)}
                            className={alert.is_active 
                              ? "text-red-600 border-red-200 hover:bg-red-50" 
                              : "text-green-600 border-green-200 hover:bg-green-50"
                            }
                          >
                            {alert.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                        No alerts found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Alert Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Alert</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="alert_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alert Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select alert type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {alertTypeEnum.options.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Alert message" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="blood_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Type (Optional)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {bloodTypeEnum.options.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alert Level</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select alert level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="expires_in_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expires In (Days)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Leave empty for no expiration" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <div className="text-sm text-gray-500">
                        Set whether this alert is active immediately
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createAlertMutation.isPending}
                >
                  {createAlertMutation.isPending ? "Creating..." : "Create Alert"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
