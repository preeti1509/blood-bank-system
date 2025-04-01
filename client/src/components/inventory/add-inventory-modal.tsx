import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { bloodTypeEnum, Donor } from "@shared/schema";
import { addDays } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddInventoryModal({ isOpen, onClose }: AddInventoryModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state
  const [bloodType, setBloodType] = useState<string>("");
  const [units, setUnits] = useState<string>("1");
  const [donationDate, setDonationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [donorId, setDonorId] = useState<string>("");
  
  // Fetch eligible donors for dropdown
  const { data: donors } = useQuery<Donor[]>({
    queryKey: ['/api/donors'],
    select: (data) => data.filter(donor => 
      donor.status === 'active' && (!donor.next_eligible_date || new Date(donor.next_eligible_date) <= new Date())
    ),
  });
  
  const eligibleDonors = donors || [];
  
  // Update expiry date when donation date changes (blood expires after 42 days)
  useEffect(() => {
    if (donationDate) {
      const newExpiryDate = addDays(new Date(donationDate), 42);
      setExpiryDate(newExpiryDate.toISOString().split('T')[0]);
    }
  }, [donationDate]);
  
  // Add inventory mutation
  const addInventoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/inventory', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `${units} units of ${bloodType} blood added to inventory`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/blood-summary'] });
      resetForm();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add inventory: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const resetForm = () => {
    setBloodType("");
    setUnits("1");
    setDonationDate(new Date().toISOString().split('T')[0]);
    setExpiryDate("");
    setDonorId("");
  };
  
  const handleSubmit = () => {
    if (!bloodType) {
      toast({
        title: "Validation Error",
        description: "Please select a blood type",
        variant: "destructive",
      });
      return;
    }
    
    if (!donationDate) {
      toast({
        title: "Validation Error",
        description: "Please enter a donation date",
        variant: "destructive",
      });
      return;
    }
    
    if (!expiryDate) {
      toast({
        title: "Validation Error",
        description: "Please enter an expiry date",
        variant: "destructive",
      });
      return;
    }
    
    // Validate units is a positive number
    const unitsNumber = parseInt(units);
    if (isNaN(unitsNumber) || unitsNumber < 1) {
      toast({
        title: "Validation Error",
        description: "Units must be a positive number",
        variant: "destructive",
      });
      return;
    }
    
    // Convert form data to API format
    const data = {
      blood_type: bloodType,
      units: unitsNumber,
      donation_date: new Date(donationDate),
      expiry_date: new Date(expiryDate),
      donor_id: donorId ? parseInt(donorId) : undefined,
      status: "available",
    };
    
    addInventoryMutation.mutate(data);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Blood to Inventory</DialogTitle>
          <DialogDescription>
            Enter details about the blood donation to add to inventory
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
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="units" className="text-right">
              Units
            </Label>
            <div className="col-span-3">
              <Input
                id="units"
                type="number"
                min="1"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="donationDate" className="text-right">
              Donation Date
            </Label>
            <div className="col-span-3">
              <Input
                id="donationDate"
                type="date"
                value={donationDate}
                onChange={(e) => setDonationDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="expiryDate" className="text-right">
              Expiry Date
            </Label>
            <div className="col-span-3">
              <Input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Default is 42 days after donation date</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="donorId" className="text-right">
              Donor
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