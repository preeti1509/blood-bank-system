import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { BloodInventoryItem, BloodTypeSummary } from "@shared/schema";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddInventoryModal from "@/components/inventory/add-inventory-modal";
import BloodTypeCard from "@/components/dashboard/blood-type-card";
import { formatDateString } from "@/lib/utils";

export default function Inventory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Fetch inventory
  const { data: inventory, isLoading: isLoadingInventory } = useQuery<BloodInventoryItem[]>({
    queryKey: ['/api/inventory'],
  });

  // Fetch blood summary
  const { data: bloodSummary } = useQuery<BloodTypeSummary[]>({
    queryKey: ['/api/dashboard/blood-summary'],
  });

  // Update inventory item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<BloodInventoryItem> }) => {
      const response = await apiRequest('PATCH', `/api/inventory/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Inventory updated",
        description: "The inventory item has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/blood-summary'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update inventory: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Filter inventory based on search and status
  const filteredInventory = inventory?.filter(
    item => 
      (item.blood_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.status.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (!selectedStatus || item.status === selectedStatus)
  ) || [];

  const handleDiscardItem = (id: number) => {
    updateItemMutation.mutate({ 
      id, 
      data: { status: 'discarded' } 
    });
  };

  // Get counts by status
  const getCounts = () => {
    if (!inventory) return { available: 0, reserved: 0, expired: 0, discarded: 0 };
    
    return inventory.reduce((acc, item) => {
      acc[item.status as 'available' | 'reserved' | 'expired' | 'discarded']++;
      return acc;
    }, { available: 0, reserved: 0, expired: 0, discarded: 0 });
  };

  const counts = getCounts();

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Blood Inventory</h1>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <span className="material-icons mr-1">add</span>
          Add Inventory
        </Button>
      </div>

      {/* Blood Type Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        {bloodSummary ? (
          bloodSummary.map(bloodType => (
            <BloodTypeCard
              key={bloodType.bloodType}
              type={bloodType.bloodType}
              units={bloodType.units}
              percentage={bloodType.percentage}
              expiringUnits={bloodType.expiringUnits}
              expiringDays={bloodType.expiringDays}
              isCritical={bloodType.isCritical}
            />
          ))
        ) : (
          // Loading skeleton
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="flex flex-col animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="h-6 w-8 bg-gray-200 rounded"></div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="mt-2 h-4 w-full bg-gray-200 rounded"></div>
            </div>
          ))
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Inventory Details</CardTitle>
            <div className="relative w-64">
              <Input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <span className="material-icons absolute left-3 top-2 text-gray-400">search</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="mb-6">
            <TabsList>
              <TabsTrigger 
                value="all" 
                onClick={() => setSelectedStatus(null)}
              >
                All ({inventory?.length || 0})
              </TabsTrigger>
              <TabsTrigger 
                value="available" 
                onClick={() => setSelectedStatus('available')}
              >
                Available ({counts.available})
              </TabsTrigger>
              <TabsTrigger 
                value="reserved" 
                onClick={() => setSelectedStatus('reserved')}
              >
                Reserved ({counts.reserved})
              </TabsTrigger>
              <TabsTrigger 
                value="expired" 
                onClick={() => setSelectedStatus('expired')}
              >
                Expired ({counts.expired})
              </TabsTrigger>
              <TabsTrigger 
                value="discarded" 
                onClick={() => setSelectedStatus('discarded')}
              >
                Discarded ({counts.discarded})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoadingInventory ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Donation Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Donor ID</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.length > 0 ? (
                    filteredInventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>#{item.id.toString().padStart(4, '0')}</TableCell>
                        <TableCell className="font-medium">{item.blood_type}</TableCell>
                        <TableCell>{item.units}</TableCell>
                        <TableCell>{formatDateString(item.donation_date)}</TableCell>
                        <TableCell>{formatDateString(item.expiry_date)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'available' 
                              ? 'bg-green-100 text-green-800' 
                              : item.status === 'reserved'
                                ? 'bg-blue-100 text-blue-800'
                                : item.status === 'expired'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                          }`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>{item.donor_id || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          {item.status === 'available' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDiscardItem(item.id)}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              Discard
                            </Button>
                          )}
                          {item.status === 'expired' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDiscardItem(item.id)}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              Remove
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                        No inventory items found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Inventory Modal */}
      <AddInventoryModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
      />
    </>
  );
}
