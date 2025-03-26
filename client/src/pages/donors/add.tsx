import React from "react";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DonorForm } from "@/components/forms/donor-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AddDonor() {
  const [_, navigate] = useLocation();
  
  const handleBackClick = () => {
    navigate("/donors");
  };
  
  const handleSuccess = () => {
    navigate("/donors");
  };
  
  return (
    <DashboardLayout title="Add New Donor">
      <div className="mb-6">
        <Button variant="outline" onClick={handleBackClick}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Donors
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>New Donor Registration</CardTitle>
          <CardDescription>
            Add a new blood donor to the system with their personal information and contact details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DonorForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
