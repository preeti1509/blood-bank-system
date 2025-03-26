import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { BloodTypeAvailability } from "@/lib/types";
import { BLOOD_TYPES, calculateBloodLevelStatus, getBloodLevelStatusColor } from "@/lib/utils";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function BloodInventory() {
  const { data: bloodAvailability, isLoading } = useQuery<BloodTypeAvailability>({
    queryKey: ['/api/dashboard/blood-availability'],
  });
  
  if (isLoading) {
    return (
      <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="text-center">
              <div className="mx-auto w-20">
                <Skeleton className="h-[100px] w-full rounded" />
              </div>
              <div className="mt-2">
                <Skeleton className="h-6 w-8 mx-auto mb-1" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (!bloodAvailability) {
    return null;
  }
  
  return (
    <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-neutral-400">Blood Inventory Status</h3>
        <Link href="/inventory">
          <Button variant="link" className="text-secondary p-0 h-auto">
            View Full Inventory
            <span className="material-icons text-sm ml-1">arrow_forward</span>
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        {BLOOD_TYPES.map(type => {
          const units = bloodAvailability[type] || 0;
          const levelPercentage = Math.min(Math.max((units / 150) * 100, 5), 95);
          const status = calculateBloodLevelStatus(units);
          
          return (
            <div key={type} className="text-center">
              <div className="mx-auto w-20">
                <div className="blood-level-indicator border border-neutral-200 bg-neutral-100">
                  <div 
                    className={`blood-level ${
                      status === 'critical' ? 'bg-status-error/80' :
                      status === 'low' ? 'bg-status-warning/80' :
                      'bg-primary/80'
                    }`}
                    style={{ height: `${levelPercentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-2">
                <p className="font-medium text-lg text-neutral-400">{type}</p>
                <p className={`text-sm ${getBloodLevelStatusColor(status)}`}>{units} units</p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-status-success mr-2"></div>
          <span className="text-sm text-neutral-300">Sufficient</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-status-warning mr-2"></div>
          <span className="text-sm text-neutral-300">Low</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-status-error mr-2"></div>
          <span className="text-sm text-neutral-300">Critical</span>
        </div>
      </div>
    </div>
  );
}
