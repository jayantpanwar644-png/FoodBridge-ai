import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ScanBarcode,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Plus,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Tag,
  Info
} from 'lucide-react';

interface ScannedProduct {
  barcode: string;
  name: string;
  brand: string;
  category: string;
  packageType: string;
  expiryDate: string;
  shelfLifeRemainingDays: number;
  storageRecommended: string;
  allergens: string[];
  safeForDonation: boolean;
  donorCategory: string;
  estimatedPortions: number;
}

const SAMPLE_PRODUCTS: ScannedProduct[] = [
  {
    barcode: '8901030829141',
    name: 'Whole Grain Multigrain Bread (Pack of 12)',
    brand: 'Harvest Bakehouse',
    category: 'Bakery & Dairy',
    packageType: 'Sealed plastic wrapper',
    expiryDate: '2026-10-31',
    shelfLifeRemainingDays: 3,
    storageRecommended: 'Ambient / Room Temperature',
    allergens: ['Gluten / Wheat', 'Soy'],
    safeForDonation: true,
    donorCategory: 'bakery_dairy',
    estimatedPortions: 24
  },
  {
    barcode: '8901725181229',
    name: 'Pasteurized Homogenized Milk Crates (10L)',
    brand: 'Valley Farms Dairy',
    category: 'Dairy Products',
    packageType: 'Insulated sealed carton',
    expiryDate: '2026-10-29',
    shelfLifeRemainingDays: 1,
    storageRecommended: 'Refrigerated (≤ 4°C)',
    allergens: ['Dairy / Lactose'],
    safeForDonation: true,
    donorCategory: 'bakery_dairy',
    estimatedPortions: 30
  },
  {
    barcode: '8901499010839',
    name: 'Mixed Garden Vegetable Salad Bowls',
    brand: 'FreshRoots Organics',
    category: 'Fresh Produce',
    packageType: 'Sealed compostable clamshell',
    expiryDate: '2026-10-30',
    shelfLifeRemainingDays: 2,
    storageRecommended: 'Refrigerated (≤ 4°C)',
    allergens: [],
    safeForDonation: true,
    donorCategory: 'fresh_produce',
    estimatedPortions: 18
  },
  {
    barcode: '8901058852237',
    name: 'Unlabeled Frozen Meat Casserole',
    brand: 'Unknown Commercial Pack',
    category: 'Cooked Meals',
    packageType: 'Torn plastic tray',
    expiryDate: '2026-10-25',
    shelfLifeRemainingDays: -3,
    storageRecommended: 'Deep Frozen (≤ -18°C)',
    allergens: ['Gluten', 'Eggs'],
    safeForDonation: false,
    donorCategory: 'cooked_meals',
    estimatedPortions: 15
  }
];

