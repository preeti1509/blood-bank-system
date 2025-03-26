import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Transaction, Donor, Hospital } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateString } from "@/lib/utils";

export default function Transactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [transactionType, setTransactionType] = useState<string | null>(null);

  // Fetch transactions
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  // Fetch donors and hospitals for reference
  const { data: donors } = useQuery<Donor[]>({
    queryKey: ['/api/donors'],
  });

  const { data: hospitals } = useQuery<Hospital[]>({
    queryKey: ['/api/hospitals'],
  });

  // Filter transactions based on search and type
  const filteredTransactions = transactions?.filter(
    transaction => 
      (transaction.blood_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
       transaction.transaction_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
       transaction.source?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       transaction.destination?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (!transactionType || transaction.transaction_type === transactionType)
  ) || [];

  // Get counts by transaction type
  const getCounts = () => {
    if (!transactions) return { donation: 0, distribution: 0, transfer: 0, disposal: 0, other: 0 };
    
    return transactions.reduce((acc, transaction) => {
      acc[transaction.transaction_type as 'donation' | 'distribution' | 'transfer' | 'disposal' | 'other']++;
      return acc;
    }, { donation: 0, distribution: 0, transfer: 0, disposal: 0, other: 0 });
  };

  const counts = getCounts();

  // Helper to get source/destination name
  const getEntityName = (id: string, type: 'source' | 'destination') => {
    if (id === 'inventory') return 'Blood Bank Inventory';
    
    const numId = parseInt(id);
    if (isNaN(numId)) return id;
    
    if (type === 'source' && transactions?.find(t => t.transaction_type === 'donation')) {
      const donor = donors?.find(d => d.id === numId);
      if (donor) return `${donor.first_name} ${donor.last_name}`;
    }
    
    if (type === 'destination' && transactions?.find(t => t.transaction_type === 'distribution')) {
      const hospital = hospitals?.find(h => h.id === numId);
      if (hospital) return hospital.name;
    }
    
    return `ID: ${id}`;
  };
  
  // Get color for transaction type
  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'donation': return 'bg-green-100 text-green-800';
      case 'distribution': return 'bg-blue-100 text-blue-800';
      case 'transfer': return 'bg-purple-100 text-purple-800';
      case 'disposal': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <span className="material-icons mr-1">download</span>
          Export Report
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Transaction History</CardTitle>
            <div className="relative w-64">
              <Input
                type="text"
                placeholder="Search transactions..."
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
                onClick={() => setTransactionType(null)}
              >
                All ({transactions?.length || 0})
              </TabsTrigger>
              <TabsTrigger 
                value="donation" 
                onClick={() => setTransactionType('donation')}
              >
                Donations ({counts.donation})
              </TabsTrigger>
              <TabsTrigger 
                value="distribution" 
                onClick={() => setTransactionType('distribution')}
              >
                Distributions ({counts.distribution})
              </TabsTrigger>
              <TabsTrigger 
                value="transfer" 
                onClick={() => setTransactionType('transfer')}
              >
                Transfers ({counts.transfer})
              </TabsTrigger>
              <TabsTrigger 
                value="disposal" 
                onClick={() => setTransactionType('disposal')}
              >
                Disposals ({counts.disposal})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>#{transaction.id.toString().padStart(4, '0')}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.transaction_type)}`}>
                            {transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{transaction.blood_type}</TableCell>
                        <TableCell>{transaction.units}</TableCell>
                        <TableCell>{getEntityName(transaction.source || '', 'source')}</TableCell>
                        <TableCell>{getEntityName(transaction.destination || '', 'destination')}</TableCell>
                        <TableCell>{formatDateString(transaction.created_at)}</TableCell>
                        <TableCell className="max-w-xs truncate">{transaction.notes || 'N/A'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
