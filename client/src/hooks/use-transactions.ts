import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Transaction, InsertTransaction } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { generateTransactionId } from "@/lib/utils";

interface UseTransactionsReturn {
  transactions: Transaction[] | undefined;
  isLoading: boolean;
  isError: boolean;
  recentTransactions: Transaction[] | undefined;
  recentLoading: boolean;
  getTransactionById: (id: number) => Transaction | undefined;
  getTransactionByTransactionId: (transactionId: string) => Transaction | undefined;
  createTransaction: (data: Omit<InsertTransaction, "transactionId">) => Promise<void>;
  updateTransaction: (id: number, data: Partial<Transaction>) => Promise<void>;
}

export function useTransactions(): UseTransactionsReturn {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get all transactions
  const { data: transactions, isLoading, isError } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });
  
  // Get recent transactions
  const { data: recentTransactions, isLoading: recentLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions/recent'],
  });
  
  // Find transaction by ID
  const getTransactionById = (id: number): Transaction | undefined => {
    if (!transactions) return undefined;
    return transactions.find(transaction => transaction.id === id);
  };
  
  // Find transaction by transaction ID
  const getTransactionByTransactionId = (transactionId: string): Transaction | undefined => {
    if (!transactions) return undefined;
    return transactions.find(transaction => transaction.transactionId === transactionId);
  };
  
  // Create transaction mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertTransaction) => {
      const response = await apiRequest("POST", "/api/transactions", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Transaction Created",
        description: "The transaction has been created successfully."
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/stats'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create transaction: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Update transaction mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Transaction> }) => {
      const response = await apiRequest("PATCH", `/api/transactions/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Transaction Updated",
        description: "The transaction has been updated successfully."
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/recent'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update transaction: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Create transaction wrapper with auto-generated transaction ID
  const createTransaction = async (data: Omit<InsertTransaction, "transactionId">) => {
    const transactionData: InsertTransaction = {
      ...data,
      transactionId: generateTransactionId(),
    };
    
    await createMutation.mutateAsync(transactionData);
  };
  
  // Update transaction wrapper
  const updateTransaction = async (id: number, data: Partial<Transaction>) => {
    await updateMutation.mutateAsync({ id, data });
  };
  
  return {
    transactions,
    isLoading,
    isError,
    recentTransactions,
    recentLoading,
    getTransactionById,
    getTransactionByTransactionId,
    createTransaction,
    updateTransaction
  };
}
