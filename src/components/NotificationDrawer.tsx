import React from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Bell,
  CheckCheck,
  ShieldAlert,
  Truck,
  Timer,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead, setActiveTab } = useApp();

  if (!isOpen) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'safety':
        return <ShieldAlert className="w-5 h-5 text-rose-600" />;
      case 'delivery':
        return <Truck className="w-5 h-5 text-amber-600" />;
      case 'expiry':
        return <Timer className="w-5 h-5 text-orange-600" />;
      case 'match':
        return <Sparkles className="w-5 h-5 text-emerald-600" />;
      default:
        return <Bell className="w-5 h-5 text-brand-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-surface-200 flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-surface-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bell className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-bold text-surface-900">Notification Center</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={markAllNotificationsRead}
                title="Mark all as read"
                className="text-sm text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1.5 px-3 py-1.5 hover:bg-emerald-50 rounded-lg transition"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Read All</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-surface-400 text-base">
                No notifications to display.
              </div>
            ) : (
              notifications.map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    markNotificationRead(item.id);
                    if (item.linkToTab) {
                      let tab = item.linkToTab;
                      if (tab === 'logistics') tab = 'deliveries';
                      if (tab === 'analytics') tab = 'impact';
                      setActiveTab(tab);
                      onClose();
                    }
                  }}
                  className={`p-4 rounded-2xl border text-base cursor-pointer transition ${
                    item.unread
                      ? 'bg-emerald-50/50 border-emerald-200 shadow-xs'
                      : 'bg-white border-surface-200 hover:bg-surface-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-surface-100 shrink-0">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-surface-900 truncate">
                          {item.title}
                        </span>
                        {item.unread && (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-surface-600 text-sm leading-relaxed mb-2">{item.message}</p>
                      <div className="flex items-center justify-between text-xs text-surface-400">
                        <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {item.linkToTab && (
                          <span className="text-emerald-700 font-bold flex items-center gap-1 hover:underline">
                            View details <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
