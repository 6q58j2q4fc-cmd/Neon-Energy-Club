import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUPPORTED_COUNTRIES, getRegionsForCountry } from "../../../shared/countries";
import HamburgerHeader from "@/components/HamburgerHeader";
import Footer from "@/components/Footer";
import { User, Mail, Calendar, Shield, Package, Gem, ArrowLeft, Edit2, Save, X, Phone, MapPin, Home, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function Profile() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  // Fetch full profile data
  const { data: profile, isLoading: profileLoading, refetch } = trpc.user.profile.useQuery(undefined, {
    enabled: !!user,
  });

  // Update profile mutation
  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile Updated", {
        description: "Your profile has been saved successfully.",
      });
      setIsEditing(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Update Failed", {
        description: error.message || "Failed to update profile. Please try again.",
      });
    },
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        addressLine1: profile.addressLine1 || "",
        addressLine2: profile.addressLine2 || "",
        city: profile.city || "",
        state: profile.state || "",
        postalCode: profile.postalCode || "",
        country: profile.country || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = getLoginUrl();
    }
  }, [loading, user]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#c8ff00]/30 border-t-[#c8ff00] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSave = () => {
    updateProfile.mutate(formData);
  };

  const handleCancel = () => {
    // Reset form data to profile values
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        addressLine1: profile.addressLine1 || "",
        addressLine2: profile.addressLine2 || "",
        city: profile.city || "",
        state: profile.state || "",
        postalCode: profile.postalCode || "",
        country: profile.country || "",
      });
    }
    setIsEditing(false);
  };

  const hasShippingAddress = profile?.addressLine1 || profile?.city || profile?.state;

  return (
    <div className="min-h-screen bg-black text-white">
      <HamburgerHeader variant="dark" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#c8ff00]/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#c8ff00]/10 rounded-full blur-[120px]" />
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-[#ff0080]/10 rounded-full blur-[100px]" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Back Button */}
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-white/60 hover:text-[#c8ff00] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </button>

          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#c8ff00]/30 to-[#00ffff]/30 flex items-center justify-center border border-[#c8ff00]/30">
              <User className="w-12 h-12 text-[#c8ff00]" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {profile?.name || user.name || "NEON User"}
              </h1>
              <p className="text-white/60">{user.email}</p>
              {user.role === "admin" && (
                <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-[#ff0080]/20 text-[#ff0080] text-sm font-medium">
                  <Shield className="w-3 h-3" />
                  Administrator
                </span>
              )}
            </div>
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  className="bg-[#c8ff00] hover:bg-[#d4ff33] text-black"
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="border-[#c8ff00]/30 text-[#c8ff00] hover:bg-[#c8ff00]/10"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Account Information */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <User className="w-5 h-5 text-[#c8ff00]" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-white/60 uppercase tracking-wide">Full Name</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 bg-white/5 border-white/20 text-white"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-white/60 uppercase tracking-wide">Phone Number</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-1 bg-white/5 border-white/20 text-white"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-wide">Full Name</label>
                      <p className="text-white font-medium">{profile?.name || "Not set"}</p>
                    </div>
                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-wide">Email Address</label>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-white/40" />
                        <p className="text-white font-medium">{user.email || "Not set"}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-wide">Phone Number</label>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-white/40" />
                        <p className="text-white font-medium">{profile?.phone || "Not set"}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-wide">Account Role</label>
                      <p className="text-white font-medium capitalize">{user.role}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Home className="w-5 h-5 text-[#ff0080]" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-white/60 uppercase tracking-wide">Address Line 1</Label>
                      <Input
                        value={formData.addressLine1}
                        onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                        className="mt-1 bg-white/5 border-white/20 text-white"
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-white/60 uppercase tracking-wide">Address Line 2</Label>
                      <Input
                        value={formData.addressLine2}
                        onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                        className="mt-1 bg-white/5 border-white/20 text-white"
                        placeholder="Apt, Suite, Unit (optional)"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-white/60 uppercase tracking-wide">City</Label>
                        <Input
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="mt-1 bg-white/5 border-white/20 text-white"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-white/60 uppercase tracking-wide">State/Province</Label>
                        {getRegionsForCountry(formData.country).length > 0 ? (
                          <Select
                            value={formData.state}
                            onValueChange={(value) => setFormData({ ...formData, state: value })}
                          >
                            <SelectTrigger className="mt-1 bg-white/5 border-white/20 text-white">
                              <SelectValue placeholder="Select state/province" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1a2e] border-white/20 max-h-60">
                              {getRegionsForCountry(formData.country).map((region) => (
                                <SelectItem key={region.code} value={region.name} className="text-white hover:bg-white/10">
                                  {region.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            className="mt-1 bg-white/5 border-white/20 text-white"
                            placeholder="State/Province"
                          />
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-white/60 uppercase tracking-wide">ZIP/Postal Code</Label>
                        <Input
                          value={formData.postalCode}
                          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                          className="mt-1 bg-white/5 border-white/20 text-white"
                          placeholder="12345"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-white/60 uppercase tracking-wide">Country</Label>
                        <Select
                          value={formData.country}
                          onValueChange={(value) => setFormData({ ...formData, country: value, state: "" })}
                        >
                          <SelectTrigger className="mt-1 bg-white/5 border-white/20 text-white">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a1a2e] border-white/20 max-h-60">
                            {SUPPORTED_COUNTRIES.map((country) => (
                              <SelectItem key={country.code} value={country.name} className="text-white hover:bg-white/10">
                                {country.flag} {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ) : hasShippingAddress ? (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-white/40 mt-1" />
                      <div>
                        {profile?.addressLine1 && <p className="text-white">{profile.addressLine1}</p>}
                        {profile?.addressLine2 && <p className="text-white/80">{profile.addressLine2}</p>}
                        <p className="text-white/80">
                          {[profile?.city, profile?.state, profile?.postalCode].filter(Boolean).join(", ")}
                        </p>
                        {profile?.country && <p className="text-white/60">{profile.country}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-[#c8ff00]">
                      <Check className="w-4 h-4" />
                      <span className="text-sm">Address saved</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <MapPin className="w-8 h-8 text-white/20 mx-auto mb-2" />
                    <p className="text-white/40 text-sm">No shipping address saved</p>
                    <p className="text-white/60 text-xs mt-1">Click "Edit Profile" to add your address</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Activity */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Calendar className="w-5 h-5 text-[#00ffff]" />
                  Account Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wide">Member Since</label>
                  <p className="text-white font-medium">{formatDate(user.createdAt)}</p>
                </div>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wide">Last Sign In</label>
                  <p className="text-white font-medium">{formatDate(user.lastSignedIn)}</p>
                </div>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wide">Login Method</label>
                  <p className="text-white font-medium capitalize">{user.loginMethod || "OAuth"}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mt-6 bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="w-5 h-5 text-[#c8ff00]" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  onClick={() => setLocation("/orders")}
                  variant="outline"
                  className="justify-start border-white/10 text-white hover:bg-white/5 hover:border-[#c8ff00]/30"
                >
                  <Package className="w-4 h-4 mr-2 text-[#c8ff00]" />
                  View My Orders
                </Button>
                <Button
                  onClick={() => setLocation("/nft-gallery")}
                  variant="outline"
                  className="justify-start border-white/10 text-white hover:bg-white/5 hover:border-[#00ffff]/30"
                >
                  <Gem className="w-4 h-4 mr-2 text-[#00ffff]" />
                  View My NFTs
                </Button>
                <Button
                  onClick={() => setLocation("/shop")}
                  variant="outline"
                  className="justify-start border-white/10 text-white hover:bg-white/5 hover:border-[#ff0080]/30"
                >
                  <Package className="w-4 h-4 mr-2 text-[#ff0080]" />
                  Shop Now
                </Button>
                <Button
                  onClick={() => setLocation("/crowdfund")}
                  variant="outline"
                  className="justify-start border-white/10 text-white hover:bg-white/5 hover:border-yellow-400/30"
                >
                  <Shield className="w-4 h-4 mr-2 text-yellow-400" />
                  Back the Relaunch
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Section */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-[#c8ff00]/10 to-transparent rounded-2xl p-6 border border-[#c8ff00]/20">
              <Package className="w-8 h-8 text-[#c8ff00] mb-3" />
              <p className="text-2xl font-bold text-white">--</p>
              <p className="text-sm text-white/60">Total Orders</p>
            </div>
            <div className="bg-gradient-to-br from-[#00ffff]/10 to-transparent rounded-2xl p-6 border border-[#00ffff]/20">
              <Gem className="w-8 h-8 text-[#00ffff] mb-3" />
              <p className="text-2xl font-bold text-white">--</p>
              <p className="text-sm text-white/60">NFTs Owned</p>
            </div>
            <div className="bg-gradient-to-br from-[#ff0080]/10 to-transparent rounded-2xl p-6 border border-[#ff0080]/20">
              <Shield className="w-8 h-8 text-[#ff0080] mb-3" />
              <p className="text-2xl font-bold text-white capitalize">{user.role}</p>
              <p className="text-sm text-white/60">Account Type</p>
            </div>
            <div className="bg-gradient-to-br from-white/10 to-transparent rounded-2xl p-6 border border-white/20">
              <Calendar className="w-8 h-8 text-white/80 mb-3" />
              <p className="text-2xl font-bold text-white">
                {Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
              </p>
              <p className="text-sm text-white/60">Days as Member</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
