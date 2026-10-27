import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  Thermometer,
  ShieldCheck,
  MessageSquare,
  Plus,
  Filter,
  Building,
  UserCheck
} from 'lucide-react';

interface FoodReview {
  id: string;
  donorName: string;
  recipientName: string;
  foodItem: string;
  quantity: string;
  rating: number; // 1-5
  temperatureRating: string;
  freshnessScore: string;
  date: string;
  comment: string;
  verifiedShelter: boolean;
  avatarInitials: string;
}

const SEED_REVIEWS: FoodReview[] = [
  {
    id: 'rev-101',
    donorName: 'Grand Amber Hotel',
    recipientName: 'Hope Harbor Family Shelter',
    foodItem: 'Steamed Salmon with Roasted Veggies',
    quantity: '50 portions',
    rating: 5,
    temperatureRating: '66°C (Hot Holding Pass)',
    freshnessScore: 'Excellent (Freshly Prepared)',
    date: 'Today, 1:45 PM',
    comment:
      'The meals arrived hot and securely packed in commercial trays. All temperature logs were intact. Our 42 residents had a nutritious, delicious dinner. Huge thanks to Grand Amber!',
    verifiedShelter: true,
    avatarInitials: 'HH'
  },
  {
    id: 'rev-102',
    donorName: 'Harvest Bakehouse',
    recipientName: 'Downtown Community Kitchen',
    foodItem: 'Whole Grain Sourdough & Pastries',
    quantity: '35 loaves',
    rating: 5,
    temperatureRating: 'Room Temperature (Properly Ventilated)',
    freshnessScore: 'Very High (Same-Day Surplus)',
    date: 'Yesterday, 6:10 PM',
    comment:
      'Freshly baked and individually bagged. Very easy for our volunteers to distribute directly to morning breakfast lines.',
    verifiedShelter: true,
    avatarInitials: 'DC'
  },
  {
    id: 'rev-103',
    donorName: 'Green Leaf Cafeteria',
    recipientName: 'St. Jude Youth Center',
    foodItem: 'Mediterranean Pasta & Lentil Soup',
    quantity: '40 portions',
    rating: 4,
    temperatureRating: '62°C (Insulated thermal bag)',
    freshnessScore: 'High Quality',
    date: '2 days ago',
    comment:
      'Great portion sizes and clear allergen labeling on every container. Courier arrived right on time within the 30-minute delivery window.',
    verifiedShelter: true,
    avatarInitials: 'SJ'
  },
  {
    id: 'rev-104',
    donorName: 'Sunrise Corporate Dining',
    recipientName: 'Veterans Welcome House',
    foodItem: 'Grilled Chicken & Steamed Rice',
    quantity: '30 portions',
    rating: 5,
    temperatureRating: '68°C (Insulated hot box)',
    freshnessScore: 'Excellent',
    date: '3 days ago',
    comment:
      'Zero waste! High quality protein that our kitchen staff was able to serve immediately upon courier drop-off verification.',
    verifiedShelter: true,
    avatarInitials: 'VW'
  }
];

