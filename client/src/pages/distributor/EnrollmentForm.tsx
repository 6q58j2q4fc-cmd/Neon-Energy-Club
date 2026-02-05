import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Building2, User, Phone, Mail, MapPin, Users, AlertCircle, Shield, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EnrollmentFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  
  // Address
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Business Entity
  entityType: "individual" | "llc" | "corporation" | "partnership" | "";
  businessName?: string;
  businessEin?: string;
  businessAddress?: string;
  businessCity?: string;
  businessState?: string;
  businessZipCode?: string;
  
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  
  // Sponsor Information
  sponsorCode?: string;
  
  // Agreements
  agreeToTerms: boolean;
  agreeToPolicies: boolean;
  agreeToAutoship: boolean;
}

export default function EnrollmentForm() {
  const [, setLocation] = useLocation();
  // Using sonner toast
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<EnrollmentFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    entityType: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    agreeToTerms: false,
    agreeToPolicies: false,
    agreeToAutoship: true, // Default checked
  });

  const enrollMutation = trpc.distributor.enroll.useMutation({
    onSuccess: (data) => {
      toast.success("Enrollment Successful!", {
        description: `Your distributor code is: ${data.distributorCode}`,
      });
      // Redirect to package selection
      setLocation("/distributor/select-package");
    },
    onError: (error) => {
      toast.error("Enrollment Failed", {
        description: error.message,
      });
    },
  });

  const handleInputChange = (field: keyof EnrollmentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return !!(formData.firstName && formData.lastName && formData.email && formData.phone && formData.dateOfBirth);
      case 2:
        return !!(formData.address && formData.city && formData.state && formData.zipCode && formData.country);
      case 3:
        if (formData.entityType === "individual") return true;
        return !!(formData.businessName && formData.businessEin);
      case 4:
        return !!(formData.emergencyContactName && formData.emergencyContactPhone && formData.emergencyContactRelationship);
      case 5:
        return formData.agreeToTerms && formData.agreeToPolicies;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    } else {
      toast.error("Incomplete Information", {
        description: "Please fill in all required fields before continuing.",
      });
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    if (!validateStep(5)) {
      toast.error("Incomplete Information", {
        description: "Please agree to all terms and policies.",
      });
      return;
    }

    enrollMutation.mutate({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      country: formData.country,
      sponsorCode: formData.sponsorCode,
    });
  };

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-white">Distributor Enrollment</h2>
            <span className="text-sm text-white/60">Step {step} of {totalSteps}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#c8ff00] to-cyan-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {step === 1 && <><User className="w-5 h-5" /> Personal Information</>}
              {step === 2 && <><MapPin className="w-5 h-5" /> Address Information</>}
              {step === 3 && <><Building2 className="w-5 h-5" /> Business Entity</>}
              {step === 4 && <><Users className="w-5 h-5" /> Emergency Contact</>}
              {step === 5 && <><Shield className="w-5 h-5" /> Review & Agreements</>}
            </CardTitle>
            <CardDescription className="text-white/60">
              {step === 1 && "Enter your personal details as they appear on your government ID"}
              {step === 2 && "Provide your current residential address"}
              {step === 3 && "Choose how you'll operate your business"}
              {step === 4 && "Provide an emergency contact person"}
              {step === 5 && "Review your information and agree to terms"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-white">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="bg-white/5 border-white/20 text-white"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-white">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="bg-white/5 border-white/20 text-white"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-white">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-white">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="bg-white/5 border-white/20 text-white"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth" className="text-white">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                </div>

                <Alert className="bg-blue-500/10 border-blue-500/20">
                  <AlertCircle className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-200">
                    You must be 18 years or older to enroll as a distributor.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 2: Address Information */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address" className="text-white">Street Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="123 Main Street, Apt 4B"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-white">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className="bg-white/5 border-white/20 text-white"
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-white">State/Province *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      className="bg-white/5 border-white/20 text-white"
                      placeholder="NY"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode" className="text-white">ZIP/Postal Code *</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      className="bg-white/5 border-white/20 text-white"
                      placeholder="10001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-white">Country *</Label>
                    <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="MX">Mexico</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Business Entity */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="entityType" className="text-white">Business Entity Type *</Label>
                  <Select value={formData.entityType} onValueChange={(value: any) => handleInputChange("entityType", value)}>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Select entity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual (Sole Proprietor)</SelectItem>
                      <SelectItem value="llc">LLC (Limited Liability Company)</SelectItem>
                      <SelectItem value="corporation">Corporation</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.entityType && formData.entityType !== "individual" && (
                  <>
                    <Alert className="bg-yellow-500/10 border-yellow-500/20">
                      <AlertCircle className="h-4 w-4 text-yellow-400" />
                      <AlertDescription className="text-yellow-200">
                        You've selected to enroll as a business entity. Please provide your registered business information below.
                      </AlertDescription>
                    </Alert>

                    <div>
                      <Label htmlFor="businessName" className="text-white">Registered Business Name *</Label>
                      <Input
                        id="businessName"
                        value={formData.businessName || ""}
                        onChange={(e) => handleInputChange("businessName", e.target.value)}
                        className="bg-white/5 border-white/20 text-white"
                        placeholder="ACME Energy LLC"
                      />
                    </div>

                    <div>
                      <Label htmlFor="businessEin" className="text-white">Business EIN/Tax ID *</Label>
                      <Input
                        id="businessEin"
                        value={formData.businessEin || ""}
                        onChange={(e) => handleInputChange("businessEin", e.target.value)}
                        className="bg-white/5 border-white/20 text-white"
                        placeholder="12-3456789"
                      />
                    </div>

                    <div>
                      <Label htmlFor="businessAddress" className="text-white">Business Address *</Label>
                      <Input
                        id="businessAddress"
                        value={formData.businessAddress || ""}
                        onChange={(e) => handleInputChange("businessAddress", e.target.value)}
                        className="bg-white/5 border-white/20 text-white"
                        placeholder="456 Business Blvd, Suite 100"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="businessCity" className="text-white">City *</Label>
                        <Input
                          id="businessCity"
                          value={formData.businessCity || ""}
                          onChange={(e) => handleInputChange("businessCity", e.target.value)}
                          className="bg-white/5 border-white/20 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessState" className="text-white">State *</Label>
                        <Input
                          id="businessState"
                          value={formData.businessState || ""}
                          onChange={(e) => handleInputChange("businessState", e.target.value)}
                          className="bg-white/5 border-white/20 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessZipCode" className="text-white">ZIP Code *</Label>
                        <Input
                          id="businessZipCode"
                          value={formData.businessZipCode || ""}
                          onChange={(e) => handleInputChange("businessZipCode", e.target.value)}
                          className="bg-white/5 border-white/20 text-white"
                        />
                      </div>
                    </div>
                  </>
                )}

                {formData.entityType === "individual" && (
                  <Alert className="bg-green-500/10 border-green-500/20">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-200">
                      You'll be enrolling as an individual sole proprietor. You can always upgrade to a business entity later.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Step 4: Emergency Contact */}
            {step === 4 && (
              <div className="space-y-4">
                <Alert className="bg-blue-500/10 border-blue-500/20">
                  <AlertCircle className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-200">
                    Please provide an emergency contact who can be reached if we cannot contact you directly.
                  </AlertDescription>
                </Alert>

                <div>
                  <Label htmlFor="emergencyContactName" className="text-white">Emergency Contact Name *</Label>
                  <Input
                    id="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="Jane Doe"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContactPhone" className="text-white">Emergency Contact Phone *</Label>
                    <Input
                      id="emergencyContactPhone"
                      type="tel"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                      className="bg-white/5 border-white/20 text-white"
                      placeholder="+1 (555) 987-6543"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactRelationship" className="text-white">Relationship *</Label>
                    <Select value={formData.emergencyContactRelationship} onValueChange={(value) => handleInputChange("emergencyContactRelationship", value)}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="sibling">Sibling</SelectItem>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="friend">Friend</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="sponsorCode" className="text-white">Sponsor/Referral Code (Optional)</Label>
                  <Input
                    id="sponsorCode"
                    value={formData.sponsorCode || ""}
                    onChange={(e) => handleInputChange("sponsorCode", e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="DIST123ABC"
                  />
                  <p className="text-xs text-white/50 mt-1">
                    If you were referred by another distributor, enter their code here.
                  </p>
                </div>
              </div>
            )}

            {/* Step 5: Review & Agreements */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="bg-white/5 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-white">Review Your Information</h3>
                  <div className="text-sm text-white/70 space-y-1">
                    <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                    <p><strong>Email:</strong> {formData.email}</p>
                    <p><strong>Phone:</strong> {formData.phone}</p>
                    <p><strong>Address:</strong> {formData.address}, {formData.city}, {formData.state} {formData.zipCode}</p>
                    <p><strong>Entity Type:</strong> {formData.entityType === "individual" ? "Individual" : formData.businessName}</p>
                    <p><strong>Emergency Contact:</strong> {formData.emergencyContactName} ({formData.emergencyContactRelationship})</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
                      className="mt-1"
                    />
                    <Label htmlFor="agreeToTerms" className="text-white text-sm cursor-pointer">
                      I have read and agree to the{" "}
                      <a href="/terms-and-conditions" target="_blank" className="text-[#c8ff00] hover:underline">
                        Terms and Conditions
                      </a>
                      {" "}*
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="agreeToPolicies"
                      checked={formData.agreeToPolicies}
                      onCheckedChange={(checked) => handleInputChange("agreeToPolicies", checked)}
                      className="mt-1"
                    />
                    <Label htmlFor="agreeToPolicies" className="text-white text-sm cursor-pointer">
                      I have read and agree to the{" "}
                      <a href="/policies-and-procedures" target="_blank" className="text-[#c8ff00] hover:underline">
                        Policies and Procedures
                      </a>
                      {" "}*
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="agreeToAutoship"
                      checked={formData.agreeToAutoship}
                      onCheckedChange={(checked) => handleInputChange("agreeToAutoship", checked)}
                      className="mt-1"
                    />
                    <Label htmlFor="agreeToAutoship" className="text-white text-sm cursor-pointer">
                      I understand that I must maintain an active autoship order to remain commission-eligible
                    </Label>
                  </div>

                  {!formData.agreeToAutoship && (
                    <Alert className="bg-red-500/10 border-red-500/20">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <AlertDescription className="text-red-200">
                        <strong>Warning:</strong> Without an active autoship, you will NOT be eligible to earn commissions on your team's sales.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <Alert className="bg-green-500/10 border-green-500/20">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-200">
                    After completing enrollment, you'll be directed to select your enrollment package and set up your autoship.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-white/10">
              {step > 1 && (
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Back
                </Button>
              )}
              {step < totalSteps ? (
                <Button
                  onClick={handleNext}
                  className="ml-auto bg-[#c8ff00] hover:bg-[#d4ff33] text-black font-bold"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={enrollMutation.isPending}
                  className="ml-auto bg-[#c8ff00] hover:bg-[#d4ff33] text-black font-bold"
                >
                  {enrollMutation.isPending ? "Processing..." : "Complete Enrollment"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
