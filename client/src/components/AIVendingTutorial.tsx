import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Zap, Wifi, Camera, TrendingUp, DollarSign, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  image?: string;
  features: string[];
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "The Redbox of Energy Drinks",
    description: "Just like Redbox revolutionized movie rentals with convenient kiosks, NEON is transforming energy drink distribution with AI-powered vending machines.",
    icon: <Zap className="w-8 h-8 text-[#c8ff00]" />,
    features: [
      "24/7 automated sales - no staff needed",
      "Prime location placement (gyms, offices, campuses)",
      "Cashless payment integration",
      "Real-time inventory tracking"
    ]
  },
  {
    id: 2,
    title: "AI Sales Bot - Your Digital Salesperson",
    description: "Our advanced AI doesn't just dispense drinks - it actively sells, engages customers, and generates leads automatically.",
    icon: <Users className="w-8 h-8 text-[#c8ff00]" />,
    features: [
      "Personalized product recommendations",
      "Upselling and cross-selling automation",
      "Customer preference learning",
      "Multi-language support"
    ]
  },
  {
    id: 3,
    title: "Selfie Cam Lead Generation",
    description: "Revolutionary customer capture system that turns every interaction into a marketing opportunity.",
    icon: <Camera className="w-8 h-8 text-[#c8ff00]" />,
    features: [
      "Optional selfie for loyalty program signup",
      "Instant email/SMS capture",
      "Social media sharing incentives",
      "Referral program integration"
    ]
  },
  {
    id: 4,
    title: "WiFi Hotspot Marketing Hub",
    description: "Transform your vending machine into a marketing powerhouse with built-in WiFi that captures customer attention.",
    icon: <Wifi className="w-8 h-8 text-[#c8ff00]" />,
    features: [
      "Free WiFi attracts foot traffic",
      "Splash page advertising",
      "Email capture on WiFi login",
      "Location-based promotions"
    ]
  },
  {
    id: 5,
    title: "Passive Income Machine",
    description: "Watch your investment work for you 24/7 with minimal maintenance and maximum returns.",
    icon: <DollarSign className="w-8 h-8 text-[#c8ff00]" />,
    features: [
      "Average $2,000-$5,000/month per machine",
      "Remote monitoring and restocking alerts",
      "Automated payment processing",
      "Scalable to multiple territories"
    ]
  },
  {
    id: 6,
    title: "Real-Time Analytics Dashboard",
    description: "Track every sale, customer interaction, and performance metric from your phone or computer.",
    icon: <TrendingUp className="w-8 h-8 text-[#c8ff00]" />,
    features: [
      "Live sales tracking",
      "Customer demographics insights",
      "Peak hours analysis",
      "Inventory optimization recommendations"
    ]
  }
];

interface AIVendingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIVendingTutorial({ isOpen, onClose }: AIVendingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = tutorialSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="relative w-full max-w-4xl bg-gradient-to-br from-gray-900 via-gray-800 to-black border-[#c8ff00]/20 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-800/50 hover:bg-gray-700 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* Progress indicator */}
        <div className="flex gap-2 p-6 pb-4">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-all ${
                index === currentStep
                  ? 'bg-[#c8ff00]'
                  : index < currentStep
                  ? 'bg-[#c8ff00]/50'
                  : 'bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-6 pt-2">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-[#c8ff00]/10 border border-[#c8ff00]/20">
              {step.icon}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-center mb-4 text-white">
            {step.title}
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-300 text-center mb-8 max-w-2xl mx-auto">
            {step.description}
          </p>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {step.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg bg-gray-800/50 border border-gray-700"
              >
                <div className="w-2 h-2 rounded-full bg-[#c8ff00] mt-2 flex-shrink-0" />
                <p className="text-gray-300">{feature}</p>
              </div>
            ))}
          </div>

          {/* Visual mockup placeholder */}
          {currentStep === 2 && (
            <div className="mb-8 p-8 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-[#c8ff00]/20">
              <div className="aspect-video flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-[#c8ff00]/50" />
                  <p className="text-sm">Selfie Cam Interface Mockup</p>
                  <p className="text-xs text-gray-600 mt-2">Customer takes selfie → Instant loyalty signup → Drink dispensed</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="mb-8 p-8 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-[#c8ff00]/20">
              <div className="aspect-video flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Wifi className="w-16 h-16 mx-auto mb-4 text-[#c8ff00]/50" />
                  <p className="text-sm">WiFi Hotspot Marketing Flow</p>
                  <p className="text-xs text-gray-600 mt-2">Free WiFi → Splash page ad → Email capture → Promotional offer</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <Button
              onClick={handlePrev}
              disabled={isFirstStep}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="text-sm text-gray-500">
              Step {currentStep + 1} of {tutorialSteps.length}
            </div>

            {isLastStep ? (
              <Button
                onClick={handleClose}
                className="bg-[#c8ff00] text-black hover:bg-[#d4ff33] flex items-center gap-2"
              >
                Get Started
                <Zap className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-[#c8ff00] text-black hover:bg-[#d4ff33] flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
