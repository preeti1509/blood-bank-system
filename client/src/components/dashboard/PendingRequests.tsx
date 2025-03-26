import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { BloodRequest } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function PendingRequests() {
  const { toast } = useToast();
  const [processingRequests, setProcessingRequests] = useState<number[]>([]);
  
  const { data: requests, isLoading } = useQuery<BloodRequest[]>({
    queryKey: ['/api/requests/pending'],
  });
  
  const { data: hospitals } = useQuery<any[]>({
    queryKey: ['/api/hospitals'],
    enabled: !isLoading && !!requests,
  });
  
  const getHospitalName = (hospitalId: number) => {
    const hospital = hospitals?.find(h => h.id === hospitalId);
    return hospital ? hospital.name : "Unknown Hospital";
  };
  
  const handleApprove = async (id: number) => {
    try {
      setProcessingRequests(prev => [...prev, id]);
      await apiRequest('PATCH', `/api/requests/${id}`, { status: 'approved' });
      queryClient.invalidateQueries({ queryKey: ['/api/requests/pending'] });
      toast({
        title: "Request Approved",
        description: "The blood request has been approved successfully.",
      });
    } catch (error) {
      console.error("Failed to approve request:", error);
      toast({
        title: "Error",
        description: "Failed to approve the request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingRequests(prev => prev.filter(reqId => reqId !== id));
    }
  };
  
  const handleReject = async (id: number) => {
    try {
      setProcessingRequests(prev => [...prev, id]);
      await apiRequest('PATCH', `/api/requests/${id}`, { status: 'rejected' });
      queryClient.invalidateQueries({ queryKey: ['/api/requests/pending'] });
      toast({
        title: "Request Rejected",
        description: "The blood request has been rejected.",
      });
    } catch (error) {
      console.error("Failed to reject request:", error);
      toast({
        title: "Error",
        description: "Failed to reject the request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingRequests(prev => prev.filter(reqId => reqId !== id));
    }
  };
  
  if (isLoading) {
    return (
      <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-48" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Skeleton className="h-56 w-full" />
        </div>
      </div>
    );
  }
  
  if (!requests) {
    return null;
  }
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "emergency":
        return (
          <Badge className="bg-status-error/10 text-status-error hover:bg-status-error/20 border-none">
            Emergency
          </Badge>
        );
      case "urgent":
        return (
          <Badge className="bg-status-warning/10 text-status-warning hover:bg-status-warning/20 border-none">
            Urgent
          </Badge>
        );
      default:
        return (
          <Badge className="bg-status-info/10 text-status-info hover:bg-status-info/20 border-none">
            Standard
          </Badge>
        );
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-status-warning/10 text-status-warning hover:bg-status-warning/20 border-none">
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-status-success/10 text-status-success hover:bg-status-success/20 border-none">
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-status-error/10 text-status-error hover:bg-status-error/20 border-none">
            Rejected
          </Badge>
        );
      case "fulfilled":
        return (
          <Badge className="bg-status-info/10 text-status-info hover:bg-status-info/20 border-none">
            Fulfilled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };
  
  return (
    <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-neutral-400">Pending Blood Requests</h3>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="text-sm">
            Filter <span className="material-icons text-sm ml-1">filter_list</span>
          </Button>
          <Link href="/inventory/requests">
            <Button variant="link" className="text-secondary p-0 h-auto">
              View All
              <span className="material-icons text-sm ml-1">arrow_forward</span>
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                Hospital
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                Blood Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                Units
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {requests.length > 0 ? (
              requests.slice(0, 4).map(request => (
                <tr key={request.id}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-neutral-400">
                        {getHospitalName(request.hospitalId)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-neutral-400">{request.bloodType}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-neutral-400">{request.units}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getPriorityBadge(request.priority)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-400">
                    <Button 
                      variant="link" 
                      size="sm"
                      className="text-secondary hover:text-secondary/80 mr-3 h-auto p-0"
                      onClick={() => handleApprove(request.id)}
                      disabled={processingRequests.includes(request.id)}
                    >
                      Approve
                    </Button>
                    <Button 
                      variant="link" 
                      size="sm"
                      className="text-status-error hover:text-status-error/80 h-auto p-0"
                      onClick={() => handleReject(request.id)}
                      disabled={processingRequests.includes(request.id)}
                    >
                      Reject
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-sm text-neutral-300 text-center">
                  No pending requests available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
