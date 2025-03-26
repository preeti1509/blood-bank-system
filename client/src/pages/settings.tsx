import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [autoExpireAlerts, setAutoExpireAlerts] = useState(true);
  const [lowInventoryThreshold, setLowInventoryThreshold] = useState("10");
  
  const handleSaveGeneralSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your general settings have been updated successfully.",
    });
  };
  
  const handleSaveNotificationSettings = () => {
    toast({
      title: "Notification settings saved",
      description: "Your notification preferences have been updated successfully.",
    });
  };
  
  const handleSaveInventorySettings = () => {
    toast({
      title: "Inventory settings saved",
      description: "Your inventory settings have been updated successfully.",
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage your basic system settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="blood-bank-name">Blood Bank Name</Label>
                <Input id="blood-bank-name" defaultValue="Central Blood Bank" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="blood-bank-address">Address</Label>
                <Input id="blood-bank-address" defaultValue="123 Main Street, Springfield" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Contact Phone</Label>
                  <Input id="contact-phone" defaultValue="555-1234" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input id="contact-email" defaultValue="info@centralbloodbank.org" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" defaultValue="https://www.centralbloodbank.org" />
              </div>
              
              <Button onClick={handleSaveGeneralSettings}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                  <span>Email Notifications</span>
                  <span className="font-normal text-sm text-gray-500">Receive notifications via email</span>
                </Label>
                <Switch 
                  id="email-notifications" 
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="sms-notifications" className="flex flex-col space-y-1">
                  <span>SMS Notifications</span>
                  <span className="font-normal text-sm text-gray-500">Receive notifications via SMS</span>
                </Label>
                <Switch 
                  id="sms-notifications" 
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emergency-contacts">Emergency Contacts (comma separated)</Label>
                <Input id="emergency-contacts" defaultValue="555-6789, 555-4321" />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="auto-expire" className="flex flex-col space-y-1">
                  <span>Auto-expire Alerts</span>
                  <span className="font-normal text-sm text-gray-500">Automatically expire alerts after 7 days</span>
                </Label>
                <Switch 
                  id="auto-expire" 
                  checked={autoExpireAlerts}
                  onCheckedChange={setAutoExpireAlerts}
                />
              </div>
              
              <Button onClick={handleSaveNotificationSettings}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Inventory Settings */}
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Settings</CardTitle>
              <CardDescription>
                Configure inventory management preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="low-inventory">Low Inventory Threshold (units)</Label>
                <Input 
                  id="low-inventory" 
                  type="number" 
                  value={lowInventoryThreshold}
                  onChange={(e) => setLowInventoryThreshold(e.target.value)}
                />
                <p className="text-sm text-gray-500">Alerts will be triggered when blood units fall below this number</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expiration-warning">Expiration Warning (days)</Label>
                <Input id="expiration-warning" type="number" defaultValue="7" />
                <p className="text-sm text-gray-500">Days before expiration to trigger warnings</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="default-expiry">Default Expiry Period (days)</Label>
                <Input id="default-expiry" type="number" defaultValue="42" />
                <p className="text-sm text-gray-500">Default expiration period for blood units</p>
              </div>
              
              <Button onClick={handleSaveInventorySettings}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* User Management */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <span className="material-icons text-6xl text-gray-300">people</span>
                <h3 className="mt-4 text-lg font-medium text-gray-900">User Management</h3>
                <p className="mt-2 text-gray-500">
                  This feature is available only for administrator accounts.
                </p>
                <Button className="mt-4">Contact Administrator</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
