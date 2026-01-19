import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, MapPin, DollarSign, ShoppingCart, Zap, Gift } from "lucide-react";

type NotificationType = "crowdfunding" | "franchise" | "preorder" | "distributor";

interface Notification {
  id: string;
  type: NotificationType;
  name: string;
  amount?: number;
  location?: string;
  tier?: string;
  product?: string;
  quantity?: number;
  timestamp: Date;
}

// Expanded name pools for variety
const firstNames = [
  "Sarah", "Michael", "Jennifer", "David", "Amanda", "Robert", "Emily", "Chris",
  "Jessica", "James", "Ashley", "Daniel", "Stephanie", "Matthew", "Nicole", "Andrew",
  "Michelle", "Joshua", "Kimberly", "Ryan", "Elizabeth", "Brandon", "Megan", "Justin",
  "Rachel", "Kevin", "Lauren", "Brian", "Samantha", "Tyler", "Heather", "Jason",
  "Brittany", "Aaron", "Christina", "Eric", "Amber", "Adam", "Tiffany", "Nathan",
  "Rebecca", "Patrick", "Kayla", "Sean", "Victoria", "Derek", "Melissa", "Kyle",
  "Maria", "Carlos", "Ana", "Luis", "Sofia", "Diego", "Isabella", "Marco",
  "Yuki", "Kenji", "Sakura", "Hiroshi", "Aisha", "Omar", "Fatima", "Hassan",
  "Priya", "Raj", "Ananya", "Vikram", "Chen", "Wei", "Mei", "Li"
];

const lastInitials = ["M", "R", "K", "L", "T", "P", "W", "B", "S", "H", "J", "D", "C", "G", "N", "F", "V", "Z", "A", "E"];

// Expanded location pools
const locations = [
  "Los Angeles, CA", "New York, NY", "Miami, FL", "Chicago, IL", "Houston, TX",
  "Phoenix, AZ", "San Diego, CA", "Dallas, TX", "Austin, TX", "San Francisco, CA",
  "Seattle, WA", "Denver, CO", "Boston, MA", "Atlanta, GA", "Nashville, TN",
  "Portland, OR", "Las Vegas, NV", "San Jose, CA", "Charlotte, NC", "Detroit, MI",
  "Minneapolis, MN", "Tampa, FL", "Orlando, FL", "Philadelphia, PA", "Washington, DC",
  "Baltimore, MD", "Cleveland, OH", "Pittsburgh, PA", "Cincinnati, OH", "Indianapolis, IN",
  "Kansas City, MO", "St. Louis, MO", "New Orleans, LA", "Salt Lake City, UT", "Honolulu, HI",
  "Anchorage, AK", "Sacramento, CA", "San Antonio, TX", "Fort Worth, TX", "Jacksonville, FL"
];

// Product types
const products = [
  { name: "NEON Original 12-Pack", quantity: 1 },
  { name: "NEON Organic 12-Pack", quantity: 1 },
  { name: "NEON Original 24-Pack", quantity: 1 },
  { name: "NEON Organic 24-Pack", quantity: 1 },
  { name: "NEON Variety Pack", quantity: 1 },
  { name: "NEON Original", quantity: 6 },
  { name: "NEON Organic", quantity: 6 },
  { name: "NEON Starter Bundle", quantity: 1 },
  { name: "NEON Pro Bundle", quantity: 1 },
  { name: "NEON Elite Bundle", quantity: 1 },
];

// Crowdfunding tiers
const crowdfundingTiers = [
  { tier: "SUPPORTER", amount: 25 },
  { tier: "SUPPORTER", amount: 50 },
  { tier: "ENERGIZER", amount: 100 },
  { tier: "ENERGIZER", amount: 150 },
  { tier: "VIP INSIDER", amount: 500 },
  { tier: "VIP INSIDER", amount: 750 },
  { tier: "FOUNDING MEMBER", amount: 2500 },
  { tier: "FOUNDING MEMBER", amount: 5000 },
];

// Generate a random notification
function generateNotification(): Notification {
  const types: NotificationType[] = ["crowdfunding", "franchise", "preorder", "distributor"];
  const type = types[Math.floor(Math.random() * types.length)];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastInitial = lastInitials[Math.floor(Math.random() * lastInitials.length)];
  const name = `${firstName} ${lastInitial}.`;
  
  const location = locations[Math.floor(Math.random() * locations.length)];
  
  // Random timestamp within the last 30 minutes
  const minutesAgo = Math.floor(Math.random() * 30) + 1;
  const timestamp = new Date(Date.now() - minutesAgo * 60 * 1000);
  
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  switch (type) {
    case "crowdfunding": {
      const tierData = crowdfundingTiers[Math.floor(Math.random() * crowdfundingTiers.length)];
      return {
        id,
        type,
        name,
        amount: tierData.amount,
        tier: tierData.tier,
        timestamp,
      };
    }
    case "franchise":
      return {
        id,
        type,
        name,
        location,
        timestamp,
      };
    case "preorder": {
      const product = products[Math.floor(Math.random() * products.length)];
      return {
        id,
        type,
        name,
        product: product.name,
        quantity: product.quantity,
        location,
        timestamp,
      };
    }
    case "distributor":
      return {
        id,
        type,
        name,
        location,
        timestamp,
      };
    default:
      return {
        id,
        type: "crowdfunding",
        name,
        amount: 100,
        tier: "ENERGIZER",
        timestamp,
      };
  }
}

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

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "crowdfunding":
      return <DollarSign className="w-5 h-5 text-[#c8ff00]" />;
    case "franchise":
      return <MapPin className="w-5 h-5 text-[#ff0080]" />;
    case "preorder":
      return <ShoppingCart className="w-5 h-5 text-[#00ffff]" />;
    case "distributor":
      return <Zap className="w-5 h-5 text-[#9d4edd]" />;
    default:
      return <Gift className="w-5 h-5 text-[#c8ff00]" />;
  }
}

