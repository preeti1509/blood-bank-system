import React, { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { Plus, Search } from "lucide-react";
import { Recipient } from "@shared/schema";

export default function RecipientsPage() {
  const [_, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Fetch recipients data
  const { data: recipients, isLoading } = useQuery<Recipient[]>({
    queryKey: ['/api/recipients', searchQuery],
  });
  
  // Filter recipients based on search query
  const filteredRecipients = recipients?.filter(recipient => 
    recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipient.bloodType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipient.phone.includes(searchQuery)
  ) || [];
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredRecipients.length / itemsPerPage);
  const paginatedRecipients = filteredRecipients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };
  
  const handleAddRecipient = () => {
    navigate("/recipients/add");
  };
  
  const handleRecipientClick = (recipientId: number) => {
    navigate(`/recipients/${recipientId}`);
  };
  
  return (
    <DashboardLayout title="Recipients">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64 md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search recipients..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <Button onClick={handleAddRecipient}>
          <Plus className="mr-2 h-4 w-4" />
          Add Recipient
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Associated Hospital</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRecipients.length > 0 ? (
                  paginatedRecipients.map((recipient) => (
                    <TableRow 
                      key={recipient.id} 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleRecipientClick(recipient.id)}
                    >
                      <TableCell className="font-medium">{recipient.name}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                          {recipient.bloodType}
                        </span>
                      </TableCell>
                      <TableCell>{recipient.phone}</TableCell>
                      <TableCell>{recipient.hospitalId || "None"}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          recipient.active 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {recipient.active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      {searchQuery 
                        ? "No recipients found matching your search criteria." 
                        : "No recipients have been added yet."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
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
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink
                          onClick={() => setCurrentPage(i + 1)}
                          isActive={currentPage === i + 1}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
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
