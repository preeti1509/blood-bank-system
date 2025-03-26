import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Hospital, InsertHospital } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface UseHospitalsReturn {
  hospitals: Hospital[] | undefined;
  isLoading: boolean;
  isError: boolean;
  filteredHospitals: (searchQuery: string) => Hospital[] | undefined;
  getHospitalById: (id: number) => Promise<Hospital | undefined>;
  createHospital: (data: InsertHospital) => Promise<Hospital | undefined>;
  updateHospital: (id: number, data: Partial<Hospital>) => Promise<Hospital | undefined>;
  toggleHospitalActive: (id: number, active: boolean) => Promise<void>;
}

export function useHospitals(): UseHospitalsReturn {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get all hospitals
  const { data: hospitals, isLoading, isError } = useQuery<Hospital[]>({
    queryKey: ['/api/hospitals'],
  });
  
  // Filter hospitals by search query
  const filteredHospitals = (searchQuery: string): Hospital[] | undefined => {
    if (!hospitals || !searchQuery) return hospitals;
    const query = searchQuery.toLowerCase();
    
    return hospitals.filter(hospital => 
      hospital.name.toLowerCase().includes(query) ||
      hospital.city.toLowerCase().includes(query) ||
      hospital.contactName.toLowerCase().includes(query) ||
      hospital.contactPhone.includes(query) ||
      hospital.contactEmail.toLowerCase().includes(query)
    );
  };
  
  // Get hospital by ID
  const getHospitalById = async (id: number): Promise<Hospital | undefined> => {
    try {
      // Check if we already have the hospital in cache
      const cachedHospital = hospitals?.find(hospital => hospital.id === id);
      if (cachedHospital) return cachedHospital;
      
      // Otherwise fetch from API
      const response = await apiRequest("GET", `/api/hospitals/${id}`, undefined);
      return await response.json();
    } catch (error) {
      console.error("Error fetching hospital:", error);
      return undefined;
    }
  };
  
  // Create hospital mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertHospital) => {
      const response = await apiRequest("POST", "/api/hospitals", data);
      return response.json();
    },
    onSuccess: (hospital: Hospital) => {
      toast({
        title: "Hospital Created",
        description: "The hospital has been added successfully."
      });
      
      // Invalidate hospitals query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/hospitals'] });
      return hospital;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create hospital: ${error.message}`,
        variant: "destructive"
      });
      return undefined;
    }
  });
  
  // Update hospital mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Hospital> }) => {
      const response = await apiRequest("PATCH", `/api/hospitals/${id}`, data);
      return response.json();
    },
    onSuccess: (hospital: Hospital) => {
      toast({
        title: "Hospital Updated",
        description: "The hospital information has been updated successfully."
      });
      
      // Invalidate hospitals query and specific hospital query
      queryClient.invalidateQueries({ queryKey: ['/api/hospitals'] });
      queryClient.invalidateQueries({ queryKey: [`/api/hospitals/${hospital.id}`] });
      return hospital;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update hospital: ${error.message}`,
        variant: "destructive"
      });
      return undefined;
    }
  });
  
  // Create hospital wrapper
  const createHospital = async (data: InsertHospital): Promise<Hospital | undefined> => {
    return await createMutation.mutateAsync(data);
  };
  
  // Update hospital wrapper
  const updateHospital = async (id: number, data: Partial<Hospital>): Promise<Hospital | undefined> => {
    return await updateMutation.mutateAsync({ id, data });
  };
  
  // Toggle hospital active status
  const toggleHospitalActive = async (id: number, active: boolean): Promise<void> => {
    await updateMutation.mutateAsync({ id, data: { active } });
  };
  
  return {
    hospitals,
    isLoading,
    isError,
    filteredHospitals,
    getHospitalById,
    createHospital,
    updateHospital,
    toggleHospitalActive
  };
}
