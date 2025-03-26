import { useQuery } from "@tanstack/react-query";
import { DashboardMetrics } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function KeyMetrics() {
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ['/api/dashboard/metrics'],
  });
  
  if (isLoading) {
    return (
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="h-4 w-32 mt-2" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (!metrics) {
    return null;
  }
  
  const metricsData = [
    {
      title: "Total Donations",
      value: metrics.totalDonations,
      trend: { value: "12%", direction: "up", label: "this week" },
      icon: "volunteer_activism",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Blood Units Available",
      value: metrics.totalBloodUnits.toLocaleString(),
      trend: { value: "", direction: "neutral", label: "Same as last week" },
      icon: "water_drop",
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary",
    },
    {
      title: "Pending Requests",
      value: metrics.pendingRequests,
      trend: { value: "8%", direction: "up", label: "this week" },
      icon: "pending_actions",
      iconBg: "bg-status-warning/10",
      iconColor: "text-status-warning",
    },
    {
      title: "Registered Donors",
      value: metrics.registeredDonors.toLocaleString(),
      trend: { value: "3%", direction: "up", label: "this week" },
      icon: "people",
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
    },
  ];
  
  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {metricsData.map((metric, index) => (
        <Card key={index} className="dashboard-card shadow-sm transition-all hover:translate-y-[-3px] hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-300">{metric.title}</p>
                <p className="text-2xl font-medium text-neutral-400">{metric.value}</p>
                <div className={`flex items-center mt-1 text-sm ${
                  metric.trend.direction === "up" ? "text-status-success" : 
                  metric.trend.direction === "down" ? "text-status-error" : 
                  "text-neutral-300"
                }`}>
                  {metric.trend.direction === "up" && <span className="material-icons text-sm">arrow_upward</span>}
                  {metric.trend.direction === "down" && <span className="material-icons text-sm">arrow_downward</span>}
                  {metric.trend.direction === "neutral" && <span className="material-icons text-sm">remove</span>}
                  <span>{metric.trend.value} {metric.trend.label}</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-full ${metric.iconBg} flex items-center justify-center`}>
                <span className={`material-icons ${metric.iconColor}`}>{metric.icon}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
