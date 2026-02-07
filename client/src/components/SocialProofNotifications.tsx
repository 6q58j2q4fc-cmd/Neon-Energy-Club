import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, MapPin, DollarSign, ShoppingCart, Zap, Gift } from "lucide-react";
import { trpc } from "@/lib/trpc";

type NotificationType = "crowdfunding" | "franchise" | "preorder" | "distributor" | "newsletter";

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
  isSimulated?: boolean;
}

// Diverse names for simulated notifications (variety for authenticity)
const SIMULATED_NAMES = [
  "Sarah M.", "James T.", "Emily R.", "Michael B.", "Jessica L.", "David K.",
  "Ashley W.", "Christopher P.", "Amanda H.", "Matthew S.", "Stephanie G.",
  "Andrew J.", "Nicole F.", "Joshua D.", "Lauren C.", "Ryan N.", "Megan V.",
  "Brandon A.", "Brittany E.", "Justin O.", "Samantha I.", "Tyler U.",
  "Kayla Y.", "Kevin Q.", "Rachel Z.", "Daniel X.", "Michelle W.",
  "Robert L.", "Jennifer K.", "William H.", "Elizabeth G.", "Joseph F.",
  "Maria D.", "Carlos S.", "Ana R.", "Luis M.", "Sofia P.", "Diego V.",
  "Valentina C.", "Alejandro B.", "Isabella N.", "Marcus J.", "Aaliyah T.",
  "DeShawn W.", "Keisha L.", "Jamal H.", "Latoya R.", "Tyrone M.",
  "Shaniqua P.", "Darius K.", "Imani S.", "Malik D.", "Jasmine F.",
  "Wei L.", "Mei C.", "Hiroshi T.", "Yuki S.", "Jin W.", "Sakura M.",
  "Raj P.", "Priya S.", "Arjun K.", "Ananya R.", "Vikram M.", "Deepa N."
];

// Diverse locations for simulated notifications
const SIMULATED_LOCATIONS = [
  "Los Angeles, CA", "New York, NY", "Miami, FL", "Houston, TX", "Phoenix, AZ",
  "Chicago, IL", "San Diego, CA", "Dallas, TX", "San Jose, CA", "Austin, TX",
  "Jacksonville, FL", "San Francisco, CA", "Columbus, OH", "Fort Worth, TX",
  "Charlotte, NC", "Seattle, WA", "Denver, CO", "Boston, MA", "Nashville, TN",
  "Detroit, MI", "Portland, OR", "Las Vegas, NV", "Memphis, TN", "Louisville, KY",
  "Baltimore, MD", "Milwaukee, WI", "Albuquerque, NM", "Tucson, AZ", "Fresno, CA",
  "Sacramento, CA", "Atlanta, GA", "Kansas City, MO", "Colorado Springs, CO",
  "Omaha, NE", "Raleigh, NC", "Long Beach, CA", "Virginia Beach, VA", "Oakland, CA",
  "Minneapolis, MN", "Tampa, FL", "Arlington, TX", "New Orleans, LA", "Honolulu, HI",
  "Anaheim, CA", "Henderson, NV", "Orlando, FL", "St. Louis, MO", "Pittsburgh, PA"
];

// Products for simulated pre-orders
const SIMULATED_PRODUCTS = [
  "NEON Original 12-Pack", "NEON Pink 6-Pack", "NEON Variety Pack",
  "NEON Original 24-Pack", "NEON Pink 12-Pack", "NEON Original 6-Pack",
  "NEON Starter Bundle", "NEON Family Pack", "NEON Party Pack"
];

