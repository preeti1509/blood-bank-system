import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DonorForm } from "@/components/forms/donor-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import { Donor, Transaction } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Edit, ArrowLeft, UserX, UserCheck, History } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function DonorDetails() {
  const [_, navigate] = useLocation();
  const [match, params] = useRoute("/donors/:id");
  const donorId = match ? parseInt(params.id) : -1;
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  
  // Fetch donor data
  const { data: donor, isLoading, isError } = useQuery<Donor>({
    queryKey: [`/api/donors/${donorId}`],
    enabled: donorId > 0,
  });
  
  // Fetch donor's donation history
  const { data: donorTransactions, isLoading: isTransactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
    select: (transactions) => 
      transactions.filter(tx => tx.donorId === donorId && tx.transactionType === "donation"),
    enabled: donorId > 0,
  });
  
  // Toggle donor active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async (active: boolean) => {
      const response = await apiRequest(
        "PATCH",
        `/api/donors/${donorId}`,
        { active }
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Donor status updated",
        description: `The donor has been ${donor?.active ? "deactivated" : "activated"}.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/donors/${donorId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/donors'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update donor status: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  if (isError) {
    return (
      <DashboardLayout title="Donor Not Found">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Donor Not Found</h2>
          <p className="text-gray-600 mb-6">The donor you are looking for does not exist or has been removed.</p>
          <Button onClick={() => navigate("/donors")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Donors
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
  const handleToggleActive = () => {
    if (donor) {
      toggleActiveMutation.mutate(!donor.active);
    }
  };
  
  const handleBackClick = () => {
    navigate("/donors");
  };
  
  if (isEditing) {
    return (
      <DashboardLayout title="Edit Donor">
        <Card>
          <CardHeader>
            <CardTitle>Edit Donor Information</CardTitle>
            <CardDescription>Update the donor's personal and contact information.</CardDescription>
          </CardHeader>
          <CardContent>
            <DonorForm 
              defaultValues={donor} 
              isEdit={true} 
              donorId={donorId}
              onSuccess={() => {
                setIsEditing(false);
                queryClient.invalidateQueries({ queryKey: [`/api/donors/${donorId}`] });
              }} 
            />
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout title="Donor Details">
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
      ) : donor ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Button variant="outline" onClick={handleBackClick}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Donors
            </Button>
            <div className="flex space-x-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className={donor.active ? "text-red-500" : "text-green-500"}>
                    {donor.active ? (
                      <>
                        <UserX className="mr-2 h-4 w-4" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Activate
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {donor.active ? "Deactivate Donor" : "Activate Donor"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {donor.active 
                        ? "This will mark the donor as inactive. They won't appear in active donor lists." 
                        : "This will reactivate the donor, making them available for blood donations."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleToggleActive}>
                      {donor.active ? "Deactivate" : "Activate"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Donor
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="details">Donor Details</TabsTrigger>
              <TabsTrigger value="history">Donation History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center">
                        {donor.name}
                        <Badge variant={donor.active ? "default" : "secondary"} className="ml-2">
                          {donor.active ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Donor ID: {donor.id} | Registered: {donor.lastDonationDate ? `Last donated on ${formatDate(donor.lastDonationDate)}` : "Never donated"}
                      </CardDescription>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{donor.bloodType}</div>
                      <div className="text-sm text-gray-500">Blood Type</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm font-medium text-gray-500">Gender</div>
                          <div className="text-base">{donor.gender}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500">Date of Birth</div>
                          <div className="text-base">{formatDate(donor.dateOfBirth)}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500">Medical History</div>
                          <div className="text-base">{donor.medicalHistory || "No medical history recorded"}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm font-medium text-gray-500">Phone</div>
                          <div className="text-base">{donor.phone}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500">Email</div>
                          <div className="text-base">{donor.email || "No email provided"}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500">Address</div>
                          <div className="text-base">
                            {donor.address}, {donor.city}, {donor.state} {donor.zipCode}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">Donation Eligibility</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm font-medium text-gray-500">Last Donation Date</div>
                        <div className="text-base">
                          {donor.lastDonationDate ? formatDate(donor.lastDonationDate) : "Never donated"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500">Eligible to Donate Since</div>
                        <div className="text-base">
                          {donor.eligibleToDonateSince ? formatDate(donor.eligibleToDonateSince) : "Not specified"}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Donation History</CardTitle>
                  <CardDescription>Record of all blood donations made by this donor</CardDescription>
                </CardHeader>
                <CardContent>
                  {isTransactionsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : donorTransactions && donorTransactions.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Transaction ID</TableHead>
                          <TableHead>Blood Type</TableHead>
                          <TableHead>Units</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {donorTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                            <TableCell>{transaction.transactionId}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">
                                {transaction.bloodType}
                              </Badge>
                            </TableCell>
                            <TableCell>{transaction.units}</TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={
                                  transaction.status === "completed" 
                                    ? "bg-green-50 text-green-800 border-green-200" 
                                    : transaction.status === "pending"
                                    ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                                    : "bg-red-50 text-red-800 border-red-200"
                                }
                              >
                                {transaction.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 flex flex-col items-center">
                      <History className="h-12 w-12 text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900">No donation history</h3>
                      <p className="text-gray-500 mt-1">This donor hasn't made any donations yet.</p>
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
