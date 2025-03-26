export interface BloodTypeAvailability {
  [key: string]: number;
}

export interface DashboardMetrics {
  totalDonations: number;
  totalBloodUnits: number;
  pendingRequests: number;
  registeredDonors: number;
}

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
}

export interface Hospital {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  latitude: number | null;
  longitude: number | null;
}

export interface Donor {
  id: number;
  name: string;
  gender: string;
  bloodType: string;
  address: string | null;
  phone: string;
  email: string | null;
  dateOfBirth: string;
  lastDonation: string | null;
  eligibleToday: boolean;
  eligibleFromDate: string | null;
}

export interface Recipient {
  id: number;
  name: string;
  gender: string;
  bloodType: string;
  address: string | null;
  phone: string;
  email: string | null;
  dateOfBirth: string;
  medicalHistory: string | null;
  hospitalId: number | null;
}

export interface BloodInventory {
  id: number;
  bloodId: string;
  bloodType: string;
  units: number;
  donorId: number | null;
  donationDate: string;
  expiryDate: string;
  status: string;
}

export interface BloodRequest {
  id: number;
  requestId: string;
  hospitalId: number;
  bloodType: string;
  units: number;
  priority: "standard" | "urgent" | "emergency";
  status: "pending" | "approved" | "rejected" | "fulfilled";
  requestDate: string;
  requiredBy: string | null;
  recipientId: number | null;
  notes: string | null;
}

export interface Transaction {
  id: number;
  transactionId: string;
  type: "donation" | "distribution" | "transfer";
  bloodId: string | null;
  bloodType: string;
  units: number;
  fromId: number | null;
  fromType: string | null;
  toId: number | null;
  toType: string | null;
  requestId: number | null;
  transactionDate: string;
  status: "pending" | "completed" | "cancelled";
  notes: string | null;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: "emergency" | "alert" | "info";
  bloodType: string | null;
  relatedId: number | null;
  relatedType: string | null;
  toUserId: number | null;
  toHospitalId: number | null;
  isRead: boolean;
  createdAt: string;
}
