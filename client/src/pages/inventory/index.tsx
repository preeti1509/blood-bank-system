import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { BloodTypeCard } from "@/components/ui/blood-type-card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { BloodCompatibilityChart } from "@/components/ui/blood-compatibility-chart";
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from "@/components/ui/alert";
import { formatDate, formatExpirationDate } from "@/lib/utils";
import { BLOOD_TYPES, BloodInventory } from "@shared/schema";
import { Search, AlertTriangle, Filter, Plus } from "lucide-react";
import { useLocation } from "wouter";

export default function InventoryPage() {
  const [_, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bloodTypeFilter, setBloodTypeFilter] = useState("all");
  const [currentTab, setCurrentTab] = useState("overview");
  
  // Get query parameter for filtered view
  const urlParams = new URLSearchParams(window.location.search);
  const filterParam = urlParams.get('filter');
  
  // Switch to expiring tab if filter parameter is set
  React.useEffect(() => {
    if (filterParam === 'expiring') {
      setCurrentTab('expiring');
    }
  }, [filterParam]);
  
  // Get blood inventory data
  const { data: inventoryItems, isLoading: isInventoryLoading } = useQuery<BloodInventory[]>({
    queryKey: ['/api/inventory'],
  });
  
  // Get inventory statistics
  const { data: inventoryStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['/api/inventory/stats'],
  });
  
  // Get expiring items separately
  const { data: expiringItems, isLoading: isExpiringLoading } = useQuery<BloodInventory[]>({
    queryKey: ['/api/inventory/expiring'],
  });
  
  // Filter inventory items based on search query and filters
  const filteredInventoryItems = inventoryItems?.filter(item => {
    // Apply search filter
    const matchesSearch = 
      item.bloodType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.transactionId.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply status filter
    const matchesStatus = 
      statusFilter === "all" || 
      item.status.toLowerCase() === statusFilter.toLowerCase();
    
    // Apply blood type filter
    const matchesBloodType = 
      bloodTypeFilter === "all" || 
      item.bloodType === bloodTypeFilter;
    
    return matchesSearch && matchesStatus && matchesBloodType;
  }) || [];
  
  // Calculate total units by blood type for overview
  const inventoryByBloodType = React.useMemo(() => {
    const result: Record<string, { units: number, percentage: number }> = {};
    
    // Initialize all blood types with zero counts
    BLOOD_TYPES.forEach(type => {
      result[type] = { units: 0, percentage: 0 };
    });
    
    if (!inventoryItems) return result;
    
    // Calculate total available units
    const availableItems = inventoryItems.filter(item => item.status === "available");
    let totalUnits = 0;
    
    // Sum units by blood type
    availableItems.forEach(item => {
      const type = item.bloodType;
      if (result[type]) {
        result[type].units += item.units;
        totalUnits += item.units;
      }
    });
    
    // Calculate percentages
    if (totalUnits > 0) {
      BLOOD_TYPES.forEach(type => {
        result[type].percentage = (result[type].units / totalUnits) * 100;
      });
    }
    
    return result;
  }, [inventoryItems]);
  
  // Handle search query change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Add new inventory item (via transaction)
  const handleAddInventory = () => {
    navigate("/transactions/add");
  };
  
  return (
    <DashboardLayout title="Blood Inventory">
      <Tabs defaultValue="overview" value={currentTab} onValueChange={setCurrentTab}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="inventory">Inventory Details</TabsTrigger>
            <TabsTrigger value="expiring">Expiring Units</TabsTrigger>
            <TabsTrigger value="compatibility">Compatibility Chart</TabsTrigger>
          </TabsList>
          
          <Button onClick={handleAddInventory}>
            <Plus className="mr-2 h-4 w-4" />
            Add Inventory
          </Button>
        </div>
        
        <TabsContent value="overview">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Blood Inventory Overview</CardTitle>
              <CardDescription>
                Current blood inventory levels by blood type
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <Skeleton key={index} className="h-32" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                  {BLOOD_TYPES.map((type) => {
                    const stats = inventoryByBloodType[type] || { units: 0, percentage: 0 };
                    return (
                      <BloodTypeCard
                        key={type}
                        bloodType={type}
                        units={stats.units}
                        percentage={stats.percentage}
                      />
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Critical Levels</CardTitle>
                <CardDescription>
                  Blood types with low inventory levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isStatsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton key={index} className="h-12" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(inventoryByBloodType)
                      .filter(([_, stats]) => stats.percentage < 30)
                      .sort(([_, statsA], [__, statsB]) => statsA.percentage - statsB.percentage)
                      .map(([type, stats]) => (
                        <div key={type} className="flex items-center justify-between p-3 bg-red-50 rounded-md">
                          <div className="flex items-center">
                            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                            <div>
                              <span className="font-medium">{type}</span>
                              <span className="text-sm text-gray-500 ml-2">({stats.units} units)</span>
                            </div>
                          </div>
                          <div>
                            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                              {stats.percentage.toFixed(1)}% of capacity
                            </Badge>
                          </div>
                        </div>
                      ))}
                    
                    {Object.entries(inventoryByBloodType).filter(([_, stats]) => stats.percentage < 30).length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        No blood types at critical levels.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Expiring Soon</CardTitle>
                <CardDescription>
                  Units that need to be used quickly
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isExpiringLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton key={index} className="h-16" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {expiringItems && expiringItems.length > 0 ? (
                      expiringItems.slice(0, 5).map((item) => {
                        const { daysLeft, status } = formatExpirationDate(item.expirationDate);
                        const borderColor = status === 'critical' ? 'border-error' : 'border-warning';
                        
                        return (
                          <div key={item.id} className={`border-l-4 ${borderColor} pl-4 py-2`}>
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold text-gray-800">{item.bloodType}</span>
                              <span className={`text-sm ${status === 'critical' ? 'bg-error' : 'bg-warning'} text-white px-2 py-1 rounded-md`}>
                                {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              <span>{item.units} units from {item.source}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              <span>ID: {item.transactionId}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        No blood units expiring soon.
                      </div>
                    )}
                    
                    {expiringItems && expiringItems.length > 5 && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setCurrentTab('expiring')}
                      >
                        View All Expiring Units
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Details</CardTitle>
              <CardDescription>
                Detailed view of all blood inventory items
              </CardDescription>
              <div className="flex flex-col md:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search by blood type or ID..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="w-[160px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={bloodTypeFilter}
                    onValueChange={setBloodTypeFilter}
                  >
                    <SelectTrigger className="w-[160px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {BLOOD_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isInventoryLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-12" />
                  ))}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Blood Type</TableHead>
                        <TableHead>Units</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Donation Date</TableHead>
                        <TableHead>Expiration Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInventoryItems.length > 0 ? (
                        filteredInventoryItems.map((item) => {
                          const { formattedDate, daysLeft, status } = formatExpirationDate(item.expirationDate);
                          
                          return (
                            <TableRow key={item.id}>
                              <TableCell>
                                <Badge className="bg-red-100 text-red-800 border-none">
                                  {item.bloodType}
                                </Badge>
                              </TableCell>
                              <TableCell>{item.units}</TableCell>
                              <TableCell>{item.source}</TableCell>
                              <TableCell>{formatDate(item.donationDate)}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  {formattedDate}
                                  {status !== 'good' && (
                                    <Badge 
                                      variant="outline" 
                                      className={`ml-2 ${
                                        status === 'critical' 
                                          ? 'bg-red-100 text-red-800 border-red-200' 
                                          : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                      }`}
                                    >
                                      {daysLeft} days left
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={
                                    item.status === 'available' 
                                      ? 'bg-green-100 text-green-800 border-green-200' 
                                      : item.status === 'reserved'
                                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                                      : 'bg-red-100 text-red-800 border-red-200'
                                  }
                                >
                                  {item.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {item.transactionId}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                            No inventory items found matching your criteria.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expiring">
          <Card>
            <CardHeader>
              <CardTitle>Expiring Blood Units</CardTitle>
              <CardDescription>
                Blood units that are nearing their expiration date
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isExpiringLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-16" />
                  ))}
                </div>
              ) : (
                <>
                  {expiringItems && expiringItems.length > 0 ? (
                    <div className="space-y-4">
                      {expiringItems.map((item) => {
                        const { daysLeft, status } = formatExpirationDate(item.expirationDate);
                        const borderColor = status === 'critical' ? 'border-error' : 'border-warning';
                        
                        return (
                          <div key={item.id} className={`border-l-4 ${borderColor} pl-4 py-3 bg-gray-50 rounded-r-md`}>
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center">
                                  <span className="text-lg font-bold text-gray-800 mr-2">{item.bloodType}</span>
                                  <span className="text-sm text-gray-600">({item.units} units)</span>
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  <span>Source: {item.source}</span>
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  <span>Donated: {formatDate(item.donationDate)}</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  <span>ID: {item.transactionId}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`inline-block text-sm ${status === 'critical' ? 'bg-error' : 'bg-warning'} text-white px-3 py-1 rounded-md font-medium`}>
                                  Expires in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
                                </span>
                                <div className="text-sm text-gray-600 mt-2">
                                  Expiration: {formatDate(item.expirationDate)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Time-sensitive inventory</AlertTitle>
                        <AlertDescription>
                          These units should be prioritized for use in upcoming transfusions or transferred to facilities with higher demand.
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">No expiring units</h3>
                      <p className="text-gray-500 mt-1 max-w-md mx-auto">
                        There are currently no blood units nearing their expiration date within the next 7 days.
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="compatibility">
          <Card>
            <CardHeader>
              <CardTitle>Blood Type Compatibility Chart</CardTitle>
              <CardDescription>
                Reference for determining compatible blood types for transfusions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BloodCompatibilityChart />
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Universal Donor & Recipient</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-md border border-green-100">
                      <div className="font-medium text-green-800 mb-1">O- (Universal Donor)</div>
                      <p className="text-green-700 text-sm">
                        People with O- blood can donate red blood cells to anyone, making it the most versatile blood type for emergency situations.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
                      <div className="font-medium text-blue-800 mb-1">AB+ (Universal Recipient)</div>
                      <p className="text-blue-700 text-sm">
                        People with AB+ blood can receive red blood cells from any blood type, making them universal recipients.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Current Inventory Status</h3>
                  <div className="space-y-2">
                    {isStatsLoading ? (
                      Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="h-12" />
                      ))
                    ) : (
                      BLOOD_TYPES.map((type) => {
                        const stats = inventoryByBloodType[type] || { units: 0, percentage: 0 };
                        let statusColor = "bg-green-100 text-green-800";
                        
                        if (stats.percentage < 20) {
                          statusColor = "bg-red-100 text-red-800";
                        } else if (stats.percentage < 50) {
                          statusColor = "bg-yellow-100 text-yellow-800";
                        }
                        
                        return (
                          <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div className="font-medium">{type}</div>
                            <div className="flex items-center space-x-3">
                              <div>{stats.units} units</div>
                              <Badge className={statusColor}>
                                {stats.percentage.toFixed(1)}%
                              </Badge>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
