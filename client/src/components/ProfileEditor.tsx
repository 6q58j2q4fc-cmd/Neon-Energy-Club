import { useState, useRef, useEffect } from "react";
import ImageCropper from "./ImageCropper";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Camera, 
  Check, 
  X, 
  Link as LinkIcon, 
  Globe, 
  MapPin, 
  User, 
  Loader2,
  Copy,
  ExternalLink,
  Eye,
  AlertCircle,
  Sparkles
} from "lucide-react";

interface ProfileEditorProps {
  userType: "distributor" | "customer";
  onSave?: () => void;
}

export default function ProfileEditor({ userType, onSave }: ProfileEditorProps) {
  const utils = trpc.useUtils();
  
  // Fetch current profile
  const { data: profileData, isLoading: profileLoading } = trpc.profile.getMyProfile.useQuery();
  const { data: profileStats } = trpc.profile.getStats.useQuery();
  
  // Form state
  const [displayName, setDisplayName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [slugInput, setSlugInput] = useState("");
  
  // Social media links
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");
  
  // Photo upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [rawImageData, setRawImageData] = useState<string | null>(null);
  
  // Slug availability check
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  
  // Mutations
  const updateProfile = trpc.profile.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile Updated", {
        description: "Your profile information has been saved.",
      });
      utils.profile.getMyProfile.invalidate();
      onSave?.();
    },
    onError: (error) => {
      toast.error("Update Failed", {
        description: error.message || "Failed to update profile.",
      });
    },
  });
  
  const uploadPhoto = trpc.profile.uploadPhoto.useMutation({
    onSuccess: (data) => {
      toast.success("Photo Uploaded", {
        description: "Your profile photo has been updated.",
      });
      setPhotoPreview(null);
      utils.profile.getMyProfile.invalidate();
    },
    onError: (error) => {
      toast.error("Upload Failed", {
        description: error.message || "Failed to upload photo.",
      });
    },
  });
  
  const updateSlug = trpc.profile.updateSlug.useMutation({
    onSuccess: (data) => {
      toast.success("Referral Link Updated", {
        description: `Your new link is: neonenergyclub.com/${data.slug}`,
      });
      setCustomSlug(data.slug);
      setIsEditingSlug(false);
      setSlugInput("");
      utils.profile.getMyProfile.invalidate();
      utils.profile.getStats.invalidate();
    },
    onError: (error) => {
      toast.error("Update Failed", {
        description: error.message || "Failed to update referral link.",
      });
    },
  });
  
  const { data: slugCheckData, error: slugCheckError, isFetching: slugCheckFetching } = trpc.profile.checkSlugAvailability.useQuery(
    { slug: slugInput },
    { 
      enabled: slugInput.length >= 3 && isEditingSlug,
    }
  );
  
  // Handle slug check results
  useEffect(() => {
    if (slugCheckData) {
      setSlugAvailable(slugCheckData.available);
      setSlugError(slugCheckData.available ? null : "This link is already taken");
      setIsCheckingSlug(false);
    }
  }, [slugCheckData]);
  
  useEffect(() => {
    if (slugCheckError) {
      setSlugError(slugCheckError.message);
      setSlugAvailable(false);
      setIsCheckingSlug(false);
    }
  }, [slugCheckError]);
  
  // Initialize form with existing data
  useEffect(() => {
    if (profileData?.personalizedProfile) {
      setDisplayName(profileData.personalizedProfile.displayName || "");
      setLocation(profileData.personalizedProfile.location || "");
      setBio(profileData.personalizedProfile.bio || "");
      setCustomSlug(profileData.personalizedProfile.customSlug || "");
    } else if (profileData?.user) {
      setDisplayName(profileData.user.name || "");
    }
  }, [profileData]);
  
  // Debounced slug check
  useEffect(() => {
    if (slugInput.length >= 3) {
      setIsCheckingSlug(true);
      const timer = setTimeout(() => {
        // Query will run automatically due to enabled condition
      }, 500);
      return () => clearTimeout(timer);
    } else if (slugInput.length > 0 && slugInput.length < 3) {
      setSlugError("Must be at least 3 characters");
      setSlugAvailable(false);
    } else {
      setSlugError(null);
      setSlugAvailable(null);
    }
  }, [slugInput]);
  
  // Handle photo selection
  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
      toast.error("Invalid File Type", {
        description: "Please select a JPEG, PNG, GIF, or WebP image.",
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File Too Large", {
        description: "Please select an image smaller than 5MB.",
      });
      return;
    }
    
    // Create preview and show cropper
    const reader = new FileReader();
    reader.onload = (e) => {
      setRawImageData(e.target?.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };
  
  // Handle crop complete
  const handleCropComplete = (croppedImage: string) => {
    setPhotoPreview(croppedImage);
    setShowCropper(false);
    setRawImageData(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  // Handle crop cancel
  const handleCropCancel = () => {
    setShowCropper(false);
    setRawImageData(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  // Upload photo
  const handlePhotoUpload = async () => {
    if (!photoPreview) return;
    
    setIsUploadingPhoto(true);
    try {
      // Extract base64 data and mime type
      const [header, base64Data] = photoPreview.split(",");
      const mimeType = header.match(/data:(.*?);/)?.[1] || "image/jpeg";
      
      await uploadPhoto.mutateAsync({
        photoBase64: base64Data,
        mimeType,
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };
  
  // Save profile
  const handleSaveProfile = () => {
    updateProfile.mutate({
      displayName: displayName || undefined,
      location: location || undefined,
      bio: bio || undefined,
    });
  };
  
  // Save slug
  const handleSaveSlug = () => {
    if (!slugAvailable || !slugInput) return;
    updateSlug.mutate({ slug: slugInput });
  };
  
  // Copy referral link
  const copyReferralLink = () => {
    const link = `neonenergyclub.com/${customSlug}`;
    navigator.clipboard.writeText(`https://${link}`);
    toast.success("Link Copied!", {
      description: `Your referral link has been copied to clipboard.`,
    });
  };
  
  // Format slug input (lowercase, alphanumeric + hyphens only)
  const formatSlugInput = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-");
  };
  
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#c8ff00]" />
      </div>
    );
  }
  
  const currentPhotoUrl = profileData?.personalizedProfile?.profilePhotoUrl;
  
  return (
    <div className="space-y-6">
      {/* Profile Photo Section */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Camera className="h-5 w-5 text-[#c8ff00]" />
            Profile Photo
          </CardTitle>
          <CardDescription>
            Upload a photo to personalize your landing page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-[#c8ff00]/30">
                <AvatarImage src={photoPreview || currentPhotoUrl || undefined} />
                <AvatarFallback className="bg-[#c8ff00]/20 text-[#c8ff00] text-4xl">
                  {displayName?.charAt(0) || "N"}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-[#c8ff00] text-black hover:bg-[#a8d600] transition-colors"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>
            
            <div className="flex-1 space-y-3">
              <p className="text-sm text-white/60">
                Recommended: Square image, at least 400x400 pixels
              </p>
              {photoPreview && (
                <div className="flex gap-2">
                  <Button
                    onClick={handlePhotoUpload}
                    disabled={isUploadingPhoto || uploadPhoto.isPending}
                    className="bg-[#c8ff00] text-black hover:bg-[#a8d600]"
                  >
                    {isUploadingPhoto || uploadPhoto.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Save Photo
                  </Button>
                  <Button
                    onClick={() => setPhotoPreview(null)}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Referral Link Section */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-[#c8ff00]" />
            Your Referral Link
          </CardTitle>
          <CardDescription>
            Customize your unique referral URL
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEditingSlug ? (
            <>
              <div className="flex items-center gap-2 p-4 rounded-lg bg-black/40 border border-[#c8ff00]/30">
                <Globe className="h-5 w-5 text-[#c8ff00]" />
                <span className="text-white/60">neonenergyclub.com/</span>
                <span className="text-[#c8ff00] font-bold">{customSlug || "your-link"}</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    setIsEditingSlug(true);
                    setSlugInput(customSlug);
                  }}
                  variant="outline"
                  className="border-[#c8ff00]/30 text-[#c8ff00] hover:bg-[#c8ff00]/10"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Customize Link
                </Button>
                
                {customSlug && (
                  <>
                    <Button
                      onClick={copyReferralLink}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                    
                    <Button
                      onClick={() => window.open(`/r/${customSlug}`, "_blank")}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </>
                )}
              </div>
              
              {/* Stats */}
              {profileStats && (
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#c8ff00]">{profileStats.pageViews}</p>
                    <p className="text-sm text-white/60">Page Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#c8ff00]">{profileStats.signupsGenerated}</p>
                    <p className="text-sm text-white/60">Signups Generated</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-white/80">New Referral Link</Label>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 px-3 py-2 rounded-l-lg bg-black/60 border border-r-0 border-white/20">
                    <span className="text-white/60 text-sm">neonenergyclub.com/</span>
                  </div>
                  <div className="relative flex-1">
                    <Input
                      value={slugInput}
                      onChange={(e) => setSlugInput(formatSlugInput(e.target.value))}
                      placeholder="your-custom-link"
                      className="bg-black/40 border-white/20 text-white rounded-l-none pr-10"
                      maxLength={50}
                    />
                    {isCheckingSlug && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-white/40" />
                    )}
                    {!isCheckingSlug && slugAvailable === true && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                    {!isCheckingSlug && slugAvailable === false && slugInput.length >= 3 && (
                      <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                {slugError && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {slugError}
                  </p>
                )}
                {slugAvailable && (
                  <p className="text-green-400 text-sm mt-1 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    This link is available!
                  </p>
                )}
                <p className="text-white/40 text-xs mt-2">
                  Only lowercase letters, numbers, and hyphens allowed. Minimum 3 characters.
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveSlug}
                  disabled={!slugAvailable || updateSlug.isPending}
                  className="bg-[#c8ff00] text-black hover:bg-[#a8d600]"
                >
                  {updateSlug.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Save Link
                </Button>
                <Button
                  onClick={() => {
                    setIsEditingSlug(false);
                    setSlugInput("");
                    setSlugError(null);
                    setSlugAvailable(null);
                  }}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Profile Details Section */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5 text-[#c8ff00]" />
            Profile Details
          </CardTitle>
          <CardDescription>
            Customize how you appear on your landing page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white/80">Display Name</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name or business name"
              className="mt-1 bg-black/40 border-white/20 text-white"
              maxLength={255}
            />
            <p className="text-white/40 text-xs mt-1">
              This is how your name will appear on your personalized landing page
            </p>
          </div>
          
          <div>
            <Label className="text-white/80">Location</Label>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State"
                className="bg-black/40 border-white/20 text-white pl-10"
                maxLength={255}
              />
            </div>
            <p className="text-white/40 text-xs mt-1">
              Help visitors know where you're based
            </p>
          </div>
          
          <div>
            <Label className="text-white/80">Bio / Tagline</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share why you love NEON Energy..."
              className="mt-1 bg-black/40 border-white/20 text-white min-h-[100px]"
              maxLength={1000}
            />
            <p className="text-white/40 text-xs mt-1">
              {bio.length}/1000 characters - A brief message to visitors
            </p>
          </div>
          
          <Separator className="bg-white/10" />
          
          <Button
            onClick={handleSaveProfile}
            disabled={updateProfile.isPending}
            className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d600]"
          >
            {updateProfile.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Save Profile Details
          </Button>
        </CardContent>
      </Card>
      
      {/* Preview Card */}
      <Card className="bg-gradient-to-br from-[#c8ff00]/10 to-purple-500/10 border-[#c8ff00]/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16 border-2 border-[#c8ff00]">
              <AvatarImage src={photoPreview || currentPhotoUrl || undefined} />
              <AvatarFallback className="bg-[#c8ff00]/20 text-[#c8ff00] text-2xl">
                {displayName?.charAt(0) || "N"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-bold text-white">
                {displayName || "Your Name"}
              </h3>
              {location && (
                <p className="text-white/60 text-sm flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {location}
                </p>
              )}
              <Badge className="mt-1 bg-[#c8ff00]/20 text-[#c8ff00] border-[#c8ff00]/30">
                {userType === "distributor" ? "NEON Distributor" : "NEON Ambassador"}
              </Badge>
            </div>
          </div>
          {bio && (
            <p className="text-white/80 italic text-sm">"{bio}"</p>
          )}
          <p className="text-[#c8ff00] text-sm mt-4 text-center">
            Preview of how your profile card will appear
          </p>
        </CardContent>
      </Card>
      
      {/* Image Cropper Modal */}
      {showCropper && rawImageData && (
        <ImageCropper
          imageSrc={rawImageData}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1}
          outputSize={400}
        />
      )}
    </div>
  );
}
