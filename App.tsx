import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CalendarView } from './components/CalendarView';
import { TicketFormModal } from './components/TicketFormModal';
import { TicketDetailModal } from './components/TicketDetailModal';
import { FirestoreRulesWarning } from './components/FirestoreRulesWarning';
import { FirestoreDatabaseWarning } from './components/FirestoreDatabaseWarning';
import { PlusIcon } from './components/Icons';
import { AppView, Ticket, TicketUpdatePayload } from './types';
import { useTickets } from './hooks/useTickets';

// Mock user for development since login is removed
const mockUser = {
  displayName: 'Admin User',
  email: 'admin@payalelectronics.com',
  photoURL: null,
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.Dashboard);
  const { 
    tickets, 
    addTicket, 
    updateTicket, 
    isLoading: areTicketsLoading, 
    error: ticketsError,
    operationError,
    clearOperationError
  } = useTickets();

  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const handleTicketSelect = useCallback((ticket: Ticket) => {
    setSelectedTicket(ticket);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setSelectedTicket(null);
  }, []);

  const handleUpdateTicket = useCallback((firestoreDocId: string, updates: TicketUpdatePayload) => {
    updateTicket(firestoreDocId, updates);
    if(selectedTicket && selectedTicket.firestoreDocId === firestoreDocId) {
      const updatedTime = new Date();
      setSelectedTicket(prev => prev ? {...prev, ...updates, updatedAt: updatedTime} : null);
    }
  }, [updateTicket, selectedTicket]);
  
  const handleSignOut = () => {
    alert("Sign out functionality is disabled.");
  };

  const renderView = () => {
    if (areTicketsLoading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-lg text-gray-600">Loading Tickets from Firestore...</p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case AppView.Dashboard:
        return <Dashboard tickets={tickets} onTicketSelect={handleTicketSelect} />;
      case AppView.Calendar:
        return <CalendarView tickets={tickets} onTicketSelect={handleTicketSelect} />;
      default:
        return <Dashboard tickets={tickets} onTicketSelect={handleTicketSelect} />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col font-sans bg-background text-gray-900">
      <Header 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        user={mockUser}
        onSignOut={handleSignOut}
      />
      <div className="flex-1 flex flex-col overflow-hidden relative">
          {renderView()}
      </div>

      {currentView === AppView.Dashboard && (
        <div className="fixed bottom-5 right-5 z-30">
            <button
                onClick={() => setIsNewTicketModalOpen(true)}
                className="bg-secondary hover:bg-amber-500 text-primary-dark rounded-full p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                aria-label="Create New Ticket"
            >
                <PlusIcon className="w-8 h-8" />
            </button>
        </div>
      )}
      
      <TicketFormModal 
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        onSave={(data) => addTicket(data)}
      />

      {selectedTicket && (
        <TicketDetailModal 
            isOpen={!!selectedTicket}
            onClose={handleCloseDetailModal}
            ticket={selectedTicket}
            onUpdate={handleUpdateTicket}
        />
      )}
      
      {ticketsError && (
        <FirestoreRulesWarning error={ticketsError} />
      )}
      
      {operationError && operationError.message.includes("The database (default) does not exist") && (
        <FirestoreDatabaseWarning
          error={operationError}
          onClose={clearOperationError}
        />
      )}
    </div>
  );
};

export default App;