function getIconBgColor(type: NotificationType) {
  switch (type) {
    case "crowdfunding":
      return "bg-[#c8ff00]/20";
    case "franchise":
      return "bg-[#ff0080]/20";
    case "preorder":
      return "bg-[#00ffff]/20";
    case "distributor":
      return "bg-[#9d4edd]/20";
    default:
      return "bg-[#c8ff00]/20";
  }
}

function getAccentColor(type: NotificationType) {
  switch (type) {
    case "crowdfunding":
      return "text-[#c8ff00]";
    case "franchise":
      return "text-[#ff0080]";
    case "preorder":
      return "text-[#00ffff]";
    case "distributor":
      return "text-[#9d4edd]";
    default:
      return "text-[#c8ff00]";
  }
}

function getPulseColor(type: NotificationType) {
  switch (type) {
    case "crowdfunding":
      return "bg-[#c8ff00]";
    case "franchise":
      return "bg-[#ff0080]";
    case "preorder":
      return "bg-[#00ffff]";
    case "distributor":
      return "bg-[#9d4edd]";
    default:
      return "bg-[#c8ff00]";
  }
}

export default function SocialProofNotifications() {
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cycleRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track shown notifications to avoid immediate repeats
  const shownNamesRef = useRef<Set<string>>(new Set());

  const showNextNotification = useCallback(() => {
    // Generate a new unique notification
    let notification = generateNotification();
    let attempts = 0;
    
    // Try to avoid showing the same name twice in a row (up to 5 attempts)
    while (shownNamesRef.current.has(notification.name) && attempts < 5) {
      notification = generateNotification();
      attempts++;
    }
    
    // Track this name
    shownNamesRef.current.add(notification.name);
    
    // Keep only last 10 names to allow recycling
    if (shownNamesRef.current.size > 10) {
      const names = Array.from(shownNamesRef.current);
      shownNamesRef.current = new Set(names.slice(-10));
    }
    
    setCurrentNotification(notification);
    setIsVisible(true);
    
    // Hide after 5 seconds
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 5000);
    
    // Schedule next notification after 10-15 seconds (random interval for natural feel)
    const nextDelay = 10000 + Math.random() * 5000;
    cycleRef.current = setTimeout(showNextNotification, nextDelay);
  }, []);

  useEffect(() => {
    // Show first notification after 4-6 seconds (random)
    const initialDelay = 4000 + Math.random() * 2000;
    const initialTimeout = setTimeout(showNextNotification, initialDelay);

    return () => {
      clearTimeout(initialTimeout);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (cycleRef.current) clearTimeout(cycleRef.current);
    };
  }, [showNextNotification]);

  const renderNotificationContent = (notification: Notification) => {
    const accentColor = getAccentColor(notification.type);
    
    switch (notification.type) {
      case "crowdfunding":
        return (
          <p className="text-gray-300 text-sm">
            backed <span className={`${accentColor} font-semibold`}>${notification.amount}</span>
            {notification.tier && (
              <span className="text-gray-400"> • {notification.tier}</span>
            )}
          </p>
        );
      case "franchise":
        return (
          <p className="text-gray-300 text-sm">
            applied for franchise in{" "}
            <span className={`${accentColor} font-semibold`}>{notification.location}</span>
          </p>
        );
      case "preorder":
        return (
          <p className="text-gray-300 text-sm">
            ordered{" "}
            {notification.quantity && notification.quantity > 1 && (
              <span className={`${accentColor} font-semibold`}>{notification.quantity}x </span>
            )}
            <span className={`${accentColor} font-semibold`}>{notification.product}</span>
          </p>
        );
      case "distributor":
        return (
          <p className="text-gray-300 text-sm">
            joined as distributor in{" "}
            <span className={`${accentColor} font-semibold`}>{notification.location}</span>
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 pointer-events-none">
      <AnimatePresence>
        {isVisible && currentNotification && (
          <motion.div
            initial={{ opacity: 0, x: -100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="pointer-events-auto"
          >
            <div className="bg-[#0a0a0a]/95 backdrop-blur-lg border border-white/10 rounded-xl p-4 shadow-2xl max-w-sm">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full ${getIconBgColor(currentNotification.type)} flex items-center justify-center`}>
                    {getNotificationIcon(currentNotification.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-white/60" />
                    <span className="font-bold text-white text-sm">{currentNotification.name}</span>
                  </div>
                  
                  {renderNotificationContent(currentNotification)}

                  <p className="text-gray-500 text-xs mt-1">
                    {getTimeAgo(currentNotification.timestamp)}
                  </p>
                </div>

                {/* Pulse indicator */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className={`w-2 h-2 rounded-full ${getPulseColor(currentNotification.type)}`}></div>
                    <div className={`absolute inset-0 w-2 h-2 rounded-full ${getPulseColor(currentNotification.type)} animate-ping`}></div>
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
