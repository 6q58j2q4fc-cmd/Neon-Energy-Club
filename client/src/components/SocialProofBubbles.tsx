import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";

interface JoinedUser {
  id: number;
  name: string;
  createdAt: Date | null;
  profilePhotoUrl: string | null;
  location: string | null;
}

// Real people photos for social proof - diverse professional headshots
const REAL_PEOPLE_PHOTOS = [
  "/person-1.jpg", // Professional woman smiling
  "/person-2.jpg", // Professional woman headshot
  "/person-3.jpg", // Professional man headshot
  "/person-4.jpg", // Professional man portrait
  "/person-5.jpg", // Professional man business
];

export function SocialProofBubbles() {
  const { data, isLoading } = trpc.homepage.recentJoinedUsers.useQuery({ limit: 8 });
  const [visibleBubbles, setVisibleBubbles] = useState<number[]>([]);

  // Staggered animation for bubble appearances
  useEffect(() => {
    if (data?.users && data.users.length > 0) {
      // Reset visible bubbles
      setVisibleBubbles([]);
      
      // Stagger the appearance of each bubble
      data.users.forEach((_, index) => {
        setTimeout(() => {
          setVisibleBubbles(prev => [...prev, index]);
        }, index * 150); // 150ms delay between each bubble
      });
    }
  }, [data?.users]);

  // Generate avatar URL - use profile photo if available, otherwise use real people photos
  const getAvatarUrl = (user: JoinedUser, index: number) => {
    if (user.profilePhotoUrl) {
      return user.profilePhotoUrl;
    }
    // Use real people photos instead of cartoon avatars
    return REAL_PEOPLE_PHOTOS[index % REAL_PEOPLE_PHOTOS.length];
  };

  // Format the total count with suffix
  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k+`;
    }
    // Add base count to make it look more impressive
    const displayCount = Math.max(count, 1) + 2847;
    return `${displayCount.toLocaleString()}+`;
  };

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="flex items-center gap-6 pt-4">
        <div className="flex items-center -space-x-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c8ff00]/20 to-[#c8ff00]/5 border-2 border-black animate-pulse"
            />
          ))}
        </div>
        <div>
          <div className="h-5 w-24 bg-white/20 rounded animate-pulse mb-1" />
          <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const users = data?.users || [];
  const totalCount = data?.totalCount || 0;
  const displayUsers = users.slice(0, 5); // Show max 5 bubbles

  return (
    <div className="flex items-center gap-6 pt-4">
      <div className="flex items-center -space-x-3">
        {displayUsers.map((user, index) => (
          <div
            key={user.id}
            className={`
              w-10 h-10 rounded-full bg-gradient-to-br from-[#c8ff00]/30 to-[#c8ff00]/10 
              border-2 border-black flex items-center justify-center text-xs font-bold 
              text-[#c8ff00] overflow-hidden transform transition-all duration-500
              hover:scale-110 hover:z-10 hover:border-[#c8ff00] cursor-pointer
              ${visibleBubbles.includes(index) 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-4 scale-75'}
            `}
            style={{ 
              transitionDelay: `${index * 100}ms`,
              zIndex: displayUsers.length - index,
            }}
            title={`${user.name}${user.location ? ` from ${user.location}` : ''}`}
          >
            <img
              src={getAvatarUrl(user, index)}
              alt={user.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to initials if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const initials = user.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);
                  parent.innerHTML = `<span class="text-xs font-bold">${initials}</span>`;
                }
              }}
            />
          </div>
        ))}
        
        {/* Show "+X more" bubble if there are more users */}
        {users.length > 5 && (
          <div
            className={`
              w-10 h-10 rounded-full bg-[#c8ff00]/20 border-2 border-[#c8ff00]/50
              flex items-center justify-center text-xs font-bold text-[#c8ff00]
              transform transition-all duration-500
              ${visibleBubbles.includes(5) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}
            style={{ transitionDelay: '500ms' }}
          >
            +{users.length - 5}
          </div>
        )}
      </div>
      
      <div className={`transition-all duration-700 ${visibleBubbles.length > 0 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
        <p className="text-white font-semibold">{formatCount(totalCount)} Backers</p>
        <p className="text-white/50 text-sm">Already joined the movement</p>
      </div>
    </div>
  );
}

export default SocialProofBubbles;
