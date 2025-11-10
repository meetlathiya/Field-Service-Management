import React, { useState, useCallback, useMemo } from 'react';
import { Ticket, TicketStatus, Technician, TicketUpdatePayload, UrgencyLevel, ServiceType } from '../types';
import { TECHNICIANS } from '../constants';
import { CloseIcon, PencilIcon, StarIcon } from './Icons';
import { SignaturePad } from './SignaturePad';

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  onUpdate: (ticketId: string, updates: TicketUpdatePayload) => void;
}

const statusColors: { [key in TicketStatus]: string } = {
    [TicketStatus.New]: 'bg-blue-100 text-blue-800',
    [TicketStatus.Assigned]: 'bg-yellow-100 text-yellow-800',
    [TicketStatus.InProgress]: 'bg-indigo-100 text-indigo-800',
    [TicketStatus.Completed]: 'bg-green-100 text-green-800',
    [TicketStatus.Closed]: 'bg-gray-100 text-gray-800',
};

const urgencyColors: { [key in UrgencyLevel]: string } = {
    [UrgencyLevel.Low]: 'bg-gray-100 text-gray-800',
    [UrgencyLevel.Medium]: 'bg-yellow-100 text-yellow-800',
    [UrgencyLevel.High]: 'bg-red-100 text-red-800',
};

const DetailItem: React.FC<{ label: string; value?: string | number | null; children?: React.ReactNode }> = ({ label, value, children }) => (
    <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {children ? <div className="mt-1">{children}</div> : <p className="text-md text-gray-900">{value || '-'}</p>}
    </div>
);

