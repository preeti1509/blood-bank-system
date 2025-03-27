import { useState } from "react";
import { bloodTypeEnum } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DonorFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export default function DonorForm({ initialData, onSubmit, isSubmitting, onCancel }: DonorFormProps) {
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
  const [lastDonationDate, setLastDonationDate] = useState(initialData?.last_donation_date ? new Date(initialData.last_donation_date).toISOString().split('T')[0] : "");
  const [medicalNotes, setMedicalNotes] = useState(initialData?.medical_notes || "");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      first_name: firstName,
      last_name: lastName,
      blood_type: bloodType,
      gender,
      date_of_birth: new Date(dateOfBirth),
      phone,
      email,
      address,
      city,
      state,
      zip,
      last_donation_date: lastDonationDate ? new Date(lastDonationDate) : null,
      is_eligible: true, // Default value, adjust as needed
      medical_notes: medicalNotes,
    });
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
          <Label htmlFor="lastDonationDate">Last Donation Date</Label>
          <Input
            id="lastDonationDate"
            type="date"
            value={lastDonationDate}
            onChange={(e) => setLastDonationDate(e.target.value)}
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
          {isSubmitting ? "Saving..." : initialData ? "Update Donor" : "Add Donor"}
        </Button>
      </div>
    </form>
  );
}