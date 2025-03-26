import React from "react";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, TrendingUp, FileText, Building } from "lucide-react";

interface InventoryStats {
  totalUnits: number;
  change: number;
}

interface DonationStats {
  weeklyDonations: number;
  change: number;
}

interface RequestStats {
  activeRequests: number;
  change: number;
}

interface HospitalStats {
  connectedHospitals: number;
  change: number;
}

interface DashboardStats {
  inventory: InventoryStats;
  donations: DonationStats;
  requests: RequestStats;
  hospitals: HospitalStats;
}

export function OverviewStats() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/stats/overview'],
    
    // Fallback to the following data if the API doesn't exist yet or returns an error
    initialData: {
      inventory: {
        totalUnits: 468,
        change: 5.3
      },
      donations: {
        weeklyDonations: 37,
        change: 12.4
      },
      requests: {
        activeRequests: 15,
        change: 3.2
      },
      hospitals: {
        connectedHospitals: 24,
        change: 0
      }
    }
  });

  if (isLoading) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-700 mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-5">
              <div className="flex justify-between">
                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-36 mt-3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium text-gray-700 mb-4">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Blood Units"
          value={stats.inventory.totalUnits}
          icon={Package}
          change={{
            value: stats.inventory.change,
            timeframe: "last month"
          }}
          bgColor="bg-primary-light bg-opacity-20"
          iconColor="text-primary"
        />
        
        <StatCard
          title="Donations This Week"
          value={stats.donations.weeklyDonations}
          icon={TrendingUp}
          change={{
            value: stats.donations.change,
            timeframe: "last week"
          }}
          bgColor="bg-success-light bg-opacity-20"
          iconColor="text-success"
        />
        
        <StatCard
          title="Active Requests"
          value={stats.requests.activeRequests}
          icon={FileText}
          change={{
            value: stats.requests.change,
            timeframe: "yesterday"
          }}
          bgColor="bg-secondary-light bg-opacity-20"
          iconColor="text-secondary"
        />
        
        <StatCard
          title="Hospitals Connected"
          value={stats.hospitals.connectedHospitals}
          icon={Building}
          change={{
            value: stats.hospitals.change,
            timeframe: "last month"
          }}
          bgColor="bg-info-light bg-opacity-20"
          iconColor="text-info"
        />
      </div>
    </div>
  );
}
