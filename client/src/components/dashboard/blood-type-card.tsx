import { BloodType } from "@shared/schema";
import { formatPercentage, getColorByBloodLevel } from "@/lib/utils";

interface BloodTypeCardProps {
  type: BloodType;
  units: number;
  percentage: number;
  expiringUnits: number;
  expiringDays: number;
  isCritical: boolean;
}

export default function BloodTypeCard({
  type,
  units,
  percentage,
  expiringUnits,
  expiringDays,
  isCritical
}: BloodTypeCardProps) {
  const bloodLevelColor = getColorByBloodLevel(percentage);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-lg text-gray-900">{type}</span>
        <span className="text-sm text-gray-600">{units} units</span>
      </div>
      
      <div className="blood-level-indicator bg-gray-200 h-24 relative rounded overflow-hidden">
        <div 
          className={`blood-level absolute bottom-0 w-full transition-all duration-500 ${bloodLevelColor}`} 
          style={{ height: `${percentage}%` }}
        ></div>
      </div>
      
      {expiringUnits > 0 ? (
        <div className="mt-2 text-xs text-gray-600 flex items-center">
          <span className="material-icons text-amber-500 text-xs mr-1">schedule</span>
          {expiringUnits} units expiring in {expiringDays} days
        </div>
      ) : isCritical ? (
        <div className="mt-2 text-xs text-red-600 flex items-center font-medium">
          <span className="material-icons text-red-600 text-xs mr-1">priority_high</span>
          Critical level
        </div>
      ) : (
        <div className="mt-2 text-xs text-green-600 flex items-center">
          <span className="material-icons text-green-600 text-xs mr-1">check_circle</span>
          Healthy supply
        </div>
      )}
    </div>
  );
}
