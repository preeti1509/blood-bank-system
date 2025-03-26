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
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MapPin, Phone, Mail } from "lucide-react";
import { Hospital } from "@shared/schema";

export default function HospitalsPage() {
  const [_, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Fetch hospitals data
  const { data: hospitals, isLoading } = useQuery<Hospital[]>({
    queryKey: ['/api/hospitals'],
  });
  
  // Filter hospitals based on search query
  const filteredHospitals = hospitals?.filter(hospital => 
    hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hospital.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hospital.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hospital.contactPhone.includes(searchQuery)
  ) || [];
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredHospitals.length / itemsPerPage);
  const paginatedHospitals = filteredHospitals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };
  
  const handleAddHospital = () => {
    navigate("/hospitals/add");
  };
  
  const handleHospitalClick = (hospitalId: number) => {
    navigate(`/hospitals/${hospitalId}`);
  };
  
  return (
    <DashboardLayout title="Hospitals">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64 md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search hospitals..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <Button onClick={handleAddHospital}>
          <Plus className="mr-2 h-4 w-4" />
          Add Hospital
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
                    <TableHead>Hospital Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedHospitals.length > 0 ? (
                    paginatedHospitals.map((hospital) => (
                      <TableRow 
                        key={hospital.id} 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleHospitalClick(hospital.id)}
                      >
                        <TableCell className="font-medium">{hospital.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                            <span>{hospital.city}, {hospital.state}</span>
                          </div>
                        </TableCell>
                        <TableCell>{hospital.contactName}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 text-gray-400 mr-1" />
                              <span>{hospital.contactPhone}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 text-gray-400 mr-1" />
                              <span className="truncate max-w-[180px]">{hospital.contactEmail}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={hospital.active ? "default" : "secondary"}>
                            {hospital.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        {searchQuery 
                          ? "No hospitals found matching your search criteria." 
                          : "No hospitals have been added yet."}
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