// Helper to format date to YYYY-MM-DD for input[type=date]
const formatDateForInput = (date: Date | null | undefined): string => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({ isOpen, onClose, ticket, onUpdate }) => {
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [notes, setNotes] = useState(ticket.notes);
    
    const handleUpdate = useCallback(<K extends keyof TicketUpdatePayload>(field: K, value: TicketUpdatePayload[K]) => {
        onUpdate(ticket.id, { [field]: value });
    }, [onUpdate, ticket.id]);
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const newDate = value ? new Date(`${value}T00:00:00`) : null;
        handleUpdate('scheduledDate', newDate);
    };

    const technicianName = useMemo(() => {
      return TECHNICIANS.find(t => t.id === ticket.technicianId)?.name || 'Unassigned';
    }, [ticket.technicianId]);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newPhotos: string[] = [];
            let filesProcessed = 0;

            // FIX: Explicitly type 'file' as 'File' to resolve type inference issue.
            files.forEach((file: File) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target && typeof event.target.result === 'string') {
                        newPhotos.push(event.target.result);
                    }
                    filesProcessed++;
                    if (filesProcessed === files.length) {
                        handleUpdate('photos', [...ticket.photos, ...newPhotos]);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };
    
    const isPaidService = ticket.serviceType === ServiceType.ServicePaid || ticket.serviceType === ServiceType.Installation;
    const totalBill = ticket.serviceCharge + ticket.partsCharge;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40 p-2 sm:p-4">
            <div className="bg-gray-50 rounded-lg shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b bg-white rounded-t-lg">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                        Ticket: <span className="text-primary">{ticket.id}</span>
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="font-semibold text-lg mb-4 text-gray-700">Service Information</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <DetailItem label="Status">
                                    <select value={ticket.status} onChange={e => handleUpdate('status', e.target.value as TicketStatus)} className={`rounded-md px-2 py-1 text-sm font-medium border-0 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-light ${statusColors[ticket.status]}`}>
                                        {Object.values(TicketStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </DetailItem>
                                <DetailItem label="Urgency">
                                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${urgencyColors[ticket.urgency]}`}>{ticket.urgency}</span>
                                </DetailItem>
                                 <DetailItem label="Scheduled Date">
                                    <input type="date" value={formatDateForInput(ticket.scheduledDate)} onChange={handleDateChange} className="w-full rounded-md text-sm border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light" />
                                </DetailItem>
                                <DetailItem label="Technician">
                                    <select value={ticket.technicianId || ''} onChange={e => handleUpdate('technicianId', parseInt(e.target.value))} className="w-full rounded-md text-sm border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light">
                                        <option value="">Unassigned</option>
                                        {TECHNICIANS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </DetailItem>
                                <DetailItem label="Service Type" value={ticket.serviceType} />
                                <DetailItem label="Created At" value={new Date(ticket.createdAt).toLocaleString()} />
                                <DetailItem label="Last Updated" value={new Date(ticket.updatedAt).toLocaleString()} />
                            </div>
                            <div className="mt-4">
                                <DetailItem label="Issue Description" value={ticket.issueDescription} />
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow">
                             <h3 className="font-semibold text-lg mb-4 text-gray-700">Work Log & Evidence</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                         <label className="text-sm font-medium text-gray-500">Notes / Comments</label>
                                         <button onClick={() => setIsEditingNotes(!isEditingNotes)} className="text-sm text-primary hover:underline flex items-center">
                                             <PencilIcon className="w-4 h-4 mr-1" />{isEditingNotes ? 'Save' : 'Edit'}
                                         </button>
                                    </div>
                                    {isEditingNotes ? (
                                        <textarea value={notes} onChange={e => setNotes(e.target.value)} onBlur={() => {setIsEditingNotes(false); handleUpdate('notes', notes);}} autoFocus className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light sm:text-sm" rows={4}/>
                                    ) : (
                                        <p className="text-gray-800 whitespace-pre-wrap p-2 bg-gray-50 rounded-md min-h-[50px]">{ticket.notes || 'No notes yet.'}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Job Photos</label>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {ticket.photos.map((photo, index) => (
                                            <img key={index} src={photo} alt={`Job photo ${index+1}`} className="w-24 h-24 object-cover rounded-md" />
                                        ))}
                                        <label className="w-24 h-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                                            <span className="text-gray-500 text-3xl">+</span>
                                            <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {isPaidService && (
                             <div className="bg-white p-4 rounded-lg shadow">
                                <h3 className="font-semibold text-lg mb-4 text-gray-700">Charges & Payment</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Service Charge ($)</label>
                                        <input type="number" value={ticket.serviceCharge} onChange={e => handleUpdate('serviceCharge', parseFloat(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light sm:text-sm"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Parts Charge ($)</label>
                                        <input type="number" value={ticket.partsCharge} onChange={e => handleUpdate('partsCharge', parseFloat(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light sm:text-sm"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Commission ($)</label>
                                        <input type="number" value={ticket.commission} onChange={e => handleUpdate('commission', parseFloat(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light sm:text-sm"/>
                                    </div>
                                    <div className="text-right">
                                         <p className="text-sm font-medium text-gray-500">Total Bill</p>
                                         <p className="text-2xl font-bold text-primary-dark">${totalBill.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="bg-white p-4 rounded-lg shadow">
                             <h3 className="font-semibold text-lg mb-4 text-gray-700">Customer Feedback & Sign-off</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Service Rating</p>
                                    <div className="flex items-center mt-1">
                                        {[1,2,3,4,5].map(star => (
                                            <button key={star} onClick={() => handleUpdate('feedbackRating', star)} className="text-yellow-400 hover:text-yellow-500">
                                                <StarIcon filled={star <= (ticket.feedbackRating || 0)} className="w-7 h-7" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Customer Signature</p>
                                    {ticket.customerSignature ? (
                                        <img src={ticket.customerSignature} alt="Customer Signature" className="border rounded-md bg-white" />
                                    ) : (
                                        <SignaturePad 
                                            onSave={(sig) => handleUpdate('customerSignature', sig)}
                                            onClear={() => handleUpdate('customerSignature', undefined)}
                                        />
                                    )}
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white p-4 rounded-lg shadow">
                             <h3 className="font-semibold text-lg mb-4 text-gray-700">Customer Details</h3>
                             <div className="space-y-3">
                                <DetailItem label="Name" value={ticket.customerName} />
                                <DetailItem label="Phone" value={ticket.phone} />
                                <DetailItem label="Address" value={`${ticket.address}, ${ticket.city}`} />
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                             <h3 className="font-semibold text-lg mb-4 text-gray-700">Product Details</h3>
                             <div className="space-y-3">
                                <DetailItem label="Category" value={ticket.productCategory} />
                                <DetailItem label="Model" value={ticket.productModel} />
                                <DetailItem label="Serial Number" value={ticket.serialNumber} />
                                <DetailItem label="Warranty">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ticket.warrantyStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {ticket.warrantyStatus ? 'Active' : 'Expired'}
                                    </span>
                                </DetailItem>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};