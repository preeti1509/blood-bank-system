import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Donor } from "@shared/schema";
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
import DonorForm from "@/components/donors/donor-form";
import { formatDateString } from "@/lib/utils";

export default function Donors() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  const [filter, setFilter] = useState<'all' | 'eligible' | 'ineligible'>('all');

  // Fetch donors
  const { data: donors, isLoading } = useQuery<Donor[]>({
    queryKey: ['/api/donors'],
  });

  // Create donor mutation
  const createDonorMutation = useMutation({
    mutationFn: async (donorData: Omit<Donor, 'id' | 'created_at'>) => {
      const response = await apiRequest('POST', '/api/donors', donorData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Donor added",
        description: "The donor has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/donors'] });
      setShowAddModal(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add donor: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Update donor mutation
  const updateDonorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Donor> }) => {
      const response = await apiRequest('PATCH', `/api/donors/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Donor updated",
        description: "The donor has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/donors'] });
      setEditingDonor(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update donor: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Filter donors based on search and eligibility
  const filteredDonors = donors?.filter(
    donor => 
      (donor.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       donor.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       donor.blood_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
       donor.phone.includes(searchQuery)) &&
      (filter === 'all' || 
       (filter === 'eligible' && donor.is_eligible) || 
       (filter === 'ineligible' && !donor.is_eligible))
  ) || [];

  const handleCreateDonor = (data: Omit<Donor, 'id' | 'created_at'>) => {
    createDonorMutation.mutate(data);
  };

  const handleUpdateDonor = (data: Partial<Donor>) => {
    if (editingDonor) {
      updateDonorMutation.mutate({ id: editingDonor.id, data });
    }
  };

  // Calculate counts
  const totalDonors = donors?.length || 0;
  const eligibleDonors = donors?.filter(d => d.is_eligible).length || 0;
  const ineligibleDonors = totalDonors - eligibleDonors;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Donors</h1>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <span className="material-icons mr-1">add</span>
          Add Donor
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Donor Registry</CardTitle>
            <div className="relative w-64">
              <Input
                type="text"
                placeholder="Search donors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <span className="material-icons absolute left-3 top-2 text-gray-400">search</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              onClick={() => setFilter('all')}
            >
              All Donors ({totalDonors})
            </Button>
            <Button 
              variant={filter === 'eligible' ? 'default' : 'outline'} 
              className={filter === 'eligible' ? 'bg-green-600 hover:bg-green-700' : 'text-green-600 border-green-200 hover:bg-green-50'}
              onClick={() => setFilter('eligible')}
            >
              Eligible ({eligibleDonors})
            </Button>
            <Button 
              variant={filter === 'ineligible' ? 'default' : 'outline'} 
              className={filter === 'ineligible' ? 'bg-amber-600 hover:bg-amber-700' : 'text-amber-600 border-amber-200 hover:bg-amber-50'}
              onClick={() => setFilter('ineligible')}
            >
              Ineligible ({ineligibleDonors})
            </Button>
          </div>

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
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Last Donation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Eligible Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDonors.length > 0 ? (
                    filteredDonors.map((donor) => (
                      <TableRow key={donor.id}>
                        <TableCell className="font-medium">
                          {donor.first_name} {donor.last_name}
                        </TableCell>
                        <TableCell className="font-medium">{donor.blood_type}</TableCell>
                        <TableCell>
                          <div>{donor.phone}</div>
                          <div className="text-xs text-gray-500">{donor.email}</div>
                        </TableCell>
                        <TableCell>{donor.last_donation_date ? formatDateString(donor.last_donation_date) : 'Never'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            donor.is_eligible 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {donor.is_eligible ? 'Eligible' : 'Ineligible'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {donor.next_eligible_date 
                            ? formatDateString(donor.next_eligible_date) 
                            : donor.is_eligible 
                              ? 'Available now' 
                              : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setEditingDonor(donor)}
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
                        No donors found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Donor Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Donor</DialogTitle>
          </DialogHeader>
          <DonorForm 
            onSubmit={handleCreateDonor} 
            isSubmitting={createDonorMutation.isPending}
            onCancel={() => setShowAddModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Donor Modal */}
      <Dialog 
        open={!!editingDonor} 
        onOpenChange={(open) => !open && setEditingDonor(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Donor</DialogTitle>
          </DialogHeader>
          {editingDonor && (
            <DonorForm 
              initialData={editingDonor}
              onSubmit={handleUpdateDonor} 
              isSubmitting={updateDonorMutation.isPending}
              onCancel={() => setEditingDonor(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
