import React from "react";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RecipientForm } from "@/components/forms/recipient-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AddRecipient() {
  const [_, navigate] = useLocation();
  
  const handleBackClick = () => {
    navigate("/recipients");
  };
  
  const handleSuccess = () => {
    navigate("/recipients");
  };
  
  return (
    <DashboardLayout title="Add New Recipient">
      <div className="mb-6">
        <Button variant="outline" onClick={handleBackClick}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Recipients
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>New Recipient Registration</CardTitle>
          <CardDescription>
            Add a new blood recipient to the system with their personal information and contact details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecipientForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
