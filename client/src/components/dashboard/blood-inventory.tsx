import React from "react";
import { useQuery } from "@tanstack/react-query";
import { BloodTypeCard } from "@/components/ui/blood-type-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { BLOOD_TYPES } from "@shared/schema";

interface BloodInventoryStats {
  [key: string]: {
    units: number;
    percentage: number;
  };
}

export function BloodInventory() {
  const [_, navigate] = useLocation();
  
  const { data: inventoryStats, isLoading } = useQuery<BloodInventoryStats>({
    queryKey: ['/api/inventory/stats'],
  });
  
  const handleViewFullInventory = () => {
    navigate("/inventory");
  };
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-700">Blood Inventory</h2>
        <Button 
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors duration-300"
          onClick={handleViewFullInventory}
        >
          View Full Inventory
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {isLoading ? (
              // Render skeletons while loading
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <Skeleton className="h-7 w-12 mx-auto mb-2" />
                  <Skeleton className="h-8 w-10 mx-auto mb-2" />
                  <Skeleton className="h-4 w-8 mx-auto mb-2" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))
            ) : (
              // Render actual blood type cards when data is available
              BLOOD_TYPES.map((type) => {
                const stats = inventoryStats?.[type] || { units: 0, percentage: 0 };
                return (
                  <BloodTypeCard
                    key={type}
                    bloodType={type}
                    units={stats.units}
                    percentage={stats.percentage}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
