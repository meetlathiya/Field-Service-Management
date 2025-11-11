export enum TicketStatus {
  New = 'New',
  Assigned = 'Assigned',
  InProgress = 'In Progress',
  Completed = 'Completed',
  Closed = 'Closed'
}

export enum ServiceType {
  Installation = 'Installation',
  ProductDemo = 'Product Demo',
  ServicePaid = 'Service - Paid',
  ServiceWarranty = 'Service - Warranty'
}

export enum UrgencyLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}

export interface Technician {
  id: number;
  name: string;
}

export interface Ticket {
  firestoreDocId: string; // The unique ID from the Firestore document
  id: string; // The human-readable ID like PE-JUL24-001
  customerName: string;
  phone: string;
  address: string;
  city: string;
  productCategory: string;
  productModel: string;
  serialNumber: string;
  warrantyStatus: boolean;
  serviceType: ServiceType;
  issueDescription: string;
  urgency: UrgencyLevel;
  status: TicketStatus;
  technicianId?: number;
  createdAt: Date;
  updatedAt: Date;
  scheduledDate?: Date | null;
  photos: string[]; // array of base64 image strings
  notes: string;
  serviceCharge: number;
  partsCharge: number;
  commission: number;
  feedbackRating?: number;
  customerSignature?: string; // base64 image string
}

export type TicketUpdatePayload = Partial<Omit<Ticket, 'id' | 'createdAt' | 'firestoreDocId'>>;

export enum AppView {
  Dashboard,
  Calendar
}