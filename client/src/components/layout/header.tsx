import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import EmergencyRequestModal from "@/components/modals/emergency-request-modal";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "@shared/schema";

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  
  // Fetch alerts for notifications
  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ['/api/alerts?active=true'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  const activeAlerts = alerts?.filter(alert => alert.is_active) || [];
  const criticalAlerts = activeAlerts.filter(alert => alert.level === 'critical');

  return (
    <>
      <header className="bg-white shadow-sm z-20">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button 
                type="button" 
                onClick={onMenuClick}
                className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
              >
                <span className="material-icons">menu</span>
              </button>
              <h2 className="text-lg font-medium text-gray-900 ml-2 md:ml-0">{title}</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Emergency Button */}
              <Button 
                variant="destructive" 
                size="sm" 
                className="flex items-center"
                onClick={() => setIsEmergencyModalOpen(true)}
              >
                <span className="material-icons mr-1">emergency</span>
                Emergency
              </Button>
              
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {criticalAlerts.length > 0 && (
                      <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">
                        {criticalAlerts.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {activeAlerts.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No active notifications
                    </div>
                  ) : (
                    activeAlerts.map(alert => (
                      <DropdownMenuItem key={alert.id} className="p-3 cursor-pointer">
                        <div className="flex items-start">
                          <div className={`flex-shrink-0 rounded-full p-2 ${
                            alert.level === 'critical' ? 'bg-red-100' : 
                            alert.level === 'warning' ? 'bg-amber-100' : 'bg-blue-100'
                          }`}>
                            <span className={`material-icons text-sm ${
                              alert.level === 'critical' ? 'text-red-600' : 
                              alert.level === 'warning' ? 'text-amber-600' : 'text-blue-600'
                            }`}>
                              {alert.alert_type === 'critical_shortage' ? 'warning' :
                               alert.alert_type === 'expiring_soon' ? 'schedule' :
                               alert.alert_type === 'new_request' ? 'local_hospital' : 
                               'notifications'}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {alert.alert_type === 'critical_shortage' ? 'Critical Shortage' :
                               alert.alert_type === 'expiring_soon' ? 'Expiring Soon' :
                               alert.alert_type === 'new_request' ? 'New Request' : 
                               alert.alert_type === 'donation_needed' ? 'Donation Needed' : 
                               'Alert'}
                            </p>
                            <p className="mt-1 text-xs text-gray-600">{alert.message}</p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="justify-center cursor-pointer">
                    <Button variant="ghost" size="sm" asChild>
                      <span className="w-full text-center">View all</span>
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* User Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      AB
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Admin User</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Emergency Request Modal */}
      <EmergencyRequestModal 
        isOpen={isEmergencyModalOpen} 
        onClose={() => setIsEmergencyModalOpen(false)} 
      />
    </>
  );
}
