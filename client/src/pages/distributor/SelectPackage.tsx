import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Check, AlertTriangle, Zap, Crown, Gem, Package, TrendingUp, Users, DollarSign } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/_core/hooks/useAuth";

export default function SelectPackage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  // Using sonner toast
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [autoshipEnabled, setAutoshipEnabled] = useState(true);
  const [showWarning, setShowWarning] = useState(false);

  const { data: packages, isLoading } = trpc.distributor.getEnrollmentPackages.useQuery();
  const { data: distributorInfo } = trpc.distributor.me.useQuery();

  useEffect(() => {
    // If user is already enrolled and has a package, redirect to dashboard
    if (distributorInfo && distributorInfo.enrollmentPackage) {
      setLocation("/distributor");
    }
  }, [distributorInfo, setLocation]);

  useEffect(() => {
    // Show warning when autoship is unchecked
    if (!autoshipEnabled) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [autoshipEnabled]);

  const selectPackageMutation = trpc.distributor.selectEnrollmentPackage.useMutation({
    onSuccess: () => {
      toast.success("Package Selected!", {
        description: "Your enrollment is complete. Welcome to the NEON family!",
      });
      setLocation("/distributor");
    },
    onError: (error) => {
      toast.error("Selection Failed", {
        description: error.message,
      });
    },
  });

  const handleSelectPackage = () => {
    if (!selectedPackageId) {
      toast({
        title: "No Package Selected",
        description: "Please select an enrollment package to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!autoshipEnabled) {
      const confirmed = window.confirm(
        "⚠️ WARNING: Without an active autoship, you will NOT be eligible to earn commissions on your team's sales. Are you sure you want to continue without autoship?"
      );
      if (!confirmed) return;
    }

    selectPackageMutation.mutate({
      packageId: selectedPackageId,
      autoshipEnabled,
    });
  };

  const getPackageIcon = (name: string) => {
    if (name.includes("Starter")) return <Package className="w-8 h-8" />;
    if (name.includes("Pro")) return <Zap className="w-8 h-8" />;
    if (name.includes("Elite")) return <Crown className="w-8 h-8" />;
    return <Gem className="w-8 h-8" />;
  };

  const getPackageColor = (name: string) => {
    if (name.includes("Starter")) return "from-blue-500 to-cyan-500";
    if (name.includes("Pro")) return "from-purple-500 to-pink-500";
    if (name.includes("Elite")) return "from-yellow-500 to-orange-500";
    return "from-green-500 to-teal-500";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading packages...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="container max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Choose Your <span className="gradient-text">Enrollment Package</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Select the package that best fits your business goals. You can upgrade anytime.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {packages?.map((pkg) => {
            const isSelected = selectedPackageId === pkg.id;
            const benefits: string[] = [
              `${pkg.productQuantity} cases of NEON Energy Drink`,
              `${pkg.businessVolume} BV (Business Volume)`,
              ...(pkg.marketingMaterialsIncluded ? ["Marketing materials included"] : []),
              `${pkg.trainingAccessLevel.charAt(0).toUpperCase() + pkg.trainingAccessLevel.slice(1)} training access`,
              ...(pkg.fastStartBonusEligible ? ["Fast Start Bonus eligible"] : []),
            ];
            
            return (
              <Card
                key={pkg.id}
                className={`relative overflow-hidden transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "bg-white/20 border-[#c8ff00] border-2 shadow-[0_0_30px_rgba(200,255,0,0.3)]"
                    : "bg-white/10 border-white/20 hover:bg-white/15"
                } backdrop-blur-lg`}
                onClick={() => setSelectedPackageId(pkg.id)}
              >
                {/* Gradient Accent */}
                <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${getPackageColor(pkg.name)}`} />
                
                {/* Selected Badge */}
                {isSelected && (
                  <div className="absolute top-4 right-4 bg-[#c8ff00] text-black px-3 py-1 rounded-full text-xs font-bold">
                    SELECTED
                  </div>
                )}

                <CardHeader className="text-center">
                  <div className={`mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br ${getPackageColor(pkg.name)} flex items-center justify-center text-white`}>
                    {getPackageIcon(pkg.name)}
                  </div>
                  <CardTitle className="text-2xl font-black text-white">{pkg.name}</CardTitle>
                  <CardDescription className="text-white/60">{pkg.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-black text-[#c8ff00]">${pkg.price}</span>
                    <span className="text-white/50 text-sm"> one-time</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {benefits.map((benefit: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-[#c8ff00] flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-white/80">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={`w-full ${
                      isSelected
                        ? "bg-[#c8ff00] hover:bg-[#d4ff33] text-black"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    } font-bold`}
                  >
                    {isSelected ? "Selected" : "Select Package"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Autoship Section */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 max-w-3xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#c8ff00]" />
              Autoship & Commission Eligibility
            </CardTitle>
            <CardDescription className="text-white/60">
              Maintain your commission eligibility with an active autoship subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
              <Checkbox
                id="autoship"
                checked={autoshipEnabled}
                onCheckedChange={(checked) => setAutoshipEnabled(checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="autoship" className="text-white font-semibold cursor-pointer">
                  Enable Monthly Autoship (Recommended)
                </Label>
                <p className="text-sm text-white/60 mt-1">
                  Receive a monthly shipment of NEON products and maintain your commission eligibility. Cancel anytime.
                </p>
              </div>
            </div>

            {showWarning && (
              <Alert className="bg-red-500/10 border-red-500/20">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <AlertDescription className="text-red-200">
                  <strong className="block mb-2">⚠️ IMPORTANT: Commission Eligibility Warning</strong>
                  <p className="mb-2">
                    By unchecking autoship, you understand and agree that:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>You will NOT be eligible to earn commissions on your team's sales</li>
                    <li>You will NOT receive monthly bonuses or rank advancement rewards</li>
                    <li>Your replicated website will remain active but you won't earn from referrals</li>
                    <li>You can re-enable autoship anytime to restore commission eligibility</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {autoshipEnabled && (
              <Alert className="bg-green-500/10 border-green-500/20">
                <Check className="h-5 w-5 text-green-400" />
                <AlertDescription className="text-green-200">
                  <strong className="block mb-2">✓ Commission Eligible</strong>
                  <p className="text-sm">
                    With autoship enabled, you're eligible to earn commissions on all team sales, receive monthly bonuses, and qualify for rank advancement rewards.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <Users className="w-8 h-8 text-[#c8ff00] mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">Up to 25%</div>
                <div className="text-xs text-white/60">Team Commissions</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <DollarSign className="w-8 h-8 text-[#c8ff00] mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">$500+</div>
                <div className="text-xs text-white/60">Monthly Bonuses</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <Crown className="w-8 h-8 text-[#c8ff00] mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">7 Ranks</div>
                <div className="text-xs text-white/60">Advancement Levels</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="text-center">
          <Button
            onClick={handleSelectPackage}
            disabled={!selectedPackageId || selectPackageMutation.isPending}
            className="bg-[#c8ff00] hover:bg-[#d4ff33] text-black font-bold px-12 h-14 text-lg rounded-xl shadow-[0_0_20px_rgba(200,255,0,0.4)] hover:shadow-[0_0_30px_rgba(200,255,0,0.6)] transition-all"
          >
            {selectPackageMutation.isPending ? "Processing..." : "Complete Enrollment"}
          </Button>
          <p className="text-white/50 text-sm mt-4">
            You'll be redirected to your distributor dashboard after completing enrollment
          </p>
        </div>
      </div>
    </div>
  );
}
