import React from 'react';
import { Ticket, TicketStatus, UrgencyLevel, Technician } from '../types';

interface TicketListProps {
  tickets: Ticket[];
  technicians: Technician[];
  onTicketSelect: (ticket: Ticket) => void;
}

const statusColors: { [key in TicketStatus]: string } = {
  [TicketStatus.New]: 'bg-blue-100 text-blue-800',
  [TicketStatus.Assigned]: 'bg-yellow-100 text-yellow-800',
  [TicketStatus.InProgress]: 'bg-indigo-100 text-indigo-800',
  [TicketStatus.Completed]: 'bg-green-100 text-green-800',
  [TicketStatus.Closed]: 'bg-gray-100 text-gray-800',
};

const urgencyColors: { [key in UrgencyLevel]: string } = {
  [UrgencyLevel.Low]: 'border-gray-400',
  [UrgencyLevel.Medium]: 'border-yellow-500',
  [UrgencyLevel.High]: 'border-red-600',
};

const TicketItem: React.FC<{ ticket: Ticket; technicians: Technician[]; onSelect: () => void }> = ({ ticket, technicians, onSelect }) => {
  const technicianName = technicians.find(t => t.id === ticket.technicianId)?.name || 'N/A';
  
  return (
    <tr onClick={onSelect} className={`bg-white hover:bg-gray-50 cursor-pointer border-l-4 ${urgencyColors[ticket.urgency]}`}>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-dark">{ticket.id}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.customerName}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{ticket.productCategory}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">{technicianName}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">{new Date(ticket.createdAt).toLocaleDateString()}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[ticket.status]}`}>
          {ticket.status}
        </span>
      </td>
    </tr>
  );
};

const TicketCard: React.FC<{ ticket: Ticket; technicians: Technician[]; onSelect: () => void }> = ({ ticket, technicians, onSelect }) => {
    const technicianName = technicians.find(t => t.id === ticket.technicianId)?.name || 'Unassigned';
    return (
        <div onClick={onSelect} className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md cursor-pointer border-l-4 ${urgencyColors[ticket.urgency]}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-primary-dark text-sm">{ticket.id}</p>
                    <p className="text-md font-semibold text-gray-800">{ticket.customerName}</p>
                    <p className="text-xs text-gray-500">{ticket.productCategory} - {ticket.productModel}</p>
                </div>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[ticket.status]}`}>
                    {ticket.status}
                </span>
            </div>
            <div className="mt-4 pt-2 border-t border-gray-100 flex justify-between items-center text-xs text-gray-600">
                <span>Technician: {technicianName}</span>
                <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
    );
};


export const TicketList: React.FC<TicketListProps> = ({ tickets, technicians, onTicketSelect }) => {
    if (tickets.length === 0) {
        return <div className="text-center py-10 bg-white rounded-lg shadow"><p className="text-gray-500">No tickets match the current filters.</p></div>
    }
  return (
    <>
      {/* Table for medium screens and up */}
      <div className="hidden md:block shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Product</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Technician</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tickets.map(ticket => (
              <TicketItem key={ticket.id} ticket={ticket} technicians={technicians} onSelect={() => onTicketSelect(ticket)} />
            ))}
          </tbody>
        </table>
      </div>

       {/* Cards for small screens */}
      <div className="md:hidden space-y-3">
        {tickets.map(ticket => (
           <TicketCard key={ticket.id} ticket={ticket} technicians={technicians} onSelect={() => onTicketSelect(ticket)} />
        ))}
      </div>
    </>
  );
};