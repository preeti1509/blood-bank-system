import { BloodRequest } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { getColorByPriority, getColorByStatus, formatTimeAgo } from "@/lib/utils";

interface RequestRowProps {
  request: BloodRequest & { 
    hospital?: { 
      id: number;
      name: string;
      contact_person: string;
    } | null 
  };
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

export default function RequestRow({ request, onApprove, onReject }: RequestRowProps) {
  const priorityClass = getColorByPriority(request.priority);
  const statusClass = getColorByStatus(request.status);

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="material-icons text-blue-600">local_hospital</span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {request.hospital?.name || "Unknown Hospital"}
            </div>
            <div className="text-xs text-gray-600">ID: #{request.id.toString().padStart(4, '0')}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 font-medium">{request.blood_type}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{request.units} units</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityClass}`}>
          {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {formatTimeAgo(request.created_at)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        {request.status === 'pending' && (
          <>
            <Button 
              onClick={() => onApprove(request.id)} 
              variant="ghost" 
              size="sm" 
              className="text-green-600 hover:text-green-800 mr-3"
            >
              Approve
            </Button>
            <Button 
              onClick={() => onReject(request.id)} 
              variant="ghost" 
              size="sm" 
              className="text-red-600 hover:text-red-800"
            >
              Reject
            </Button>
          </>
        )}
        {request.status === 'approved' && (
          <Button 
            onClick={() => onApprove(request.id)} 
            variant="ghost" 
            size="sm" 
            className="text-blue-600 hover:text-blue-800"
          >
            Fulfill
          </Button>
        )}
        {(request.status === 'fulfilled' || request.status === 'rejected') && (
          <span className="text-gray-500">Completed</span>
        )}
      </td>
    </tr>
  );
}
