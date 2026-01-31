import { useState } from "react";
import { Camera, Heart, MessageCircle, Share2, ChevronLeft, ChevronRight, X, Instagram, Twitter, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";


// Sample customer photos - in production, these would come from a database/API
const customerPhotos = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=600&fit=crop",
    username: "@fitness_mike",
    location: "Los Angeles, CA",
    caption: "Pre-workout fuel that actually works! 💪 #NEONEnergy #FitnessLife",
    likes: 2847,
    comments: 156,
    verified: true,
    product: "original"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=600&h=600&fit=crop",
    username: "@sarah_wellness",
    location: "Miami, FL",
    caption: "Finally an energy drink made for women! Love the NEON Pink 💗 #NEONPink #WomensHealth",
    likes: 3421,
    comments: 234,
    verified: true,
    product: "pink"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop",
    username: "@gym_rat_jake",
    location: "Austin, TX",
    caption: "The only energy drink in my gym bag. Clean energy, no crash! 🏋️ #NEONOriginal",
    likes: 1956,
    comments: 89,
    verified: false,
    product: "original"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=600&fit=crop",
    username: "@yoga_with_jen",
    location: "San Diego, CA",
    caption: "Post-yoga refreshment 🧘‍♀️ Love that it supports breast cancer research! #NEONPink #GiveBack",
    likes: 4102,
    comments: 312,
    verified: true,
    product: "pink"
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop",
    username: "@crossfit_chris",
    location: "Denver, CO",
    caption: "WOD fuel! This stuff actually glows under blacklight 🤯 #NEONEnergy #CrossFit",
    likes: 2234,
    comments: 145,
    verified: false,
    product: "original"
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop",
    username: "@runner_rachel",
    location: "Portland, OR",
    caption: "Marathon training partner 🏃‍♀️ Natural caffeine for the win! #NEONPink #MarathonTraining",
    likes: 3678,
    comments: 201,
    verified: true,
    product: "pink"
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=600&h=600&fit=crop",
    username: "@gamer_dave",
    location: "Seattle, WA",
    caption: "Late night gaming sessions powered by NEON! No sugar crash 🎮 #NEONOriginal #Gaming",
    likes: 5421,
    comments: 456,
    verified: true,
    product: "original"
  },
  {
    id: 8,
    image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&h=600&fit=crop",
    username: "@surf_life_sam",
    location: "Huntington Beach, CA",
    caption: "Dawn patrol fuel 🏄‍♂️ Clean energy for clean waves! #NEONEnergy #SurfLife",
    likes: 2890,
    comments: 167,
    verified: false,
    product: "original"
  }
];

interface CustomerPhotoGalleryProps {
  variant?: "default" | "compact";
  maxPhotos?: number;
}

