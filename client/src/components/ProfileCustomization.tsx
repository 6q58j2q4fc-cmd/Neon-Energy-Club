import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Camera, 
  Link as LinkIcon, 
  Check, 
  X, 
  Loader2, 
  Copy, 
  ExternalLink,
  User,
  MapPin,
  FileText,
  Eye,
  Users,
  Share2
} from "lucide-react";

interface ProfileCustomizationProps {
  userType: "distributor" | "customer";
}

export default function ProfileCustomization({ userType }: ProfileCustomizationProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  // State
  const [customSlug, setCustomSlug] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Queries
  const { data: profileData, isLoading: isLoadingProfile } = trpc.profile.getMyProfile.useQuery();
  const { data: stats } = trpc.profile.getStats.useQuery();

  // Mutations
  const updateSlugMutation = trpc.profile.updateSlug.useMutation({
    onSuccess: () => {
      toast.success("Referral Link Updated", {
        description: "Your personalized referral link has been updated successfully.",
      });
      utils.profile.getMyProfile.invalidate();
      utils.profile.getStats.invalidate();
      setSlugAvailable(null);
    },
    onError: (error) => {
      toast.error("Update Failed", {
        description: error.message,
      });
    },
  });

  const updateProfileMutation = trpc.profile.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile Updated", {
        description: "Your profile information has been saved.",
      });
      utils.profile.getMyProfile.invalidate();
    },
    onError: (error) => {
      toast.error("Update Failed", {
        description: error.message,
      });
    },
  });

  const uploadPhotoMutation = trpc.profile.uploadPhoto.useMutation({
    onSuccess: () => {
      toast.success("Photo Uploaded", {
        description: "Your profile photo has been updated.",
      });
      utils.profile.getMyProfile.invalidate();
      setIsUploading(false);
    },
    onError: (error) => {
      toast.error("Upload Failed", {
        description: error.message,
      });
      setIsUploading(false);
    },
  });

  // Initialize form with existing data
  useEffect(() => {
    if (profileData?.personalizedProfile) {
      setCustomSlug(profileData.personalizedProfile.customSlug || "");
      setDisplayName(profileData.personalizedProfile.displayName || "");
      setLocation(profileData.personalizedProfile.location || "");
      setBio(profileData.personalizedProfile.bio || "");
    } else if (profileData?.user) {
      setDisplayName(profileData.user.name || "");
    }
  }, [profileData]);

  // Check slug availability with debounce
  useEffect(() => {
    if (!customSlug || customSlug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    // Don't check if it's the same as current slug
    if (profileData?.personalizedProfile?.customSlug === customSlug.toLowerCase()) {
      setSlugAvailable(true);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingSlug(true);
      try {
        const response = await utils.client.profile.checkSlugAvailability.useQuery({ slug: customSlug });
        setSlugAvailable(response.available);
      } catch {
        setSlugAvailable(null);
      }
      setIsCheckingSlug(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [customSlug, profileData?.personalizedProfile?.customSlug, utils.client.profile.checkSlugAvailability]);

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
      toast.error("Invalid File Type", {
        description: "Please upload a JPEG, PNG, GIF, or WebP image.",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File Too Large", {
        description: "Please upload an image smaller than 5MB.",
      });
      return;
    }

    setIsUploading(true);

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadPhotoMutation.mutate({
        photoBase64: base64,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle slug update
  const handleSlugUpdate = () => {
    if (!customSlug || customSlug.length < 3 || !slugAvailable) return;
    updateSlugMutation.mutate({ slug: customSlug });
  };

  // Handle profile update
  const handleProfileUpdate = () => {
    updateProfileMutation.mutate({
      displayName: displayName || undefined,
      location: location || undefined,
      bio: bio || undefined,
    });
  };

  // Copy referral link
  const copyReferralLink = () => {
    const link = `${window.location.host}/d/${stats?.customSlug || customSlug}`;
    navigator.clipboard.writeText(`https://${link}`);
    toast.success("Link Copied", {
      description: "Your referral link has been copied to clipboard.",
    });
  };

  const referralLink = stats?.customSlug || profileData?.personalizedProfile?.customSlug;

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#c8ff00]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-black/40 border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#c8ff00]/20">
                <Eye className="h-5 w-5 text-[#c8ff00]" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Page Views</p>
                <p className="text-2xl font-bold text-white">{stats?.pageViews || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/40 border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#c8ff00]/20">
                <Users className="h-5 w-5 text-[#c8ff00]" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Signups Generated</p>
                <p className="text-2xl font-bold text-white">{stats?.signupsGenerated || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/40 border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#c8ff00]/20">
                <Share2 className="h-5 w-5 text-[#c8ff00]" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <Badge className={stats?.isPublished ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                  {stats?.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Photo */}
      <Card className="bg-black/40 border-white/10">
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
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border-2 border-[#c8ff00]/30">
              <AvatarImage src={profileData?.personalizedProfile?.profilePhotoUrl || undefined} />
              <AvatarFallback className="bg-[#c8ff00]/20 text-[#c8ff00] text-2xl">
                {displayName?.charAt(0) || profileData?.user?.name?.charAt(0) || "N"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-[#c8ff00] text-black hover:bg-[#a8d600]"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" />
                    Upload Photo
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-400">JPEG, PNG, GIF, or WebP. Max 5MB.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Referral Link */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-[#c8ff00]" />
            Your Personalized Referral Link
          </CardTitle>
          <CardDescription>
            Customize your unique referral URL. This link will display your personalized landing page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm whitespace-nowrap">{window.location.host}/d/</span>
            <div className="relative flex-1">
              <Input
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="your-unique-link"
                className="bg-black/60 border-white/20 text-white pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isCheckingSlug && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                {!isCheckingSlug && slugAvailable === true && <Check className="h-4 w-4 text-green-500" />}
                {!isCheckingSlug && slugAvailable === false && <X className="h-4 w-4 text-red-500" />}
              </div>
            </div>
          </div>
          
          {slugAvailable === false && (
            <p className="text-red-400 text-sm">This link is already taken. Please choose a different one.</p>
          )}
          
          {slugAvailable === true && customSlug !== profileData?.personalizedProfile?.customSlug && (
            <p className="text-green-400 text-sm">This link is available!</p>
          )}

          <div className="flex items-center gap-2">
            <Button
              onClick={handleSlugUpdate}
              disabled={!slugAvailable || updateSlugMutation.isPending || customSlug.length < 3}
              className="bg-[#c8ff00] text-black hover:bg-[#a8d600]"
            >
              {updateSlugMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Link"
              )}
            </Button>
            
            {referralLink && (
              <>
                <Button
                  variant="outline"
                  onClick={copyReferralLink}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(`/r/${referralLink}`, "_blank")}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </>
            )}
          </div>

          {referralLink && (
            <div className="p-3 rounded-lg bg-[#c8ff00]/10 border border-[#c8ff00]/30">
              <p className="text-sm text-gray-300">
                <span className="text-[#c8ff00] font-medium">Your active link:</span>{" "}
                <span className="text-white">https://{window.location.host}/d/{referralLink}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5 text-[#c8ff00]" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Customize how you appear on your personalized landing page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300 flex items-center gap-2">
              <User className="h-4 w-4" />
              Display Name
            </Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name as shown on your page"
              className="bg-black/60 border-white/20 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State (e.g., Los Angeles, CA)"
              className="bg-black/60 border-white/20 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Bio / Tagline
            </Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short bio or tagline for your landing page..."
              className="bg-black/60 border-white/20 text-white min-h-[100px]"
              maxLength={1000}
            />
            <p className="text-xs text-gray-400">{bio.length}/1000 characters</p>
          </div>

          <Separator className="bg-white/10" />

          <Button
            onClick={handleProfileUpdate}
            disabled={updateProfileMutation.isPending}
            className="bg-[#c8ff00] text-black hover:bg-[#a8d600]"
          >
            {updateProfileMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Profile"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
