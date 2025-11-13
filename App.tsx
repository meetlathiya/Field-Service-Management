import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CalendarView } from './components/CalendarView';
import { TicketFormModal } from './components/TicketFormModal';
import { TicketDetailModal } from './components/TicketDetailModal';
import { Login } from './components/Login';
import { RoleSetupWarning } from './components/RoleSetupWarning';
import { FirebaseConfigWarning } from './components/FirebaseConfigWarning';
import { FirestoreRulesWarning } from './components/FirestoreRulesWarning';
import { StorageRulesWarning } from './components/StorageRulesWarning';
import { FirestoreDatabaseWarning } from './components/FirestoreDatabaseWarning';
import { PlusIcon } from './components/Icons';
import { AppView, Ticket, TicketUpdatePayload } from './types';
import { useTickets } from './hooks/useTickets';
import { useAuth } from './hooks/useAuth';
import { authService } from './services/authService';
import { initError } from './services/firebaseService';

const LoadingSpinner: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex-1 flex items-center justify-center h-full w-full">
        <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-lg text-gray-600">{message}</p>
        </div>
    </div>
);


const App: React.FC = () => {
    // Top-level check: If Firebase config itself is invalid, stop everything.
    if (initError) {
        return <FirebaseConfigWarning />;
    }

    const { 
        currentUser, 
        userProfile, 
        isLoading: isAuthLoading, 
    } = useAuth();
    
    // Auth-related blocking views
    if (isAuthLoading) {
        return <div className="h-screen w-screen"><LoadingSpinner message="Authenticating..." /></div>;
    }
    if (!currentUser) {
        return <Login />;
    }
    if (!userProfile) {
        return <RoleSetupWarning user={currentUser} />;
    }
    
    return <MainApp userProfile={userProfile} currentUser={currentUser} />;
};

// Main application component, rendered only after successful authentication and profile load.
const MainApp: React.FC<{ userProfile: any; currentUser: any; }> = ({ userProfile, currentUser }) => {
    const [currentView, setCurrentView] = useState<AppView>(AppView.Dashboard);
    const { 
        tickets, 
        addTicket, 
        updateTicket, 
        isLoading: areTicketsLoading,
        error: ticketsStreamError,
        operationError: ticketsOpError,
        clearOperationError,
    } = useTickets();

    const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [appError, setAppError] = useState<any>(null);

    useEffect(() => {
        if (ticketsStreamError) setAppError(ticketsStreamError);
    }, [ticketsStreamError]);

    useEffect(() => {
        if (ticketsOpError) setAppError(ticketsOpError);
    }, [ticketsOpError]);

    const handleUploadError = useCallback((error: any) => {
        setAppError(error);
    }, []);
    
    const clearAppError = () => {
        setAppError(null);
        if (clearOperationError) {
          clearOperationError();
        }
    };

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
        authService.signOutUser();
    };

    const renderContent = () => {
        if (areTicketsLoading) {
            return <LoadingSpinner message="Loading tickets..." />;
        }
        // If there's a stream error (like permission denied), show the warning instead of content.
        if (appError?.code === 'permission-denied') {
            return null; // The modal will be the only content.
        }

        switch (currentView) {
            case AppView.Dashboard:
                return <Dashboard tickets={tickets} onTicketSelect={handleTicketSelect} userProfile={userProfile} />;
            case AppView.Calendar:
                return <CalendarView tickets={tickets} onTicketSelect={handleTicketSelect} />;
            default:
                return <Dashboard tickets={tickets} onTicketSelect={handleTicketSelect} userProfile={userProfile} />;
        }
    };

    const isTechnician = userProfile?.role === 'technician';
    const isConnected = !areTicketsLoading && !ticketsStreamError;

    return (
        <div className="h-screen w-screen flex flex-col font-sans bg-background text-gray-900">
            <Header 
                currentView={currentView} 
                onNavigate={setCurrentView} 
                user={currentUser}
                userProfile={userProfile}
                onSignOut={handleSignOut}
                isConnected={isConnected}
            />

            <div className="flex-1 flex flex-col overflow-hidden relative">
                {renderContent()}
            </div>

            {/* Error Modals */}
            {appError?.code === 'permission-denied' && <FirestoreRulesWarning error={appError} />}
            {appError?.code === 'storage/unauthorized' && <StorageRulesWarning error={appError} onClose={clearAppError} />}
            {appError?.code === 'failed-precondition' && <FirestoreDatabaseWarning error={appError} onClose={clearAppError} />}

            {!isTechnician && currentView === AppView.Dashboard && (
                <div className="fixed bottom-5 right-5 z-30">
                    <button
                        onClick={() => setIsNewTicketModalOpen(true)}
                        className="bg-secondary hover:bg-amber-500 text-primary-dark rounded-full p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                        aria-label="Create New Ticket"
                        title="Create New Ticket"
                    >
                        <PlusIcon className="w-8 h-8" />
                    </button>
                </div>
            )}

            <TicketFormModal 
                isOpen={isNewTicketModalOpen}
                onClose={() => setIsNewTicketModalOpen(false)}
                onSave={(data) => addTicket(data)}
                onUploadError={handleUploadError}
            />

            {selectedTicket && userProfile && (
                <TicketDetailModal 
                    isOpen={!!selectedTicket}
                    onClose={handleCloseDetailModal}
                    ticket={selectedTicket}
                    onUpdate={handleUpdateTicket}
                    onUploadError={handleUploadError}
                    userProfile={userProfile}
                />
            )}
        </div>
    );
};

export default App;