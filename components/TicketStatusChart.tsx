import React, { useState, useMemo } from 'react';
import { Ticket, TicketStatus } from '../types';

interface ChartData {
  status: TicketStatus;
  count: number;
  percentage: number;
  color: string;
}

const STATUS_COLORS: { [key in TicketStatus]: string } = {
  [TicketStatus.New]: '#1976D2', // primary-light
  [TicketStatus.Assigned]: '#FFC107', // secondary
  [TicketStatus.InProgress]: '#6366F1', // A standard indigo color
  [TicketStatus.Completed]: '#4CAF50', // accent
  [TicketStatus.Closed]: '#9CA3AF', // A standard gray color
};

// Define a consistent order for statuses in the chart and legend
const statusOrder = [
    TicketStatus.New,
    TicketStatus.Assigned,
    TicketStatus.InProgress,
    TicketStatus.Completed,
    TicketStatus.Closed
];


export const TicketStatusChart: React.FC<{ tickets: Ticket[] }> = ({ tickets }) => {
  const [hoveredStatus, setHoveredStatus] = useState<TicketStatus | null>(null);

  const chartData = useMemo((): ChartData[] => {
    const counts = tickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {} as { [key in TicketStatus]: number });

    const total = tickets.length;
    if (total === 0) return [];

    return statusOrder
      .filter(status => counts[status] > 0) // Only include statuses that have tickets
      .map(status => ({
        status,
        count: counts[status],
        percentage: (counts[status] / total) * 100,
        color: STATUS_COLORS[status],
      }));
  }, [tickets]);

  if (tickets.length === 0) {
    return (
        <div className="bg-white p-6 rounded-lg shadow h-full flex flex-col items-center justify-center min-h-[300px]">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Ticket Status Distribution</h3>
            <p className="text-gray-500">No ticket data available to display chart.</p>
        </div>
    );
  }

  const radius = 80;
  const strokeWidth = 25;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercentage = 0;

  const totalTickets = tickets.length;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow h-full flex flex-col">
      <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center sm:text-left">Ticket Status Distribution</h3>
      <div className="flex-grow flex flex-col sm:flex-row items-center justify-center gap-6">
        <div className="relative w-52 h-52 sm:w-64 sm:h-64 flex-shrink-0">
          <svg className="w-full h-full" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r={radius} fill="transparent" stroke="#e0e0e0" strokeWidth={strokeWidth} />
            {chartData.map((data) => {
              const strokeDasharray = `${(data.percentage / 100) * circumference} ${circumference}`;
              const rotation = accumulatedPercentage * 3.6; // Convert percentage to degrees
              accumulatedPercentage += data.percentage;
              
              return (
                <circle
                  key={data.status}
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="transparent"
                  stroke={data.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  transform={`rotate(${-90 + rotation} 100 100)`}
                  className="transition-all duration-300"
                  onMouseEnter={() => setHoveredStatus(data.status)}
                  onMouseLeave={() => setHoveredStatus(null)}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            {hoveredStatus ? (
              <>
                <span className="text-3xl font-bold" style={{ color: STATUS_COLORS[hoveredStatus] }}>
                    {chartData.find(d => d.status === hoveredStatus)?.count}
                </span>
                <span className="text-sm text-gray-500">{hoveredStatus}</span>
              </>
            ) : (
              <>
                <span className="text-4xl font-bold text-gray-800">{totalTickets}</span>
                <span className="text-md text-gray-500">Total Tickets</span>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap justify-center sm:flex-col sm:justify-start gap-2 sm:gap-3">
          {chartData.map(data => (
            <div 
                key={data.status} 
                className="flex items-center text-sm cursor-default"
                onMouseEnter={() => setHoveredStatus(data.status)}
                onMouseLeave={() => setHoveredStatus(null)}
            >
              <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: data.color }}></span>
              <span className="font-semibold text-gray-700">{data.status}:</span>
              <span className="ml-1.5 text-gray-600">{data.count} ({data.percentage.toFixed(0)}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
