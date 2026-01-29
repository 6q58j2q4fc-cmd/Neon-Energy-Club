import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Shield, 
  Zap,
  Calculator,
  ArrowRight,
  Loader2
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

interface VendingCheckoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  machineModel?: string;
  basePrice?: number;
}

const MACHINE_MODELS = [
  { id: "standard", name: "Standard Model", price: 4500, description: "Perfect for gyms and offices" },
  { id: "premium", name: "Premium Model", price: 6500, description: "55\" HD touchscreen display" },
  { id: "deluxe", name: "Deluxe Model", price: 8500, description: "Full AI-powered smart vending" },
];

const PAYMENT_PLANS = [
  { months: 3, apr: 0, label: "3 Months", description: "0% APR" },
  { months: 6, apr: 0, label: "6 Months", description: "0% APR" },
  { months: 12, apr: 5.99, label: "12 Months", description: "5.99% APR" },
  { months: 24, apr: 7.99, label: "24 Months", description: "7.99% APR" },
];

const DEPOSIT_PERCENTAGE = 20; // 20% deposit required

export default function VendingCheckout({ open, onOpenChange, machineModel = "standard", basePrice }: VendingCheckoutProps) {
  const { user } = useAuth();
  
  const [step, setStep] = useState<"select" | "payment" | "details" | "confirm">("select");
  const [selectedModel, setSelectedModel] = useState(machineModel);
  const [quantity, setQuantity] = useState(1);
  const [paymentType, setPaymentType] = useState<"full" | "deposit" | "payment_plan">("deposit");
  const [selectedPlan, setSelectedPlan] = useState(6);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Contact details
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  const createOrder = trpc.vending.createOrder.useMutation({
    onSuccess: (data) => {
      if ('checkoutUrl' in data && data.checkoutUrl) {
        window.open(data.checkoutUrl, "_blank");
        toast.success("Redirecting to checkout", {
          description: "Complete your payment in the new window.",
        });
        onOpenChange(false);
      } else {
        toast.success("Order created", {
          description: "Your order has been submitted. We'll contact you shortly.",
        });
        onOpenChange(false);
      }
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message || "Failed to create order. Please try again.",
      });
      setIsProcessing(false);
    },
  });

  const machine = MACHINE_MODELS.find(m => m.id === selectedModel) || MACHINE_MODELS[0];
  const totalPrice = (basePrice || machine.price) * quantity;
  const depositAmount = Math.round(totalPrice * (DEPOSIT_PERCENTAGE / 100));
  
  // Calculate payment plan
  const plan = PAYMENT_PLANS.find(p => p.months === selectedPlan) || PAYMENT_PLANS[1];
  const financedAmount = totalPrice - depositAmount;
  const monthlyInterest = plan.apr / 100 / 12;
  const monthlyPayment = plan.apr > 0 
    ? Math.round((financedAmount * monthlyInterest * Math.pow(1 + monthlyInterest, plan.months)) / (Math.pow(1 + monthlyInterest, plan.months) - 1))
    : Math.round(financedAmount / plan.months);
  const totalWithInterest = depositAmount + (monthlyPayment * plan.months);

  const handleSubmit = async () => {
    if (!name || !email || !phone) {
      toast.error("Missing information", {
        description: "Please fill in all required fields.",
      });
      return;
    }

    setIsProcessing(true);
    
    createOrder.mutate({
      machineModel: selectedModel,
      quantity,
      totalPriceCents: totalPrice * 100,
      depositAmountCents: paymentType === "full" ? totalPrice * 100 : depositAmount * 100,
      paymentType,
      paymentPlanMonths: paymentType === "payment_plan" ? selectedPlan : undefined,
      monthlyPaymentCents: paymentType === "payment_plan" ? monthlyPayment * 100 : undefined,
      name,
      email,
      phone,
      deliveryAddress: address,
      deliveryCity: city,
      deliveryState: state,
      deliveryZip: zip,
    });
  };

  const renderStep = () => {
    switch (step) {
      case "select":
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-semibold mb-4 block">Select Machine Model</Label>
              <RadioGroup value={selectedModel} onValueChange={setSelectedModel} className="space-y-3">
                {MACHINE_MODELS.map((model) => (
                  <div key={model.id} className="flex items-center space-x-3">
                    <RadioGroupItem value={model.id} id={model.id} />
                    <Label htmlFor={model.id} className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center p-4 rounded-lg border border-gray-700 hover:border-[#c8ff00]/50 transition-colors">
                        <div>
                          <p className="font-semibold text-white">{model.name}</p>
                          <p className="text-sm text-gray-400">{model.description}</p>
                        </div>
                        <p className="text-xl font-bold text-[#c8ff00]">${model.price.toLocaleString()}</p>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div>
              <Label className="text-lg font-semibold mb-2 block">Quantity</Label>
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center text-lg">
              <span className="text-gray-400">Subtotal:</span>
              <span className="text-2xl font-bold text-white">${totalPrice.toLocaleString()}</span>
            </div>
            
            <Button 
              className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold text-lg py-6"
              onClick={() => setStep("payment")}
            >
              Continue to Payment Options <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        );
        
      case "payment":
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-semibold mb-4 block">Choose Payment Option</Label>
              <RadioGroup value={paymentType} onValueChange={(v) => setPaymentType(v as any)} className="space-y-3">
                {/* Full Payment */}
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="full" id="full" className="mt-1" />
                  <Label htmlFor="full" className="flex-1 cursor-pointer">
                    <div className="p-4 rounded-lg border border-gray-700 hover:border-[#c8ff00]/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-white flex items-center gap-2">
                            <CreditCard className="h-4 w-4" /> Pay in Full
                          </p>
                          <p className="text-sm text-gray-400">One-time payment, no interest</p>
                        </div>
                        <p className="text-xl font-bold text-[#c8ff00]">${totalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                  </Label>
                </div>
                
                {/* Deposit Only */}
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="deposit" id="deposit" className="mt-1" />
                  <Label htmlFor="deposit" className="flex-1 cursor-pointer">
                    <div className="p-4 rounded-lg border border-gray-700 hover:border-[#c8ff00]/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-white flex items-center gap-2">
                            <DollarSign className="h-4 w-4" /> {DEPOSIT_PERCENTAGE}% Deposit
                          </p>
                          <p className="text-sm text-gray-400">Reserve your machine, pay balance before delivery</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-[#c8ff00]">${depositAmount.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">+ ${(totalPrice - depositAmount).toLocaleString()} later</p>
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
                
                {/* Payment Plan */}
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="payment_plan" id="payment_plan" className="mt-1" />
                  <Label htmlFor="payment_plan" className="flex-1 cursor-pointer">
                    <div className="p-4 rounded-lg border border-gray-700 hover:border-[#c8ff00]/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-white flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Payment Plan
                          </p>
                          <p className="text-sm text-gray-400">{DEPOSIT_PERCENTAGE}% deposit + monthly payments</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-[#c8ff00]">${depositAmount.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">+ ${monthlyPayment.toLocaleString()}/mo</p>
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Payment Plan Options */}
            {paymentType === "payment_plan" && (
              <div className="bg-gray-900/50 rounded-lg p-4 space-y-4">
                <Label className="font-semibold block">Select Payment Term</Label>
                <RadioGroup value={selectedPlan.toString()} onValueChange={(v) => setSelectedPlan(parseInt(v))} className="grid grid-cols-2 gap-3">
                  {PAYMENT_PLANS.map((p) => (
                    <div key={p.months} className="flex items-center space-x-2">
                      <RadioGroupItem value={p.months.toString()} id={`plan-${p.months}`} />
                      <Label htmlFor={`plan-${p.months}`} className="cursor-pointer">
                        <span className="font-semibold">{p.label}</span>
                        <span className="text-xs text-gray-400 ml-1">({p.description})</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                
                <Separator />
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Deposit ({DEPOSIT_PERCENTAGE}%):</span>
                    <span className="font-semibold">${depositAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Monthly Payment:</span>
                    <span className="font-semibold">${monthlyPayment.toLocaleString()}/mo × {selectedPlan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total with Interest:</span>
                    <span className="font-semibold">${totalWithInterest.toLocaleString()}</span>
                  </div>
                  {plan.apr > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Interest ({plan.apr}% APR):</span>
                      <span className="text-gray-500">${(totalWithInterest - totalPrice).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("select")} className="flex-1">
                Back
              </Button>
              <Button 
                className="flex-1 bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold"
                onClick={() => setStep("details")}
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
        
      case "details":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  className="bg-gray-900 border-gray-700"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="bg-gray-900 border-gray-700"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input 
                  id="phone" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="bg-gray-900 border-gray-700"
                />
              </div>
            </div>
            
            <Separator />
            
            <p className="text-sm text-gray-400">Delivery Address (Optional - can be provided later)</p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Street Address</Label>
                <Input 
                  id="address" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St"
                  className="bg-gray-900 border-gray-700"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Miami"
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input 
                    id="state" 
                    value={state} 
                    onChange={(e) => setState(e.target.value)}
                    placeholder="FL"
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
                <div>
                  <Label htmlFor="zip">ZIP</Label>
                  <Input 
                    id="zip" 
                    value={zip} 
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="33101"
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("payment")} className="flex-1">
                Back
              </Button>
              <Button 
                className="flex-1 bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold"
                onClick={() => setStep("confirm")}
                disabled={!name || !email || !phone}
              >
                Review Order <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
        
      case "confirm":
        return (
          <div className="space-y-6">
            <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-lg">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Machine:</span>
                  <span>{machine.name} × {quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Price:</span>
                  <span className="font-semibold">${totalPrice.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment Type:</span>
                  <span className="capitalize">{paymentType.replace("_", " ")}</span>
                </div>
                {paymentType === "payment_plan" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Plan:</span>
                      <span>{selectedPlan} months @ {plan.apr}% APR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Monthly Payment:</span>
                      <span>${monthlyPayment.toLocaleString()}/mo</span>
                    </div>
                  </>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Due Today:</span>
                  <span className="text-[#c8ff00]">
                    ${paymentType === "full" ? totalPrice.toLocaleString() : depositAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold">Contact Information</h3>
              <p className="text-sm text-gray-400">{name}</p>
              <p className="text-sm text-gray-400">{email}</p>
              <p className="text-sm text-gray-400">{phone}</p>
              {address && (
                <p className="text-sm text-gray-400">{address}, {city}, {state} {zip}</p>
              )}
            </div>
            
            <div className="flex items-start gap-2 text-sm text-gray-400">
              <Shield className="h-4 w-4 mt-0.5 text-[#c8ff00]" />
              <p>Your payment is secured with 256-bit SSL encryption. We never store your card details.</p>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("details")} className="flex-1">
                Back
              </Button>
              <Button 
                className="flex-1 bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold text-lg py-6"
                onClick={handleSubmit}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Pay ${paymentType === "full" ? totalPrice.toLocaleString() : depositAmount.toLocaleString()}
                  </>
                )}
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-[#0a1a1a] border-[#c8ff00]/30 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-[#c8ff00]" />
            {step === "select" && "Select Your Machine"}
            {step === "payment" && "Payment Options"}
            {step === "details" && "Your Information"}
            {step === "confirm" && "Confirm Order"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {step === "select" && "Choose your NEON vending machine model and quantity"}
            {step === "payment" && "Select how you'd like to pay"}
            {step === "details" && "Enter your contact and delivery information"}
            {step === "confirm" && "Review your order before payment"}
          </DialogDescription>
        </DialogHeader>
        
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 py-2">
          {["select", "payment", "details", "confirm"].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === s ? "bg-[#c8ff00] text-black" : 
                ["select", "payment", "details", "confirm"].indexOf(step) > i ? "bg-[#c8ff00]/30 text-[#c8ff00]" : 
                "bg-gray-800 text-gray-500"
              }`}>
                {i + 1}
              </div>
              {i < 3 && <div className={`w-8 h-0.5 ${
                ["select", "payment", "details", "confirm"].indexOf(step) > i ? "bg-[#c8ff00]/30" : "bg-gray-800"
              }`} />}
            </div>
          ))}
        </div>
        
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}
