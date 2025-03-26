import {
  users, donors, hospitals, recipients, bloodInventory, bloodRequests, transactions, alerts,
  type User, type InsertUser, type Hospital, type InsertHospital, type Donor, type InsertDonor,
  type Recipient, type InsertRecipient, type BloodInventoryItem, type InsertBloodInventoryItem,
  type BloodRequest, type InsertBloodRequest, type Transaction, type InsertTransaction,
  type Alert, type InsertAlert, type BloodTypeSummary, type StatsSummary, type RecentActivity,
  type BloodType, type RequestStatus
} from "@shared/schema";
import { add, format, differenceInDays } from "date-fns";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  listUsers(): Promise<User[]>;

  // Hospital methods
  getHospital(id: number): Promise<Hospital | undefined>;
  createHospital(hospital: InsertHospital): Promise<Hospital>;
  updateHospital(id: number, hospital: Partial<InsertHospital>): Promise<Hospital | undefined>;
  listHospitals(): Promise<Hospital[]>;
  
  // Donor methods
  getDonor(id: number): Promise<Donor | undefined>;
  createDonor(donor: InsertDonor): Promise<Donor>;
  updateDonor(id: number, donor: Partial<InsertDonor>): Promise<Donor | undefined>;
  listDonors(): Promise<Donor[]>;
  
  // Recipient methods
  getRecipient(id: number): Promise<Recipient | undefined>;
  createRecipient(recipient: InsertRecipient): Promise<Recipient>;
  updateRecipient(id: number, recipient: Partial<InsertRecipient>): Promise<Recipient | undefined>;
  listRecipients(): Promise<Recipient[]>;
  
  // Blood inventory methods
  getBloodInventoryItem(id: number): Promise<BloodInventoryItem | undefined>;
  createBloodInventoryItem(item: InsertBloodInventoryItem): Promise<BloodInventoryItem>;
  updateBloodInventoryItem(id: number, item: Partial<InsertBloodInventoryItem>): Promise<BloodInventoryItem | undefined>;
  listBloodInventory(): Promise<BloodInventoryItem[]>;
  getBloodTypeSummary(): Promise<BloodTypeSummary[]>;
  
  // Blood request methods
  getBloodRequest(id: number): Promise<BloodRequest | undefined>;
  createBloodRequest(request: InsertBloodRequest): Promise<BloodRequest>;
  updateBloodRequest(id: number, request: Partial<InsertBloodRequest>): Promise<BloodRequest | undefined>;
  listBloodRequests(status?: RequestStatus): Promise<BloodRequest[]>;
  
  // Transaction methods
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  listTransactions(): Promise<Transaction[]>;
  
  // Alert methods
  getAlert(id: number): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: number, alert: Partial<InsertAlert>): Promise<Alert | undefined>;
  listAlerts(activeOnly?: boolean): Promise<Alert[]>;

  // Dashboard methods
  getStatsSummary(): Promise<StatsSummary>;
  getRecentActivities(limit?: number): Promise<RecentActivity[]>;
}

export class MemStorage implements IStorage {
  // Storage maps
  private usersMap: Map<number, User>;
  private hospitalsMap: Map<number, Hospital>;
  private donorsMap: Map<number, Donor>;
  private recipientsMap: Map<number, Recipient>;
  private bloodInventoryMap: Map<number, BloodInventoryItem>;
  private bloodRequestsMap: Map<number, BloodRequest>;
  private transactionsMap: Map<number, Transaction>;
  private alertsMap: Map<number, Alert>;
  
  // Current IDs for auto-increment
  private currentUserID: number;
  private currentHospitalID: number;
  private currentDonorID: number;
  private currentRecipientID: number;
  private currentBloodInventoryID: number;
  private currentBloodRequestID: number;
  private currentTransactionID: number;
  private currentAlertID: number;

