import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { HospitalForm } from "@/components/forms/hospital-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Hospital, Transaction, Request } from "@shared/schema";
import { Edit, ArrowLeft, Building, BuildingX, Phone, Mail, MapPin, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatDateTime } from "@/lib/utils";
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

export default function HospitalDetails() {
  const [_, navigate] = useLocation();
  const [match, params] = useRoute("/hospitals/:id");
  const hospitalId = match ? parseInt(params.id) : -1;
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  
  // Fetch hospital data
  const { data: hospital, isLoading, isError } = useQuery<Hospital>({
    queryKey: [`/api/hospitals/${hospitalId}`],
    enabled: hospitalId > 0,
  });
  
  // Fetch hospital-related transactions
  const { data: transactions, isLoading: isTransactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
    select: (transactions) => 
      transactions.filter(tx => 
        tx.sourceHospitalId === hospitalId || tx.destinationHospitalId === hospitalId
      ),
    enabled: hospitalId > 0,
  });
  
  // Fetch hospital-related requests
  const { data: requests, isLoading: isRequestsLoading } = useQuery<Request[]>({
    queryKey: ['/api/requests'],
    select: (requests) => 
      requests.filter(req => req.hospitalId === hospitalId),
    enabled: hospitalId > 0,
  });
  
  // Toggle hospital active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async (active: boolean) => {
      const response = await apiRequest(
        "PATCH",
        `/api/hospitals/${hospitalId}`,
        { active }
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Hospital status updated",
        description: `The hospital has been ${hospital?.active ? "deactivated" : "activated"}.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/hospitals/${hospitalId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/hospitals'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update hospital status: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  if (isError) {
    return (
      <DashboardLayout title="Hospital Not Found">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Hospital Not Found</h2>
          <p className="text-gray-600 mb-6">The hospital you are looking for does not exist or has been removed.</p>
          <Button onClick={() => navigate("/hospitals")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Hospitals
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
  const handleToggleActive = () => {
    if (hospital) {
      toggleActiveMutation.mutate(!hospital.active);
    }
  };
  
  const handleBackClick = () => {
    navigate("/hospitals");
  };
  
  if (isEditing) {
    return (
      <DashboardLayout title="Edit Hospital">
        <Card>
          <CardHeader>
            <CardTitle>Edit Hospital Information</CardTitle>
            <CardDescription>Update the hospital's details and contact information.</CardDescription>
          </CardHeader>
          <CardContent>
            <HospitalForm 
              defaultValues={hospital} 
              isEdit={true} 
              hospitalId={hospitalId}
              onSuccess={() => {
                setIsEditing(false);
                queryClient.invalidateQueries({ queryKey: [`/api/hospitals/${hospitalId}`] });
              }} 
            />
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout title="Hospital Details">
      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : hospital ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Button variant="outline" onClick={handleBackClick}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Hospitals
            </Button>
            <div className="flex space-x-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className={hospital.active ? "text-red-500" : "text-green-500"}>
                    {hospital.active ? (
                      <>
                        <BuildingX className="mr-2 h-4 w-4" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Building className="mr-2 h-4 w-4" />
                        Activate
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {hospital.active ? "Deactivate Hospital" : "Activate Hospital"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {hospital.active 
                        ? "This will mark the hospital as inactive. You won't be able to process blood requests or transfers with this hospital." 
                        : "This will reactivate the hospital, allowing blood requests and transfers."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleToggleActive}>
                      {hospital.active ? "Deactivate" : "Activate"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Hospital
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="details">Hospital Details</TabsTrigger>
              <TabsTrigger value="requests">Blood Requests</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center">
                        {hospital.name}
                        <Badge variant={hospital.active ? "default" : "secondary"} className="ml-2">
                          {hospital.active ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Hospital ID: {hospital.id}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Location Information</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm font-medium text-gray-500">Address</div>
                          <div className="text-base flex items-start mt-1">
                            <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                            <div>
                              {hospital.address}<br />
                              {hospital.city}, {hospital.state} {hospital.zipCode}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm font-medium text-gray-500">Contact Person</div>
                          <div className="text-base">{hospital.contactName}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500">Phone</div>
                          <div className="text-base flex items-center">
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            {hospital.contactPhone}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500">Email</div>
                          <div className="text-base flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            {hospital.contactEmail}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="requests">
              <Card>
                <CardHeader>
                  <CardTitle>Blood Requests</CardTitle>
                  <CardDescription>
                    All blood requests made by this hospital
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isRequestsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : requests && requests.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Request ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Blood Type</TableHead>
                            <TableHead>Units</TableHead>
                            <TableHead>Urgency</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Contact</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {requests.map((request) => (
                            <TableRow key={request.id}>
                              <TableCell className="font-mono text-xs">
                                {request.requestId}
                              </TableCell>
                              <TableCell>{formatDateTime(request.requestDate)}</TableCell>
                              <TableCell>
                                <Badge className="bg-red-100 text-red-800 border-none">
                                  {request.bloodType}
                                </Badge>
                              </TableCell>
                              <TableCell>{request.units}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={
                                    request.urgency === 'critical' 
                                      ? 'bg-red-100 text-red-800 border-red-200' 
                                      : request.urgency === 'urgent'
                                      ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                      : 'bg-blue-100 text-blue-800 border-blue-200'
                                  }
                                >
                                  {request.urgency}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={
                                    request.status === 'fulfilled' 
                                      ? 'bg-green-100 text-green-800 border-green-200' 
                                      : request.status === 'approved'
                                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                                      : request.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                      : 'bg-red-100 text-red-800 border-red-200'
                                  }
                                >
                                  {request.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{request.contactName}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 flex flex-col items-center">
                      <FileText className="h-12 w-12 text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900">No blood requests</h3>
                      <p className="text-gray-500 mt-1">This hospital hasn't made any blood requests yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle>Blood Transactions</CardTitle>
                  <CardDescription>
                    History of blood received from or sent to this hospital
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isTransactionsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : transactions && transactions.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Transaction ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Blood Type</TableHead>
                            <TableHead>Units</TableHead>
                            <TableHead>Direction</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions.map((transaction) => {
                            const isSource = transaction.sourceHospitalId === hospitalId;
                            const direction = isSource ? "Outgoing" : "Incoming";
                            
                            return (
                              <TableRow key={transaction.id}>
                                <TableCell className="font-mono text-xs">
                                  {transaction.transactionId}
                                </TableCell>
                                <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                                <TableCell>{transaction.transactionType}</TableCell>
                                <TableCell>
                                  <Badge className="bg-red-100 text-red-800 border-none">
                                    {transaction.bloodType}
                                  </Badge>
                                </TableCell>
                                <TableCell>{transaction.units}</TableCell>
                                <TableCell>
                                  <Badge 
                                    variant="outline" 
                                    className={isSource 
                                      ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
                                      : 'bg-green-100 text-green-800 border-green-200'
                                    }
                                  >
                                    {direction}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant="outline" 
                                    className={
                                      transaction.status === 'completed' 
                                        ? 'bg-green-100 text-green-800 border-green-200' 
                                        : transaction.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                        : 'bg-red-100 text-red-800 border-red-200'
                                    }
                                  >
                                    {transaction.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 flex flex-col items-center">
                      <FileText className="h-12 w-12 text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900">No transactions</h3>
                      <p className="text-gray-500 mt-1">This hospital doesn't have any blood transactions yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