export function CustomerPhotoGallery({ variant = "default", maxPhotos = 8 }: CustomerPhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<typeof customerPhotos[0] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedPhotos, setLikedPhotos] = useState<Set<number>>(new Set());

  const displayPhotos = customerPhotos.slice(0, maxPhotos);

  const handleLike = (photoId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedPhotos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  };

  const openPhoto = (photo: typeof customerPhotos[0], index: number) => {
    setSelectedPhoto(photo);
    setCurrentIndex(index);
  };

  const navigatePhoto = (direction: "prev" | "next") => {
    const newIndex = direction === "prev" 
      ? (currentIndex - 1 + displayPhotos.length) % displayPhotos.length
      : (currentIndex + 1) % displayPhotos.length;
    setCurrentIndex(newIndex);
    setSelectedPhoto(displayPhotos[newIndex]);
  };

  return (
    <section className="py-16 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#c8ff00]/5 to-transparent" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#c8ff00]/20 to-pink-500/20 border border-[#c8ff00]/30 mb-6">
            <Camera className="w-5 h-5 text-[#c8ff00]" />
            <span className="text-[#c8ff00] font-bold text-sm tracking-wider">COMMUNITY SPOTLIGHT</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Real People, <span className="bg-gradient-to-r from-[#c8ff00] to-pink-400 bg-clip-text text-transparent">Real Energy</span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            See how our community fuels their passions with NEON. Tag us @NEONEnergy to be featured!
          </p>
        </div>

        {/* Photo Grid */}
        <div className={`grid ${variant === "compact" ? "grid-cols-2 md:grid-cols-4 gap-3" : "grid-cols-2 md:grid-cols-4 gap-4"}`}>
          {displayPhotos.map((photo, index) => (
            <div 
              key={photo.id}
              onClick={() => openPhoto(photo, index)}
              className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer bg-black/40"
            >
              {/* Image */}
              <img 
                src={photo.image} 
                alt={`Customer photo by ${photo.username}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white font-bold text-sm">{photo.username}</span>
                    {photo.verified && (
                      <div className="w-4 h-4 rounded-full bg-[#c8ff00] flex items-center justify-center">
                        <Star className="w-2.5 h-2.5 text-black fill-black" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-white/70 text-xs">
                    <span className="flex items-center gap-1">
                      <Heart className={`w-3 h-3 ${likedPhotos.has(photo.id) ? "fill-[#ff0080] text-[#ff0080]" : ""}`} />
                      {photo.likes.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {photo.comments}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product badge */}
              <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-bold ${
                photo.product === "pink" 
                  ? "bg-pink-500/90 text-white" 
                  : "bg-[#c8ff00]/90 text-black"
              }`}>
                {photo.product === "pink" ? "PINK" : "ORIGINAL"}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <p className="text-white/40 text-sm mb-4">Share your NEON moments with #NEONEnergy</p>
          <div className="flex items-center justify-center gap-4">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-bold text-sm hover:scale-105 transition-transform"
            >
              <Instagram className="w-4 h-4" />
              Follow on Instagram
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-bold text-sm hover:bg-white/20 transition-colors"
            >
              <Twitter className="w-4 h-4" />
              Follow on X
            </a>
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border border-white/10 overflow-hidden">
          <DialogTitle className="sr-only">Customer Photo by {selectedPhoto?.username}</DialogTitle>
          {selectedPhoto && (
            <div className="flex flex-col md:flex-row">
              {/* Image */}
              <div className="relative md:w-2/3 aspect-square md:aspect-auto">
                <img 
                  src={selectedPhoto.image} 
                  alt={`Photo by ${selectedPhoto.username}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation arrows */}
                <button
                  onClick={() => navigatePhoto("prev")}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={() => navigatePhoto("next")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Details */}
              <div className="md:w-1/3 p-6 flex flex-col">
                {/* User info */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c8ff00] to-pink-500 flex items-center justify-center text-black font-bold">
                    {selectedPhoto.username.charAt(1).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{selectedPhoto.username}</span>
                      {selectedPhoto.verified && (
                        <div className="w-4 h-4 rounded-full bg-[#c8ff00] flex items-center justify-center">
                          <Star className="w-2.5 h-2.5 text-black fill-black" />
                        </div>
                      )}
                    </div>
                    <span className="text-white/50 text-sm">{selectedPhoto.location}</span>
                  </div>
                </div>

                {/* Caption */}
                <p className="text-white/80 text-sm leading-relaxed flex-grow">
                  {selectedPhoto.caption}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-6 pt-4 border-t border-white/10">
                  <button 
                    onClick={(e) => handleLike(selectedPhoto.id, e)}
                    className="flex items-center gap-2 text-white/70 hover:text-[#ff0080] transition-colors"
                  >
                    <Heart className={`w-6 h-6 ${likedPhotos.has(selectedPhoto.id) ? "fill-[#ff0080] text-[#ff0080]" : ""}`} />
                    <span className="font-bold">{(selectedPhoto.likes + (likedPhotos.has(selectedPhoto.id) ? 1 : 0)).toLocaleString()}</span>
                  </button>
                  <button className="flex items-center gap-2 text-white/70 hover:text-[#c8ff00] transition-colors">
                    <MessageCircle className="w-6 h-6" />
                    <span className="font-bold">{selectedPhoto.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 text-white/70 hover:text-[#00ffff] transition-colors ml-auto">
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>

                {/* Product badge */}
                <div className={`mt-4 px-4 py-2 rounded-xl text-center font-bold text-sm ${
                  selectedPhoto.product === "pink" 
                    ? "bg-pink-500/20 text-pink-400 border border-pink-500/30" 
                    : "bg-[#c8ff00]/20 text-[#c8ff00] border border-[#c8ff00]/30"
                }`}>
                  Enjoying NEON {selectedPhoto.product === "pink" ? "Pink" : "Original"}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default CustomerPhotoGallery;
