import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { MapPin, DollarSign, Calendar, TrendingUp, Check, Phone, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import TerritoryMapSelector from "@/components/TerritoryMapSelector";
import type { TerritoryData } from "@/components/TerritoryMapSelector";
import { useAuth } from "@/_core/hooks/useAuth";
import HamburgerHeader from "@/components/HamburgerHeader";
import { SEO } from "@/components/SEO";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import MeetingScheduler from "@/components/MeetingScheduler";
import { Breadcrumb, breadcrumbConfigs } from "@/components/Breadcrumb";
import { useHashNavigation } from "@/hooks/useHashNavigation";
import { TerritoryPricingCalculator } from "@/components/TerritoryPricingCalculator";
import type { TerritoryPricingOutput } from "../../../shared/territoryPricing";
import { TerritoryPDFExport } from "@/components/TerritoryPDFExport";
import ROICalculator from "@/components/ROICalculator";
import TerritoryReservation from "@/components/TerritoryReservation";
import { useLanguage } from "@/contexts/LanguageContext";
import { AIVendingTutorial } from "@/components/AIVendingTutorial";

// Territory pricing data (price per square mile per month)
const territoryPricing = {
  "New York, NY": 150,
  "Los Angeles, CA": 140,
  "Chicago, IL": 120,
  "Houston, TX": 100,
  "Phoenix, AZ": 95,
  "Philadelphia, PA": 110,
  "San Antonio, TX": 85,
  "San Diego, CA": 130,
  "Dallas, TX": 105,
  "San Jose, CA": 145,
  "Austin, TX": 115,
  "Jacksonville, FL": 80,
  "Fort Worth, TX": 95,
  "Columbus, OH": 90,
  "Charlotte, NC": 95,
  "San Francisco, CA": 160,
  "Indianapolis, IN": 85,
  "Seattle, WA": 135,
  "Denver, CO": 110,
  "Boston, MA": 140,
  "Other": 75,
};

export default function Franchise() {
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  
  // Initialize hash navigation
  useHashNavigation({ offset: 120 });
  const [scheduleCallOpen, setScheduleCallOpen] = useState(false);
  
  // Territory selection state
  const [territory, setTerritory] = useState<TerritoryData | null>(null);
  const [termMonths, setTermMonths] = useState<number>(12);
  const [financing, setFinancing] = useState<string>("full");
  const [forensicPricing, setForensicPricing] = useState<TerritoryPricingOutput | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Calculate pricing based on territory map selection
  const baseCost = territory ? territory.totalPrice : 0;
  const totalCost = baseCost * termMonths; // Multiply by term length
  const depositAmount = totalCost * 0.25; // 25% deposit
  const monthlyPayment = totalCost / termMonths;

  // Mutation to submit franchise application
  const submitApplication = trpc.franchise.submit.useMutation({
    onSuccess: () => {
      toast.success("Franchise application submitted! We'll contact you within 24 hours.");
      // Reset form
      setFormData({ name: "", email: "", phone: "", notes: "" });
      setTerritory(null);
      setTermMonths(12);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit application. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!territory) {
      toast.error("Please select a territory on the map");
      return;
    }

    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Submit to database via tRPC
    submitApplication.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      territory: territory.address,
      squareMiles: Math.round(territory.squareMiles),
      termMonths: termMonths,
      pricePerSqMile: Math.round(territory.totalPrice / territory.squareMiles),
      totalCost: Math.round(totalCost),
      depositAmount: Math.round(depositAmount),
      financing: financing as "full" | "deposit" | "monthly",
      notes: formData.notes || undefined,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a1a] via-[#0d2818] to-[#0a1a1a] text-white relative overflow-hidden">
      <SEO 
        title="Franchise Opportunity - NEON Energy Drink"
        description="Own your territory with NEON Energy Drink franchise. Select your market, set your radius, and build your energy drink empire. Territory licensing starting at $75/sq mi."
        image="/og-franchise.png"
        url="/franchise"
        keywords="NEON franchise, energy drink franchise, territory licensing, business opportunity, passive income, energy drink distribution"
      />
      {/* Background Graphics */}
      <div className="synthwave-grid-bg" />
      <div className="floating-neon-orb green w-96 h-96 -top-48 -left-48" style={{ animationDelay: '0s' }} />
      <div className="floating-neon-orb pink w-80 h-80 top-1/4 -right-40" style={{ animationDelay: '-5s' }} />
      <div className="floating-neon-orb cyan w-72 h-72 bottom-1/3 -left-36" style={{ animationDelay: '-10s' }} />
      
      <HamburgerHeader variant="default" />

      {/* Breadcrumb */}
      <div className="pt-24 pb-4 px-4 relative z-20">
        <div className="container mx-auto max-w-6xl">
          <Breadcrumb items={breadcrumbConfigs.franchise} variant="default" />
        </div>
      </div>

      {/* Hero Section */}
      <section id="hero" className="pt-8 pb-16 px-4 animated-bg scroll-focus-target">
        <div className={`container mx-auto max-w-6xl text-center ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-5xl md:text-7xl font-black mb-6">
            EXCLUSIVE <span className="text-[#c8ff00] neon-text">TERRITORY</span> LICENSING
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Secure your exclusive territory for NEON AI-powered vending machines. 
            Lock in prime locations and build a profitable franchise business.
          </p>
        </div>
      </section>

      {/* Territory Map & Pricing Calculator */}
      <section className="py-16 px-4 bg-gradient-to-b from-[#0a1a1a] to-[#0d2818] animated-bg">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Territory Map */}
            <div className={`space-y-6 ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
              {/* Interactive Map Territory Selector */}
              <TerritoryMapSelector onTerritoryChange={setTerritory} />

              {/* Term Length Selector */}
              <Card className="bg-[#0a1a1a]/90 backdrop-blur-sm border-[#c8ff00]/30 neon-border">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-[#c8ff00] flex items-center gap-3">
                    <Calendar className="w-6 h-6 neon-glow" />
                    License Term
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Duration</Label>
                      <span className="text-2xl font-bold text-[#c8ff00]">{termMonths} months</span>
                    </div>
                    <Slider
                      value={[termMonths]}
                      onValueChange={(value) => setTermMonths(value[0])}
                      min={6}
                      max={60}
                      step={6}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>6 months (Short-term)</span>
                      <span>60 months (Long-term)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pricing Calculator */}
            <div className={`space-y-6 ${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
              <Card className="bg-[#0a1a1a]/90 backdrop-blur-sm border-[#c8ff00]/30 neon-border sticky top-24">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-[#c8ff00] flex items-center gap-3">
                    <DollarSign className="w-8 h-8 neon-glow" />
                    Pricing Calculator
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Dynamic pricing based on your selections
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Pricing Breakdown */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-black rounded-lg border border-[#c8ff00]/20">
                      <span className="text-gray-400">Base Territory Cost</span>
                      <span className="text-xl font-bold text-white">${baseCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-black rounded-lg border border-[#c8ff00]/20">
                      <span className="text-gray-400">Monthly Payment</span>
                      <span className="text-xl font-bold text-white">${monthlyPayment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-black rounded-lg border border-[#c8ff00]/20">
                      <span className="text-gray-400">License Term</span>
                      <span className="text-xl font-bold text-white">{termMonths} months</span>
                    </div>
                    <div className="h-px bg-[#c8ff00]/30"></div>
                    <div className="flex justify-between items-center p-6 bg-gradient-to-r from-[#c8ff00]/20 to-transparent rounded-lg border-2 border-[#c8ff00] neon-border">
                      <span className="text-xl font-bold text-white">Total License Cost</span>
                      <span className="text-4xl font-black text-[#c8ff00] neon-text">${totalCost.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Financing Options */}
                  <div className="space-y-4">
                    <Label>Financing Option</Label>
                    <div className="grid gap-3">
                      <button
                        onClick={() => setFinancing("full")}
                        className={`p-4 rounded-lg border-2 transition-smooth text-left ${
                          financing === "full"
                            ? "border-[#c8ff00] bg-[#c8ff00]/10 neon-border"
                            : "border-gray-700 hover:border-[#c8ff00]/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white">Full Payment</div>
                            <div className="text-sm text-gray-400">Pay in full, save 10%</div>
                          </div>
                          <div className="text-xl font-bold text-[#c8ff00]">
                            ${(totalCost * 0.9).toLocaleString()}
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => setFinancing("deposit")}
                        className={`p-4 rounded-lg border-2 transition-smooth text-left ${
                          financing === "deposit"
                            ? "border-[#c8ff00] bg-[#c8ff00]/10 neon-border"
                            : "border-gray-700 hover:border-[#c8ff00]/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white">25% Deposit</div>
                            <div className="text-sm text-gray-400">Pay 25% now, rest on delivery</div>
                          </div>
                          <div className="text-xl font-bold text-[#c8ff00]">
                            ${depositAmount.toLocaleString()}
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => setFinancing("monthly")}
                        className={`p-4 rounded-lg border-2 transition-smooth text-left ${
                          financing === "monthly"
                            ? "border-[#c8ff00] bg-[#c8ff00]/10 neon-border"
                            : "border-gray-700 hover:border-[#c8ff00]/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white">Monthly Payments</div>
                            <div className="text-sm text-gray-400">Spread over license term</div>
                          </div>
                          <div className="text-xl font-bold text-[#c8ff00]">
                            ${monthlyPayment.toLocaleString()}/mo
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-3 p-4 bg-black rounded-lg border border-[#c8ff00]/20">
                    <div className="font-bold text-[#c8ff00] mb-2">What's Included:</div>
                    <div className="flex items-start gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-[#c8ff00] mt-0.5 flex-shrink-0" />
                      <span>Exclusive territory rights</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-[#c8ff00] mt-0.5 flex-shrink-0" />
                      <span>AI-powered vending machines</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-[#c8ff00] mt-0.5 flex-shrink-0" />
                      <span>Full training & support</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-[#c8ff00] mt-0.5 flex-shrink-0" />
                      <span>Marketing materials</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-[#c8ff00] mt-0.5 flex-shrink-0" />
                      <span>24/7 technical support</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Forensic Audit Pricing Calculator */}
      {territory && (
        <section className="py-16 px-4 bg-gradient-to-b from-[#0d2818] to-[#0a1a1a] animated-bg">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                <span className="text-[#c8ff00] neon-text">FORENSIC AUDIT</span> PRICING MODEL
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Our territory pricing is calculated using the 2025-2026 U.S. Energy Drink Licensing Fees 
                and Territory Valuation Metrics forensic audit formula.
              </p>
            </div>
            <TerritoryPricingCalculator
              state={territory.address?.split(',').pop()?.trim().split(' ')[0] || 'CA'}
              city={territory.address?.split(',')[0]}
              population={territory.estimatedPopulation || 50000}
              areaSqMiles={territory.squareMiles}
              populationDensity={territory.estimatedPopulation ? territory.estimatedPopulation / territory.squareMiles : undefined}
              onPriceCalculated={setForensicPricing}
            />
            
            {/* ROI Calculator */}
            <div className="mt-8">
              <ROICalculator
                territory={{
                  name: territory.address?.split(',')[0] || 'Selected Territory',
                  state: territory.address?.split(',').pop()?.trim().split(' ')[0] || 'CA',
                  area: territory.squareMiles,
                  population: territory.estimatedPopulation || 50000,
                  density: territory.estimatedPopulation ? territory.estimatedPopulation / territory.squareMiles : 1000,
                  licenseFee: forensicPricing?.finalPrice || 5000,
                }}
                pricePerSqMile={forensicPricing?.pricePerSqMile || 500}
              />
            </div>
            
            {/* PDF Export */}
            <div className="mt-8">
              <TerritoryPDFExport
                territory={{
                  name: territory.address?.split(',')[0] || 'Selected Territory',
                  state: territory.address?.split(',').pop()?.trim().split(' ')[0] || 'CA',
                  area: territory.squareMiles,
                  population: territory.estimatedPopulation || 50000,
                  density: territory.estimatedPopulation ? territory.estimatedPopulation / territory.squareMiles : 1000,
                  demandFactor: territory.demandMultiplier || 1,
                  licenseFee: forensicPricing?.finalPrice || 5000,
                }}
                pricing={forensicPricing ? {
                  baseValue: forensicPricing.totalBasePrice,
                  stateFees: forensicPricing.licensingFees,
                  densityAdjustment: 0,
                  demographicPremium: forensicPricing.totalBasePrice * (forensicPricing.demographicMultiplier - 1),
                  regionalAdjustment: forensicPricing.totalBasePrice * (forensicPricing.regionalMultiplier - 1),
                  municipalTaxImpact: forensicPricing.exciseTaxImpact,
                  volumeDiscount: forensicPricing.volumeDiscount,
                  total: forensicPricing.finalPrice,
                } : { baseValue: 0, stateFees: 0, densityAdjustment: 0, demographicPremium: 0, regionalAdjustment: 0, municipalTaxImpact: 0, volumeDiscount: 0, total: 0 }}
                stateLicensing={{
                  state: territory.address?.split(',').pop()?.trim().split(' ')[0] || 'CA',
                  baseFee: 1200,
                  renewalFee: 1200,
                  additionalFees: 76,
                }}
                densityMultiplier={forensicPricing?.densityMultiplier || 1}
                demographicMultiplier={forensicPricing?.demographicMultiplier || 1}
                regionalMultiplier={forensicPricing?.regionalMultiplier || 1}
                volumeDiscountPercent={forensicPricing?.volumeDiscount ? (forensicPricing.volumeDiscount / forensicPricing.totalBasePrice) * 100 : 0}
                blueSkyMultiple={forensicPricing?.blueSkyMultiple || 10}
              />
            </div>
            
            {/* Territory Reservation */}
            <div className="mt-8">
              <TerritoryReservation
                territory={{
                  name: territory.address?.split(',')[0] || 'Selected Territory',
                  state: territory.address?.split(',').pop()?.trim().split(' ')[0] || 'CA',
                  area: territory.squareMiles,
                  population: territory.estimatedPopulation || 50000,
                  centerLat: territory.center?.lat || 0,
                  centerLng: territory.center?.lng || 0,
                  radiusMiles: territory.radiusMiles || Math.sqrt(territory.squareMiles / Math.PI),
                  licenseFee: forensicPricing?.finalPrice || 5000,
                }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Application Form */}
      <section className="py-16 px-4 bg-gradient-to-b from-[#0a0a0a] to-black animated-bg">
        <div className="container mx-auto max-w-3xl">
          <Card className="bg-[#0a0a0a] border-[#c8ff00]/30 neon-border hover-lift">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-[#c8ff00]">
                Apply for Territory License
              </CardTitle>
              <CardDescription className="text-gray-400">
                Submit your application and we'll contact you within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="bg-black border-[#c8ff00]/30 text-white focus:border-[#c8ff00] transition-smooth"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-black border-[#c8ff00]/30 text-white focus:border-[#c8ff00] transition-smooth"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-black border-[#c8ff00]/30 text-white focus:border-[#c8ff00] transition-smooth"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Information</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="bg-black border-[#c8ff00]/30 text-white min-h-[100px] focus:border-[#c8ff00] transition-smooth"
                    placeholder="Tell us about your business experience, preferred locations, etc."
                  />
                </div>

                {/* Summary */}
                {territory && (
                  <div className="p-6 bg-black rounded-lg border border-[#c8ff00]/20 space-y-2">
                    <div className="font-bold text-[#c8ff00] mb-3">Application Summary:</div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Territory:</span>
                      <span className="text-white font-semibold">{territory.address}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Size:</span>
                      <span className="text-white font-semibold">{territory.squareMiles} sq mi</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Term:</span>
                      <span className="text-white font-semibold">{termMonths} months</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Cost:</span>
                      <span className="text-[#c8ff00] font-bold text-lg">${totalCost.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    type="submit"
                    disabled={!territory || submitApplication.isPending}
                    className="flex-1 bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold text-lg py-6 neon-pulse transition-smooth"
                  >
                    {submitApplication.isPending ? "Submitting..." : "Submit Application"} <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Dialog open={scheduleCallOpen} onOpenChange={setScheduleCallOpen}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 border-[#c8ff00] text-[#c8ff00] hover:bg-[#c8ff00]/10 font-bold text-lg py-6"
                      >
                        <Phone className="w-5 h-5 mr-2" /> Schedule a Call
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-[#0a1a1a] border-[#c8ff00]/30">
                      <MeetingScheduler 
                        meetingType="franchise" 
                        onSuccess={() => setScheduleCallOpen(false)} 
                        onClose={() => setScheduleCallOpen(false)} 
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[#c8ff00]/20">
        <div className="container mx-auto text-center text-gray-400">
          <p>&copy; 2025 NEON Energy Drink. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
