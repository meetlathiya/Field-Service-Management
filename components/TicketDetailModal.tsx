import React, { useState, useCallback, useMemo } from 'react';
import { Ticket, TicketStatus, Technician, TicketUpdatePayload, UrgencyLevel, ServiceType } from '../types';
import { TECHNICIANS } from '../constants';
import { CloseIcon, PencilIcon, StarIcon, CameraIcon, PhotoIcon } from './Icons';
import { SignaturePad } from './SignaturePad';
import { firebaseService } from '../services/firebaseService';

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  onUpdate: (firestoreDocId: string, updates: TicketUpdatePayload) => void;
  onUploadError: (error: Error) => void;
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

const compressImage = async (file: File): Promise<Blob> => {
    // Use createImageBitmap for better performance and memory management compared to FileReader
    const bitmap = await createImageBitmap(file);
    const { width: originalWidth, height: originalHeight } = bitmap;
    
    const canvas = document.createElement('canvas');
    const MAX_WIDTH = 1024;
    const MAX_HEIGHT = 1024;
    let targetWidth = originalWidth;
    let targetHeight = originalHeight;

    if (targetWidth > targetHeight) {
        if (targetWidth > MAX_WIDTH) {
            targetHeight = Math.round(targetHeight * (MAX_WIDTH / targetWidth));
            targetWidth = MAX_WIDTH;
        }
    } else {
        if (targetHeight > MAX_HEIGHT) {
            targetWidth = Math.round(targetWidth * (MAX_HEIGHT / targetHeight));
            targetHeight = MAX_HEIGHT;
        }
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Could not get canvas context');
    }
    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
    bitmap.close(); // Release memory associated with the bitmap

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Canvas to Blob conversion failed.'));
                }
            },
            'image/jpeg',
            0.8 // Good quality/size balance
        );
    });
};

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({ isOpen, onClose, ticket, onUpdate, onUploadError }) => {
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [notes, setNotes] = useState(ticket.notes);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState<string | null>(null);
    
    const handleUpdate = useCallback(<K extends keyof TicketUpdatePayload>(field: K, value: TicketUpdatePayload[K]) => {
        onUpdate(ticket.firestoreDocId, { [field]: value });
    }, [onUpdate, ticket.firestoreDocId]);
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const newDate = value ? new Date(`${value}T00:00:00`) : null;
        handleUpdate('scheduledDate', newDate);
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (ticket.photos.length + files.length > 5) {
                alert("You can upload a maximum of 5 photos per ticket.");
                return;
            }

            setIsUploading(true);
            setUploadProgress(0);
            setUploadError(null);

            const individualProgresses: number[] = files.map(() => 0);
            const updateTotalProgress = () => {
                const total = individualProgresses.reduce((acc, p) => acc + p, 0);
                const overallPercentage = total / files.length;
                setUploadProgress(overallPercentage);
            };

            try {
                const compressionPromises = files.map(compressImage);
                const compressedImageBlobs = await Promise.all(compressionPromises);
                
                const uploadPromises = compressedImageBlobs.map((imgBlob, index) =>
                    firebaseService.uploadImage(
                        imgBlob, 
                        'ticket-photos',
                        (progress) => {
                            individualProgresses[index] = progress;
                            updateTotalProgress();
                        }
                    )
                );
                
                const newImageUrls = await Promise.all(uploadPromises);
                handleUpdate('photos', [...ticket.photos, ...newImageUrls]);
            } catch (error) {
                console.error("Error uploading photos:", error);
                onUploadError(error as Error);
                const message = error instanceof Error ? error.message : "An unknown error occurred.";
                setUploadError(`Photo upload failed. ${message}`);
            } finally {
                setIsUploading(false);
                setUploadProgress(0);
                e.target.value = '';
            }
        }
    };
    
    const handleSaveSignature = async (signatureDataUrl: string) => {
        try {
            // Note: signature uploads do not have progress reporting, but are generally small and fast.
            const signatureUrl = await firebaseService.uploadImage(signatureDataUrl, 'signatures');
            handleUpdate('customerSignature', signatureUrl);
        } catch (error) {
            console.error("Error uploading signature:", error);
            onUploadError(error as Error);
            alert("Failed to save signature. Please try again.");
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
                                    <label className="text-sm font-medium text-gray-500">Job Photos (up to 5)</label>
                                    <div className="mt-2">
                                        <div className="flex flex-wrap gap-2">
                                            {ticket.photos.map((photoUrl, index) => (
                                                <img key={index} src={photoUrl} alt={`Job photo ${index+1}`} className="w-24 h-24 object-cover rounded-md" />
                                            ))}
                                            {ticket.photos.length < 5 && !isUploading && (
                                                <div className="flex gap-2">
                                                    <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-gray-500">
                                                        <CameraIcon className="h-8 w-8" />
                                                        <span className="text-xs mt-1">Take Photo</span>
                                                        <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" disabled={isUploading}/>
                                                    </label>
                                                     <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-gray-500">
                                                        <PhotoIcon className="h-8 w-8" />
                                                        <span className="text-xs mt-1">From Gallery</span>
                                                        <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={isUploading}/>
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                        {isUploading && (
                                            <div className="mt-2 max-w-xs">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-xs font-medium text-gray-700">Uploading photos...</span>
                                                    <span className="text-xs font-medium text-gray-700">{Math.round(uploadProgress)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-primary h-2 rounded-full transition-width duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {uploadError && <p className="text-sm text-danger mt-2">{uploadError}</p>}
                                </div>
                            </div>
                        </div>
                        {isPaidService && (
                             <div className="bg-white p-4 rounded-lg shadow">
                                <h3 className="font-semibold text-lg mb-4 text-gray-700">Charges & Payment</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Service Charge (₹)</label>
                                        <input type="number" value={ticket.serviceCharge} onChange={e => handleUpdate('serviceCharge', parseFloat(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light sm:text-sm"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Parts Charge (₹)</label>
                                        <input type="number" value={ticket.partsCharge} onChange={e => handleUpdate('partsCharge', parseFloat(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light sm:text-sm"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Commission (₹)</label>
                                        <input type="number" value={ticket.commission} onChange={e => handleUpdate('commission', parseFloat(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light sm:text-sm"/>
                                    </div>
                                    <div className="text-right">
                                         <p className="text-sm font-medium text-gray-500">Total Bill</p>
                                         <p className="text-2xl font-bold text-primary-dark">₹{totalBill.toFixed(2)}</p>
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
                                            onSave={handleSaveSignature}
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