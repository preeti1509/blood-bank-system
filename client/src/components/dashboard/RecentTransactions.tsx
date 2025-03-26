import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { formatTimeAgo } from "@/lib/utils";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecentTransactions() {
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions/recent/4'],
  });
  
  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="p-4 border border-neutral-200 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="ml-3">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!transactions) {
    return null;
  }
  
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "donation":
        return {
          icon: "add",
          bgColor: "bg-primary/10",
          textColor: "text-primary"
        };
      case "distribution":
        return {
          icon: "remove",
          bgColor: "bg-secondary/10",
          textColor: "text-secondary"
        };
      case "transfer":
        return {
          icon: "sync",
          bgColor: "bg-status-warning/10",
          textColor: "text-status-warning"
        };
      default:
        return {
          icon: "help_outline",
          bgColor: "bg-neutral-100",
          textColor: "text-neutral-400"
        };
    }
  };
  
  const getTransactionAmount = (transaction: Transaction) => {
    switch (transaction.type) {
      case "donation":
        return {
          text: `+${transaction.units} unit${transaction.units !== 1 ? 's' : ''}`,
          textColor: "text-status-success"
        };
      case "distribution":
        return {
          text: `-${transaction.units} unit${transaction.units !== 1 ? 's' : ''}`,
          textColor: "text-status-error"
        };
      case "transfer":
        return {
          text: `${transaction.units} unit${transaction.units !== 1 ? 's' : ''}`,
          textColor: "text-status-warning"
        };
      default:
        return {
          text: `${transaction.units} unit${transaction.units !== 1 ? 's' : ''}`,
          textColor: "text-neutral-400"
        };
    }
  };
  
  const getTransactionTitle = (type: string) => {
    switch (type) {
      case "donation":
        return "Donation Received";
      case "distribution":
        return "Blood Dispatched";
      case "transfer":
        return "Transfer Complete";
      default:
        return "Transaction";
    }
  };
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-neutral-400">Recent Transactions</h3>
          <Link href="/transactions">
            <Button variant="link" className="text-secondary p-0 h-auto">
              View All
              <span className="material-icons text-sm ml-1">arrow_forward</span>
            </Button>
          </Link>
        </div>
        
        <div className="space-y-4">
          {transactions.map(transaction => {
            const icon = getTransactionIcon(transaction.type);
            const amount = getTransactionAmount(transaction);
            
            return (
              <div key={transaction.id} className="p-4 border border-neutral-200 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full ${icon.bgColor} flex items-center justify-center`}>
                      <span className={`material-icons ${icon.textColor} text-sm`}>{icon.icon}</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-neutral-400">
                        {getTransactionTitle(transaction.type)}
                      </p>
                      <p className="text-xs text-neutral-300">
                        {transaction.bloodType} Blood Type
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${amount.textColor}`}>
                      {amount.text}
                    </p>
                    <p className="text-xs text-neutral-300">
                      {formatTimeAgo(transaction.transactionDate)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
