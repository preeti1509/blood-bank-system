import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Donor, InsertDonor } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface UseDonorsReturn {
  donors: Donor[] | undefined;
  isLoading: boolean;
  isError: boolean;
  filteredDonors: (searchQuery: string) => Donor[] | undefined;
  getDonorById: (id: number) => Promise<Donor | undefined>;
  createDonor: (data: InsertDonor) => Promise<Donor | undefined>;
  updateDonor: (id: number, data: Partial<Donor>) => Promise<Donor | undefined>;
  toggleDonorActive: (id: number, active: boolean) => Promise<void>;
}

export function useDonors(): UseDonorsReturn {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get all donors
  const { data: donors, isLoading, isError } = useQuery<Donor[]>({
    queryKey: ['/api/donors'],
  });
  
  // Filter donors by search query
  const filteredDonors = (searchQuery: string): Donor[] | undefined => {
    if (!donors || !searchQuery) return donors;
    const query = searchQuery.toLowerCase();
    
    return donors.filter(donor => 
      donor.name.toLowerCase().includes(query) ||
      donor.bloodType.toLowerCase().includes(query) ||
      donor.phone.includes(query)
    );
  };
  
  // Get donor by ID
  const getDonorById = async (id: number): Promise<Donor | undefined> => {
    try {
      // Check if we already have the donor in cache
      const cachedDonor = donors?.find(donor => donor.id === id);
      if (cachedDonor) return cachedDonor;
      
      // Otherwise fetch from API
      const response = await apiRequest("GET", `/api/donors/${id}`, undefined);
      return await response.json();
    } catch (error) {
      console.error("Error fetching donor:", error);
      return undefined;
    }
  };
  
  // Create donor mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertDonor) => {
      const response = await apiRequest("POST", "/api/donors", data);
      return response.json();
    },
    onSuccess: (donor: Donor) => {
      toast({
        title: "Donor Created",
        description: "The donor has been added successfully."
      });
      
      // Invalidate donors query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/donors'] });
      return donor;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create donor: ${error.message}`,
        variant: "destructive"
      });
      return undefined;
    }
  });
  
  // Update donor mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Donor> }) => {
      const response = await apiRequest("PATCH", `/api/donors/${id}`, data);
      return response.json();
    },
    onSuccess: (donor: Donor) => {
      toast({
        title: "Donor Updated",
        description: "The donor information has been updated successfully."
      });
      
      // Invalidate donors query and specific donor query
      queryClient.invalidateQueries({ queryKey: ['/api/donors'] });
      queryClient.invalidateQueries({ queryKey: [`/api/donors/${donor.id}`] });
      return donor;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update donor: ${error.message}`,
        variant: "destructive"
      });
      return undefined;
    }
  });
  
  // Create donor wrapper
  const createDonor = async (data: InsertDonor): Promise<Donor | undefined> => {
    return await createMutation.mutateAsync(data);
  };
  
  // Update donor wrapper
  const updateDonor = async (id: number, data: Partial<Donor>): Promise<Donor | undefined> => {
    return await updateMutation.mutateAsync({ id, data });
  };
  
  // Toggle donor active status
  const toggleDonorActive = async (id: number, active: boolean): Promise<void> => {
    await updateMutation.mutateAsync({ id, data: { active } });
  };
  
  return {
    donors,
    isLoading,
    isError,
    filteredDonors,
    getDonorById,
    createDonor,
    updateDonor,
    toggleDonorActive
  };
}
