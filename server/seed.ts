import { db } from "./db";
import { 
  users, hospitals, donors, bloodInventory, bloodRequests, transactions, alerts,
  type BloodType, userRoleEnum
} from "@shared/schema";
import { add } from "date-fns";

export async function seedDatabase() {
  console.log("Seeding database...");

  // Check if any data already exists
  const existingUsers = await db.select({ count: { value: users.id } }).from(users);
  if (existingUsers[0]?.count?.value > 0) {
    console.log("Database already has data, skipping seed");
    return;
  }

  // Add admin user
  const [adminUser] = await db.insert(users).values({
    username: "admin",
    password: "admin123",
    name: "Admin User",
    email: "admin@bloodbank.com",
    phone: "555-1234",
    role: "admin"
  }).returning();

  console.log("Created admin user:", adminUser.id);

  // Add hospitals
  const hospitalValues = [
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

  const createdHospitals = await db.insert(hospitals).values(hospitalValues).returning();
  console.log(`Created ${createdHospitals.length} hospitals`);

  // Add donors
  const donorValues = [
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

  const createdDonors = await db.insert(donors).values(donorValues).returning();
  console.log(`Created ${createdDonors.length} donors`);

  // Add blood inventory
  const baseDate = new Date();
  const bloodTypes: BloodType[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const inventoryItems = [];

  // A+ (good supply)
  for (let i = 0; i < 45; i++) {
    inventoryItems.push({
      blood_type: "A+" as BloodType,
      units: 1,
      donation_date: add(baseDate, { days: -Math.floor(Math.random() * 20) }),
      expiry_date: add(baseDate, { days: 35 + Math.floor(Math.random() * 10) }),
      status: "available",
      donor_id: i % 3 === 0 ? 1 : (i % 3 === 1 ? 2 : 3)
    });
  }
  
  // B+ (medium supply)
  for (let i = 0; i < 32; i++) {
    inventoryItems.push({
      blood_type: "B+" as BloodType,
      units: 1,
      donation_date: add(baseDate, { days: -Math.floor(Math.random() * 20) }),
      expiry_date: add(baseDate, { days: 35 + Math.floor(Math.random() * 10) }),
      status: "available",
      donor_id: i % 3 === 0 ? 1 : (i % 3 === 1 ? 2 : 3)
    });
  }
  
  // AB+ (medium supply)
  for (let i = 0; i < 28; i++) {
    inventoryItems.push({
      blood_type: "AB+" as BloodType,
      units: 1,
      donation_date: add(baseDate, { days: -Math.floor(Math.random() * 20) }),
      expiry_date: add(baseDate, { days: 35 + Math.floor(Math.random() * 10) }),
      status: "available",
      donor_id: i % 3 === 0 ? 1 : (i % 3 === 1 ? 2 : 3)
    });
  }
  
  // O- (critical supply)
  for (let i = 0; i < 8; i++) {
    inventoryItems.push({
      blood_type: "O-" as BloodType,
      units: 1,
      donation_date: add(baseDate, { days: -Math.floor(Math.random() * 20) }),
      expiry_date: add(baseDate, { days: 35 + Math.floor(Math.random() * 10) }),
      status: "available",
      donor_id: i % 3 === 0 ? 1 : (i % 3 === 1 ? 2 : 3)
    });
  }

  const createdInventory = await db.insert(bloodInventory).values(inventoryItems).returning();
  console.log(`Created ${createdInventory.length} inventory items`);

  // Add blood requests
  const requestValues = [
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

  const createdRequests = await db.insert(bloodRequests).values(requestValues).returning();
  console.log(`Created ${createdRequests.length} blood requests`);

  // Add transactions
  const transactionValues = [
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

  const createdTransactions = await db.insert(transactions).values(transactionValues).returning();
  console.log(`Created ${createdTransactions.length} transactions`);

  // Add alerts
  const alertValues = [
    {
      alert_type: "critical_shortage",
      message: "Critical shortage of O- blood type",
      blood_type: "O-" as BloodType,
      level: "critical",
      is_active: true,
      expires_at: add(baseDate, { days: 7 })
    },
    {
      alert_type: "expiring_soon",
      message: "10 units of AB+ blood expiring in 5 days",
      blood_type: "AB+" as BloodType,
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

  const createdAlerts = await db.insert(alerts).values(alertValues).returning();
  console.log(`Created ${createdAlerts.length} alerts`);

  console.log("Database seeding completed!");
}