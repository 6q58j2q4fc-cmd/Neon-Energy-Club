import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { Check, Users, ShoppingCart, TrendingUp, DollarSign, Gift, Sparkles, ArrowRight, Zap, Globe } from "lucide-react";
import HamburgerHeader from "@/components/HamburgerHeader";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUPPORTED_COUNTRIES } from "@shared/countries";

export default function JoinNow() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [accountType, setAccountType] = useState<"customer" | "distributor" | null>(null);
  const [step, setStep] = useState<"choose" | "signup">("choose");

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#c8ff00] text-xl">Loading...</div>
      </div>
    );
  }

  if (!user && step === "signup") {
    window.location.href = getLoginUrl();
    return null;
  }

  const handleChooseType = (type: "customer" | "distributor") => {
    setAccountType(type);
    if (!user) {
      window.location.href = getLoginUrl();
    } else {
      setStep("signup");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <SEO 
        title="Join NEON - Become a Customer or Distributor"
        description="Join the NEON Energy Drink movement! Become a customer for exclusive perks or a distributor to build your own energy drink empire. Start your journey today."
        image="/og-join.png"
        url="/join"
        keywords="join NEON, NEON distributor, NEON customer, energy drink business, MLM opportunity, network marketing, build your empire"
      />
      <HamburgerHeader variant="default" />

      {/* Choose Account Type */}
      {step === "choose" && (
        <section className="py-20">
          <div className="container px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c8ff00]/10 border border-[#c8ff00]/30 mb-6">
                  <Sparkles className="w-4 h-4 text-[#c8ff00]" />
                  <span className="text-[#c8ff00] font-bold text-sm">JOIN THE MOVEMENT</span>
                </div>
                <h1 className="text-6xl font-black mb-4">
                  CHOOSE YOUR <span className="text-[#c8ff00] neon-text">PATH</span>
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  Whether you're here to fuel your lifestyle or build a business, we've got you covered
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Customer Card */}
                <Card className="bg-gradient-to-br from-[#0a0a0a] to-black border-[#c8ff00]/30 hover:border-[#c8ff00] transition-all duration-300 group cursor-pointer"
                  onClick={() => handleChooseType("customer")}>
                  <CardHeader className="text-center pb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#c8ff00]/10 mb-6 mx-auto group-hover:bg-[#c8ff00]/20 transition-colors">
                      <ShoppingCart className="w-10 h-10 text-[#c8ff00]" />
                    </div>
                    <CardTitle className="text-3xl font-black mb-2">CUSTOMER</CardTitle>
                    <CardDescription className="text-gray-400 text-lg">
                      Enjoy exclusive perks and member pricing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      {[
                        "Member-only discounts",
                        "Early access to new flavors",
                        "Free shipping on orders $50+",
                        "Exclusive merchandise",
                        "VIP event invitations",
                      ].map((benefit, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-[#c8ff00] flex-shrink-0" />
                          <span className="text-gray-300">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => handleChooseType("customer")}
                      className="w-full bg-[#c8ff00]/10 text-[#c8ff00] hover:bg-[#c8ff00]/20 border border-[#c8ff00]/30 font-bold h-12"
                    >
                      Join as Customer
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                {/* Distributor Card */}
                <Card className="bg-gradient-to-br from-[#c8ff00]/10 via-[#0a0a0a] to-black border-2 border-[#c8ff00] relative overflow-hidden group cursor-pointer"
                  onClick={() => handleChooseType("distributor")}>
                  {/* Popular Badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 bg-[#c8ff00] text-black text-xs font-black rounded-full">
                    MOST POPULAR
                  </div>

                  <CardHeader className="text-center pb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#c8ff00]/20 mb-6 mx-auto group-hover:bg-[#c8ff00]/30 transition-colors neon-glow">
                      <TrendingUp className="w-10 h-10 text-[#c8ff00]" />
                    </div>
                    <CardTitle className="text-3xl font-black mb-2 text-[#c8ff00]">DISTRIBUTOR</CardTitle>
                    <CardDescription className="text-gray-300 text-lg">
                      Build your business and earn unlimited income
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      {[
                        "Earn up to 40% commission",
                        "Build your own team",
                        "Custom branded website",
                        "Marketing tools & training",
                        "Passive income potential",
                        "Exclusive distributor events",
                      ].map((benefit, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-[#c8ff00] flex-shrink-0" />
                          <span className="text-white font-semibold">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => handleChooseType("distributor")}
                      className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d600] font-black h-12 neon-pulse"
                    >
                      Become a Distributor
                      <Sparkles className="w-5 h-5 ml-2" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => setLocation('/genealogy-tutorial')}
                      className="w-full border-[#c8ff00]/50 text-[#c8ff00] hover:bg-[#c8ff00]/10 font-semibold h-10"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Learn How the Team Structure Works
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Comparison Table */}
              <div className="mt-16 bg-[#0a0a0a] border border-[#c8ff00]/30 rounded-2xl p-8">
                <h3 className="text-2xl font-black text-center mb-8">FEATURE COMPARISON</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="text-gray-500 font-bold">FEATURE</div>
                  <div className="text-white font-bold">CUSTOMER</div>
                  <div className="text-[#c8ff00] font-bold">DISTRIBUTOR</div>

                  <div className="text-left text-gray-400">Member Discounts</div>
                  <div><Check className="w-5 h-5 text-[#c8ff00] mx-auto" /></div>
                  <div><Check className="w-5 h-5 text-[#c8ff00] mx-auto" /></div>

                  <div className="text-left text-gray-400">Earn Commissions</div>
                  <div className="text-gray-600">—</div>
                  <div><Check className="w-5 h-5 text-[#c8ff00] mx-auto" /></div>

                  <div className="text-left text-gray-400">Build Team</div>
                  <div className="text-gray-600">—</div>
                  <div><Check className="w-5 h-5 text-[#c8ff00] mx-auto" /></div>

                  <div className="text-left text-gray-400">Custom Website</div>
                  <div className="text-gray-600">—</div>
                  <div><Check className="w-5 h-5 text-[#c8ff00] mx-auto" /></div>

                  <div className="text-left text-gray-400">Training & Support</div>
                  <div className="text-gray-400 text-sm">Basic</div>
                  <div className="text-[#c8ff00] text-sm font-bold">Premium</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Signup Form (shown after choosing type and logging in) */}
      {step === "signup" && user && accountType === "distributor" && (
        <DistributorSignupForm user={user} />
      )}

      {/* Customer Welcome (shown after choosing customer and logging in) */}
      {step === "signup" && user && accountType === "customer" && (
        <CustomerWelcome user={user} />
      )}

      <Footer />
    </div>
  );
}

function DistributorSignupForm({ user }: { user: any }) {
  const [, setLocation] = useLocation();
  const [sponsorCode, setSponsorCode] = useState("");
  const [country, setCountry] = useState("US");
  
  const enrollDistributor = trpc.distributor.enroll.useMutation({
    onSuccess: () => {
      toast.success("Welcome to the NEON family! Your distributor account is active.");
      setLocation("/distributor/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to enroll");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    enrollDistributor.mutate({ sponsorCode: sponsorCode || undefined, country });
  };

  return (
    <section className="py-20">
      <div className="container px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black mb-4">
              COMPLETE YOUR <span className="text-[#c8ff00] neon-text">ENROLLMENT</span>
            </h2>
            <p className="text-xl text-gray-400">
              You're one step away from building your NEON business
            </p>
          </div>

          <Card className="bg-gradient-to-br from-[#0a0a0a] to-black border-[#c8ff00]/30">
            <CardHeader>
              <CardTitle className="text-2xl font-black">Distributor Information</CardTitle>
              <CardDescription>Your account details are pre-filled from your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={user.name || ""}
                    disabled
                    className="bg-[#0a0a0a] border-[#c8ff00]/30 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={user.email || ""}
                    disabled
                    className="bg-[#0a0a0a] border-[#c8ff00]/30 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="bg-[#0a0a0a] border-[#c8ff00]/30 text-white">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0a] border-[#c8ff00]/30 max-h-[300px]">
                      {SUPPORTED_COUNTRIES.map((c) => (
                        <SelectItem key={c.code} value={c.code} className="text-white hover:bg-[#c8ff00]/20">
                          <span className="flex items-center gap-2">
                            <span className="text-lg">{c.flag}</span>
                            <span>{c.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    Your country flag will be displayed on your replicated website
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sponsorCode">Sponsor Code (Optional)</Label>
                  <Input
                    id="sponsorCode"
                    type="text"
                    placeholder="Enter your sponsor's code"
                    value={sponsorCode}
                    onChange={(e) => setSponsorCode(e.target.value)}
                    className="bg-[#0a0a0a] border-[#c8ff00]/30 text-white placeholder:text-gray-500 focus:border-[#c8ff00]"
                  />
                  <p className="text-sm text-gray-500">
                    If you were referred by someone, enter their code here
                  </p>
                </div>

                <div className="bg-[#c8ff00]/10 border border-[#c8ff00]/30 rounded-lg p-6">
                  <h4 className="font-bold text-[#c8ff00] mb-3">What happens next?</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#c8ff00] mt-0.5 flex-shrink-0" />
                      <span>Instant access to your distributor dashboard</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#c8ff00] mt-0.5 flex-shrink-0" />
                      <span>Unique distributor code and custom website</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#c8ff00] mt-0.5 flex-shrink-0" />
                      <span>Complete training materials and marketing tools</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#c8ff00] mt-0.5 flex-shrink-0" />
                      <span>Start earning commissions immediately</span>
                    </li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  disabled={enrollDistributor.isPending}
                  className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d600] font-black h-14 text-lg neon-pulse"
                >
                  {enrollDistributor.isPending ? "Enrolling..." : "Activate My Distributor Account"}
                  <Sparkles className="w-6 h-6 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}


function CustomerWelcome({ user }: { user: any }) {
  const [, setLocation] = useLocation();

  return (
    <section className="py-20">
      <div className="container px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-[#c8ff00]/20 flex items-center justify-center neon-glow">
            <Gift className="w-12 h-12 text-[#c8ff00]" />
          </div>
          
          <h2 className="text-5xl font-black mb-4">
            WELCOME TO <span className="text-[#c8ff00] neon-text">NEON!</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Hey {user.name?.split(' ')[0] || 'there'}! You're now part of the NEON family.
          </p>

          <Card className="bg-gradient-to-br from-[#0a0a0a] to-black border-[#c8ff00]/30 mb-8">
            <CardContent className="p-8">
              <h3 className="text-2xl font-black text-[#c8ff00] mb-6">YOUR MEMBER BENEFITS</h3>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                {[
                  { icon: DollarSign, text: "Exclusive member discounts" },
                  { icon: Zap, text: "Early access to new flavors" },
                  { icon: Gift, text: "3-for-Free referral rewards" },
                  { icon: ShoppingCart, text: "Free shipping on $50+ orders" },
                  { icon: Users, text: "VIP community access" },
                  { icon: Sparkles, text: "Birthday rewards" },
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-[#c8ff00]/5 rounded-lg">
                    <benefit.icon className="w-5 h-5 text-[#c8ff00] flex-shrink-0" />
                    <span className="text-white">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="bg-[#c8ff00]/10 border border-[#c8ff00]/30 rounded-xl p-6 mb-8">
            <h4 className="font-black text-[#c8ff00] text-lg mb-2">🎁 3-FOR-FREE PROGRAM</h4>
            <p className="text-gray-300">
              Refer 3 friends who make a purchase and get a FREE case of NEON! 
              Track your referrals in your Customer Portal.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setLocation("/customer-portal")}
              className="bg-[#c8ff00] text-black hover:bg-[#a8d600] font-black h-14 px-8 text-lg neon-pulse"
            >
              Go to My Rewards Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              onClick={() => setLocation("/products")}
              variant="outline"
              className="border-[#c8ff00]/50 text-[#c8ff00] hover:bg-[#c8ff00]/10 font-bold h-14 px-8"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Shop Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
