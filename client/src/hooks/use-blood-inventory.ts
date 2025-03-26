import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { BloodInventory, BLOOD_TYPES, BloodType, InsertBloodInventory } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface InventoryStats {
  [key: string]: {
    units: number;
    percentage: number;
  };
}

interface UseBloodInventoryReturn {
  inventory: BloodInventory[] | undefined;
  isLoading: boolean;
  isError: boolean;
  inventoryStats: InventoryStats | undefined;
  statsLoading: boolean;
  expiringItems: BloodInventory[] | undefined;
  expiringLoading: boolean;
  getInventoryByType: (type: BloodType) => BloodInventory[] | undefined;
  updateInventoryItem: (id: number, data: Partial<BloodInventory>) => void;
  createInventoryItem: (data: InsertBloodInventory) => void;
}

export function useBloodInventory(): UseBloodInventoryReturn {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get all inventory items
  const { data: inventory, isLoading, isError } = useQuery<BloodInventory[]>({
    queryKey: ['/api/inventory'],
  });
  
  // Get inventory statistics
  const { data: inventoryStats, isLoading: statsLoading } = useQuery<InventoryStats>({
    queryKey: ['/api/inventory/stats'],
  });
  
  // Get expiring inventory items
  const { data: expiringItems, isLoading: expiringLoading } = useQuery<BloodInventory[]>({
    queryKey: ['/api/inventory/expiring'],
  });
  
  // Filter inventory by blood type
  const getInventoryByType = (type: BloodType): BloodInventory[] | undefined => {
    if (!inventory) return undefined;
    return inventory.filter(item => item.bloodType === type);
  };
  
  // Update inventory item mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<BloodInventory> }) => {
      const response = await apiRequest("PATCH", `/api/inventory/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Inventory Updated",
        description: "The inventory item has been updated successfully."
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/expiring'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update inventory: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Create inventory item mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertBloodInventory) => {
      const response = await apiRequest("POST", `/api/inventory`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Inventory Created",
        description: "The new inventory item has been added successfully."
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/stats'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create inventory: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Update inventory item wrapper
  const updateInventoryItem = (id: number, data: Partial<BloodInventory>) => {
    updateMutation.mutate({ id, data });
  };
  
  // Create inventory item wrapper
  const createInventoryItem = (data: InsertBloodInventory) => {
    createMutation.mutate(data);
  };
  
  return {
    inventory,
    isLoading,
    isError,
    inventoryStats,
    statsLoading,
    expiringItems,
    expiringLoading,
    getInventoryByType,
    updateInventoryItem,
    createInventoryItem
  };
}
