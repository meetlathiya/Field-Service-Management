import React, { useState, useMemo } from 'react';
import { Ticket } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from './Icons';

interface CalendarViewProps {
  tickets: Ticket[];
  onTicketSelect: (ticket: Ticket) => void;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_OF_WEEK_MOBILE = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const CalendarView: React.FC<CalendarViewProps> = ({ tickets, onTicketSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const firstDayOfMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), [currentDate]);
  const daysInMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate(), [currentDate]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const ticketsByDate = useMemo(() => {
      const map = new Map<string, Ticket[]>();
      tickets.forEach(ticket => {
          if (ticket.scheduledDate) {
              const dateKey = new Date(ticket.scheduledDate).toDateString();
              if (!map.has(dateKey)) {
                  map.set(dateKey, []);
              }
              map.get(dateKey)?.push(ticket);
          }
      });
      return map;
  }, [tickets]);

  const renderCalendarGrid = () => {
    const blanks = Array(firstDayOfMonth.getDay()).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const today = new Date();

    return [...blanks, ...days].map((day, index) => {
      if (!day) {
        return <div key={`blank-${index}`} className="border-r border-b border-gray-200"></div>;
      }
      
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = date.toDateString() === today.toDateString();
      const scheduledTickets = ticketsByDate.get(date.toDateString()) || [];

      return (
        <div key={day} className="border-r border-b border-gray-200 p-1 sm:p-2 min-h-[100px] sm:min-h-[120px] flex flex-col">
            <span className={`text-xs sm:text-sm font-semibold self-center sm:self-start ${isToday ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-gray-700'}`}>
                {day}
            </span>
            <div className="mt-1 overflow-y-auto flex-1">
                {scheduledTickets.map(ticket => (
                    <div 
                        key={ticket.id} 
                        onClick={() => onTicketSelect(ticket)}
                        className="text-xs bg-primary-light text-white rounded p-1 mb-1 cursor-pointer hover:bg-primary-dark truncate"
                        title={`${ticket.id} - ${ticket.customerName}`}
                    >
                       {ticket.id}
                    </div>
                ))}
            </div>
        </div>
      );
    });
  };

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center">
                    <CalendarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary mr-2 sm:mr-3" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                        Job Calendar
                    </h1>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-4">
                    <button onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-gray-100">
                        <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                    </button>
                    <span className="text-base sm:text-xl font-semibold text-gray-700 w-32 sm:w-48 text-center">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-gray-100">
                        <ChevronRightIcon className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 border-t border-l border-gray-200">
                {DAYS_OF_WEEK.map((day, i) => (
                    <div key={day} className="text-center font-medium text-sm text-gray-500 py-2 border-r border-b border-gray-200 bg-gray-50">
                        <span className="hidden sm:inline">{day}</span>
                        <span className="sm:hidden">{DAYS_OF_WEEK_MOBILE[i]}</span>
                    </div>
                ))}
                {renderCalendarGrid()}
            </div>
        </div>
      </div>
    </main>
  );
};