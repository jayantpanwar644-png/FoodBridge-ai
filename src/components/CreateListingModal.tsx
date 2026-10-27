import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FoodCategory, StorageRequirement, PackagingStatus, FoodUnit, FoodListing } from '../types';
import {
  X,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from 'lucide-react';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({ isOpen, onClose }) => {
  const { addListing, donors, currentSimulatedTime, setActiveTab } = useApp();

  // Essential fields
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState<number>(30);
  const [unit, setUnit] = useState<FoodUnit>('portions');
  const [collectionWindowHours, setCollectionWindowHours] = useState<number>(2.5);
  const [donorId, setDonorId] = useState(donors[0]?.id || 'donor-1');
  const [storageRequirement, setStorageRequirement] = useState<StorageRequirement>('hot_insulated');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);

  // Optional details (collapsible)
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);
  const [category, setCategory] = useState<FoodCategory>('cooked_meals');
  const [packaging, setPackaging] = useState<PackagingStatus>('sealed_containers');
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isHalal, setIsHalal] = useState(true);
  const [notes, setNotes] = useState('Containers sealed and packed at proper holding temperature.');

  // State after submission
  const [createdListing, setCreatedListing] = useState<FoodListing | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const currentDonor = donors.find(d => d.id === donorId) || donors[0];
  const allergenList = ['Dairy', 'Gluten / Wheat', 'Eggs', 'Nuts', 'Fish / Seafood', 'Soy'];

  const toggleAllergen = (item: string) => {
    setSelectedAllergens(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!foodName.trim()) {
      setErrorMessage('Please enter the food name.');
      return;
    }
    if (quantity <= 0 || isNaN(quantity)) {
      setErrorMessage('Please enter a valid quantity greater than zero.');
      return;
    }

    const cur = new Date(currentSimulatedTime).getTime();
    const collectionDeadline = new Date(cur + collectionWindowHours * 3600 * 1000).toISOString();
    const useByDeadline = new Date(cur + (collectionWindowHours + 3.5) * 3600 * 1000).toISOString();

    const newListing: FoodListing = {
      id: `list-${Date.now().toString().slice(-4)}`,
      donorId,
      foodName: foodName.trim(),
      category,
      quantity,
      remainingQuantity: quantity,
      unit,
      preparationTime: currentSimulatedTime,
      useByDeadline,
      collectionDeadline,
      storageRequirement,
      packaging,
      allergens: selectedAllergens,
      isVegetarian,
      isVegan: false,
      isHalal,
      pickupAddress: currentDonor.location.address,
      pickupLocation: currentDonor.location,
      pickupWindowStart: currentSimulatedTime,
      pickupWindowEnd: collectionDeadline,
      donorInstructions: notes,
      safetyVerified: true,
      quarantined: false,
      status: 'active',
      createdAt: currentSimulatedTime
    };

    addListing(newListing);
    setCreatedListing(newListing);
  };

  const handleResetAndClose = () => {
    setCreatedListing(null);
    setFoodName('');
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-xs" onClick={handleResetAndClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl border border-surface-200 max-w-xl w-full p-7 z-10 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-100">
          <div>
            <h2 className="text-2xl font-extrabold text-surface-900 flex items-center gap-2.5">
              <PlusCircle className="w-7 h-7 text-emerald-600" />
              <span>Donate Surplus Food</span>
            </h2>
            <p className="text-base text-surface-500 mt-1">
              Fill out a few essential fields to connect your surplus with a nearby shelter.
            </p>
          </div>
          <button onClick={handleResetAndClose} className="p-2 text-surface-400 hover:text-surface-700 rounded-lg hover:bg-surface-100">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Success Confirmation View */}
        {createdListing ? (
          <div className="py-6 space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-surface-900">Food Donation Published!</h3>
              <p className="text-surface-600 text-base mt-1.5">
                Your donation of <strong>{createdListing.quantity} {createdListing.unit}</strong> of "{createdListing.foodName}" is now visible to nearby shelters.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-50 border border-surface-200 text-left text-base space-y-2">
              <div className="flex justify-between">
                <span className="text-surface-500">Collection Deadline:</span>
                <strong className="text-surface-900">
                  {new Date(createdListing.collectionDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Storage Condition:</span>
                <strong className="text-surface-900 capitalize">{createdListing.storageRequirement.replace('_', ' ')}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Pickup Location:</span>
                <span className="text-surface-800 font-medium truncate max-w-[240px]">{createdListing.pickupAddress}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 pt-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-6 py-3 border border-surface-200 rounded-xl text-surface-700 font-bold text-base hover:bg-surface-50"
              >
                Done
              </button>
              <button
                type="button"
                onClick={() => {
                  handleResetAndClose();
                  setActiveTab('matching');
                }}
                className="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base flex items-center gap-2 shadow-sm"
              >
                <span>Find Suitable NGO</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-base flex items-center gap-2.5 font-medium">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Food Name */}
            <div>
              <label className="block font-semibold text-surface-800 text-base mb-1.5">
                Food Name *
              </label>
              <input
                type="text"
                required
                value={foodName}
                onChange={e => setFoodName(e.target.value)}
                placeholder="e.g., Vegetable Biryani & Lentil Curry"
                className="w-full px-4 py-2.5 border border-surface-300 rounded-xl text-base focus:ring-2 focus:ring-emerald-500 text-surface-900"
              />
            </div>

            {/* 2. Quantity & Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-surface-800 text-base mb-1.5">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-surface-300 rounded-xl text-base text-surface-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-surface-800 text-base mb-1.5">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={e => setUnit(e.target.value as FoodUnit)}
                  className="w-full px-4 py-2.5 border border-surface-300 rounded-xl text-base bg-surface-50 text-surface-900"
                >
                  <option value="portions">Portions / Servings</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="boxes">Boxes / Packs</option>
                </select>
              </div>
            </div>

            {/* 3. Collection Deadline Window */}
            <div>
              <label className="block font-semibold text-surface-800 text-base mb-1.5">
                Collection Deadline Window
              </label>
              <select
                value={collectionWindowHours}
                onChange={e => setCollectionWindowHours(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-surface-300 rounded-xl text-base bg-surface-50 text-surface-900"
              >
                <option value={1.0}>In 1 hour (Urgent pickup needed)</option>
                <option value={2.0}>In 2 hours (Standard lunch/dinner surplus)</option>
                <option value={3.5}>In 3.5 hours</option>
                <option value={6.0}>In 6 hours (Extended shelf-life)</option>
              </select>
            </div>

            {/* 4. Pickup Location */}
            <div>
              <label className="block font-semibold text-surface-800 text-base mb-1.5">
                Pickup Location
              </label>
              <select
                value={donorId}
                onChange={e => setDonorId(e.target.value)}
                className="w-full px-4 py-2.5 border border-surface-300 rounded-xl text-base bg-surface-50 text-surface-900"
              >
                {donors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.location.address}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Storage Requirements */}
            <div>
              <label className="block font-semibold text-surface-800 text-base mb-1.5">
                Storage Requirements *
              </label>
              <select
                value={storageRequirement}
                onChange={e => setStorageRequirement(e.target.value as StorageRequirement)}
                className="w-full px-4 py-2.5 border border-surface-300 rounded-xl text-base bg-surface-50 font-medium text-surface-900"
              >
                <option value="hot_insulated">Hot Insulated (Must remain ≥ 60°C)</option>
                <option value="refrigerated">Refrigerated (Must stay chilled ≤ 4°C)</option>
                <option value="room_temp">Ambient / Room Temperature</option>
                <option value="frozen">Deep Frozen (≤ -18°C)</option>
              </select>
            </div>

            {/* 6. Known Allergens */}
            <div>
              <label className="block font-semibold text-surface-800 text-base mb-2">
                Known Allergens (Select any present)
              </label>
              <div className="flex flex-wrap gap-2">
                {allergenList.map(item => {
                  const isSelected = selectedAllergens.includes(item);
                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => toggleAllergen(item)}
                      className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border transition ${
                        isSelected
                          ? 'bg-rose-100 border-rose-300 text-rose-900'
                          : 'bg-surface-50 border-surface-200 text-surface-700 hover:bg-surface-100'
                      }`}
                    >
                      {isSelected ? `✓ ${item}` : item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Collapsible Additional Details */}
            <div className="pt-2 border-t border-surface-100">
              <button
                type="button"
                onClick={() => setShowOptionalDetails(!showOptionalDetails)}
                className="flex items-center justify-between w-full py-2 text-base font-bold text-surface-700 hover:text-surface-900"
              >
                <span>Additional Details (Optional)</span>
                {showOptionalDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              {showOptionalDetails && (
                <div className="mt-3 space-y-4 pl-1">
                  <div>
                    <label className="block font-semibold text-surface-700 text-base mb-1">Packaging Status</label>
                    <select
                      value={packaging}
                      onChange={e => setPackaging(e.target.value as PackagingStatus)}
                      className="w-full px-4 py-2 border border-surface-300 rounded-xl text-base"
                    >
                      <option value="sealed_containers">Sealed Food Containers</option>
                      <option value="individual_boxes">Individual Meal Boxes</option>
                      <option value="bulk_pans">Bulk Gastronorm Trays</option>
                      <option value="reusable_crates">Reusable Sanitized Crates</option>
                    </select>
                  </div>

                  <div className="flex gap-6 text-base">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-surface-800">
                      <input
                        type="checkbox"
                        checked={isVegetarian}
                        onChange={e => setIsVegetarian(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Vegetarian</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-surface-800">
                      <input
                        type="checkbox"
                        checked={isHalal}
                        onChange={e => setIsHalal(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Halal</span>
                    </label>
                  </div>

                  <div>
                    <label className="block font-semibold text-surface-700 text-base mb-1">Driver Instructions</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="e.g. Ring loading dock bell #2"
                      className="w-full px-4 py-2 border border-surface-300 rounded-xl text-base"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-surface-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-5 py-2.5 border border-surface-200 rounded-xl text-surface-700 hover:bg-surface-50 font-semibold text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-xl shadow-xs transition"
              >
                Submit Donation
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
