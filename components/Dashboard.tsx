import React, { useState, useMemo } from 'react';
import { Ticket, TicketStatus, Technician } from '../types';
import { TicketList } from './TicketList';
import { TECHNICIANS } from '../constants';
import { ExportIcon } from './Icons';

interface DashboardProps {
  tickets: Ticket[];
  onTicketSelect: (ticket: Ticket) => void;
}

const KpiCard: React.FC<{ title: string; value: number; color: string }> = ({ title, value, color }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ tickets, onTicketSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [techFilter, setTechFilter] = useState<string>('all');

  const kpis = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => ![TicketStatus.Completed, TicketStatus.Closed].includes(t.status)).length;
    const completedToday = tickets.filter(t => t.status === TicketStatus.Completed && new Date(t.updatedAt).toDateString() === new Date().toDateString()).length;
    const highUrgency = tickets.filter(t => t.urgency === 'High' && t.status !== TicketStatus.Closed).length;
    return { total, open, completedToday, highUrgency };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch =
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.productModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesTech = techFilter === 'all' || ticket.technicianId === parseInt(techFilter);

      return matchesSearch && matchesStatus && matchesTech;
    });
  }, [tickets, searchTerm, statusFilter, techFilter]);

  const handleExportCSV = () => {
    if (filteredTickets.length === 0) {
      alert("No data to export.");
      return;
    }

    const sanitizeCSVValue = (value: any): string => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (/[",\n\r]/.test(str)) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const headers = [
        'Ticket ID', 'Customer Name', 'Phone', 'Address', 'City',
        'Product Category', 'Product Model', 'Serial Number', 'Warranty Active',
        'Service Type', 'Issue Description', 'Urgency', 'Status',
        'Assigned Technician', 'Created Date', 'Last Updated', 'Scheduled Date',
        'Notes', 'Service Charge', 'Parts Charge', 'Total Bill', 'Commission',
        'Feedback Rating'
    ];
    
    const csvRows = [headers.join(',')];

    filteredTickets.forEach(ticket => {
        const technicianName = TECHNICIANS.find(t => t.id === ticket.technicianId)?.name || 'Unassigned';
        const totalBill = ticket.serviceCharge + ticket.partsCharge;
        
        const row = [
            sanitizeCSVValue(ticket.id),
            sanitizeCSVValue(ticket.customerName),
            sanitizeCSVValue(ticket.phone),
            sanitizeCSVValue(ticket.address),
            sanitizeCSVValue(ticket.city),
            sanitizeCSVValue(ticket.productCategory),
            sanitizeCSVValue(ticket.productModel),
            sanitizeCSVValue(ticket.serialNumber),
            sanitizeCSVValue(ticket.warrantyStatus ? 'Yes' : 'No'),
            sanitizeCSVValue(ticket.serviceType),
            sanitizeCSVValue(ticket.issueDescription),
            sanitizeCSVValue(ticket.urgency),
            sanitizeCSVValue(ticket.status),
            sanitizeCSVValue(technicianName),
            sanitizeCSVValue(new Date(ticket.createdAt).toLocaleString()),
            sanitizeCSVValue(new Date(ticket.updatedAt).toLocaleString()),
            sanitizeCSVValue(ticket.scheduledDate ? new Date(ticket.scheduledDate).toLocaleDateString() : 'Not set'),
            sanitizeCSVValue(ticket.notes),
            sanitizeCSVValue(ticket.serviceCharge),
            sanitizeCSVValue(ticket.partsCharge),
            sanitizeCSVValue(totalBill.toFixed(2)),
            sanitizeCSVValue(ticket.commission),
            sanitizeCSVValue(ticket.feedbackRating || 'N/A')
        ];
        
        csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
        URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const today = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `tickets-export-${today}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KpiCard title="Total Tickets" value={kpis.total} color="text-primary-dark" />
          <KpiCard title="Open Tickets" value={kpis.open} color="text-yellow-500" />
          <KpiCard title="High Urgency" value={kpis.highUrgency} color="text-danger" />
          <KpiCard title="Completed Today" value={kpis.completedToday} color="text-accent" />
        </div>

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">All Tickets</h2>
          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 mb-4">
            <div className="w-full sm:flex-grow">
              <input
                type="text"
                placeholder="Search by ID, customer, model..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light sm:text-sm"
              />
            </div>
            <div className="w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light sm:text-sm"
              >
                <option value="all">All Statuses</option>
                {Object.values(TicketStatus).map(status => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
             <div className="w-full sm:w-auto">
              <select
                value={techFilter}
                onChange={e => setTechFilter(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light sm:text-sm"
              >
                <option value="all">All Technicians</option>
                {TECHNICIANS.map(tech => <option key={tech.id} value={tech.id}>{tech.name}</option>)}
              </select>
            </div>
            <div className="w-full sm:w-auto">
              <button
                onClick={handleExportCSV}
                className="w-full flex items-center justify-center px-4 py-2 bg-accent text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium shadow-sm"
                aria-label="Export filtered tickets to CSV"
              >
                <ExportIcon className="w-5 h-5 mr-2" />
                Export CSV
              </button>
            </div>
          </div>
          <TicketList tickets={filteredTickets} technicians={TECHNICIANS} onTicketSelect={onTicketSelect} />
        </div>
      </div>
    </main>
  );
};