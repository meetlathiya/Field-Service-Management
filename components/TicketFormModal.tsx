import React, { useState } from 'react';
import { Ticket, ServiceType, UrgencyLevel } from '../types';
import { PRODUCT_CATEGORIES } from '../constants';
import { CloseIcon, CameraIcon, PhotoIcon } from './Icons';
import { firebaseService } from '../services/firebaseService';

interface TicketFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  onUploadError: (error: Error) => void;
}

const initialFormState = {
  customerName: '',
  phone: '',
  address: '',
  city: '',
  productCategory: PRODUCT_CATEGORIES[0],
  productModel: '',
  serialNumber: '',
  warrantyStatus: false,
  serviceType: ServiceType.ServicePaid,
  issueDescription: '',
  urgency: UrgencyLevel.Medium,
  photos: [] as string[],
  notes: '',
  serviceCharge: 0,
  partsCharge: 0,
  commission: 0,
  scheduledDate: '',
};

const compressImage = async (file: File): Promise<File> => {
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
                    const compressedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });
                    resolve(compressedFile);
                } else {
                    reject(new Error('Canvas to Blob conversion failed.'));
                }
            },
            'image/jpeg',
            0.8 // Good quality/size balance
        );
    });
};


export const TicketFormModal: React.FC<TicketFormModalProps> = ({ isOpen, onClose, onSave, onUploadError }) => {
  const [formData, setFormData] = useState<any>(initialFormState);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);
        if (formData.photos.length + files.length > 5) {
            alert("You can upload a maximum of 5 photos.");
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setUploadError(null);

        try {
            const compressionPromises = files.map(compressImage);
            const compressedImageFiles = await Promise.all(compressionPromises);

            const newImageUrls: string[] = [];
            const totalFiles = compressedImageFiles.length;

            for (let i = 0; i < totalFiles; i++) {
                const imgFile = compressedImageFiles[i];

                // Use the firebaseService for uploading
                const url = await firebaseService.uploadImage(
                    imgFile,
                    'ticket-photos',
                    (progress) => {
                        const overallProgress = ((i + (progress / 100)) / totalFiles) * 100;
                        setUploadProgress(overallProgress);
                    }
                );
                newImageUrls.push(url);
            }

            setFormData(prev => ({...prev, photos: [...prev.photos, ...newImageUrls]}));
        } catch (error) {
            console.error("Error uploading images:", error);
            onUploadError(error as Error); // Notify parent for special handling
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            setUploadError(`Photo upload failed. ${message}`);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            e.target.value = '';
        }
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
      setFormData(prev => ({
          ...prev,
          photos: prev.photos.filter((_, index) => index !== indexToRemove)
      }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
        ...formData,
        serviceCharge: parseFloat(formData.serviceCharge) || 0,
        partsCharge: parseFloat(formData.partsCharge) || 0,
        // FIX: Firestore does not support `undefined`. Use `null` for empty dates.
        scheduledDate: formData.scheduledDate ? new Date(`${formData.scheduledDate}T00:00:00`) : null,
    };
    onSave(dataToSave);
    setFormData(initialFormState);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Create New Service Ticket</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <form id="ticket-form" onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <fieldset className="border p-4 rounded-md space-y-4">
              <legend className="text-lg font-semibold px-2">Customer Details</legend>
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light sm:text-sm text-gray-900" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light sm:text-sm text-gray-900" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light sm:text-sm text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light sm:text-sm text-gray-900" />
              </div>
            </fieldset>

            <fieldset className="border p-4 rounded-md space-y-4">
              <legend className="text-lg font-semibold px-2">Product & Service Details</legend>
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Category</label>
                <select name="productCategory" value={formData.productCategory} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light sm:text-sm text-gray-900">
                  {PRODUCT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Model</label>
                <input type="text" name="productModel" value={formData.productModel} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light sm:text-sm text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Serial Number</label>
                <input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light sm:text-sm text-gray-900" />
              </div>
               <div className="flex items-center">
                <input id="warrantyStatus" name="warrantyStatus" type="checkbox" checked={formData.warrantyStatus} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary-light" />
                <label htmlFor="warrantyStatus" className="ml-2 block text-sm text-gray-900">Under Warranty</label>
              </div>
            </fieldset>
          </div>
           <fieldset className="border p-4 rounded-md space-y-4">
              <legend className="text-lg font-semibold px-2">Issue Details</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Service Type</label>
                    <select name="serviceType" value={formData.serviceType} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light sm:text-sm text-gray-900">
                      {Object.values(ServiceType).map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700">Urgency Level</label>
                    <select name="urgency" value={formData.urgency} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light sm:text-sm text-gray-900">
                      {Object.values(UrgencyLevel).map(level => <option key={level} value={level}>{level}</option>)}
                    </select>
                  </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Issue Description</label>
                <textarea name="issueDescription" value={formData.issueDescription} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light sm:text-sm text-gray-900"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Add Photos (Optional, up to 5)</label>
                <div className="mt-2">
                    <div className="flex items-center flex-wrap gap-4">
                       {formData.photos.map((photoUrl, index) => (
                          <div key={index} className="relative">
                            <img src={photoUrl} alt={`Upload preview ${index + 1}`} className="h-24 w-24 rounded-md object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(index)}
                              className="absolute top-0 right-0 -mt-2 -mr-2 bg-danger text-white rounded-full p-0.5 shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              aria-label="Remove image"
                            >
                              <CloseIcon className="w-4 h-4" />
                            </button>
                          </div>
                       ))}
                       {formData.photos.length < 5 && !isUploading && (
                          <div className="flex gap-4">
                            <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-gray-500">
                              <CameraIcon className="h-8 w-8" />
                              <span className="text-xs mt-1">Take Photo</span>
                              <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" disabled={isUploading} />
                            </label>
                             <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-gray-500">
                              <PhotoIcon className="h-8 w-8" />
                              <span className="text-xs mt-1">From Gallery</span>
                              <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={isUploading} />
                            </label>
                          </div>
                       )}
                    </div>
                     {isUploading && (
                        <div className="w-full max-w-sm mt-4">
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">Uploading photos...</span>
                                <span className="text-sm font-medium text-gray-700">{Math.round(uploadProgress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-primary h-2.5 rounded-full transition-width duration-300" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>
                {uploadError && <p className="text-sm text-danger mt-2">{uploadError}</p>}
              </div>
            </fieldset>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <fieldset className="border p-4 rounded-md space-y-4">
                    <legend className="text-lg font-semibold px-2">Charges (Optional)</legend>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Service Charge (₹)</label>
                        <input type="number" name="serviceCharge" value={formData.serviceCharge} onChange={handleChange} min="0" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light sm:text-sm text-gray-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Parts Charge (₹)</label>
                        <input type="number" name="partsCharge" value={formData.partsCharge} onChange={handleChange} min="0" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light sm:text-sm text-gray-900" />
                    </div>
                </fieldset>
                <fieldset className="border p-4 rounded-md space-y-4">
                    <legend className="text-lg font-semibold px-2">Scheduling (Optional)</legend>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Schedule Date</label>
                        <input type="date" name="scheduledDate" value={formData.scheduledDate} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light sm:text-sm text-gray-900" />
                    </div>
                </fieldset>
            </div>
        </form>
        <div className="flex justify-end items-center p-4 border-t bg-gray-50 rounded-b-lg">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">Cancel</button>
          <button type="submit" form="ticket-form" className="ml-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light transition-colors" disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Save Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
};