import { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, DollarSign, Users, TrendingUp, Award, Gift, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  data?: string | null;
  isRead: boolean | null;
  readAt?: Date | null;
  createdAt: Date;
}

// Icon mapping for notification types
const notificationIcons: Record<string, typeof Bell> = {
  new_referral: Users,
  commission_paid: DollarSign,
  commission_pending: DollarSign,
  rank_advancement: Award,
  team_growth: TrendingUp,
  reward_earned: Gift,
  default: Bell,
};

// Color mapping for notification types
const notificationColors: Record<string, string> = {
  new_referral: 'text-[#00ffff] bg-[#00ffff]/20',
  commission_paid: 'text-[#c8ff00] bg-[#c8ff00]/20',
  commission_pending: 'text-yellow-400 bg-yellow-400/20',
  rank_advancement: 'text-[#ff0080] bg-[#ff0080]/20',
  team_growth: 'text-green-400 bg-green-400/20',
  reward_earned: 'text-purple-400 bg-purple-400/20',
  default: 'text-white/60 bg-white/10',
};

export function NotificationBell() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const { data: notifications, refetch } = trpc.notification.getNotifications.useQuery(
    { limit: 10 },
    { enabled: isAuthenticated }
  );

  // Mark as read mutation
  const markAsRead = trpc.notification.markAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  // Mark all as read mutation
  const markAllAsRead = trpc.notification.markAllAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Count unread notifications
  const unreadCount = notifications?.filter((n: NotificationItem) => !n.isRead).length || 0;

  const handleNotificationClick = (notification: NotificationItem) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead.mutate({ notificationId: notification.id });
    }

    // Navigate based on notification type
    const data = notification.data ? JSON.parse(notification.data) : {};
    switch (notification.type) {
      case 'new_referral':
        setLocation('/distributor-portal?tab=team');
        break;
      case 'commission_paid':
      case 'commission_pending':
        setLocation('/distributor-portal?tab=commissions');
        break;
      case 'rank_advancement':
        setLocation('/distributor-portal?tab=dashboard');
        break;
      default:
        setLocation('/distributor-portal');
    }
    setIsOpen(false);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative z-[9999]" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-200 cursor-pointer pointer-events-auto"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-[#c8ff00]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-[#ff0080] text-white text-xs font-bold rounded-full animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-black/95 backdrop-blur-xl border border-[#c8ff00]/30 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-white font-bold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead.mutate()}
                className="text-xs text-[#c8ff00] hover:text-[#d4ff33] transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {!notifications || notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/60">No notifications yet</p>
                <p className="text-white/40 text-sm mt-1">
                  You'll see updates about referrals and commissions here
                </p>
              </div>
            ) : (
              notifications.map((notification: NotificationItem) => {
                const Icon = notificationIcons[notification.type] || notificationIcons.default;
                const colorClass = notificationColors[notification.type] || notificationColors.default;
                
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all hover:bg-white/5 ${
                      !notification.isRead ? 'bg-[#c8ff00]/5' : ''
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`font-medium text-sm ${!notification.isRead ? 'text-white' : 'text-white/80'}`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#c8ff00] flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-white/60 text-sm mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-white/40 text-xs mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications && notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-white/10">
              <button
                onClick={() => { setLocation('/distributor-portal?tab=notifications'); setIsOpen(false); }}
                className="w-full flex items-center justify-center gap-2 text-sm text-[#c8ff00] hover:text-[#d4ff33] transition-colors"
              >
                View all notifications
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
