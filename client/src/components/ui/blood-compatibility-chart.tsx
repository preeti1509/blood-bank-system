import React from "react";
import { BLOOD_TYPES, BLOOD_COMPATIBILITY } from "@shared/schema";
import { cn } from "@/lib/utils";

interface BloodCompatibilityChartProps {
  className?: string;
}

export function BloodCompatibilityChart({ className }: BloodCompatibilityChartProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Recipient ↓ / Donor →
            </th>
            {BLOOD_TYPES.map((type) => (
              <th
                key={type}
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {type}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {BLOOD_TYPES.map((recipientType) => (
            <tr key={recipientType}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                {recipientType}
              </td>
              {BLOOD_TYPES.map((donorType) => {
                const isCompatible = BLOOD_COMPATIBILITY[recipientType].includes(donorType);
                return (
                  <td
                    key={`${recipientType}-${donorType}`}
                    className={cn(
                      "px-6 py-4 whitespace-nowrap text-center text-sm",
                      isCompatible
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    )}
                  >
                    {isCompatible ? "Yes" : "No"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 text-sm text-gray-500">
        <p>
          <strong>Note:</strong> This chart shows which donor blood types are
          compatible with each recipient blood type. "Yes" indicates compatibility.
        </p>
      </div>
    </div>
  );
}
