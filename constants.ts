import { Technician, Ticket, TicketStatus, ServiceType, UrgencyLevel } from './types';

export const TECHNICIANS: Technician[] = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' },
  { id: 3, name: 'Mike Johnson' },
  { id: 4, name: 'Emily Brown' },
];

export const PRODUCT_CATEGORIES = ['Television', 'Refrigerator', 'Washing Machine', 'Air Conditioner', 'Other'];

const now = new Date();
// Use last month for mock data to avoid conflicting with new tickets created this month.
const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const month = lastMonth.toLocaleString('default', { month: 'short' }).toUpperCase();
const year = lastMonth.getFullYear().toString().slice(-2);
const idPrefix = `PE-${month}${year}`;

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: `${idPrefix}-001`,
    customerName: 'Alice Williams',
    phone: '123-456-7890',
    address: '123 Main St',
    city: 'Metropolis',
    productCategory: 'Television',
    productModel: 'Sony Bravia X90J',
    serialNumber: 'SN12345678',
    warrantyStatus: true,
    serviceType: ServiceType.ServiceWarranty,
    issueDescription: 'Screen is flickering and shows horizontal lines.',
    urgency: UrgencyLevel.High,
    status: TicketStatus.New,
    createdAt: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 10),
    updatedAt: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 10),
    photos: [],
    notes: '',
    serviceCharge: 0,
    partsCharge: 0,
    commission: 0,
    scheduledDate: new Date(),
  },
  {
    id: `${idPrefix}-002`,
    customerName: 'Bob Johnson',
    phone: '098-765-4321',
    address: '456 Oak Ave',
    city: 'Gotham',
    productCategory: 'Refrigerator',
    productModel: 'LG InstaView',
    serialNumber: 'SN87654321',
    warrantyStatus: false,
    serviceType: ServiceType.ServicePaid,
    issueDescription: 'Not cooling properly. The freezer section is fine but the fridge is warm.',
    urgency: UrgencyLevel.Medium,
    status: TicketStatus.Assigned,
    technicianId: 2,
    createdAt: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 12),
    updatedAt: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 13),
    photos: [],
    notes: 'Assigned to Jane. She will visit tomorrow morning.',
    serviceCharge: 50,
    partsCharge: 0,
    commission: 10,
    scheduledDate: new Date(new Date().setDate(new Date().getDate() + 1)),
  },
    {
    id: `${idPrefix}-003`,
    customerName: 'Charlie Brown',
    phone: '555-555-5555',
    address: '789 Pine Ln',
    city: 'Star City',
    productCategory: 'Washing Machine',
    productModel: 'Samsung Front Load',
    serialNumber: 'SN55512345',
    warrantyStatus: false,
    serviceType: ServiceType.Installation,
    issueDescription: 'New washing machine installation required.',
    urgency: UrgencyLevel.Low,
    status: TicketStatus.Completed,
    technicianId: 1,
    createdAt: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 15),
    updatedAt: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 16),
    scheduledDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 15),
    photos: [`https://picsum.photos/seed/${idPrefix}-003/400/300`],
    notes: 'Installation completed successfully. Customer is happy with the demo.',
    serviceCharge: 75,
    partsCharge: 0,
    commission: 15,
    feedbackRating: 5,
  }
];