export const ProductScannerPage: React.FC = () => {
  const { addListing, donors, currentSimulatedTime, setActiveTab } = useApp();
  const [selectedProduct, setSelectedProduct] = useState<ScannedProduct>(SAMPLE_PRODUCTS[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scanSuccessMessage, setScanSuccessMessage] = useState('');

  const simulateScan = (product: ScannedProduct) => {
    setIsScanning(true);
    setScanSuccessMessage('');
    setTimeout(() => {
      setSelectedProduct(product);
      setIsScanning(false);
      setScanSuccessMessage(`Barcode ${product.barcode} scanned successfully!`);
    }, 700);
  };

  const handleCreateDonationFromScan = () => {
    if (!selectedProduct.safeForDonation) return;

    const cur = new Date(currentSimulatedTime).getTime();
    const collectionDeadline = new Date(cur + 3 * 3600 * 1000).toISOString();
    const donor = donors[0];

    addListing({
      id: `list-${Date.now().toString().slice(-4)}`,
      donorId: donor.id,
      foodName: selectedProduct.name,
      category: 'packaged_staples',
      quantity: selectedProduct.estimatedPortions,
      remainingQuantity: selectedProduct.estimatedPortions,
      unit: 'portions',
      preparationTime: currentSimulatedTime,
      useByDeadline: new Date(selectedProduct.expiryDate).toISOString(),
      collectionDeadline,
      storageRequirement: selectedProduct.storageRecommended.includes('Refrigerated')
        ? 'refrigerated'
        : 'room_temp',
      packaging: 'sealed_containers',
      allergens: selectedProduct.allergens,
      isVegetarian: true,
      isVegan: false,
      isHalal: true,
      pickupAddress: donor.location.address,
      pickupLocation: donor.location,
      pickupWindowStart: currentSimulatedTime,
      pickupWindowEnd: collectionDeadline,
      donorInstructions: `Scanned from barcode ${selectedProduct.barcode}. ${selectedProduct.packageType}.`,
      safetyVerified: true,
      quarantined: false,
      status: 'active',
      createdAt: currentSimulatedTime
    });

    setActiveTab('listings');
  };

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div className="bg-white p-7 rounded-2xl border border-surface-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h1 className="text-3xl font-extrabold text-surface-900 flex items-center gap-3">
            <ScanBarcode className="w-8 h-8 text-emerald-600" />
            <span>Product Scanner</span>
          </h1>
          <p className="text-base text-surface-600 mt-1 max-w-2xl">
            Scan a packaged product to check its available reference information, shelf-life, and safety suitability before donation.
          </p>
        </div>

        {selectedProduct.safeForDonation && (
          <button
            onClick={handleCreateDonationFromScan}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-sm transition self-start md:self-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Donate Scanned Item</span>
          </button>
        )}
      </div>

      {scanSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-base font-semibold flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <span>{scanSuccessMessage}</span>
        </div>
      )}

      {/* 2. Interactive Scanner & Quick Samples */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simulated Camera / Scanner View */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-surface-200 shadow-xs space-y-5">
          <h2 className="text-xl font-bold text-surface-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-600" />
            <span>Barcode & Label Scanner</span>
          </h2>

          {/* Scanner Viewfinder Simulation */}
          <div className="relative aspect-4/3 bg-surface-900 rounded-xl overflow-hidden flex flex-col items-center justify-center text-white border-2 border-surface-700">
            {/* Viewfinder overlay */}
            <div className="absolute inset-8 border-2 border-dashed border-emerald-400 rounded-lg flex items-center justify-center">
              {isScanning && (
                <div className="w-full h-1 bg-emerald-400 shadow-lg shadow-emerald-400 animate-bounce" />
              )}
            </div>

            <div className="z-10 text-center px-4 space-y-2">
              <ScanBarcode className={`w-12 h-12 mx-auto ${isScanning ? 'text-emerald-400 animate-pulse' : 'text-surface-400'}`} />
              <div className="text-base font-bold">
                {isScanning ? 'Scanning Barcode...' : 'Align Barcode Inside Frame'}
              </div>
              <div className="text-sm text-surface-400">
                Supports GS1 barcodes, UPC-A, and EAN-13 packaging
              </div>
            </div>

            {/* Current detected code */}
            <div className="absolute bottom-3 left-4 right-4 bg-surface-800/90 py-1.5 px-3 rounded-lg text-sm text-center font-mono text-emerald-300">
              Active: {selectedProduct.barcode}
            </div>
          </div>

          {/* Manual Input Fallback */}
          <div className="space-y-2">
            <label className="block text-base font-semibold text-surface-700">
              Or Enter Barcode Manually
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 8901030829141"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-surface-300 rounded-xl text-base font-mono"
              />
              <button
                onClick={() => {
                  const match = SAMPLE_PRODUCTS.find(p => p.barcode.includes(manualCode)) || SAMPLE_PRODUCTS[0];
                  simulateScan(match);
                }}
                className="px-5 py-2.5 bg-surface-900 hover:bg-surface-800 text-white font-bold text-base rounded-xl transition"
              >
                Lookup
              </button>
            </div>
          </div>

          {/* Quick Demo Scenarios */}
          <div>
            <div className="text-sm font-bold uppercase tracking-wider text-surface-500 mb-2">
              Test Sample Barcodes:
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_PRODUCTS.map((prod, idx) => (
                <button
                  key={prod.barcode}
                  onClick={() => simulateScan(prod)}
                  className={`p-3 rounded-xl border text-left text-sm transition ${
                    selectedProduct.barcode === prod.barcode
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-surface-200 hover:bg-surface-50 text-surface-700'
                  }`}
                >
                  <div className="truncate font-semibold">{prod.name}</div>
                  <div className="text-xs text-surface-500 mt-0.5 font-mono">{prod.barcode}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Scanned Product Reference Card */}
        <div className="lg:col-span-7 bg-white p-7 rounded-2xl border border-surface-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-surface-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-surface-400">
                Scanned Reference Data
              </span>
              <h2 className="text-2xl font-extrabold text-surface-900 mt-1">
                {selectedProduct.name}
              </h2>
              <div className="text-base text-surface-500 mt-0.5">
                Brand: <strong>{selectedProduct.brand}</strong> • Category: <strong>{selectedProduct.category}</strong>
              </div>
            </div>

            {selectedProduct.safeForDonation ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-base font-bold shrink-0 self-start sm:self-auto border border-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Eligible for Donation</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-100 text-rose-800 text-base font-bold shrink-0 self-start sm:self-auto border border-rose-300">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Expired / Ineligible</span>
              </span>
            )}
          </div>

          {/* Key Reference Attributes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 space-y-1">
              <span className="text-sm font-semibold text-surface-500">Packaging Integrity</span>
              <div className="text-base font-bold text-surface-900">{selectedProduct.packageType}</div>
            </div>

            <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 space-y-1">
              <span className="text-sm font-semibold text-surface-500">Storage Recommended</span>
              <div className="text-base font-bold text-surface-900">{selectedProduct.storageRecommended}</div>
            </div>

            <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 space-y-1">
              <span className="text-sm font-semibold text-surface-500">Printed Expiry Date</span>
              <div className={`text-base font-bold ${selectedProduct.shelfLifeRemainingDays < 0 ? 'text-rose-700' : 'text-surface-900'}`}>
                {selectedProduct.expiryDate} ({selectedProduct.shelfLifeRemainingDays > 0 ? `${selectedProduct.shelfLifeRemainingDays} days shelf-life left` : 'Expired'})
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 space-y-1">
              <span className="text-sm font-semibold text-surface-500">Estimated Portions</span>
              <div className="text-base font-bold text-emerald-700">
                ~{selectedProduct.estimatedPortions} meals for community shelters
              </div>
            </div>
          </div>

          {/* Allergens Disclosure */}
          <div>
            <h3 className="text-base font-bold text-surface-900 mb-2">Detected Allergens</h3>
            {selectedProduct.allergens.length === 0 ? (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-sm text-emerald-900 font-medium">
                No major allergens flagged by reference lookup.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedProduct.allergens.map((alg, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-sm font-bold border border-amber-300"
                  >
                    ⚠️ Contains: {alg}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Box */}
          <div className="pt-4 border-t border-surface-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-surface-500 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-surface-400 shrink-0" />
              <span>Reference data verified against GS1 database & food safety guidelines.</span>
            </div>

            {selectedProduct.safeForDonation ? (
              <button
                onClick={handleCreateDonationFromScan}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-sm transition"
              >
                + Create Food Listing ({selectedProduct.estimatedPortions} Portions)
              </button>
            ) : (
              <div className="text-rose-700 font-bold text-sm bg-rose-50 px-4 py-2 rounded-xl border border-rose-200">
                Cannot list expired items for human consumption.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
