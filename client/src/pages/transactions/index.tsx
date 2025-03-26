import React, { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, getTransactionTypeInfo, getStatusColor } from "@/lib/utils";
import { Plus, Search, Filter, ArrowDown, ArrowUp, ArrowLeftRight } from "lucide-react";
import { Transaction } from "@shared/schema";

export default function TransactionsPage() {
  const [_, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Fetch transactions data
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });
  
  // Filter transactions based on search query and filters
  const filteredTransactions = transactions?.filter(transaction => {
    // Apply search filter
    const matchesSearch = 
      transaction.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.bloodType.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply type filter
    const matchesType = 
      typeFilter === "all" || 
      transaction.transactionType === typeFilter;
    
    // Apply status filter
    const matchesStatus = 
      statusFilter === "all" || 
      transaction.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  }) || [];
  
  // Sort transactions by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort((a, b) => 
    new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
  );
  
  // Calculate pagination
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };
  
  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };
  
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };
  
  const handleAddTransaction = () => {
    navigate("/transactions/add");
  };
  
  const renderTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'donation':
        return <ArrowUp className="h-5 w-5 text-green-500" />;
      case 'distribution':
        return <ArrowDown className="h-5 w-5 text-red-500" />;
      case 'transfer':
        return <ArrowLeftRight className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };
  
  return (
    <DashboardLayout title="Transactions">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search transactions..."
              className="pl-8"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="flex gap-2">
            <Select
              value={typeFilter}
              onValueChange={handleTypeFilterChange}
            >
              <SelectTrigger className="w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="donation">Donations</SelectItem>
                <SelectItem value="distribution">Distributions</SelectItem>
                <SelectItem value="transfer">Transfers</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={statusFilter}
              onValueChange={handleStatusFilterChange}
            >
              <SelectTrigger className="w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button onClick={handleAddTransaction}>
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex py-4 border-b border-gray-200">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.length > 0 ? (
                    paginatedTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-mono text-xs">
                          {transaction.transactionId}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatDateTime(transaction.transactionDate)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {renderTransactionIcon(transaction.transactionType)}
                            <span className="ml-2">
                              {transaction.transactionType.charAt(0).toUpperCase() + transaction.transactionType.slice(1)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-red-100 text-red-800 border-none">
                            {transaction.bloodType}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.units}</TableCell>
                        <TableCell>
                          {transaction.donorId 
                            ? `Donor #${transaction.donorId}` 
                            : transaction.sourceHospitalId 
                            ? `Hospital #${transaction.sourceHospitalId}` 
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {transaction.recipientId 
                            ? `Recipient #${transaction.recipientId}` 
                            : transaction.destinationHospitalId 
                            ? `Hospital #${transaction.destinationHospitalId}` 
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        {searchQuery || typeFilter !== "all" || statusFilter !== "all" 
                          ? "No transactions found matching your search criteria." 
                          : "No transactions have been recorded yet."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-200">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>
                    
                    {/* Show limited page numbers to avoid overflow */}
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      let pageNum = i + 1;
                      
                      // Adjust page numbers when current page is near the end
                      if (totalPages > 5 && currentPage > 3) {
                        pageNum = Math.min(currentPage + i - 2, totalPages - 4 + i);
                      }
                      
                      // Don't show more than total pages
                      if (pageNum <= totalPages) {
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNum)}
                              isActive={currentPage === pageNum}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                        disabled={currentPage === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
