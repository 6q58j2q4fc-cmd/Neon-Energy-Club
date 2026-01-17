import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { CheckCircle, MapPin, User, Building, FileText, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

interface TerritoryData {
  centerLat: number;
  centerLng: number;
  radiusMiles: number;
  territoryName: string;
  estimatedPopulation: number;
  termMonths: number;
  totalCost: number;
}

interface TerritoryApplicationFormProps {
  territoryData: TerritoryData;
  onClose: () => void;
  onSuccess: () => void;
}

const steps = [
  { id: 1, title: "Territory", icon: MapPin },
  { id: 2, title: "Personal", icon: User },
  { id: 3, title: "Business", icon: Building },
  { id: 4, title: "Review", icon: FileText },
];

export function TerritoryApplicationForm({ territoryData, onClose, onSuccess }: TerritoryApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationId, setApplicationId] = useState<number | null>(null);
  
  // Form data
  const [personalData, setPersonalData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
  });
  
  const [businessData, setBusinessData] = useState({
    businessName: "",
    businessType: "individual" as "individual" | "llc" | "corporation" | "partnership",
    taxId: "",
    yearsInBusiness: 0,
    investmentCapital: 0,
    franchiseExperience: "",
    whyInterested: "",
  });
  
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [signature, setSignature] = useState("");
  
  // Mutations
  const startApplication = trpc.territory.startApplication.useMutation();
  const updatePersonalDetails = trpc.territory.updatePersonalDetails.useMutation();
  const updateBusinessInfo = trpc.territory.updateBusinessInfo.useMutation();
  const submitApplication = trpc.territory.submitApplication.useMutation();
  
  const handleNext = async () => {
    if (currentStep === 1) {
      // Start application with territory data
      try {
        const result = await startApplication.mutateAsync({
          ...territoryData,
        });
        setApplicationId(result.applicationId);
        setCurrentStep(2);
      } catch (error) {
        toast.error("Failed to start application. Please try again.");
      }
    } else if (currentStep === 2) {
      // Save personal details
      if (!applicationId) return;
      if (!personalData.firstName || !personalData.lastName || !personalData.email || !personalData.phone) {
        toast.error("Please fill in all required fields.");
        return;
      }
      try {
        await updatePersonalDetails.mutateAsync({
          applicationId,
          ...personalData,
        });
        setCurrentStep(3);
      } catch (error) {
        toast.error("Failed to save personal details. Please try again.");
      }
    } else if (currentStep === 3) {
      // Save business info
      if (!applicationId) return;
      if (!businessData.whyInterested) {
        toast.error("Please tell us why you're interested in NEON.");
        return;
      }
      try {
        await updateBusinessInfo.mutateAsync({
          applicationId,
          ...businessData,
        });
        setCurrentStep(4);
      } catch (error) {
        toast.error("Failed to save business information. Please try again.");
      }
    } else if (currentStep === 4) {
      // Submit application
      if (!applicationId) return;
      if (!agreedToTerms) {
        toast.error("You must agree to the terms and conditions.");
        return;
      }
      if (!signature) {
        toast.error("Please provide your signature.");
        return;
      }
      try {
        await submitApplication.mutateAsync({
          applicationId,
          agreedToTerms,
          signature,
        });
        toast.success("Application submitted successfully! We'll be in touch soon.");
        onSuccess();
      } catch (error) {
        toast.error("Failed to submit application. Please try again.");
      }
    }
  };
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const isLoading = startApplication.isPending || updatePersonalDetails.isPending || 
                    updateBusinessInfo.isPending || submitApplication.isPending;
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-[#00ff00]/30 max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00ff00]/20 to-[#00ffff]/20 p-6 border-b border-[#00ff00]/20">
          <h2 className="text-2xl font-bold text-white mb-4">Territory Application</h2>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  currentStep >= step.id 
                    ? "bg-[#00ff00] border-[#00ff00] text-black" 
                    : "border-gray-600 text-gray-500"
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step.id ? "text-[#00ff00]" : "text-gray-500"
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-3 ${
                    currentStep > step.id ? "bg-[#00ff00]" : "bg-gray-600"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold text-white mb-4">Confirm Your Territory</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/30 rounded-lg p-4 border border-[#00ff00]/20">
                    <p className="text-gray-400 text-sm">Territory Name</p>
                    <p className="text-white font-semibold">{territoryData.territoryName}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4 border border-[#00ff00]/20">
                    <p className="text-gray-400 text-sm">Radius</p>
                    <p className="text-white font-semibold">{territoryData.radiusMiles} miles</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4 border border-[#00ff00]/20">
                    <p className="text-gray-400 text-sm">Est. Population</p>
                    <p className="text-white font-semibold">{territoryData.estimatedPopulation.toLocaleString()}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4 border border-[#00ff00]/20">
                    <p className="text-gray-400 text-sm">License Term</p>
                    <p className="text-white font-semibold">{territoryData.termMonths} months</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-[#00ff00]/10 to-[#00ffff]/10 rounded-lg p-4 border border-[#00ff00]/30 mt-6">
                  <p className="text-gray-400 text-sm">Total Investment</p>
                  <p className="text-3xl font-bold text-[#00ff00]">${territoryData.totalCost.toLocaleString()}</p>
                  <p className="text-gray-500 text-sm mt-1">Includes exclusive territory rights and startup kit</p>
                </div>
              </motion.div>
            )}
            
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold text-white mb-4">Personal Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-gray-300">First Name *</Label>
                    <Input
                      id="firstName"
                      value={personalData.firstName}
                      onChange={(e) => setPersonalData({ ...personalData, firstName: e.target.value })}
                      className="bg-black/30 border-gray-700 text-white"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-gray-300">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={personalData.lastName}
                      onChange={(e) => setPersonalData({ ...personalData, lastName: e.target.value })}
                      className="bg-black/30 border-gray-700 text-white"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="text-gray-300">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={personalData.email}
                      onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })}
                      className="bg-black/30 border-gray-700 text-white"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-gray-300">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={personalData.phone}
                      onChange={(e) => setPersonalData({ ...personalData, phone: e.target.value })}
                      className="bg-black/30 border-gray-700 text-white"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="streetAddress" className="text-gray-300">Street Address *</Label>
                  <Input
                    id="streetAddress"
                    value={personalData.streetAddress}
                    onChange={(e) => setPersonalData({ ...personalData, streetAddress: e.target.value })}
                    className="bg-black/30 border-gray-700 text-white"
                    placeholder="123 Main St"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-gray-300">City *</Label>
                    <Input
                      id="city"
                      value={personalData.city}
                      onChange={(e) => setPersonalData({ ...personalData, city: e.target.value })}
                      className="bg-black/30 border-gray-700 text-white"
                      placeholder="Miami"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-gray-300">State *</Label>
                    <Input
                      id="state"
                      value={personalData.state}
                      onChange={(e) => setPersonalData({ ...personalData, state: e.target.value })}
                      className="bg-black/30 border-gray-700 text-white"
                      placeholder="FL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode" className="text-gray-300">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      value={personalData.zipCode}
                      onChange={(e) => setPersonalData({ ...personalData, zipCode: e.target.value })}
                      className="bg-black/30 border-gray-700 text-white"
                      placeholder="33101"
                    />
                  </div>
                </div>
              </motion.div>
            )}
            
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold text-white mb-4">Business Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessName" className="text-gray-300">Business Name (if applicable)</Label>
                    <Input
                      id="businessName"
                      value={businessData.businessName}
                      onChange={(e) => setBusinessData({ ...businessData, businessName: e.target.value })}
                      className="bg-black/30 border-gray-700 text-white"
                      placeholder="My Company LLC"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessType" className="text-gray-300">Business Type *</Label>
                    <Select
                      value={businessData.businessType}
                      onValueChange={(value: any) => setBusinessData({ ...businessData, businessType: value })}
                    >
                      <SelectTrigger className="bg-black/30 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="llc">LLC</SelectItem>
                        <SelectItem value="corporation">Corporation</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="investmentCapital" className="text-gray-300">Available Investment Capital ($)</Label>
                    <Input
                      id="investmentCapital"
                      type="number"
                      value={businessData.investmentCapital || ""}
                      onChange={(e) => setBusinessData({ ...businessData, investmentCapital: parseInt(e.target.value) || 0 })}
                      className="bg-black/30 border-gray-700 text-white"
                      placeholder="50000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="yearsInBusiness" className="text-gray-300">Years in Business</Label>
                    <Input
                      id="yearsInBusiness"
                      type="number"
                      value={businessData.yearsInBusiness || ""}
                      onChange={(e) => setBusinessData({ ...businessData, yearsInBusiness: parseInt(e.target.value) || 0 })}
                      className="bg-black/30 border-gray-700 text-white"
                      placeholder="5"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="franchiseExperience" className="text-gray-300">Previous Franchise/Distribution Experience</Label>
                  <Textarea
                    id="franchiseExperience"
                    value={businessData.franchiseExperience}
                    onChange={(e) => setBusinessData({ ...businessData, franchiseExperience: e.target.value })}
                    className="bg-black/30 border-gray-700 text-white"
                    placeholder="Describe any relevant experience..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="whyInterested" className="text-gray-300">Why are you interested in NEON? *</Label>
                  <Textarea
                    id="whyInterested"
                    value={businessData.whyInterested}
                    onChange={(e) => setBusinessData({ ...businessData, whyInterested: e.target.value })}
                    className="bg-black/30 border-gray-700 text-white"
                    placeholder="Tell us why you want to become a NEON distributor..."
                    rows={4}
                  />
                </div>
              </motion.div>
            )}
            
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold text-white mb-4">Review & Submit</h3>
                
                <div className="space-y-4">
                  <div className="bg-black/30 rounded-lg p-4 border border-[#00ff00]/20">
                    <h4 className="text-[#00ff00] font-semibold mb-2">Territory Details</h4>
                    <p className="text-gray-300">{territoryData.territoryName}</p>
                    <p className="text-gray-400 text-sm">{territoryData.radiusMiles} mile radius • {territoryData.estimatedPopulation.toLocaleString()} population</p>
                    <p className="text-[#00ff00] font-bold mt-2">${territoryData.totalCost.toLocaleString()} for {territoryData.termMonths} months</p>
                  </div>
                  
                  <div className="bg-black/30 rounded-lg p-4 border border-[#00ffff]/20">
                    <h4 className="text-[#00ffff] font-semibold mb-2">Personal Information</h4>
                    <p className="text-gray-300">{personalData.firstName} {personalData.lastName}</p>
                    <p className="text-gray-400 text-sm">{personalData.email} • {personalData.phone}</p>
                    <p className="text-gray-400 text-sm">{personalData.streetAddress}, {personalData.city}, {personalData.state} {personalData.zipCode}</p>
                  </div>
                  
                  <div className="bg-black/30 rounded-lg p-4 border border-[#ff0080]/20">
                    <h4 className="text-[#ff0080] font-semibold mb-2">Business Information</h4>
                    <p className="text-gray-300">{businessData.businessName || "Individual"} ({businessData.businessType})</p>
                    <p className="text-gray-400 text-sm">Investment Capital: ${businessData.investmentCapital.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-700 pt-4 mt-6">
                  <div className="flex items-start space-x-3 mb-4">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                      className="mt-1"
                    />
                    <Label htmlFor="terms" className="text-gray-300 text-sm">
                      I agree to the NEON Territory License Agreement, Terms of Service, and Privacy Policy. 
                      I understand that this application does not guarantee territory approval and that NEON 
                      reserves the right to accept or reject applications at its discretion.
                    </Label>
                  </div>
                  
                  <div>
                    <Label htmlFor="signature" className="text-gray-300">Digital Signature (Type your full name) *</Label>
                    <Input
                      id="signature"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      className="bg-black/30 border-gray-700 text-white font-cursive text-xl"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Footer */}
        <div className="bg-black/30 p-6 border-t border-gray-700 flex justify-between">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onClose : handleBack}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {currentStep === 1 ? "Cancel" : "Back"}
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="bg-gradient-to-r from-[#00ff00] to-[#00cc00] text-black font-bold hover:from-[#00cc00] hover:to-[#009900]"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4 mr-2" />
            )}
            {currentStep === 4 ? "Submit Application" : "Continue"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
