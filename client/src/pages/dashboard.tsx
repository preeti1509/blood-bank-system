import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import StatsCard from "@/components/dashboard/stats-card";
import AlertBanner from "@/components/dashboard/alert-banner";
import BloodTypeCard from "@/components/dashboard/blood-type-card";
import ActivityItem from "@/components/dashboard/activity-item";
import RequestRow from "@/components/dashboard/request-row";
import Pagination from "@/components/dashboard/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import AddInventoryModal from "@/components/inventory/add-inventory-modal";
import CreateRequestModal from "@/components/requests/create-request-modal";

import { Alert, BloodTypeSummary, RecentActivity, StatsSummary, BloodRequest } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddInventoryModalOpen, setIsAddInventoryModalOpen] = useState(false);
  const [isCreateRequestModalOpen, setIsCreateRequestModalOpen] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);

  // Fetch dashboard data
  const { data: stats } = useQuery<StatsSummary>({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: bloodSummary } = useQuery<BloodTypeSummary[]>({
    queryKey: ['/api/dashboard/blood-summary'],
  });

  const { data: activities } = useQuery<RecentActivity[]>({
    queryKey: ['/api/dashboard/activities'],
  });

  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ['/api/alerts?active=true'],
  });

  const { data: requests } = useQuery<(BloodRequest & { hospital?: { id: number; name: string; contact_person: string } | null })[]>({
    queryKey: ['/api/requests?status=pending'],
  });

  // Request approval/rejection mutations
  const approveRequestMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('PATCH', `/api/requests/${id}`, { status: 'approved' });
    },
    onSuccess: () => {
      toast({
        title: "Request approved",
        description: "The blood request has been approved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/activities'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to approve request: ${error}`,
        variant: "destructive"
      });
    }
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('PATCH', `/api/requests/${id}`, { status: 'rejected' });
    },
    onSuccess: () => {
      toast({
        title: "Request rejected",
        description: "The blood request has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/activities'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to reject request: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Alert management
  const dismissAlert = (alertId: number) => {
    setDismissedAlerts(prev => [...prev, alertId]);
  };

  const sendDonationRequests = async () => {
    toast({
      title: "Donation requests sent",
      description: "Notifications have been sent to eligible donors.",
    });
  };

  // Filter and paginate requests
  const itemsPerPage = 3;
  const filteredRequests = requests?.filter(request => 
    request.hospital?.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil((filteredRequests.length || 0) / itemsPerPage);

  // Filter active alerts that haven't been dismissed
  const activeAlerts = alerts?.filter(alert => 
    alert.is_active && !dismissedAlerts.includes(alert.id)
  ) || [];

  return (
    <>
      {/* Alert Section */}
      {activeAlerts.map(alert => (
        <AlertBanner
          key={alert.id}
          alert={alert}
          onDismiss={() => dismissAlert(alert.id)}
          onAction={sendDonationRequests}
          actionLabel="Send Requests"
        />
      ))}

      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Donations"
          value={stats?.totalDonations || 0}
          icon="water_drop"
          iconBg="bg-red-100"
          iconColor="text-red-600"
          trend={{ value: 8, label: "this month", isPositive: true }}
        />
        <StatsCard
          title="Hospitals Served"
          value={stats?.hospitalsServed || 0}
          icon="local_hospital"
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          trend={{ value: 3, label: "active", isPositive: true }}
        />
        <StatsCard
          title="Active Donors"
          value={stats?.activeDonors || 0}
          icon="people"
          iconBg="bg-green-100"
          iconColor="text-green-600"
          trend={{ value: 12, label: "registered", isPositive: true }}
        />
        <StatsCard
          title="Pending Requests"
          value={stats?.pendingRequests || 0}
          icon="pending_actions"
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          trend={{ value: 5, label: "to process", isPositive: false }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Blood Inventory */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Blood Inventory</h3>
            <Button 
              variant="link" 
              className="text-blue-600" 
              onClick={() => window.location.href = "/inventory"}
            >
              <span className="material-icons text-sm mr-1">edit</span>
              Manage
            </Button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {bloodSummary ? (
                bloodSummary.map(bloodType => (
                  <BloodTypeCard
                    key={bloodType.bloodType}
                    type={bloodType.bloodType}
                    units={bloodType.units}
                    percentage={bloodType.percentage}
                    expiringUnits={bloodType.expiringUnits}
                    expiringDays={bloodType.expiringDays}
                    isCritical={bloodType.isCritical}
                  />
                ))
              ) : (
                // Loading skeleton
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex flex-col animate-pulse">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-6 w-8 bg-gray-200 rounded"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-24 bg-gray-200 rounded"></div>
                    <div className="mt-2 h-4 w-full bg-gray-200 rounded"></div>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-6 flex justify-between items-center">
              <div className="flex space-x-2">
                <Button 
                  onClick={() => setIsAddInventoryModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <span className="material-icons mr-1">add</span>
                  Add Inventory
                </Button>
                <Button variant="outline">
                  <span className="material-icons mr-1">download</span>
                  Export
                </Button>
              </div>
              <Button 
                variant="link" 
                className="text-blue-600"
                onClick={() => window.location.href = "/inventory"}
              >
                View All
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
            <div className="relative">
              <Button variant="ghost" size="sm">
                <span className="material-icons mr-1">filter_list</span>
                Filter
              </Button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {activities ? (
              activities.length > 0 ? (
                activities.map(activity => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No recent activities
                </div>
              )
            ) : (
              // Loading skeleton
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="p-4 flex items-start animate-pulse">
                  <div className="rounded-full p-2 bg-gray-200 h-10 w-10"></div>
                  <div className="ml-3 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-gray-200">
            <Button 
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800" 
              variant="secondary"
              onClick={() => window.location.href = "/transactions"}
            >
              View All Activities
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <Card className="mt-6">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Pending Requests</h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search requests..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="material-icons absolute left-3 top-2 text-gray-400">search</span>
            </div>
            <Button 
              onClick={() => setIsCreateRequestModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <span className="material-icons mr-1">add</span>
              New Request
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Hospital
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Blood Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Priority
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Requested
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedRequests && paginatedRequests.length > 0 ? (
                paginatedRequests.map(request => (
                  <RequestRow
                    key={request.id}
                    request={request}
                    onApprove={(id) => approveRequestMutation.mutate(id)}
                    onReject={(id) => rejectRequestMutation.mutate(id)}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    {requests ? "No pending requests found" : "Loading requests..."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredRequests.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, filteredRequests.length)}
              </span>{" "}
              of <span className="font-medium">{filteredRequests.length}</span> results
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* Modals */}
      <AddInventoryModal
        isOpen={isAddInventoryModalOpen}
        onClose={() => setIsAddInventoryModalOpen(false)}
      />
      <CreateRequestModal
        isOpen={isCreateRequestModalOpen}
        onClose={() => setIsCreateRequestModalOpen(false)}
      />
    </>
  );
}
