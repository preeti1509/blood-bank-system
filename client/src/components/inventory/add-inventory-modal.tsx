import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { bloodTypeEnum } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Donor } from "@shared/schema";
import { format, addDays } from "date-fns";

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddInventoryModal({ isOpen, onClose }: AddInventoryModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Default expiry is 42 days from today (typical for blood)
  const defaultExpiryDate = format(addDays(new Date(), 42), "yyyy-MM-dd");
  
  // Form state
  const [bloodType, setBloodType] = useState<string>("");
  const [units, setUnits] = useState<string>("1");
  const [donationDate, setDonationDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [expiryDate, setExpiryDate] = useState<string>(defaultExpiryDate);
  const [donorId, setDonorId] = useState<string>("");
  
  // Fetch donors for dropdown
  const { data: donors } = useQuery<Donor[]>({
    queryKey: ['/api/donors'],
    enabled: isOpen,
  });
  
  // Reset form when modal opens/closes
  const resetForm = () => {
    setBloodType("");
    setUnits("1");
    setDonationDate(format(new Date(), "yyyy-MM-dd"));
    setExpiryDate(defaultExpiryDate);
    setDonorId("");
  };
  
  // Handle form submission
  const addInventoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/inventory', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Inventory added",
        description: "The blood units have been added to inventory.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/blood-summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/activities'] });
      
      // Create transaction record for donation
      if (donorId) {
        createTransactionMutation.mutate({
          transaction_type: "donation",
          blood_type: bloodType,
          units: parseInt(units),
          source: donorId,
          destination: "inventory",
          notes: "Donation added to inventory",
          performed_by: 1 // Default admin user
        });
      }
      
      onClose();
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Failed to add inventory",
        description: error.toString(),
        variant: "destructive",
      });
    }
  });
  
  // Create transaction record
  const createTransactionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/transactions', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    }
  });
  
  const handleSubmit = () => {
    // Validate form
    if (!bloodType || !units || !donationDate || !expiryDate) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    // Submit request
    addInventoryMutation.mutate({
      blood_type: bloodType,
      units: parseInt(units),
      donation_date: new Date(donationDate),
      expiry_date: new Date(expiryDate),
      status: "available",
      donor_id: donorId ? parseInt(donorId) : null
    });
  };
  
  // Filter for eligible donors only
  const eligibleDonors = donors?.filter(donor => donor.is_eligible) || [];
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        resetForm();
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Blood Inventory</DialogTitle>
          <DialogDescription>
            Add blood units to the inventory. This will increase the available blood supply.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bloodType" className="text-right">
              Blood Type
            </Label>
            <div className="col-span-3">
              <Select value={bloodType} onValueChange={setBloodType}>
                <SelectTrigger id="bloodType">
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
                  {bloodTypeEnum.options.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="units" className="text-right">
              Units
            </Label>
            <Input
              id="units"
              type="number"
              min="1"
              className="col-span-3"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="donationDate" className="text-right">
              Donation Date
            </Label>
            <Input
              id="donationDate"
              type="date"
              className="col-span-3"
              value={donationDate}
              onChange={(e) => setDonationDate(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="expiryDate" className="text-right">
              Expiry Date
            </Label>
            <Input
              id="expiryDate"
              type="date"
              className="col-span-3"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="donorId" className="text-right">
              Donor (Optional)
            </Label>
            <div className="col-span-3">
              <Select value={donorId} onValueChange={setDonorId}>
                <SelectTrigger id="donorId">
                  <SelectValue placeholder="Select donor (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {eligibleDonors.map((donor) => (
                    <SelectItem key={donor.id} value={donor.id.toString()}>
                      {donor.first_name} {donor.last_name} ({donor.blood_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={addInventoryMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={addInventoryMutation.isPending}
          >
            {addInventoryMutation.isPending ? "Adding..." : "Add to Inventory"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
