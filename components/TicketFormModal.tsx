import React, { useState } from 'react';
import { Ticket, ServiceType, UrgencyLevel } from '../types';
import { PRODUCT_CATEGORIES } from '../constants';
import { CloseIcon } from './Icons';

interface TicketFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
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

export const TicketFormModal: React.FC<TicketFormModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<any>(initialFormState);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);
        // FIX: Explicitly type 'file' as 'File' to resolve type inference issue.
        files.forEach((file: File) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target && typeof event.target.result === 'string') {
                    setFormData(prev => ({...prev, photos: [...prev.photos, event.target.result as string]}));
                }
            };
            reader.readAsDataURL(file);
        });
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
        scheduledDate: formData.scheduledDate ? new Date(`${formData.scheduledDate}T00:00:00`) : undefined,
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
                <textarea name="issueDescription" value={formData.issueDescription} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light sm:text-sm text-gray-900" required></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Add Photos (Optional)</label>
                <div className="mt-2 flex items-center flex-wrap gap-4">
                   {formData.photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img src={photo} alt={`Upload preview ${index + 1}`} className="h-24 w-24 rounded-md object-cover" />
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
                  <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" /></svg>
                    <span className="text-xs mt-1">Add Image</span>
                    <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </fieldset>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <fieldset className="border p-4 rounded-md space-y-4">
                    <legend className="text-lg font-semibold px-2">Charges (Optional)</legend>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Service Charge ($)</label>
                        <input type="number" name="serviceCharge" value={formData.serviceCharge} onChange={handleChange} min="0" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-light focus:ring-primary-light sm:text-sm text-gray-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Parts Charge ($)</label>
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
          <button type="submit" form="ticket-form" className="ml-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light transition-colors">Save Ticket</button>
        </div>
      </div>
    </div>
  );
};