  constructor() {
    // Initialize storage maps
    this.usersMap = new Map();
    this.hospitalsMap = new Map();
    this.donorsMap = new Map();
    this.recipientsMap = new Map();
    this.bloodInventoryMap = new Map();
    this.bloodRequestsMap = new Map();
    this.transactionsMap = new Map();
    this.alertsMap = new Map();
    
    // Initialize IDs
    this.currentUserID = 1;
    this.currentHospitalID = 1;
    this.currentDonorID = 1;
    this.currentRecipientID = 1;
    this.currentBloodInventoryID = 1;
    this.currentBloodRequestID = 1;
    this.currentTransactionID = 1;
    this.currentAlertID = 1;

    // Add seed data
    this.seedData();
  }

  // Seed initial data for demonstration
  private seedData() {
    // Create a default admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      name: "Admin User",
      email: "admin@bloodbank.com",
      phone: "555-1234",
      role: "admin"
    });

    // Create some hospitals
    const hospitals = [
      {
        name: "General Hospital",
        address: "123 Main St",
        city: "Springfield",
        state: "IL",
        zip: "62701",
        phone: "555-1000",
        email: "info@generalhospital.com",
        contact_person: "Dr. John Smith",
        status: "active"
      },
      {
        name: "Memorial Hospital",
        address: "456 Oak Ave",
        city: "Springfield",
        state: "IL",
        zip: "62702",
        phone: "555-2000",
        email: "info@memorialhospital.com",
        contact_person: "Dr. Sarah Johnson",
        status: "active"
      },
      {
        name: "City Medical Center",
        address: "789 Elm St",
        city: "Springfield",
        state: "IL",
        zip: "62703",
        phone: "555-3000",
        email: "info@citymedical.com",
        contact_person: "Dr. David Lee",
        status: "active"
      }
    ];

    hospitals.forEach(hospital => this.createHospital(hospital as InsertHospital));

    // Create some donors
    const donors = [
      {
        first_name: "John",
        last_name: "Doe",
        blood_type: "A+" as BloodType,
        date_of_birth: new Date("1985-05-15"),
        gender: "male",
        phone: "555-4001",
        email: "john.doe@example.com",
        address: "101 Pine St",
        city: "Springfield",
        state: "IL",
        zip: "62704",
        last_donation_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        is_eligible: true,
        next_eligible_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days in future
      },
      {
        first_name: "Jane",
        last_name: "Smith",
        blood_type: "O-" as BloodType,
        date_of_birth: new Date("1990-08-22"),
        gender: "female",
        phone: "555-4002",
        email: "jane.smith@example.com",
        address: "202 Maple Ave",
        city: "Springfield",
        state: "IL",
        zip: "62704",
        last_donation_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        is_eligible: true,
        next_eligible_date: null
      },
      {
        first_name: "Robert",
        last_name: "Johnson",
        blood_type: "B+" as BloodType,
        date_of_birth: new Date("1978-11-10"),
        gender: "male",
        phone: "555-4003",
        email: "robert.johnson@example.com",
        address: "303 Cedar Ln",
        city: "Springfield",
        state: "IL",
        zip: "62705",
        last_donation_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        is_eligible: false,
        eligibility_reason: "Recent medication",
        next_eligible_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days in future
      }
    ];

    donors.forEach(donor => this.createDonor(donor as InsertDonor));

    // Add blood inventory
    const bloodTypes: BloodType[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    const baseDate = new Date();
    
    // A+ (good supply)
    for (let i = 0; i < 45; i++) {
      this.createBloodInventoryItem({
        blood_type: "A+",
        units: 1,
        donation_date: add(baseDate, { days: -Math.floor(Math.random() * 20) }),
        expiry_date: add(baseDate, { days: 35 + Math.floor(Math.random() * 10) }),
        status: "available",
        donor_id: i % 3 === 0 ? 1 : (i % 3 === 1 ? 2 : 3)
      });
    }
    
    // B+ (medium supply)
    for (let i = 0; i < 32; i++) {
      this.createBloodInventoryItem({
        blood_type: "B+",
        units: 1,
        donation_date: add(baseDate, { days: -Math.floor(Math.random() * 20) }),
        expiry_date: add(baseDate, { days: 35 + Math.floor(Math.random() * 10) }),
        status: "available",
        donor_id: i % 3 === 0 ? 1 : (i % 3 === 1 ? 2 : 3)
      });
    }
    
    // AB+ (medium supply)
    for (let i = 0; i < 28; i++) {
      this.createBloodInventoryItem({
        blood_type: "AB+",
        units: 1,
        donation_date: add(baseDate, { days: -Math.floor(Math.random() * 20) }),
        expiry_date: add(baseDate, { days: 35 + Math.floor(Math.random() * 10) }),
        status: "available",
        donor_id: i % 3 === 0 ? 1 : (i % 3 === 1 ? 2 : 3)
      });
    }
    
    // O- (critical supply)
    for (let i = 0; i < 8; i++) {
      this.createBloodInventoryItem({
        blood_type: "O-",
        units: 1,
        donation_date: add(baseDate, { days: -Math.floor(Math.random() * 20) }),
        expiry_date: add(baseDate, { days: 35 + Math.floor(Math.random() * 10) }),
        status: "available",
        donor_id: i % 3 === 0 ? 1 : (i % 3 === 1 ? 2 : 3)
      });
    }
    
    // Add some blood requests
    const requests = [
      {
        hospital_id: 1,
        blood_type: "O-" as BloodType,
        units: 5,
        priority: "emergency",
        status: "pending",
        reason: "Trauma patient with severe bleeding",
        contact_person: "Dr. John Smith",
        contact_phone: "555-1001"
      },
      {
        hospital_id: 2,
        blood_type: "A+" as BloodType,
        units: 3,
        priority: "standard",
        status: "pending",
        reason: "Scheduled surgery",
        contact_person: "Dr. Sarah Johnson",
        contact_phone: "555-2001"
      },
      {
        hospital_id: 3,
        blood_type: "B+" as BloodType,
        units: 2,
        priority: "standard",
        status: "pending",
        reason: "Anemic patient",
        contact_person: "Dr. David Lee",
        contact_phone: "555-3001"
      }
    ];
    
    requests.forEach(request => this.createBloodRequest(request as InsertBloodRequest));
    
    // Add some transactions
    const transactions = [
      {
        transaction_type: "donation",
        blood_type: "A+" as BloodType,
        units: 1,
        source: "1", // donor_id
        destination: "inventory",
        notes: "Regular donation",
        performed_by: 1 // admin user
      },
      {
        transaction_type: "donation",
        blood_type: "O-" as BloodType,
        units: 1,
        source: "2", // donor_id
        destination: "inventory",
        notes: "Regular donation",
        performed_by: 1 // admin user
      },
      {
        transaction_type: "distribution",
        blood_type: "B+" as BloodType,
        units: 2,
        source: "inventory",
        destination: "2", // hospital_id
        notes: "For scheduled surgery",
        performed_by: 1 // admin user
      }
    ];
    
    transactions.forEach(transaction => this.createTransaction(transaction as InsertTransaction));
    
    // Add some alerts
    const alerts = [
      {
        alert_type: "critical_shortage",
        message: "Critical shortage of O- blood type",
        blood_type: "O-",
        level: "critical",
        is_active: true,
        expires_at: add(baseDate, { days: 7 })
      },
      {
        alert_type: "expiring_soon",
        message: "10 units of AB+ blood expiring in 5 days",
        blood_type: "AB+",
        level: "warning",
        is_active: true,
        expires_at: add(baseDate, { days: 5 })
      },
      {
        alert_type: "new_request",
        message: "New emergency request from General Hospital",
        level: "info",
        is_active: true,
        expires_at: add(baseDate, { days: 1 })
      }
    ];
    
    alerts.forEach(alert => this.createAlert(alert as InsertAlert));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.usersMap.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserID++;
    const newUser: User = {
      ...user,
      id,
      created_at: new Date()
    };
    this.usersMap.set(id, newUser);
    return newUser;
  }

  async listUsers(): Promise<User[]> {
    return Array.from(this.usersMap.values());
  }

  // Hospital methods
  async getHospital(id: number): Promise<Hospital | undefined> {
    return this.hospitalsMap.get(id);
  }

  async createHospital(hospital: InsertHospital): Promise<Hospital> {
    const id = this.currentHospitalID++;
    const newHospital: Hospital = {
      ...hospital,
      id,
      created_at: new Date()
    };
    this.hospitalsMap.set(id, newHospital);
    return newHospital;
  }

  async updateHospital(id: number, hospital: Partial<InsertHospital>): Promise<Hospital | undefined> {
    const existingHospital = this.hospitalsMap.get(id);
    if (!existingHospital) {
      return undefined;
    }
    
    const updatedHospital: Hospital = {
      ...existingHospital,
      ...hospital
    };
    
    this.hospitalsMap.set(id, updatedHospital);
    return updatedHospital;
  }

  async listHospitals(): Promise<Hospital[]> {
    return Array.from(this.hospitalsMap.values());
  }

  // Donor methods
  async getDonor(id: number): Promise<Donor | undefined> {
    return this.donorsMap.get(id);
  }

  async createDonor(donor: InsertDonor): Promise<Donor> {
    const id = this.currentDonorID++;
    const newDonor: Donor = {
      ...donor,
      id,
      created_at: new Date()
    };
    this.donorsMap.set(id, newDonor);
    return newDonor;
  }

  async updateDonor(id: number, donor: Partial<InsertDonor>): Promise<Donor | undefined> {
    const existingDonor = this.donorsMap.get(id);
    if (!existingDonor) {
      return undefined;
    }
    
    const updatedDonor: Donor = {
      ...existingDonor,
      ...donor
    };
    
    this.donorsMap.set(id, updatedDonor);
    return updatedDonor;
  }

  async listDonors(): Promise<Donor[]> {
    return Array.from(this.donorsMap.values());
  }

  // Recipient methods
  async getRecipient(id: number): Promise<Recipient | undefined> {
    return this.recipientsMap.get(id);
  }

  async createRecipient(recipient: InsertRecipient): Promise<Recipient> {
    const id = this.currentRecipientID++;
    const newRecipient: Recipient = {
      ...recipient,
      id,
      created_at: new Date()
    };
    this.recipientsMap.set(id, newRecipient);
    return newRecipient;
  }

  async updateRecipient(id: number, recipient: Partial<InsertRecipient>): Promise<Recipient | undefined> {
    const existingRecipient = this.recipientsMap.get(id);
    if (!existingRecipient) {
      return undefined;
    }
    
    const updatedRecipient: Recipient = {
      ...existingRecipient,
      ...recipient
    };
    
    this.recipientsMap.set(id, updatedRecipient);
    return updatedRecipient;
  }

  async listRecipients(): Promise<Recipient[]> {
    return Array.from(this.recipientsMap.values());
  }

  // Blood inventory methods
  async getBloodInventoryItem(id: number): Promise<BloodInventoryItem | undefined> {
    return this.bloodInventoryMap.get(id);
  }

  async createBloodInventoryItem(item: InsertBloodInventoryItem): Promise<BloodInventoryItem> {
    const id = this.currentBloodInventoryID++;
    const now = new Date();
    const newItem: BloodInventoryItem = {
      ...item,
      id,
      created_at: now,
      updated_at: now
    };
    this.bloodInventoryMap.set(id, newItem);
    return newItem;
  }

  async updateBloodInventoryItem(id: number, item: Partial<InsertBloodInventoryItem>): Promise<BloodInventoryItem | undefined> {
    const existingItem = this.bloodInventoryMap.get(id);
    if (!existingItem) {
      return undefined;
    }
    
    const updatedItem: BloodInventoryItem = {
      ...existingItem,
      ...item,
      updated_at: new Date()
    };
    
    this.bloodInventoryMap.set(id, updatedItem);
    return updatedItem;
  }

  async listBloodInventory(): Promise<BloodInventoryItem[]> {
    return Array.from(this.bloodInventoryMap.values());
  }

  async getBloodTypeSummary(): Promise<BloodTypeSummary[]> {
    const bloodTypes: BloodType[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    const inventory = Array.from(this.bloodInventoryMap.values())
      .filter(item => item.status === "available");
    
    const totalUnits = inventory.reduce((sum, item) => sum + item.units, 0);
    
    const summary: BloodTypeSummary[] = bloodTypes.map(bloodType => {
      const bloodTypeItems = inventory.filter(item => item.blood_type === bloodType);
      const units = bloodTypeItems.reduce((sum, item) => sum + item.units, 0);
      
      // Find expiring units (within next 7 days)
      const now = new Date();
      const expiringItems = bloodTypeItems.filter(item => {
        const daysUntilExpiry = differenceInDays(item.expiry_date, now);
        return daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
      });
      
      const expiringUnits = expiringItems.reduce((sum, item) => sum + item.units, 0);
      
      // Find the earliest expiry
      let expiringDays = 0;
      if (expiringItems.length > 0) {
        const earliestExpiry = expiringItems.reduce((earliest, item) => 
          item.expiry_date < earliest ? item.expiry_date : earliest, 
          expiringItems[0].expiry_date
        );
        expiringDays = Math.max(0, differenceInDays(earliestExpiry, now));
      }
      
      return {
        bloodType,
        units,
        percentage: totalUnits > 0 ? (units / totalUnits) * 100 : 0,
        expiringUnits,
        expiringDays,
        isCritical: units < 10 // Consider critical if less than 10 units
      };
    });
    
    return summary;
  }

  // Blood request methods
  async getBloodRequest(id: number): Promise<BloodRequest | undefined> {
    return this.bloodRequestsMap.get(id);
  }

  async createBloodRequest(request: InsertBloodRequest): Promise<BloodRequest> {
    const id = this.currentBloodRequestID++;
    const now = new Date();
    const newRequest: BloodRequest = {
      ...request,
      id,
      created_at: now,
      updated_at: now,
      fulfilled_at: null
    };
    this.bloodRequestsMap.set(id, newRequest);
    return newRequest;
  }

  async updateBloodRequest(id: number, request: Partial<InsertBloodRequest>): Promise<BloodRequest | undefined> {
    const existingRequest = this.bloodRequestsMap.get(id);
    if (!existingRequest) {
      return undefined;
    }
    
    const updatedRequest: BloodRequest = {
      ...existingRequest,
      ...request,
      updated_at: new Date(),
      fulfilled_at: request.status === "fulfilled" ? new Date() : existingRequest.fulfilled_at
    };
    
    this.bloodRequestsMap.set(id, updatedRequest);
    return updatedRequest;
  }

  async listBloodRequests(status?: RequestStatus): Promise<BloodRequest[]> {
    const requests = Array.from(this.bloodRequestsMap.values());
    return status ? requests.filter(req => req.status === status) : requests;
  }

  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactionsMap.get(id);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionID++;
    const newTransaction: Transaction = {
      ...transaction,
      id,
      created_at: new Date()
    };
    this.transactionsMap.set(id, newTransaction);
    return newTransaction;
  }

  async listTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactionsMap.values());
  }

  // Alert methods
  async getAlert(id: number): Promise<Alert | undefined> {
    return this.alertsMap.get(id);
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const id = this.currentAlertID++;
    const newAlert: Alert = {
      ...alert,
      id,
      created_at: new Date()
    };
    this.alertsMap.set(id, newAlert);
    return newAlert;
  }

  async updateAlert(id: number, alert: Partial<InsertAlert>): Promise<Alert | undefined> {
    const existingAlert = this.alertsMap.get(id);
    if (!existingAlert) {
      return undefined;
    }
    
    const updatedAlert: Alert = {
      ...existingAlert,
      ...alert
    };
    
    this.alertsMap.set(id, updatedAlert);
    return updatedAlert;
  }

  async listAlerts(activeOnly: boolean = false): Promise<Alert[]> {
    const alerts = Array.from(this.alertsMap.values());
    return activeOnly ? alerts.filter(alert => alert.is_active) : alerts;
  }

  // Dashboard methods
  async getStatsSummary(): Promise<StatsSummary> {
    const donations = Array.from(this.transactionsMap.values())
      .filter(t => t.transaction_type === "donation");
    
    const hospitals = new Set(Array.from(this.bloodRequestsMap.values())
      .map(r => r.hospital_id)).size;
    
    const activeDonors = Array.from(this.donorsMap.values())
      .filter(d => d.is_eligible).length;
    
    const pendingRequests = Array.from(this.bloodRequestsMap.values())
      .filter(r => r.status === "pending").length;
    
    return {
      totalDonations: donations.length,
      hospitalsServed: hospitals,
      activeDonors,
      pendingRequests
    };
  }

  async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    const activities: RecentActivity[] = [];
    
    // Add donation transactions
    const donations = Array.from(this.transactionsMap.values())
      .filter(t => t.transaction_type === "donation")
      .map(t => {
        const donor = this.donorsMap.get(parseInt(t.source));
        return {
          id: t.id,
          type: "donation" as const,
          title: "New donation received",
          description: `${t.units} units of ${t.blood_type} blood donated by ${donor ? `${donor.first_name} ${donor.last_name.charAt(0)}.` : 'a donor'}`,
          time: this.formatTimeAgo(t.created_at),
          timestamp: t.created_at,
          iconColor: "text-success",
          icon: "inventory"
        };
      });
    
    // Add request fulfillments
    const distributions = Array.from(this.transactionsMap.values())
      .filter(t => t.transaction_type === "distribution")
      .map(t => {
        const hospital = this.hospitalsMap.get(parseInt(t.destination));
        return {
          id: t.id + 1000, // Ensure unique ID
          type: "request" as const,
          title: "Hospital request fulfilled",
          description: `${t.units} units of ${t.blood_type} sent to ${hospital ? hospital.name : 'a hospital'}`,
          time: this.formatTimeAgo(t.created_at),
          timestamp: t.created_at,
          iconColor: "text-info",
          icon: "local_hospital"
        };
      });
    
    // Add alerts
    const alertActivities = Array.from(this.alertsMap.values())
      .filter(a => a.is_active)
      .map(a => {
        let icon = "warning";
        let iconColor = "text-warning";
        
        if (a.alert_type === "critical_shortage") {
          icon = "warning";
          iconColor = "text-danger";
        } else if (a.alert_type === "expiring_soon") {
          icon = "schedule";
          iconColor = "text-warning";
        }
        
        return {
          id: a.id + 2000, // Ensure unique ID
          type: a.alert_type === "critical_shortage" ? "alert" as const : "expiry" as const,
          title: a.alert_type === "critical_shortage" ? "Critical inventory alert" : "Expiration notice",
          description: a.message,
          time: this.formatTimeAgo(a.created_at),
          timestamp: a.created_at,
          iconColor,
          icon
        };
      });
    
    // Combine all activities and sort by timestamp (newest first)
    activities.push(...donations, ...distributions, ...alertActivities);
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return activities.slice(0, limit);
  }

  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return "just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInMinutes < 24 * 60) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / (60 * 24))} days ago`;
    }
  }
}

export const storage = new MemStorage();
