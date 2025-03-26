import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateString(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  
  try {
    const dateObj = new Date(date);
    return format(dateObj, "MMM dd, yyyy");
  } catch (error) {
    return "Invalid date";
  }
}

export function formatTimeAgo(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  
  try {
    const dateObj = new Date(date);
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    return "Invalid date";
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  
  try {
    const dateObj = new Date(date);
    return format(dateObj, "MMM dd, yyyy HH:mm");
  } catch (error) {
    return "Invalid date";
  }
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function getColorByBloodLevel(percentage: number): string {
  if (percentage < 20) {
    return "bg-red-600"; // Critical
  } else if (percentage < 40) {
    return "bg-amber-500"; // Warning
  } else {
    return "bg-red-500"; // Normal (still red for blood)
  }
}

export function getColorByStatus(status: string): string {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "approved":
      return "bg-blue-100 text-blue-800";
    case "fulfilled":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "cancelled":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getColorByPriority(priority: string): string {
  switch (priority.toLowerCase()) {
    case "emergency":
      return "bg-red-100 text-red-800";
    case "urgent":
      return "bg-amber-100 text-amber-800";
    case "standard":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getIconColorByType(type: string): string {
  switch (type.toLowerCase()) {
    case "donation":
    case "success":
      return "text-green-600 bg-green-100";
    case "alert":
    case "critical":
    case "error":
      return "text-red-600 bg-red-100";
    case "request":
    case "info":
      return "text-blue-600 bg-blue-100";
    case "expiry":
    case "warning":
      return "text-amber-600 bg-amber-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
