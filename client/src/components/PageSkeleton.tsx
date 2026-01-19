/**
 * Page loading skeleton components for better perceived performance
 */

export function HeroSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#0d2818] animate-pulse">
      <div className="container mx-auto px-4 pt-32">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Text content skeleton */}
          <div className="flex-1 space-y-6">
            <div className="h-4 w-48 bg-white/10 rounded" />
            <div className="h-16 w-3/4 bg-white/10 rounded" />
            <div className="h-16 w-1/2 bg-[#c8ff00]/20 rounded" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-white/10 rounded" />
              <div className="h-4 w-3/4 bg-white/10 rounded" />
            </div>
            <div className="flex gap-4 pt-4">
              <div className="h-12 w-40 bg-white/10 rounded-xl" />
              <div className="h-12 w-40 bg-[#c8ff00]/20 rounded-xl" />
            </div>
          </div>
          
          {/* Image skeleton */}
          <div className="flex-1">
            <div className="w-80 h-[500px] bg-white/5 rounded-3xl mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white/5 rounded-2xl p-6 animate-pulse">
          <div className="w-12 h-12 bg-white/10 rounded-xl mb-4" />
          <div className="h-6 w-3/4 bg-white/10 rounded mb-2" />
          <div className="h-4 w-full bg-white/10 rounded mb-1" />
          <div className="h-4 w-2/3 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white/5 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-white/10" />
      <div className="p-6 space-y-3">
        <div className="h-6 w-3/4 bg-white/10 rounded" />
        <div className="h-4 w-1/2 bg-white/10 rounded" />
        <div className="h-10 w-full bg-[#c8ff00]/20 rounded-xl mt-4" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white/5 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-white/10">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 h-4 bg-white/10 rounded" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b border-white/5 animate-pulse">
          {[1, 2, 3, 4].map((j) => (
            <div key={j} className="flex-1 h-4 bg-white/10 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="w-full h-[500px] bg-gradient-to-br from-[#0d2818] to-[#0a0a0a] rounded-xl animate-pulse flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-white/10 rounded-full mx-auto mb-4" />
        <div className="h-4 w-32 bg-white/10 rounded mx-auto" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-6 mb-8">
        <div className="w-24 h-24 bg-white/10 rounded-full" />
        <div className="space-y-3">
          <div className="h-8 w-48 bg-white/10 rounded" />
          <div className="h-4 w-32 bg-white/10 rounded" />
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/5 rounded-xl p-6">
            <div className="h-8 w-16 bg-white/10 rounded mb-2" />
            <div className="h-4 w-24 bg-white/10 rounded" />
          </div>
        ))}
      </div>
      
      {/* Form */}
      <div className="bg-white/5 rounded-xl p-6 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div className="h-4 w-24 bg-white/10 rounded mb-2" />
            <div className="h-10 w-full bg-white/10 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function NFTGallerySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white/5 rounded-2xl overflow-hidden animate-pulse">
          <div className="aspect-square bg-gradient-to-br from-purple-900/30 to-pink-900/30" />
          <div className="p-4 space-y-2">
            <div className="h-5 w-3/4 bg-white/10 rounded" />
            <div className="flex justify-between">
              <div className="h-4 w-16 bg-white/10 rounded" />
              <div className="h-4 w-20 bg-[#c8ff00]/20 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
