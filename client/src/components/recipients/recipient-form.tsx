import { useState } from "react";
import { bloodTypeEnum } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

interface RecipientFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export default function RecipientForm({ initialData, onSubmit, isSubmitting, onCancel }: RecipientFormProps) {
  const [firstName, setFirstName] = useState(initialData?.first_name || "");
  const [lastName, setLastName] = useState(initialData?.last_name || "");
  const [bloodType, setBloodType] = useState(initialData?.blood_type || "");
  const [gender, setGender] = useState(initialData?.gender || "");
  const [dateOfBirth, setDateOfBirth] = useState(initialData?.date_of_birth ? new Date(initialData.date_of_birth).toISOString().split('T')[0] : "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [city, setCity] = useState(initialData?.city || "");
  const [state, setState] = useState(initialData?.state || "");
  const [zip, setZip] = useState(initialData?.zip || "");
  const [hospitalId, setHospitalId] = useState(initialData?.hospital_id?.toString() || "");
  const [medicalNotes, setMedicalNotes] = useState(initialData?.medical_notes || "");
  
  // Fetch hospitals for dropdown
  const { data: hospitals } = useQuery({
    queryKey: ['/api/hospitals']
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation check
    if (!firstName || !lastName || !bloodType || !gender || !dateOfBirth || !phone) {
      return;
    }
    
    try {
      // Parse dates using Date constructor
      const birthDate = new Date(dateOfBirth);
      
      // Validate the date - will throw if invalid
      if (isNaN(birthDate.getTime())) {
        throw new Error("Invalid date of birth");
      }
      
      onSubmit({
        first_name: firstName,
        last_name: lastName,
        blood_type: bloodType,
        gender,
        date_of_birth: birthDate,
        phone,
        email: email || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zip: zip || null,
        hospital_id: hospitalId ? parseInt(hospitalId) : null,
        medical_notes: medicalNotes || null
      });
    } catch (error) {
      console.error("Form submission error:", error);
      // You could show an error toast here if needed
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bloodType">Blood Type</Label>
          <Select value={bloodType} onValueChange={setBloodType} required>
            <SelectTrigger id="bloodType">
              <SelectValue placeholder="Select blood type" />
            </SelectTrigger>
            <SelectContent>
              {bloodTypeEnum.options.map((type) => (
                <SelectItem key={type} value={type || ""}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email (Optional)</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="zip">ZIP Code</Label>
          <Input
            id="zip"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="hospitalId">Associated Hospital (Optional)</Label>
          <Select value={hospitalId} onValueChange={setHospitalId}>
            <SelectTrigger id="hospitalId">
              <SelectValue placeholder="Select hospital" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {hospitals?.map((hospital: any) => (
                <SelectItem key={hospital.id} value={hospital.id.toString()}>
                  {hospital.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="medicalNotes">Medical Notes (Optional)</Label>
        <Textarea
          id="medicalNotes"
          value={medicalNotes}
          onChange={(e) => setMedicalNotes(e.target.value)}
          className="h-24"
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : initialData ? "Update Recipient" : "Add Recipient"}
        </Button>
      </div>
    </form>
  );
}