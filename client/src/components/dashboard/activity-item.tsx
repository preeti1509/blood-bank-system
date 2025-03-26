import { RecentActivity } from "@shared/schema";

interface ActivityItemProps {
  activity: RecentActivity;
}

export default function ActivityItem({ activity }: ActivityItemProps) {
  return (
    <div className="p-4 flex items-start">
      <div className={`flex-shrink-0 rounded-full p-2 ${
        activity.iconColor === "text-success" ? "bg-green-100" :
        activity.iconColor === "text-danger" ? "bg-red-100" :
        activity.iconColor === "text-info" ? "bg-blue-100" :
        activity.iconColor === "text-warning" ? "bg-amber-100" : "bg-gray-100"
      }`}>
        <span className={`material-icons ${
          activity.iconColor === "text-success" ? "text-green-600" :
          activity.iconColor === "text-danger" ? "text-red-600" :
          activity.iconColor === "text-info" ? "text-blue-600" :
          activity.iconColor === "text-warning" ? "text-amber-600" : "text-gray-600"
        }`}>
          {activity.icon}
        </span>
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
        <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
      </div>
    </div>
  );
}
