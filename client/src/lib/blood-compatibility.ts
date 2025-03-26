import type { BloodType } from "@shared/schema";

// Blood type compatibility chart
// Key: Recipient blood type
// Value: Array of compatible donor blood types (in order of preference)
export const bloodCompatibilityChart: Record<BloodType, BloodType[]> = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"]
};

// Function to check if a donor blood type is compatible with a recipient blood type
export function isCompatible(donorType: BloodType, recipientType: BloodType): boolean {
  if (!bloodCompatibilityChart[recipientType]) {
    return false;
  }
  return bloodCompatibilityChart[recipientType].includes(donorType);
}

// Function to get compatible blood types for a recipient
export function getCompatibleTypes(recipientType: BloodType): BloodType[] {
  return bloodCompatibilityChart[recipientType] || [];
}

// Function to get recipient blood types that can receive a specific donor blood type
export function getRecipientTypes(donorType: BloodType): BloodType[] {
  return Object.entries(bloodCompatibilityChart)
    .filter(([_, compatibleTypes]) => compatibleTypes.includes(donorType))
    .map(([recipientType]) => recipientType as BloodType);
}

// Blood type universal status
export const bloodTypeInfo: Record<BloodType, { universal: string; rarity: number }> = {
  "O-": { universal: "Universal donor", rarity: 7 },
  "O+": { universal: "", rarity: 38 },
  "A-": { universal: "", rarity: 6 },
  "A+": { universal: "", rarity: 34 },
  "B-": { universal: "", rarity: 2 },
  "B+": { universal: "", rarity: 9 },
  "AB-": { universal: "", rarity: 1 },
  "AB+": { universal: "Universal recipient", rarity: 3 }
};
