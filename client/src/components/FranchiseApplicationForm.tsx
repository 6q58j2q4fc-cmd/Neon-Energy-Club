import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, CheckCircle, MapPin, Phone, Mail, User, Building, DollarSign, Globe } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

interface FranchiseApplicationFormProps {
  onSuccess?: () => void;
}

export default function FranchiseApplicationForm({ onSuccess }: FranchiseApplicationFormProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    phone: "",
    
    // Territory Info
    territoryCity: "",
    territoryState: "",
    territorySize: "",
    exclusivityType: "",
    
    // Financial Info
    investmentCapital: "",
    financingNeeded: "",
    netWorth: "",
    
    // Experience
    businessExperience: "",
    distributionExperience: "",
    teamSize: "",
    
    // Additional
    motivation: "",
    timeline: "",
    questions: "",
    
    // Agreements
    agreeToTerms: false,
    agreeToBackground: false,
  });

  const submitMutation = trpc.territory.submitFranchiseApplication.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success("Application submitted successfully!", {
        description: "Our franchise team will contact you within 24-48 hours.",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to submit application", {
        description: error.message,
      });
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms || !formData.agreeToBackground) {
      toast.error("Please agree to all required terms");
      return;
    }

    setIsSubmitting(true);
    
    submitMutation.mutate({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      territoryCity: formData.territoryCity,
      territoryState: formData.territoryState,
      territorySize: formData.territorySize,
      exclusivityType: formData.exclusivityType,
      investmentCapital: formData.investmentCapital,
      financingNeeded: formData.financingNeeded,
      netWorth: formData.netWorth,
      businessExperience: formData.businessExperience,
      distributionExperience: formData.distributionExperience,
      teamSize: formData.teamSize,
      motivation: formData.motivation,
      timeline: formData.timeline,
      questions: formData.questions,
      applicationType: "franchise",
    });
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <Card className="bg-white/5 border-[#c8ff00]/30">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-20 h-20 rounded-full bg-[#c8ff00]/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#c8ff00]" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Application Submitted!</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Thank you for your interest in a NEON franchise territory. Our franchise development team will review your application and contact you within 24-48 hours to discuss next steps.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => window.location.href = "/shop"}
              className="bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold"
            >
              Pre-Order NEON Now
            </Button>
            <Button
              onClick={() => window.location.href = "/join"}
              variant="outline"
              className="border-[#c8ff00] text-[#c8ff00] hover:bg-[#c8ff00]/10"
            >
              Become a Distributor
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#c8ff00]" />
          Franchise Territory Application
        </CardTitle>
        <CardDescription className="text-gray-400">
          Step {step} of 3 - {step === 1 ? "Personal Information" : step === 2 ? "Territory & Investment" : "Experience & Goals"}
        </CardDescription>
        {/* Progress bar */}
        <div className="flex gap-2 mt-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-[#c8ff00]" : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-white flex items-center gap-2">
                    <User className="w-4 h-4" /> First Name *
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-white">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  required
                  placeholder="(555) 123-4567"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <Button
                type="button"
                onClick={() => setStep(2)}
                disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone}
                className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold"
              >
                Continue to Territory Details
              </Button>
            </div>
          )}

          {/* Step 2: Territory & Investment */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="territoryCity" className="text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Desired City *
                  </Label>
                  <Input
                    id="territoryCity"
                    value={formData.territoryCity}
                    onChange={(e) => updateField("territoryCity", e.target.value)}
                    required
                    placeholder="e.g., Los Angeles"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="territoryState" className="text-white">State *</Label>
                  <Input
                    id="territoryState"
                    value={formData.territoryState}
                    onChange={(e) => updateField("territoryState", e.target.value)}
                    required
                    placeholder="e.g., CA"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="territorySize" className="text-white flex items-center gap-2">
                  <Building className="w-4 h-4" /> Territory Size Interest *
                </Label>
                <Select value={formData.territorySize} onValueChange={(v) => updateField("territorySize", v)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select territory size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="city">Single City</SelectItem>
                    <SelectItem value="county">County / Metro Area</SelectItem>
                    <SelectItem value="region">Multi-County Region</SelectItem>
                    <SelectItem value="state">State-Wide</SelectItem>
                    <SelectItem value="multi-state">Multi-State</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exclusivityType" className="text-white">Exclusivity Type *</Label>
                <Select value={formData.exclusivityType} onValueChange={(v) => updateField("exclusivityType", v)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select exclusivity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exclusive">Exclusive Rights</SelectItem>
                    <SelectItem value="semi-exclusive">Semi-Exclusive</SelectItem>
                    <SelectItem value="non-exclusive">Non-Exclusive</SelectItem>
                    <SelectItem value="unsure">Not Sure Yet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="investmentCapital" className="text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> Available Investment Capital *
                </Label>
                <Select value={formData.investmentCapital} onValueChange={(v) => updateField("investmentCapital", v)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select capital range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                    <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                    <SelectItem value="100k-250k">$100,000 - $250,000</SelectItem>
                    <SelectItem value="250k-500k">$250,000 - $500,000</SelectItem>
                    <SelectItem value="500k+">$500,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="financingNeeded" className="text-white">Will you need financing?</Label>
                <Select value={formData.financingNeeded} onValueChange={(v) => updateField("financingNeeded", v)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No, I have capital ready</SelectItem>
                    <SelectItem value="partial">Partial financing needed</SelectItem>
                    <SelectItem value="yes">Yes, will need financing</SelectItem>
                    <SelectItem value="exploring">Exploring options</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="netWorth" className="text-white">Approximate Net Worth</Label>
                <Select value={formData.netWorth} onValueChange={(v) => updateField("netWorth", v)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-100k">Under $100,000</SelectItem>
                    <SelectItem value="100k-250k">$100,000 - $250,000</SelectItem>
                    <SelectItem value="250k-500k">$250,000 - $500,000</SelectItem>
                    <SelectItem value="500k-1m">$500,000 - $1,000,000</SelectItem>
                    <SelectItem value="1m+">$1,000,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!formData.territoryCity || !formData.territoryState || !formData.territorySize || !formData.exclusivityType || !formData.investmentCapital}
                  className="flex-1 bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold"
                >
                  Continue to Experience
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Experience & Goals */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessExperience" className="text-white">Business Experience *</Label>
                <Select value={formData.businessExperience} onValueChange={(v) => updateField("businessExperience", v)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No business ownership experience</SelectItem>
                    <SelectItem value="1-3years">1-3 years business ownership</SelectItem>
                    <SelectItem value="3-5years">3-5 years business ownership</SelectItem>
                    <SelectItem value="5-10years">5-10 years business ownership</SelectItem>
                    <SelectItem value="10+years">10+ years business ownership</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="distributionExperience" className="text-white">Distribution/Beverage Industry Experience</Label>
                <Textarea
                  id="distributionExperience"
                  value={formData.distributionExperience}
                  onChange={(e) => updateField("distributionExperience", e.target.value)}
                  placeholder="Describe any relevant experience in distribution, beverages, or related industries..."
                  className="bg-white/10 border-white/20 text-white min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamSize" className="text-white">Current Team Size (if any)</Label>
                <Select value={formData.teamSize} onValueChange={(v) => updateField("teamSize", v)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select team size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">Solo / Just me</SelectItem>
                    <SelectItem value="2-5">2-5 people</SelectItem>
                    <SelectItem value="6-10">6-10 people</SelectItem>
                    <SelectItem value="11-25">11-25 people</SelectItem>
                    <SelectItem value="25+">25+ people</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivation" className="text-white">Why do you want a NEON franchise? *</Label>
                <Textarea
                  id="motivation"
                  value={formData.motivation}
                  onChange={(e) => updateField("motivation", e.target.value)}
                  required
                  placeholder="Tell us about your goals and why NEON is the right fit..."
                  className="bg-white/10 border-white/20 text-white min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeline" className="text-white">When do you want to start? *</Label>
                <Select value={formData.timeline} onValueChange={(v) => updateField("timeline", v)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediately">Immediately</SelectItem>
                    <SelectItem value="1-3months">1-3 months</SelectItem>
                    <SelectItem value="3-6months">3-6 months</SelectItem>
                    <SelectItem value="6-12months">6-12 months</SelectItem>
                    <SelectItem value="exploring">Just exploring options</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="questions" className="text-white">Questions for Our Team</Label>
                <Textarea
                  id="questions"
                  value={formData.questions}
                  onChange={(e) => updateField("questions", e.target.value)}
                  placeholder="Any questions about the franchise opportunity?"
                  className="bg-white/10 border-white/20 text-white min-h-[80px]"
                />
              </div>

              {/* Agreements */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => updateField("agreeToTerms", checked as boolean)}
                    className="border-white/30 data-[state=checked]:bg-[#c8ff00] data-[state=checked]:border-[#c8ff00]"
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm text-gray-400 cursor-pointer">
                    I agree to the Terms of Service and Privacy Policy *
                  </Label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agreeToBackground"
                    checked={formData.agreeToBackground}
                    onCheckedChange={(checked) => updateField("agreeToBackground", checked as boolean)}
                    className="border-white/30 data-[state=checked]:bg-[#c8ff00] data-[state=checked]:border-[#c8ff00]"
                  />
                  <Label htmlFor="agreeToBackground" className="text-sm text-gray-400 cursor-pointer">
                    I understand that a background check may be required for franchise approval *
                  </Label>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.motivation || !formData.timeline || !formData.businessExperience || !formData.agreeToTerms || !formData.agreeToBackground}
                  className="flex-1 bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