// Crowdfunding tiers - matching Crowdfund.tsx page
const CROWDFUNDING_TIERS = [
  { tier: "Supporter", amount: 25 },
  { tier: "Energizer", amount: 100 },
  { tier: "VIP Insider", amount: 500 },
  { tier: "Founding Member", amount: 2500 }
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
    case "newsletter":
      return <Gift className="w-5 h-5 text-[#c8ff00]" />;
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
    case "newsletter":
      return "bg-[#c8ff00]/20";
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
    case "newsletter":
      return "text-[#c8ff00]";
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
    case "newsletter":
      return "bg-[#c8ff00]";
    default:
      return "bg-[#c8ff00]";
  }
}

// Anonymize name for privacy (show first name and last initial)
function anonymizeName(fullName: string | null | undefined, email?: string | null): string {
  if (fullName) {
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[parts.length - 1][0]}.`;
    }
    return parts[0];
  }
  if (email) {
    const localPart = email.split('@')[0];
    return localPart.charAt(0).toUpperCase() + localPart.slice(1, 4) + '...';
  }
  return 'Someone';
}

// Generate a random simulated notification
function generateSimulatedNotification(): Notification {
  const types: NotificationType[] = ["preorder", "crowdfunding", "distributor"];
  const type = types[Math.floor(Math.random() * types.length)];
  const name = SIMULATED_NAMES[Math.floor(Math.random() * SIMULATED_NAMES.length)];
  const location = SIMULATED_LOCATIONS[Math.floor(Math.random() * SIMULATED_LOCATIONS.length)];
  
  // Random timestamp within last 30 minutes for freshness
  const timestamp = new Date(Date.now() - Math.random() * 30 * 60 * 1000);
  
  switch (type) {
    case "preorder":
      return {
        id: `sim-preorder-${Date.now()}-${Math.random()}`,
        type: "preorder",
        name,
        product: SIMULATED_PRODUCTS[Math.floor(Math.random() * SIMULATED_PRODUCTS.length)],
        quantity: Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 2 : 1,
        location,
        timestamp,
        isSimulated: true,
      };
    case "crowdfunding":
      const tierData = CROWDFUNDING_TIERS[Math.floor(Math.random() * CROWDFUNDING_TIERS.length)];
      return {
        id: `sim-crowdfund-${Date.now()}-${Math.random()}`,
        type: "crowdfunding",
        name,
        amount: tierData.amount,
        tier: tierData.tier,
        timestamp,
        isSimulated: true,
      };
    case "distributor":
      return {
        id: `sim-distributor-${Date.now()}-${Math.random()}`,
        type: "distributor",
        name,
        location,
        timestamp,
        isSimulated: true,
      };
    default:
      return {
        id: `sim-preorder-${Date.now()}-${Math.random()}`,
        type: "preorder",
        name,
        product: SIMULATED_PRODUCTS[0],
        timestamp,
        isSimulated: true,
      };
  }
}

export default function SocialProofNotifications() {
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [notificationQueue, setNotificationQueue] = useState<Notification[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [usedSimulatedIds, setUsedSimulatedIds] = useState<Set<string>>(new Set());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cycleRef = useRef<NodeJS.Timeout | null>(null);
  
  // Mutation to record simulated contributions
  const recordSimulated = trpc.crowdfunding.recordSimulated.useMutation();

  // Fetch real data from the database
  const recentContributions = trpc.crowdfunding.recentContributions.useQuery(undefined, {
    refetchInterval: 60000, // Refetch every minute
  });
  
  const recentDistributors = trpc.distributor.recentEnrollments.useQuery(undefined, {
    refetchInterval: 60000,
  });

  // Build notification queue from real data + simulated sales
  useEffect(() => {
    const notifications: Notification[] = [];
    
    // Add real crowdfunding contributions
    if (recentContributions.data) {
      recentContributions.data.forEach((contribution: { id: number; name: string | null; email: string | null; amount: number; tier: string | null; createdAt: string }) => {
        notifications.push({
          id: `crowdfund-${contribution.id}`,
          type: "crowdfunding",
          name: anonymizeName(contribution.name, contribution.email),
          amount: contribution.amount,
          tier: contribution.tier ?? undefined,
          timestamp: new Date(contribution.createdAt),
          isSimulated: false,
        });
      });
    }
    
    // Add real distributor enrollments
    if (recentDistributors.data) {
      recentDistributors.data.forEach((distributor: { id: number; name: string | null; city: string | null; state: string | null; createdAt: string }) => {
        notifications.push({
          id: `distributor-${distributor.id}`,
          type: "distributor",
          name: anonymizeName(distributor.name),
          location: distributor.city && distributor.state 
            ? `${distributor.city}, ${distributor.state}` 
            : undefined,
          timestamp: new Date(distributor.createdAt),
          isSimulated: false,
        });
      });
    }
    
    // Generate simulated notifications to fill the queue (for perception of active sales)
    // Only generate if we have fewer than 15 real notifications
    const simulatedCount = Math.max(0, 15 - notifications.length);
    for (let i = 0; i < simulatedCount; i++) {
      notifications.push(generateSimulatedNotification());
    }
    
    // Shuffle to mix real and simulated
    for (let i = notifications.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [notifications[i], notifications[j]] = [notifications[j], notifications[i]];
    }
    
    setNotificationQueue(notifications);
  }, [recentContributions.data, recentDistributors.data]);

  const showNextNotification = useCallback(() => {
    if (notificationQueue.length === 0) {
      // Generate a fresh simulated notification if queue is empty
      const simulated = generateSimulatedNotification();
      setCurrentNotification(simulated);
      setIsVisible(true);
      
      // Hide after 5 seconds
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      
      // Schedule next notification
      const nextDelay = 12000 + Math.random() * 18000; // 12-30 seconds
      cycleRef.current = setTimeout(showNextNotification, nextDelay);
      return;
    }
    
    let notification = notificationQueue[currentIndex % notificationQueue.length];
    
    // If it's a simulated notification we've shown before, generate a fresh one
    if (notification.isSimulated && usedSimulatedIds.has(notification.id)) {
      notification = generateSimulatedNotification();
    }
    
    // Track simulated IDs to avoid exact repeats
    if (notification.isSimulated) {
      setUsedSimulatedIds(prev => {
        const newSet = new Set(prev);
        newSet.add(notification.id);
        return newSet;
      });
    }
    
    // Update timestamp for simulated notifications to appear fresh
    if (notification.isSimulated) {
      notification = {
        ...notification,
        timestamp: new Date(Date.now() - Math.random() * 5 * 60 * 1000), // Within last 5 minutes
      };
      
      // Record simulated contribution to crowdfunding goal
      const amount = notification.type === "crowdfunding" && notification.amount 
        ? notification.amount 
        : notification.type === "preorder" 
        ? Math.floor(Math.random() * 70) + 10 // $10-$80 for preorders
        : Math.floor(Math.random() * 50) + 25; // $25-$75 for distributor signups
      
      recordSimulated.mutate({
        amount,
        type: notification.type as "preorder" | "crowdfunding" | "distributor",
      });
    }
    
    setCurrentNotification(notification);
    setIsVisible(true);
    setCurrentIndex((prev) => prev + 1);
    
    // Hide after 5 seconds
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 5000);
    
    // Schedule next notification (8-20 seconds for active feel)
    const nextDelay = 8000 + Math.random() * 12000;
    cycleRef.current = setTimeout(showNextNotification, nextDelay);
  }, [notificationQueue, currentIndex, usedSimulatedIds]);

  useEffect(() => {
    // Show first notification after 4-8 seconds
    const initialDelay = 4000 + Math.random() * 4000;
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
            applied for franchise
            {notification.location && (
              <> in <span className={`${accentColor} font-semibold`}>{notification.location}</span></>
            )}
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
            joined as distributor
            {notification.location && (
              <> in <span className={`${accentColor} font-semibold`}>{notification.location}</span></>
            )}
          </p>
        );
      case "newsletter":
        return (
          <p className="text-gray-300 text-sm">
            subscribed to the newsletter
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
