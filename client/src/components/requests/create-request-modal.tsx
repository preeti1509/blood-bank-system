import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { bloodTypeEnum, requestPriorityEnum } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Hospital } from "@shared/schema";

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateRequestModal({ isOpen, onClose }: CreateRequestModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state
  const [hospitalId, setHospitalId] = useState<string>("");
  const [bloodType, setBloodType] = useState<string>("");
  const [units, setUnits] = useState<string>("1");
  const [priority, setPriority] = useState<string>("standard");
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
    setUnits("1");
    setPriority("standard");
    setReason("");
    setContactPerson("");
    setContactPhone("");
  };
  
  // Handle form submission
  const createRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/requests', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Request created",
        description: "Your blood request has been submitted.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/activities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      onClose();
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Failed to create request",
        description: error.toString(),
        variant: "destructive",
      });
    }
  });
  
  const handleSubmit = () => {
    // Validate form
    if (!hospitalId || !bloodType || !units || !priority || !contactPerson || !contactPhone) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    // Submit request
    createRequestMutation.mutate({
      hospital_id: parseInt(hospitalId),
      blood_type: bloodType,
      units: parseInt(units),
      priority,
      status: "pending",
      reason,
      contact_person: contactPerson,
      contact_phone: contactPhone
    });
  };
  
  // Fill contact info when hospital is selected
  const handleHospitalChange = (id: string) => {
    setHospitalId(id);
    const hospital = hospitals?.find(h => h.id.toString() === id);
    if (hospital && hospital.contact_person) {
      setContactPerson(hospital.contact_person);
      setContactPhone(hospital.phone);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        resetForm();
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Blood Request</DialogTitle>
          <DialogDescription>
            Fill out this form to request blood for a hospital or patient.
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
                onValueChange={handleHospitalChange}
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
            <Label htmlFor="priority" className="text-right">
              Priority
            </Label>
            <div className="col-span-3">
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {requestPriorityEnum.options.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reason" className="text-right">
              Reason
            </Label>
            <Textarea
              id="reason"
              className="col-span-3"
              placeholder="Reason for the request"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contactPerson" className="text-right">
              Contact Person
            </Label>
            <Input
              id="contactPerson"
              className="col-span-3"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contactPhone" className="text-right">
              Contact Phone
            </Label>
            <Input
              id="contactPhone"
              className="col-span-3"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={createRequestMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className={priority === "emergency" ? "bg-red-600 hover:bg-red-700" : ""}
            onClick={handleSubmit}
            disabled={createRequestMutation.isPending}
          >
            {createRequestMutation.isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
