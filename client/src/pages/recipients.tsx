import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Recipient } from "@shared/schema";
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
import RecipientForm from "@/components/recipients/recipient-form";
import { formatDateString } from "@/lib/utils";

export default function Recipients() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null);

  // Fetch recipients
  const { data: recipients, isLoading } = useQuery<Recipient[]>({
    queryKey: ['/api/recipients'],
  });

  // Create recipient mutation
  const createRecipientMutation = useMutation({
    mutationFn: async (recipientData: Omit<Recipient, 'id' | 'created_at'>) => {
      const response = await apiRequest('POST', '/api/recipients', recipientData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Recipient added",
        description: "The recipient has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/recipients'] });
      setShowAddModal(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add recipient: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Update recipient mutation
  const updateRecipientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Recipient> }) => {
      const response = await apiRequest('PATCH', `/api/recipients/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Recipient updated",
        description: "The recipient has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/recipients'] });
      setEditingRecipient(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update recipient: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Filter recipients based on search
  const filteredRecipients = recipients?.filter(
    recipient => 
      recipient.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipient.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipient.blood_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipient.phone.includes(searchQuery)
  ) || [];

  const handleCreateRecipient = (data: Omit<Recipient, 'id' | 'created_at'>) => {
    createRecipientMutation.mutate(data);
  };

  const handleUpdateRecipient = (data: Partial<Recipient>) => {
    if (editingRecipient) {
      updateRecipientMutation.mutate({ id: editingRecipient.id, data });
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Recipients</h1>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <span className="material-icons mr-1">add</span>
          Add Recipient
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Recipient Registry</CardTitle>
            <div className="relative w-64">
              <Input
                type="text"
                placeholder="Search recipients..."
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
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Medical Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecipients.length > 0 ? (
                    filteredRecipients.map((recipient) => (
                      <TableRow key={recipient.id}>
                        <TableCell className="font-medium">
                          {recipient.first_name} {recipient.last_name}
                        </TableCell>
                        <TableCell className="font-medium">{recipient.blood_type}</TableCell>
                        <TableCell>{formatDateString(recipient.date_of_birth)}</TableCell>
                        <TableCell>
                          <div>{recipient.phone}</div>
                          <div className="text-xs text-gray-500">{recipient.email}</div>
                        </TableCell>
                        <TableCell>
                          {recipient.hospital_id || 'Not assigned'}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {recipient.medical_notes || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setEditingRecipient(recipient)}
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
                        No recipients found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Recipient Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Recipient</DialogTitle>
          </DialogHeader>
          <RecipientForm 
            onSubmit={handleCreateRecipient} 
            isSubmitting={createRecipientMutation.isPending}
            onCancel={() => setShowAddModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Recipient Modal */}
      <Dialog 
        open={!!editingRecipient} 
        onOpenChange={(open) => !open && setEditingRecipient(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Recipient</DialogTitle>
          </DialogHeader>
          {editingRecipient && (
            <RecipientForm 
              initialData={editingRecipient}
              onSubmit={handleUpdateRecipient} 
              isSubmitting={updateRecipientMutation.isPending}
              onCancel={() => setEditingRecipient(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