export const FoodReviewsPage: React.FC = () => {
  const { donors, recipients } = useApp();
  const [reviews, setReviews] = useState<FoodReview[]>(SEED_REVIEWS);
  const [filterRating, setFilterRating] = useState<string>('all');
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);

  // Form state
  const [newFoodItem, setNewFoodItem] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [selectedDonor, setSelectedDonor] = useState(donors[0]?.name || 'Grand Amber Hotel');
  const [selectedRecipient, setSelectedRecipient] = useState(recipients[0]?.name || 'Hope Harbor');

  const filteredReviews = reviews.filter(r => {
    if (filterRating === 'all') return true;
    return r.rating === Number(filterRating);
  });

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFoodItem || !newComment) return;

    const newRev: FoodReview = {
      id: `rev-${Date.now().toString().slice(-4)}`,
      donorName: selectedDonor,
      recipientName: selectedRecipient,
      foodItem: newFoodItem,
      quantity: '25 portions',
      rating: newRating,
      temperatureRating: 'Verified Optimal Holding Temperature',
      freshnessScore: 'Verified Safe',
      date: 'Just now',
      comment: newComment,
      verifiedShelter: true,
      avatarInitials: selectedRecipient.slice(0, 2).toUpperCase()
    };

    setReviews([newRev, ...reviews]);
    setShowAddReviewModal(false);
    setNewFoodItem('');
    setNewComment('');
  };

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div className="bg-white p-7 rounded-2xl border border-surface-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h1 className="text-3xl font-extrabold text-surface-900 flex items-center gap-3">
            <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
            <span>Food Reviews & Quality Feedback</span>
          </h1>
          <p className="text-base text-surface-600 mt-1 max-w-2xl">
            Verified feedback from shelters and community kitchens on food freshness, holding temperature, and donor reliability.
          </p>
        </div>

        <button
          onClick={() => setShowAddReviewModal(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-sm transition self-start md:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Write Shelter Review</span>
        </button>
      </div>

      {/* 2. Quality Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-xs flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-2xl">
            4.9
          </div>
          <div>
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <div className="text-base font-bold text-surface-900 mt-0.5">Average Quality Rating</div>
            <div className="text-sm text-surface-500">Based on 148 verified handoffs</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-xs flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Thermometer className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-700">99.4%</div>
            <div className="text-base font-bold text-surface-900 mt-0.5">Temperature Compliance</div>
            <div className="text-sm text-surface-500">Verified by courier probes</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-xs flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-black text-blue-700">100%</div>
            <div className="text-base font-bold text-surface-900 mt-0.5">Verified Recipient Reviews</div>
            <div className="text-sm text-surface-500">Authenticated via drop-off OTP</div>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-surface-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-base font-semibold text-surface-700">
          <Filter className="w-5 h-5 text-surface-500" />
          <span>Filter by Rating:</span>
          <select
            value={filterRating}
            onChange={e => setFilterRating(e.target.value)}
            className="px-4 py-2 border border-surface-300 rounded-xl bg-surface-50 text-base font-medium"
          >
            <option value="all">All Reviews ({reviews.length})</option>
            <option value="5">5 Stars Only</option>
            <option value="4">4 Stars & Above</option>
          </select>
        </div>

        <span className="text-sm text-surface-500">
          Showing <strong>{filteredReviews.length}</strong> verified reviews
        </span>
      </div>

      {/* 4. Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map(review => (
          <div
            key={review.id}
            className="bg-white p-6 rounded-2xl border border-surface-200 shadow-xs space-y-4 hover:border-surface-300 transition"
          >
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-lg flex items-center justify-center shrink-0">
                  {review.avatarInitials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-surface-900">{review.recipientName}</h3>
                    {review.verifiedShelter && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Verified Shelter</span>
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-surface-500">
                    Reviewed food from: <strong>{review.donorName}</strong> • {review.date}
                  </div>
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                <div className="flex text-amber-400">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-sm font-bold text-amber-900">{review.rating}.0 / 5</span>
              </div>
            </div>

            {/* Food Item & Temperature Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="bg-surface-100 text-surface-800 text-sm font-semibold px-3 py-1 rounded-lg">
                🍛 {review.foodItem} ({review.quantity})
              </span>
              <span className="bg-emerald-50 text-emerald-800 text-sm font-semibold px-3 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                <Thermometer className="w-4 h-4 text-emerald-600" />
                <span>{review.temperatureRating}</span>
              </span>
              <span className="bg-blue-50 text-blue-800 text-sm font-semibold px-3 py-1 rounded-lg border border-blue-200">
                ✨ {review.freshnessScore}
              </span>
            </div>

            {/* Review Comment Body */}
            <p className="text-base text-surface-700 leading-relaxed bg-surface-50 p-4 rounded-xl border border-surface-100">
              "{review.comment}"
            </p>
          </div>
        ))}
      </div>

      {/* Add Review Modal */}
      {showAddReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-xs" onClick={() => setShowAddReviewModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl border border-surface-200 max-w-lg w-full p-6 z-10 space-y-4">
            <h3 className="text-xl font-bold text-surface-900 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-emerald-600" />
              <span>Submit Recipient Shelter Review</span>
            </h3>
            <p className="text-sm text-surface-500">
              Provide authentic feedback on the quality, temperature, and packaging of delivered meals.
            </p>

            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="block text-base font-semibold text-surface-800 mb-1">
                  Recipient Shelter Name
                </label>
                <select
                  value={selectedRecipient}
                  onChange={e => setSelectedRecipient(e.target.value)}
                  className="w-full px-4 py-2.5 border border-surface-300 rounded-xl text-base"
                >
                  {recipients.map(r => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-base font-semibold text-surface-800 mb-1">
                  Food Donor
                </label>
                <select
                  value={selectedDonor}
                  onChange={e => setSelectedDonor(e.target.value)}
                  className="w-full px-4 py-2.5 border border-surface-300 rounded-xl text-base"
                >
                  {donors.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-base font-semibold text-surface-800 mb-1">
                  Food Item Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vegetarian Fried Rice & Curry"
                  value={newFoodItem}
                  onChange={e => setNewFoodItem(e.target.value)}
                  className="w-full px-4 py-2.5 border border-surface-300 rounded-xl text-base"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-surface-800 mb-1">
                  Rating
                </label>
                <select
                  value={newRating}
                  onChange={e => setNewRating(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-surface-300 rounded-xl text-base font-bold"
                >
                  <option value={5}>5 Stars - Excellent Quality & Temperature</option>
                  <option value={4}>4 Stars - Very Good</option>
                  <option value={3}>3 Stars - Acceptable</option>
                </select>
              </div>

              <div>
                <label className="block text-base font-semibold text-surface-800 mb-1">
                  Shelter Staff Comments
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe food condition, taste, temperature, and recipient reception..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  className="w-full px-4 py-2.5 border border-surface-300 rounded-xl text-base"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddReviewModal(false)}
                  className="px-5 py-2.5 border border-surface-200 rounded-xl text-surface-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-xl shadow-xs"
                >
                  Publish Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
