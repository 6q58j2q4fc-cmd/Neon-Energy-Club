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
import { Loader2, CheckCircle, Building2, MapPin, Phone, Mail, User, Briefcase } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

interface VendingApplicationFormProps {
  onSuccess?: () => void;
  isBookCall?: boolean;
}

export default function VendingApplicationForm({ onSuccess, isBookCall = false }: VendingApplicationFormProps) {
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
    
    // Business Info
    businessName: "",
    businessType: "",
    yearsInBusiness: "",
    
    // Location Info
    city: "",
    state: "",
    zipCode: "",
    proposedLocations: "",
    numberOfMachines: "1-5",
    
    // Additional Info
    investmentBudget: "",
    timeline: "",
    experience: "",
    questions: "",
    
    // Agreements
    agreeToTerms: false,
    agreeToContact: false,
  });

  const submitMutation = trpc.territory.submitVendingApplication.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success("Application submitted successfully!", {
        description: "We'll contact you within 24-48 hours.",
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
    
    if (!formData.agreeToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    setIsSubmitting(true);
    
    submitMutation.mutate({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      businessName: formData.businessName,
      businessType: formData.businessType,
      yearsInBusiness: formData.yearsInBusiness,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      proposedLocations: formData.proposedLocations,
      numberOfMachines: formData.numberOfMachines,
      investmentBudget: formData.investmentBudget,
      timeline: formData.timeline,
      experience: formData.experience,
      questions: formData.questions,
      applicationType: "vending",
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
            Thank you for your interest in NEON vending machines. Our team will review your application and contact you within 24-48 hours.
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
          <Building2 className="w-5 h-5 text-[#c8ff00]" />
          {isBookCall ? "Book a Consultation Call" : "Vending Machine Application"}
        </CardTitle>
        <CardDescription className="text-gray-400">
          {isBookCall 
            ? "Fill out your details and we'll schedule a call to discuss your vending machine opportunity"
            : `Step ${step} of 3 - ${step === 1 ? "Personal Information" : step === 2 ? "Business Details" : "Location & Investment"}`
          }
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
                Continue to Business Details
              </Button>
            </div>
          )}

          {/* Step 2: Business Info */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Business Name (if applicable)
                </Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => updateField("businessName", e.target.value)}
                  placeholder="Your business or LLC name"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessType" className="text-white">Business Type *</Label>
                <Select value={formData.businessType} onValueChange={(v) => updateField("businessType", v)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual / Sole Proprietor</SelectItem>
                    <SelectItem value="llc">LLC</SelectItem>
                    <SelectItem value="corporation">Corporation</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsInBusiness" className="text-white">Years in Business</Label>
                <Select value={formData.yearsInBusiness} onValueChange={(v) => updateField("yearsInBusiness", v)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New / Starting Out</SelectItem>
                    <SelectItem value="1-2">1-2 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="5-10">5-10 years</SelectItem>
                    <SelectItem value="10+">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience" className="text-white">Vending/Retail Experience</Label>
                <Textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => updateField("experience", e.target.value)}
                  placeholder="Tell us about any relevant experience..."
                  className="bg-white/10 border-white/20 text-white min-h-[100px]"
                />
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
                  disabled={!formData.businessType}
                  className="flex-1 bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold"
                >
                  Continue to Location
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Location & Investment */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> City *
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-white">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    required
                    placeholder="e.g., CA, TX, FL"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode" className="text-white">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => updateField("zipCode", e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proposedLocations" className="text-white">Proposed Locations</Label>
                <Textarea
                  id="proposedLocations"
                  value={formData.proposedLocations}
                  onChange={(e) => updateField("proposedLocations", e.target.value)}
                  placeholder="Describe potential locations (gyms, offices, schools, etc.)"
                  className="bg-white/10 border-white/20 text-white min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numberOfMachines" className="text-white">Number of Machines Interested In</Label>
                <Select value={formData.numberOfMachines} onValueChange={(v) => updateField("numberOfMachines", v)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-5">1-5 machines</SelectItem>
                    <SelectItem value="6-10">6-10 machines</SelectItem>
                    <SelectItem value="11-25">11-25 machines</SelectItem>
                    <SelectItem value="25+">25+ machines</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="investmentBudget" className="text-white">Investment Budget</Label>
                <Select value={formData.investmentBudget} onValueChange={(v) => updateField("investmentBudget", v)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5k-15k">$5,000 - $15,000</SelectItem>
                    <SelectItem value="15k-30k">$15,000 - $30,000</SelectItem>
                    <SelectItem value="30k-50k">$30,000 - $50,000</SelectItem>
                    <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                    <SelectItem value="100k+">$100,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeline" className="text-white">When do you want to start?</Label>
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
                <Label htmlFor="questions" className="text-white">Questions or Comments</Label>
                <Textarea
                  id="questions"
                  value={formData.questions}
                  onChange={(e) => updateField("questions", e.target.value)}
                  placeholder="Any questions for our team?"
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
                    id="agreeToContact"
                    checked={formData.agreeToContact}
                    onCheckedChange={(checked) => updateField("agreeToContact", checked as boolean)}
                    className="border-white/30 data-[state=checked]:bg-[#c8ff00] data-[state=checked]:border-[#c8ff00]"
                  />
                  <Label htmlFor="agreeToContact" className="text-sm text-gray-400 cursor-pointer">
                    I agree to be contacted by NEON regarding this application
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
                  disabled={isSubmitting || !formData.city || !formData.state || !formData.zipCode || !formData.agreeToTerms}
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
