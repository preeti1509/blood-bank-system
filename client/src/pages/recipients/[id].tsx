import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RecipientForm } from "@/components/forms/recipient-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import { Recipient, Transaction } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Edit, ArrowLeft, UserX, UserCheck, Droplet } from "lucide-react";
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

export default function RecipientDetails() {
  const [_, navigate] = useLocation();
  const [match, params] = useRoute("/recipients/:id");
  const recipientId = match ? parseInt(params.id) : -1;
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  
  // Fetch recipient data
  const { data: recipient, isLoading, isError } = useQuery<Recipient>({
    queryKey: [`/api/recipients/${recipientId}`],
    enabled: recipientId > 0,
  });
  
  // Fetch recipient's transfusion history
  const { data: recipientTransactions, isLoading: isTransactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
    select: (transactions) => 
      transactions.filter(tx => tx.recipientId === recipientId && tx.transactionType === "distribution"),
    enabled: recipientId > 0,
  });
  
  // Toggle recipient active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async (active: boolean) => {
      const response = await apiRequest(
        "PATCH",
        `/api/recipients/${recipientId}`,
        { active }
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Recipient status updated",
        description: `The recipient has been ${recipient?.active ? "deactivated" : "activated"}.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/recipients/${recipientId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/recipients'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update recipient status: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  if (isError) {
    return (
      <DashboardLayout title="Recipient Not Found">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recipient Not Found</h2>
          <p className="text-gray-600 mb-6">The recipient you are looking for does not exist or has been removed.</p>
          <Button onClick={() => navigate("/recipients")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recipients
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
  const handleToggleActive = () => {
    if (recipient) {
      toggleActiveMutation.mutate(!recipient.active);
    }
  };
  
  const handleBackClick = () => {
    navigate("/recipients");
  };
  
  if (isEditing) {
    return (
      <DashboardLayout title="Edit Recipient">
        <Card>
          <CardHeader>
            <CardTitle>Edit Recipient Information</CardTitle>
            <CardDescription>Update the recipient's personal and contact information.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecipientForm 
              defaultValues={recipient} 
              isEdit={true} 
              recipientId={recipientId}
              onSuccess={() => {
                setIsEditing(false);
                queryClient.invalidateQueries({ queryKey: [`/api/recipients/${recipientId}`] });
              }} 
            />
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout title="Recipient Details">
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
      ) : recipient ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Button variant="outline" onClick={handleBackClick}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Recipients
            </Button>
            <div className="flex space-x-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className={recipient.active ? "text-red-500" : "text-green-500"}>
                    {recipient.active ? (
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
                      {recipient.active ? "Deactivate Recipient" : "Activate Recipient"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {recipient.active 
                        ? "This will mark the recipient as inactive. They won't appear in active recipient lists." 
                        : "This will reactivate the recipient, making them available for blood transfusions."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleToggleActive}>
                      {recipient.active ? "Deactivate" : "Activate"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Recipient
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="details">Recipient Details</TabsTrigger>
              <TabsTrigger value="history">Transfusion History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center">
                        {recipient.name}
                        <Badge variant={recipient.active ? "default" : "secondary"} className="ml-2">
                          {recipient.active ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Recipient ID: {recipient.id} | Associated Hospital: {recipient.hospitalId ? `Hospital #${recipient.hospitalId}` : "None"}
                      </CardDescription>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{recipient.bloodType}</div>
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
                          <div className="text-base">{recipient.gender}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500">Date of Birth</div>
                          <div className="text-base">{formatDate(recipient.dateOfBirth)}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500">Medical History</div>
                          <div className="text-base">{recipient.medicalHistory || "No medical history recorded"}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm font-medium text-gray-500">Phone</div>
                          <div className="text-base">{recipient.phone}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500">Email</div>
                          <div className="text-base">{recipient.email || "No email provided"}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500">Address</div>
                          <div className="text-base">
                            {recipient.address}, {recipient.city}, {recipient.state} {recipient.zipCode}
                          </div>
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
                  <CardTitle>Transfusion History</CardTitle>
                  <CardDescription>Record of all blood transfusions received by this recipient</CardDescription>
                </CardHeader>
                <CardContent>
                  {isTransactionsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : recipientTransactions && recipientTransactions.length > 0 ? (
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
                        {recipientTransactions.map((transaction) => (
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
                      <Droplet className="h-12 w-12 text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900">No transfusion history</h3>
                      <p className="text-gray-500 mt-1">This recipient hasn't received any blood transfusions yet.</p>
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
