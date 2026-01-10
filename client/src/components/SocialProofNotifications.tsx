import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, MapPin, DollarSign } from "lucide-react";

interface Notification {
  id: string;
  type: "crowdfunding" | "franchise";
  name: string;
  amount?: number;
  location?: string;
  tier?: string;
  timestamp: Date;
}

// Simulated recent activity data
const recentActivity: Notification[] = [
  {
    id: "1",
    type: "crowdfunding",
    name: "Sarah M.",
    amount: 100,
    tier: "ENERGIZER",
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: "2",
    type: "franchise",
    name: "Michael R.",
    location: "Los Angeles, CA",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: "3",
    type: "crowdfunding",
    name: "Jennifer K.",
    amount: 500,
    tier: "VIP INSIDER",
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
  },
  {
    id: "4",
    type: "franchise",
    name: "David L.",
    location: "New York, NY",
    timestamp: new Date(Date.now() - 12 * 60 * 1000),
  },
  {
    id: "5",
    type: "crowdfunding",
    name: "Amanda T.",
    amount: 25,
    tier: "SUPPORTER",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: "6",
    type: "franchise",
    name: "Robert P.",
    location: "Miami, FL",
    timestamp: new Date(Date.now() - 18 * 60 * 1000),
  },
  {
    id: "7",
    type: "crowdfunding",
    name: "Emily W.",
    amount: 2500,
    tier: "FOUNDING MEMBER",
    timestamp: new Date(Date.now() - 22 * 60 * 1000),
  },
  {
    id: "8",
    type: "franchise",
    name: "Chris B.",
    location: "Chicago, IL",
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
  },
];

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function SocialProofNotifications() {
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [notificationIndex, setNotificationIndex] = useState(0);

  useEffect(() => {
    // Show first notification after 3 seconds
    const initialTimeout = setTimeout(() => {
      setCurrentNotification(recentActivity[0]);
    }, 3000);

    return () => clearTimeout(initialTimeout);
  }, []);

  useEffect(() => {
    if (currentNotification === null) return;

    // Show notification for 5 seconds, then hide for 8 seconds before showing next
    const hideTimeout = setTimeout(() => {
      setCurrentNotification(null);
    }, 5000);

    const nextTimeout = setTimeout(() => {
      const nextIndex = (notificationIndex + 1) % recentActivity.length;
      setNotificationIndex(nextIndex);
      setCurrentNotification(recentActivity[nextIndex]);
    }, 13000); // 5s visible + 8s hidden

    return () => {
      clearTimeout(hideTimeout);
      clearTimeout(nextTimeout);
    };
  }, [currentNotification, notificationIndex]);

  return (
    <div className="fixed bottom-6 left-6 z-50 pointer-events-none">
      <AnimatePresence>
        {currentNotification && (
          <motion.div
            initial={{ opacity: 0, x: -100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="pointer-events-auto"
          >
            <div className="bg-[#0a0a0a]/95 backdrop-blur-lg border border-[#c8ff00]/30 rounded-xl p-4 shadow-2xl max-w-sm">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0">
                  {currentNotification.type === "crowdfunding" ? (
                    <div className="w-10 h-10 rounded-full bg-[#c8ff00]/20 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-[#c8ff00]" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#c8ff00]/20 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-[#c8ff00]" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-[#c8ff00]" />
                    <span className="font-bold text-white text-sm">{currentNotification.name}</span>
                  </div>
                  
                  {currentNotification.type === "crowdfunding" ? (
                    <p className="text-gray-300 text-sm">
                      backed <span className="text-[#c8ff00] font-semibold">${currentNotification.amount}</span>
                      {currentNotification.tier && (
                        <span className="text-gray-400"> • {currentNotification.tier}</span>
                      )}
                    </p>
                  ) : (
                    <p className="text-gray-300 text-sm">
                      applied for franchise in{" "}
                      <span className="text-[#c8ff00] font-semibold">{currentNotification.location}</span>
                    </p>
                  )}

                  <p className="text-gray-500 text-xs mt-1">
                    {getTimeAgo(currentNotification.timestamp)}
                  </p>
                </div>

                {/* Pulse indicator */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-[#c8ff00]"></div>
                    <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#c8ff00] animate-ping"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
