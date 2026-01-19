import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HamburgerHeader from "@/components/HamburgerHeader";
import Footer from "@/components/Footer";
import { User, Mail, Calendar, Shield, Package, Gem, ArrowLeft, Edit2 } from "lucide-react";
import { useEffect } from "react";
import { getLoginUrl } from "@/const";

export default function Profile() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = getLoginUrl();
    }
  }, [loading, user]);

  if (loading) {
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
                {user.name || "NEON User"}
              </h1>
              <p className="text-white/60">{user.email}</p>
              {user.role === "admin" && (
                <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-[#ff0080]/20 text-[#ff0080] text-sm font-medium">
                  <Shield className="w-3 h-3" />
                  Administrator
                </span>
              )}
            </div>
            <Button
              variant="outline"
              className="border-[#c8ff00]/30 text-[#c8ff00] hover:bg-[#c8ff00]/10"
              disabled
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile (Coming Soon)
            </Button>
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
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wide">Full Name</label>
                  <p className="text-white font-medium">{user.name || "Not set"}</p>
                </div>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wide">Email Address</label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-white/40" />
                    <p className="text-white font-medium">{user.email || "Not set"}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wide">Account Role</label>
                  <p className="text-white font-medium capitalize">{user.role}</p>
                </div>
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

            {/* Quick Actions */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Shield className="w-5 h-5 text-[#ff0080]" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => setLocation("/orders")}
                  variant="outline"
                  className="w-full justify-start border-white/10 text-white hover:bg-white/5 hover:border-[#c8ff00]/30"
                >
                  <Package className="w-4 h-4 mr-2 text-[#c8ff00]" />
                  View My Orders
                </Button>
                <Button
                  onClick={() => setLocation("/nft-gallery")}
                  variant="outline"
                  className="w-full justify-start border-white/10 text-white hover:bg-white/5 hover:border-[#00ffff]/30"
                >
                  <Gem className="w-4 h-4 mr-2 text-[#00ffff]" />
                  View My NFTs
                </Button>
                <Button
                  onClick={() => setLocation("/shop")}
                  variant="outline"
                  className="w-full justify-start border-white/10 text-white hover:bg-white/5 hover:border-[#ff0080]/30"
                >
                  <Package className="w-4 h-4 mr-2 text-[#ff0080]" />
                  Shop Now
                </Button>
              </CardContent>
            </Card>
          </div>

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
