import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { formatDateTime, getStatusColor, getTransactionTypeInfo } from "@/lib/utils";
import { ArrowDown, ArrowUp, ArrowLeftRight } from "lucide-react";
import { Transaction } from "@shared/schema";

export function RecentTransactions() {
  const [_, navigate] = useLocation();
  
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions/recent'],
  });
  
  const handleViewAllTransactions = () => {
    navigate("/transactions");
  };
  
  const renderTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'donation':
        return (
          <div className="flex-shrink-0 h-10 w-10 bg-secondary-light bg-opacity-20 rounded-full flex items-center justify-center">
            <ArrowUp className="h-5 w-5 text-secondary" />
          </div>
        );
      case 'distribution':
        return (
          <div className="flex-shrink-0 h-10 w-10 bg-primary-light bg-opacity-20 rounded-full flex items-center justify-center">
            <ArrowDown className="h-5 w-5 text-primary" />
          </div>
        );
      case 'transfer':
        return (
          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <ArrowLeftRight className="h-5 w-5 text-blue-500" />
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
            <ArrowLeftRight className="h-5 w-5 text-gray-500" />
          </div>
        );
    }
  };
  
  return (
    <div className="lg:col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-700">Recent Transactions</h2>
        <Button 
          variant="link" 
          className="text-primary hover:text-primary-dark"
          onClick={handleViewAllTransactions}
        >
          View All
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              // Render skeleton rows while loading
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="ml-4">
                        <Skeleton className="h-5 w-28" />
                        <Skeleton className="h-4 w-32 mt-1" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24 mt-1" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </td>
                </tr>
              ))
            ) : transactions && transactions.length > 0 ? (
              // Render actual transaction data
              transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {renderTransactionIcon(transaction.transactionType)}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.transactionId}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDateTime(transaction.transactionDate)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {transaction.donorId ? "Donor" : transaction.sourceHospitalId ? "Hospital" : "Unknown"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.bloodType} Blood ({transaction.units} {transaction.units === 1 ? 'unit' : 'units'})
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.transactionType === 'donation' 
                        ? 'bg-green-100 text-green-800'
                        : transaction.transactionType === 'distribution'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {transaction.transactionType.charAt(0).toUpperCase() + transaction.transactionType.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              // No transactions
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  No recent transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
