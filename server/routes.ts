import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { bloodTypeEnum, requestPriorityEnum, requestStatusEnum, 
  insertUserSchema, insertHospitalSchema, insertDonorSchema, 
  insertRecipientSchema, insertBloodInventorySchema, 
  insertBloodRequestSchema, insertTransactionSchema, insertAlertSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handling middleware for Zod validation errors
  const validateRequest = (schema: any) => {
    return (req: Request, res: Response, next: any) => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          return res.status(400).json({ 
            error: "Validation Error", 
            message: validationError.message
          });
        }
        next(error);
      }
    };
  };

  // === Dashboard API Routes ===
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getStatsSummary();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/blood-summary", async (req, res) => {
    try {
      const summary = await storage.getBloodTypeSummary();
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blood inventory summary" });
    }
  });

  app.get("/api/dashboard/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getRecentActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent activities" });
    }
  });

  // === User API Routes ===
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.listUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/users", validateRequest(insertUserSchema), async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // === Hospital API Routes ===
  app.get("/api/hospitals", async (req, res) => {
    try {
      const hospitals = await storage.listHospitals();
      res.json(hospitals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch hospitals" });
    }
  });

  app.get("/api/hospitals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const hospital = await storage.getHospital(id);
      if (!hospital) {
        return res.status(404).json({ error: "Hospital not found" });
      }
      res.json(hospital);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch hospital" });
    }
  });

  app.post("/api/hospitals", validateRequest(insertHospitalSchema), async (req, res) => {
    try {
      const hospital = await storage.createHospital(req.body);
      res.status(201).json(hospital);
    } catch (error) {
      res.status(500).json({ error: "Failed to create hospital" });
    }
  });

  app.patch("/api/hospitals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const hospital = await storage.updateHospital(id, req.body);
      if (!hospital) {
        return res.status(404).json({ error: "Hospital not found" });
      }
      res.json(hospital);
    } catch (error) {
      res.status(500).json({ error: "Failed to update hospital" });
    }
  });

  // === Donor API Routes ===
  app.get("/api/donors", async (req, res) => {
    try {
      const donors = await storage.listDonors();
      res.json(donors);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch donors" });
    }
  });

  app.get("/api/donors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const donor = await storage.getDonor(id);
      if (!donor) {
        return res.status(404).json({ error: "Donor not found" });
      }
      res.json(donor);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch donor" });
    }
  });

  app.post("/api/donors", async (req, res) => {
    try {
      // For date fields, validate and ensure they are Date objects
      if (req.body.date_of_birth && typeof req.body.date_of_birth === 'string') {
        req.body.date_of_birth = new Date(req.body.date_of_birth);
      }
      
      if (req.body.last_donation_date && typeof req.body.last_donation_date === 'string') {
        req.body.last_donation_date = new Date(req.body.last_donation_date);
      }
      
      if (req.body.next_eligible_date && typeof req.body.next_eligible_date === 'string') {
        req.body.next_eligible_date = new Date(req.body.next_eligible_date);
      }
      
      // Now validate with the schema
      try {
        req.body = insertDonorSchema.parse(req.body);
      } catch (error) {
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          return res.status(400).json({ 
            error: "Validation Error", 
            message: validationError.message
          });
        }
        throw error;
      }
      
      const donor = await storage.createDonor(req.body);
      res.status(201).json(donor);
    } catch (error) {
      console.error("Error creating donor:", error);
      res.status(500).json({ error: "Failed to create donor" });
    }
  });

  app.patch("/api/donors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const donor = await storage.updateDonor(id, req.body);
      if (!donor) {
        return res.status(404).json({ error: "Donor not found" });
      }
      res.json(donor);
    } catch (error) {
      res.status(500).json({ error: "Failed to update donor" });
    }
  });

  // === Recipient API Routes ===
  app.get("/api/recipients", async (req, res) => {
    try {
      const recipients = await storage.listRecipients();
      res.json(recipients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recipients" });
    }
  });

  app.get("/api/recipients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const recipient = await storage.getRecipient(id);
      if (!recipient) {
        return res.status(404).json({ error: "Recipient not found" });
      }
      res.json(recipient);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recipient" });
    }
  });

  app.post("/api/recipients", async (req, res) => {
    try {
      // For date fields, validate and ensure they are Date objects
      if (req.body.date_of_birth && typeof req.body.date_of_birth === 'string') {
        req.body.date_of_birth = new Date(req.body.date_of_birth);
      }
      
      // Now validate with the schema
      try {
        req.body = insertRecipientSchema.parse(req.body);
      } catch (error) {
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          return res.status(400).json({ 
            error: "Validation Error", 
            message: validationError.message
          });
        }
        throw error;
      }
      
      const recipient = await storage.createRecipient(req.body);
      res.status(201).json(recipient);
    } catch (error) {
      console.error("Error creating recipient:", error);
      res.status(500).json({ error: "Failed to create recipient" });
    }
  });

  app.patch("/api/recipients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const recipient = await storage.updateRecipient(id, req.body);
      if (!recipient) {
        return res.status(404).json({ error: "Recipient not found" });
      }
      res.json(recipient);
    } catch (error) {
      res.status(500).json({ error: "Failed to update recipient" });
    }
  });

  // === Blood Inventory API Routes ===
  app.get("/api/inventory", async (req, res) => {
    try {
      const inventory = await storage.listBloodInventory();
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });

  app.get("/api/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getBloodInventoryItem(id);
      if (!item) {
        return res.status(404).json({ error: "Inventory item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory item" });
    }
  });

  app.post("/api/inventory", validateRequest(insertBloodInventorySchema), async (req, res) => {
    try {
      const item = await storage.createBloodInventoryItem(req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to create inventory item" });
    }
  });

  app.patch("/api/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.updateBloodInventoryItem(id, req.body);
      if (!item) {
        return res.status(404).json({ error: "Inventory item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update inventory item" });
    }
  });

  // === Blood Request API Routes ===
  app.get("/api/requests", async (req, res) => {
    try {
      const status = req.query.status as string;
      let requests;
      
      if (status && requestStatusEnum.options.includes(status as any)) {
        requests = await storage.listBloodRequests(status as any);
      } else {
        requests = await storage.listBloodRequests();
      }
      
      // Enrich with hospital data
      const enrichedRequests = await Promise.all(requests.map(async (request) => {
        const hospital = await storage.getHospital(request.hospital_id);
        return {
          ...request,
          hospital: hospital ? {
            id: hospital.id,
            name: hospital.name,
            contact_person: hospital.contact_person
          } : null
        };
      }));
      
      res.json(enrichedRequests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch requests" });
    }
  });

  app.get("/api/requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const request = await storage.getBloodRequest(id);
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }
      
      const hospital = await storage.getHospital(request.hospital_id);
      
      res.json({
        ...request,
        hospital: hospital ? {
          id: hospital.id,
          name: hospital.name,
          contact_person: hospital.contact_person
        } : null
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch request" });
    }
  });

  app.post("/api/requests", validateRequest(insertBloodRequestSchema), async (req, res) => {
    try {
      const request = await storage.createBloodRequest(req.body);
      
      // Create an alert for emergency requests
      if (req.body.priority === "emergency") {
        await storage.createAlert({
          alert_type: "new_request",
          message: `Emergency request for ${req.body.units} units of ${req.body.blood_type} blood`,
          blood_type: req.body.blood_type,
          level: "critical",
          is_active: true,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });
      }
      
      const hospital = await storage.getHospital(request.hospital_id);
      
      res.status(201).json({
        ...request,
        hospital: hospital ? {
          id: hospital.id,
          name: hospital.name,
          contact_person: hospital.contact_person
        } : null
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create request" });
    }
  });

  app.patch("/api/requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const request = await storage.updateBloodRequest(id, req.body);
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }
      
      // If the request is being fulfilled, create a transaction
      if (req.body.status === "fulfilled" && request.status === "fulfilled") {
        const userId = req.body.performed_by || 1; // Default to admin user if not specified
        
        // Create a distribution transaction
        await storage.createTransaction({
          transaction_type: "distribution",
          blood_type: request.blood_type,
          units: request.units,
          source: "inventory",
          destination: request.hospital_id.toString(),
          request_id: request.id,
          notes: `Fulfilling request #${request.id}`,
          performed_by: userId
        });
      }
      
      const hospital = await storage.getHospital(request.hospital_id);
      
      res.json({
        ...request,
        hospital: hospital ? {
          id: hospital.id,
          name: hospital.name,
          contact_person: hospital.contact_person
        } : null
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update request" });
    }
  });

  // === Transaction API Routes ===
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.listTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.getTransaction(id);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transaction" });
    }
  });

  app.post("/api/transactions", validateRequest(insertTransactionSchema), async (req, res) => {
    try {
      const transaction = await storage.createTransaction(req.body);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to create transaction" });
    }
  });

  // === Alert API Routes ===
  app.get("/api/alerts", async (req, res) => {
    try {
      const activeOnly = req.query.active === "true";
      const alerts = await storage.listAlerts(activeOnly);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  app.get("/api/alerts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const alert = await storage.getAlert(id);
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alert" });
    }
  });

  app.post("/api/alerts", validateRequest(insertAlertSchema), async (req, res) => {
    try {
      const alert = await storage.createAlert(req.body);
      res.status(201).json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to create alert" });
    }
  });

  app.patch("/api/alerts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const alert = await storage.updateAlert(id, req.body);
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to update alert" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
