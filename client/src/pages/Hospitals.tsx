import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Hospital } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import HospitalForm from "@/components/hospitals/hospital-form";

export default function Hospitals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);

  // Fetch hospitals
  const { data: hospitals, isLoading } = useQuery<Hospital[]>({
    queryKey: ['/api/hospitals'],
  });

  // Create hospital mutation
  const createHospitalMutation = useMutation({
    mutationFn: async (hospitalData: Omit<Hospital, 'id' | 'created_at'>) => {
      const response = await apiRequest('POST', '/api/hospitals', hospitalData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Hospital added",
        description: "The hospital has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hospitals'] });
      setShowAddModal(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add hospital: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Update hospital mutation
  const updateHospitalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Hospital> }) => {
      const response = await apiRequest('PATCH', `/api/hospitals/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Hospital updated",
        description: "The hospital has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hospitals'] });
      setEditingHospital(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update hospital: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Filter hospitals based on search
  const filteredHospitals = hospitals?.filter(
    hospital => 
      hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.contact_person?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleCreateHospital = (data: Omit<Hospital, 'id' | 'created_at'>) => {
    createHospitalMutation.mutate(data);
  };

  const handleUpdateHospital = (data: Partial<Hospital>) => {
    if (editingHospital) {
      updateHospitalMutation.mutate({ id: editingHospital.id, data });
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Hospitals</h1>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <span className="material-icons mr-1">add</span>
          Add Hospital
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Hospital Directory</CardTitle>
            <div className="relative w-64">
              <Input
                type="text"
                placeholder="Search hospitals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <span className="material-icons absolute left-3 top-2 text-gray-400">search</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHospitals.length > 0 ? (
                    filteredHospitals.map((hospital) => (
                      <TableRow key={hospital.id}>
                        <TableCell className="font-medium">{hospital.name}</TableCell>
                        <TableCell>
                          {`${hospital.address}, ${hospital.city}, ${hospital.state} ${hospital.zip}`}
                        </TableCell>
                        <TableCell>{hospital.contact_person}</TableCell>
                        <TableCell>{hospital.phone}</TableCell>
                        <TableCell>{hospital.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            hospital.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {hospital.status.charAt(0).toUpperCase() + hospital.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setEditingHospital(hospital)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                        No hospitals found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Hospital Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Hospital</DialogTitle>
          </DialogHeader>
          <HospitalForm 
            onSubmit={handleCreateHospital} 
            isSubmitting={createHospitalMutation.isPending}
            onCancel={() => setShowAddModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Hospital Modal */}
      <Dialog 
        open={!!editingHospital} 
        onOpenChange={(open) => !open && setEditingHospital(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Hospital</DialogTitle>
          </DialogHeader>
          {editingHospital && (
            <HospitalForm 
              initialData={editingHospital}
              onSubmit={handleUpdateHospital} 
              isSubmitting={updateHospitalMutation.isPending}
              onCancel={() => setEditingHospital(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
