import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { bloodTypeEnum } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Hospital } from "@shared/schema";

interface EmergencyRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmergencyRequestModal({ isOpen, onClose }: EmergencyRequestModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state
  const [hospitalId, setHospitalId] = useState<string>("");
  const [bloodType, setBloodType] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [reason, setReason] = useState<string>("");
  const [contactPerson, setContactPerson] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  
  // Fetch hospitals for dropdown
  const { data: hospitals, isLoading: isLoadingHospitals } = useQuery<Hospital[]>({
    queryKey: ['/api/hospitals'],
    enabled: isOpen,
  });
  
  // Reset form when modal opens/closes
  const resetForm = () => {
    setHospitalId("");
    setBloodType("");
    setQuantity("1");
    setReason("");
    setContactPerson("");
    setContactPhone("");
  };
  
  // Handle form submission
  const emergencyRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/requests', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Emergency request submitted",
        description: "Your request has been sent to the blood bank.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/activities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      onClose();
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Failed to submit request",
        description: error.toString(),
        variant: "destructive",
      });
    }
  });
  
  const handleSubmit = () => {
    // Validate form
    if (!hospitalId || !bloodType || !quantity || !reason || !contactPerson || !contactPhone) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    // Submit request
    emergencyRequestMutation.mutate({
      hospital_id: parseInt(hospitalId),
      blood_type: bloodType,
      units: parseInt(quantity),
      priority: "emergency",
      status: "pending",
      reason,
      contact_person: contactPerson,
      contact_phone: contactPhone
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        resetForm();
      }
    }}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <span className="material-icons mr-2">emergency</span>
            Emergency Blood Request
          </DialogTitle>
          <DialogDescription>
            Fill out this form to request blood in emergency situations. This will be processed with highest priority.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="hospital" className="text-right">
              Hospital
            </Label>
            <div className="col-span-3">
              <Select 
                value={hospitalId} 
                onValueChange={setHospitalId}
                disabled={isLoadingHospitals}
              >
                <SelectTrigger id="hospital">
                  <SelectValue placeholder="Select hospital" />
                </SelectTrigger>
                <SelectContent>
                  {hospitals?.map((hospital) => (
                    <SelectItem key={hospital.id} value={hospital.id.toString()}>
                      {hospital.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
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
            <Label htmlFor="quantity" className="text-right">
              Quantity (units)
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              className="col-span-3"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reason" className="text-right">
              Emergency Reason
            </Label>
            <Textarea
              id="reason"
              className="col-span-3"
              placeholder="Describe the emergency situation"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contact" className="text-right">
              Contact Person
            </Label>
            <Input
              id="contact"
              className="col-span-3"
              placeholder="Enter name"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Contact Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              className="col-span-3"
              placeholder="Enter phone number"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={emergencyRequestMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleSubmit}
            disabled={emergencyRequestMutation.isPending}
          >
            {emergencyRequestMutation.isPending ? 
              "Submitting..." : 
              "Submit Emergency Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
