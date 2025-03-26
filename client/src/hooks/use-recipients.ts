import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Recipient, InsertRecipient } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface UseRecipientsReturn {
  recipients: Recipient[] | undefined;
  isLoading: boolean;
  isError: boolean;
  filteredRecipients: (searchQuery: string) => Recipient[] | undefined;
  getRecipientById: (id: number) => Promise<Recipient | undefined>;
  createRecipient: (data: InsertRecipient) => Promise<Recipient | undefined>;
  updateRecipient: (id: number, data: Partial<Recipient>) => Promise<Recipient | undefined>;
  toggleRecipientActive: (id: number, active: boolean) => Promise<void>;
}

export function useRecipients(): UseRecipientsReturn {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get all recipients
  const { data: recipients, isLoading, isError } = useQuery<Recipient[]>({
    queryKey: ['/api/recipients'],
  });
  
  // Filter recipients by search query
  const filteredRecipients = (searchQuery: string): Recipient[] | undefined => {
    if (!recipients || !searchQuery) return recipients;
    const query = searchQuery.toLowerCase();
    
    return recipients.filter(recipient => 
      recipient.name.toLowerCase().includes(query) ||
      recipient.bloodType.toLowerCase().includes(query) ||
      recipient.phone.includes(query)
    );
  };
  
  // Get recipient by ID
  const getRecipientById = async (id: number): Promise<Recipient | undefined> => {
    try {
      // Check if we already have the recipient in cache
      const cachedRecipient = recipients?.find(recipient => recipient.id === id);
      if (cachedRecipient) return cachedRecipient;
      
      // Otherwise fetch from API
      const response = await apiRequest("GET", `/api/recipients/${id}`, undefined);
      return await response.json();
    } catch (error) {
      console.error("Error fetching recipient:", error);
      return undefined;
    }
  };
  
  // Create recipient mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertRecipient) => {
      const response = await apiRequest("POST", "/api/recipients", data);
      return response.json();
    },
    onSuccess: (recipient: Recipient) => {
      toast({
        title: "Recipient Created",
        description: "The recipient has been added successfully."
      });
      
      // Invalidate recipients query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/recipients'] });
      return recipient;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create recipient: ${error.message}`,
        variant: "destructive"
      });
      return undefined;
    }
  });
  
  // Update recipient mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Recipient> }) => {
      const response = await apiRequest("PATCH", `/api/recipients/${id}`, data);
      return response.json();
    },
    onSuccess: (recipient: Recipient) => {
      toast({
        title: "Recipient Updated",
        description: "The recipient information has been updated successfully."
      });
      
      // Invalidate recipients query and specific recipient query
      queryClient.invalidateQueries({ queryKey: ['/api/recipients'] });
      queryClient.invalidateQueries({ queryKey: [`/api/recipients/${recipient.id}`] });
      return recipient;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update recipient: ${error.message}`,
        variant: "destructive"
      });
      return undefined;
    }
  });
  
  // Create recipient wrapper
  const createRecipient = async (data: InsertRecipient): Promise<Recipient | undefined> => {
    return await createMutation.mutateAsync(data);
  };
  
  // Update recipient wrapper
  const updateRecipient = async (id: number, data: Partial<Recipient>): Promise<Recipient | undefined> => {
    return await updateMutation.mutateAsync({ id, data });
  };
  
  // Toggle recipient active status
  const toggleRecipientActive = async (id: number, active: boolean): Promise<void> => {
    await updateMutation.mutateAsync({ id, data: { active } });
  };
  
  return {
    recipients,
    isLoading,
    isError,
    filteredRecipients,
    getRecipientById,
    createRecipient,
    updateRecipient,
    toggleRecipientActive
  };
}
