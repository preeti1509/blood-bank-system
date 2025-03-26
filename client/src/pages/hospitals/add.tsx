import React from "react";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HospitalForm } from "@/components/forms/hospital-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AddHospital() {
  const [_, navigate] = useLocation();
  
  const handleBackClick = () => {
    navigate("/hospitals");
  };
  
  const handleSuccess = () => {
    navigate("/hospitals");
  };
  
  return (
    <DashboardLayout title="Add New Hospital">
      <div className="mb-6">
        <Button variant="outline" onClick={handleBackClick}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Hospitals
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>New Hospital Registration</CardTitle>
          <CardDescription>
            Add a new partner hospital to the blood bank network with contact information and address details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HospitalForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
