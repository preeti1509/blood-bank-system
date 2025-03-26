import React from "react";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionForm } from "@/components/forms/transaction-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AddTransaction() {
  const [_, navigate] = useLocation();
  
  const handleBackClick = () => {
    navigate("/transactions");
  };
  
  const handleSuccess = () => {
    navigate("/transactions");
  };
  
  return (
    <DashboardLayout title="Add New Transaction">
      <div className="mb-6">
        <Button variant="outline" onClick={handleBackClick}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Transactions
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>New Blood Transaction</CardTitle>
          <CardDescription>
            Record a new blood transaction - donation, distribution, or transfer between facilities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
