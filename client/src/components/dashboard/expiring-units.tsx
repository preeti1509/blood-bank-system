import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { formatExpirationDate } from "@/lib/utils";
import { BloodInventory } from "@shared/schema";

export function ExpiringUnits() {
  const [_, navigate] = useLocation();
  
  const { data: expiringItems, isLoading } = useQuery<BloodInventory[]>({
    queryKey: ['/api/inventory/expiring'],
  });
  
  const handleViewAll = () => {
    navigate("/inventory?filter=expiring");
  };
  
  const renderExpirationStatus = (expirationDate: string) => {
    const { daysLeft, status } = formatExpirationDate(expirationDate);
    
    let bgColor = 'bg-warning';
    if (status === 'critical') bgColor = 'bg-error';
    
    return (
      <span className={`text-sm ${bgColor} text-white px-2 py-1 rounded-md`}>
        {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
      </span>
    );
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-700">Expiring Soon</h2>
        <Button 
          variant="link" 
          className="text-primary hover:text-primary-dark"
          onClick={handleViewAll}
        >
          View All
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4">
          <div className="space-y-4">
            {isLoading ? (
              // Show skeletons while loading
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="border-l-4 border-gray-300 pl-4 py-2">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-7 w-10" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-5 w-3/4 mt-1" />
                  <Skeleton className="h-4 w-1/2 mt-1" />
                </div>
              ))
            ) : expiringItems && expiringItems.length > 0 ? (
              // Show expiring items
              expiringItems.slice(0, 4).map((item) => {
                const { daysLeft, status } = formatExpirationDate(item.expirationDate);
                const borderColor = status === 'critical' ? 'border-error' : 'border-warning';
                
                return (
                  <div key={item.id} className={`border-l-4 ${borderColor} pl-4 py-2`}>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-800">{item.bloodType}</span>
                      {renderExpirationStatus(item.expirationDate)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span>{item.units} units from {item.source}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      <span>Donation ID: {item.transactionId}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              // No expiring items
              <div className="text-center py-4 text-gray-500">
                No blood units expiring soon.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
