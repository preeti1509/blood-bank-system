import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { Download, Calendar } from "lucide-react";
import { BLOOD_TYPES, Transaction, BloodInventory } from "@shared/schema";

// Colors for blood type charts
const BLOOD_TYPE_COLORS = [
  "#e53935", // A+
  "#c62828", // A-
  "#2196F3", // B+
  "#1565c0", // B-
  "#E91E63", // AB+
  "#C2185B", // AB-
  "#4CAF50", // O+
  "#2E7D32", // O-
];

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("month");
  const [reportType, setReportType] = useState("overview");
  
  // Fetch data for reports
  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });
  
  const { data: inventoryStats, isLoading: inventoryLoading } = useQuery({
    queryKey: ['/api/inventory/stats'],
  });
  
  // Process data for charts
  const processInventoryData = () => {
    if (!inventoryStats) return [];
    
    return BLOOD_TYPES.map((type, index) => ({
      name: type,
      value: inventoryStats[type]?.units || 0,
      percentage: inventoryStats[type]?.percentage || 0,
      color: BLOOD_TYPE_COLORS[index],
    }));
  };
  
  const processTransactionData = () => {
    if (!transactions) return { byType: [], byBloodType: [], byDay: [] };
    
    // Filter transactions by time range
    const now = new Date();
    const filteredTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.transactionDate);
      if (timeRange === "week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return txDate >= weekAgo;
      } else if (timeRange === "month") {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        return txDate >= monthAgo;
      } else if (timeRange === "year") {
        const yearAgo = new Date(now);
        yearAgo.setFullYear(now.getFullYear() - 1);
        return txDate >= yearAgo;
      }
      return true; // 'all' filter
    });
    
    // Transactions by type
    const byType = [
      { name: "Donations", value: filteredTransactions.filter(tx => tx.transactionType === "donation").length },
      { name: "Distributions", value: filteredTransactions.filter(tx => tx.transactionType === "distribution").length },
      { name: "Transfers", value: filteredTransactions.filter(tx => tx.transactionType === "transfer").length },
    ];
    
    // Transactions by blood type
    const byBloodType = BLOOD_TYPES.map(type => ({
      name: type,
      donations: filteredTransactions.filter(tx => tx.bloodType === type && tx.transactionType === "donation").length,
      distributions: filteredTransactions.filter(tx => tx.bloodType === type && tx.transactionType === "distribution").length,
    }));
    
    // Transactions by day (last 30 days)
    const last30Days = new Array(30).fill(0).map((_, i) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (29 - i));
      return {
        name: formatDate(date),
        date,
        donations: 0,
        distributions: 0,
      };
    });
    
    filteredTransactions.forEach(tx => {
      const txDate = new Date(tx.transactionDate);
      const daysDiff = Math.floor((now.getTime() - txDate.getTime()) / (1000 * 3600 * 24));
      
      if (daysDiff < 30) {
        const index = 29 - daysDiff;
        if (tx.transactionType === "donation") {
          last30Days[index].donations++;
        } else if (tx.transactionType === "distribution") {
          last30Days[index].distributions++;
        }
      }
    });
    
    return { byType, byBloodType, byDay: last30Days };
  };
  
  const inventoryData = processInventoryData();
  const transactionData = processTransactionData();
  
  // Export report as CSV
  const exportCSV = () => {
    if (!transactions) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Header
    csvContent += "Transaction ID,Date,Type,Blood Type,Units,Status\n";
    
    // Data rows
    transactions.forEach(tx => {
      csvContent += `${tx.transactionId},${formatDate(tx.transactionDate)},${tx.transactionType},${tx.bloodType},${tx.units},${tx.status}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `blood_bank_report_${formatDate(new Date())}.csv`);
    document.body.appendChild(link);
    
    // Download the data file
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <DashboardLayout title="Reports & Analytics">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs value={reportType} onValueChange={setReportType}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex gap-2">
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-[130px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>
      
      {reportType === "overview" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Blood Bank Overview</CardTitle>
              <CardDescription>
                Summary of inventory and transaction statistics
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inventory Summary */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Current Inventory</h3>
                  {inventoryLoading ? (
                    <Skeleton className="h-72 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={inventoryData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, value }) => `${name}: ${value} units`}
                        >
                          {inventoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                
                {/* Transaction Summary */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Transaction Breakdown</h3>
                  {transactionsLoading ? (
                    <Skeleton className="h-72 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={transactionData.byType}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#E53935" name="Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Transaction Activity</h3>
                {transactionsLoading ? (
                  <Skeleton className="h-72 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={transactionData.byDay}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tickFormatter={(value) => {
                          // Only show every 5th date for clarity
                          const date = new Date(value);
                          return date.getDate() % 5 === 0 ? date.getDate().toString() : '';
                        }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="donations" stroke="#4CAF50" name="Donations" />
                      <Line type="monotone" dataKey="distributions" stroke="#D32F2F" name="Distributions" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {reportType === "inventory" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of current blood inventory
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {inventoryLoading ? (
                <Skeleton className="h-72 w-full" />
              ) : (
                <div className="space-y-6">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={inventoryData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#E53935" name="Units" />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Blood Type Distribution</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={inventoryData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                          >
                            {inventoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Inventory Health</h3>
                      <div className="space-y-4">
                        {inventoryData.map((item) => (
                          <div key={item.name} className="flex items-center">
                            <div className="w-12 font-medium">{item.name}</div>
                            <div className="flex-1 mx-2">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="h-2.5 rounded-full" 
                                  style={{ 
                                    width: `${Math.min(item.percentage, 100)}%`,
                                    backgroundColor: item.color 
                                  }}
                                ></div>
                              </div>
                            </div>
                            <div className="w-20 text-right text-sm">
                              {item.value} units
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      {reportType === "transactions" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Analysis</CardTitle>
              <CardDescription>
                Blood donation and distribution trends over time
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {transactionsLoading ? (
                <Skeleton className="h-72 w-full" />
              ) : (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Transactions by Blood Type</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={transactionData.byBloodType}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="donations" fill="#4CAF50" name="Donations" />
                        <Bar dataKey="distributions" fill="#E53935" name="Distributions" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Transaction Activity Over Time</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={transactionData.byDay}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name"
                          tickFormatter={(value) => {
                            // Show only few dates for clarity
                            const date = new Date(value);
                            return date.getDate() % 5 === 0 ? date.getDate().toString() : '';
                          }}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="donations" 
                          stroke="#4CAF50" 
                          name="Donations"
                          activeDot={{ r: 8 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="distributions" 
                          stroke="#E53935" 
                          name="Distributions"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Total Transactions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">
                          {transactions.length}
                        </div>
                        <p className="text-sm text-gray-500">
                          {timeRange === "week" ? "In the last week" : 
                           timeRange === "month" ? "In the last month" : 
                           timeRange === "year" ? "In the last year" : 
                           "All time"}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Total Units In</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-green-600">
                          {transactions
                            .filter(tx => tx.transactionType === "donation")
                            .reduce((sum, tx) => sum + tx.units, 0)}
                        </div>
                        <p className="text-sm text-gray-500">
                          Units donated
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Total Units Out</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-red-600">
                          {transactions
                            .filter(tx => tx.transactionType === "distribution")
                            .reduce((sum, tx) => sum + tx.units, 0)}
                        </div>
                        <p className="text-sm text-gray-500">
                          Units distributed
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
