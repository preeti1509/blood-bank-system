import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconBg: string;
  iconColor: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
}

export default function StatsCard({
  title,
  value,
  icon,
  iconBg,
  iconColor,
  trend
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center">
        <div className={cn("flex-shrink-0 rounded-full p-3", iconBg)}>
          <span className={cn("material-icons", iconColor)}>{icon}</span>
        </div>
        <div className="ml-5 w-full">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-600 text-sm font-medium truncate">{title}</h3>
            {trend && (
              <span className={cn(
                "flex items-center text-sm",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}>
                <span className="material-icons text-xs mr-1">
                  {trend.isPositive ? "arrow_upward" : "arrow_downward"}
                </span>
                {trend.value}%
              </span>
            )}
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">{value}</h2>
            {trend && <span className="text-xs text-gray-500">{trend.label}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
