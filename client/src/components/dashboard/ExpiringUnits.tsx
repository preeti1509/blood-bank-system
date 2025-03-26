import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { BloodInventory } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { formatDate, getDaysUntil } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function ExpiringUnits() {
  const { toast } = useToast();
  
  const { data: expiringUnits, isLoading } = useQuery<BloodInventory[]>({
    queryKey: ['/api/inventory/expiring/7'],
  });
  
  const handlePrioritize = async (id: number) => {
    try {
      // In a real app, this would mark the blood unit for priority use
      await apiRequest('PATCH', `/api/inventory/${id}`, { status: 'prioritized' });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/expiring/7'] });
      toast({
        title: "Unit Prioritized",
        description: "This blood unit has been marked for priority use.",
      });
    } catch (error) {
      console.error("Failed to prioritize unit:", error);
      toast({
        title: "Error",
        description: "Failed to prioritize the blood unit. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="overflow-x-auto">
          <Skeleton className="h-56 w-full" />
        </div>
      </div>
    );
  }
  
  if (!expiringUnits) {
    return null;
  }
  
  const getExpiryBadge = (expiryDate: string) => {
    const daysUntil = getDaysUntil(expiryDate);
    
    if (daysUntil <= 3) {
      return (
        <Badge className="bg-status-error/10 text-status-error hover:bg-status-error/20 border-none">
          {daysUntil} day{daysUntil !== 1 ? 's' : ''}
        </Badge>
      );
    } else if (daysUntil <= 7) {
      return (
        <Badge className="bg-status-warning/10 text-status-warning hover:bg-status-warning/20 border-none">
          {daysUntil} days
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-status-info/10 text-status-info hover:bg-status-info/20 border-none">
          {daysUntil} days
        </Badge>
      );
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-neutral-400">Expiring Blood Units</h3>
        <Link href="/inventory">
          <Button variant="link" className="text-secondary p-0 h-auto">
            View All
            <span className="material-icons text-sm ml-1">arrow_forward</span>
          </Button>
        </Link>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                Blood ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                Donation Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                Expires In
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {expiringUnits.length > 0 ? (
              expiringUnits.slice(0, 4).map(unit => (
                <tr key={unit.id}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-neutral-400">{unit.bloodId}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none">
                      {unit.bloodType}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-neutral-400">{formatDate(unit.donationDate)}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getExpiryBadge(unit.expiryDate)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-400">
                    <Button 
                      variant="link" 
                      size="sm"
                      className="text-secondary hover:text-secondary/80 h-auto p-0"
                      onClick={() => handlePrioritize(unit.id)}
                    >
                      Prioritize
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-sm text-neutral-300 text-center">
                  No expiring units in the next 7 days
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
