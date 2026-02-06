import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Globe,
  Users,
  DollarSign,
  Settings,
  Share2,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  target?: string; // CSS selector for highlighting
  position: "top" | "bottom" | "left" | "right" | "center";
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to NEON!",
    description:
      "Let's take a quick tour of your distributor portal. You'll learn how to share your website, build your team, and start earning commissions!",
    icon: <Sparkles className="w-8 h-8 text-[#c8ff00]" />,
    position: "center",
  },
  {
    id: "replicated-website",
    title: "Your Replicated Website",
    description:
      "This is your unique website link! Share it on social media, email, or text to attract customers and new distributors. Click the copy button to grab your link.",
    icon: <Globe className="w-8 h-8 text-[#c8ff00]" />,
    target: "[data-tutorial='replicated-website']",
    position: "bottom",
  },
  {
    id: "share-links",
    title: "Share Your Opportunity",
    description:
      "Use these quick share buttons to post your link on Facebook, Twitter, or LinkedIn. The more you share, the faster you'll grow your business!",
    icon: <Share2 className="w-8 h-8 text-[#c8ff00]" />,
    target: "[data-tutorial='share-buttons']",
    position: "bottom",
  },
  {
    id: "team-building",
    title: "Build Your Team",
    description:
      "Navigate to 'My Team' to see your downline, track their performance, and view your binary tree structure. Your team's success is your success!",
    icon: <Users className="w-8 h-8 text-[#c8ff00]" />,
    target: "[data-tutorial='my-team']",
    position: "right",
  },
  {
    id: "commissions",
    title: "Track Your Earnings",
    description:
      "Check your 'Commissions' tab to see your earnings breakdown: retail commissions, binary bonuses, fast start bonuses, and more!",
    icon: <DollarSign className="w-8 h-8 text-[#c8ff00]" />,
    target: "[data-tutorial='commissions']",
    position: "right",
  },
  {
    id: "rank-progress",
    title: "Advance Your Rank",
    description:
      "Watch your rank progress here! As you hit volume and team milestones, you'll advance from Starter → Bronze → Silver → Gold and beyond!",
    icon: <TrendingUp className="w-8 h-8 text-[#c8ff00]" />,
    target: "[data-tutorial='rank-progress']",
    position: "bottom",
  },
  {
    id: "customize-profile",
    title: "Customize Your Profile",
    description:
      "Go to 'Settings' to upload your photo, add a bio, and personalize your replicated website. Make it yours!",
    icon: <Settings className="w-8 h-8 text-[#c8ff00]" />,
    target: "[data-tutorial='settings']",
    position: "right",
  },
  {
    id: "complete",
    title: "You're Ready to Go!",
    description:
      "That's it! You're all set to start building your NEON business. Remember: share your link, support your team, and watch your earnings grow. Let's fuel your potential!",
    icon: <Check className="w-8 h-8 text-[#c8ff00]" />,
    position: "center",
  },
];

interface OnboardingTutorialProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export default function OnboardingTutorial({
  onComplete,
  onSkip,
}: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  const step = TUTORIAL_STEPS[currentStep];
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  useEffect(() => {
    // Check if tutorial has been completed before
    const tutorialCompleted = localStorage.getItem("neon-tutorial-completed");
    if (!tutorialCompleted) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    if (step.target && isVisible) {
      const element = document.querySelector(step.target) as HTMLElement;
      if (element) {
        setHighlightedElement(element);
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      setHighlightedElement(null);
    }
  }, [currentStep, step.target, isVisible]);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Fire confetti celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#c8ff00", "#00ff00", "#ffff00"],
    });

    localStorage.setItem("neon-tutorial-completed", "true");
    setIsVisible(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem("neon-tutorial-completed", "true");
    setIsVisible(false);
    onSkip?.();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-[9998]"
        onClick={step.position === "center" ? undefined : handleNext}
      />

      {/* Highlight spotlight for targeted elements */}
      {highlightedElement && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: highlightedElement.getBoundingClientRect().top - 8,
            left: highlightedElement.getBoundingClientRect().left - 8,
            width: highlightedElement.getBoundingClientRect().width + 16,
            height: highlightedElement.getBoundingClientRect().height + 16,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.8), 0 0 20px #c8ff00",
            borderRadius: "8px",
            border: "2px solid #c8ff00",
          }}
        />
      )}

      {/* Tutorial Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`fixed z-[10000] ${
            step.position === "center"
              ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              : "top-24 right-8"
          } max-w-md`}
        >
          <Card className="bg-black border-[#c8ff00] shadow-2xl shadow-[#c8ff00]/20">
            <CardContent className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#c8ff00]/10 rounded-lg">{step.icon}</div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{step.title}</h3>
                    <p className="text-xs text-gray-400">
                      Step {currentStep + 1} of {TUTORIAL_STEPS.length}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Progress Bar */}
              <Progress value={progress} className="h-2 bg-gray-800">
                <div
                  className="h-full bg-gradient-to-r from-[#c8ff00] to-green-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </Progress>

              {/* Description */}
              <p className="text-gray-300 text-sm leading-relaxed">{step.description}</p>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="text-gray-400 hover:text-white disabled:opacity-30"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <Button
                  onClick={handleNext}
                  className="bg-[#c8ff00] text-black hover:bg-[#a8df00] font-bold"
                >
                  {currentStep === TUTORIAL_STEPS.length - 1 ? (
                    <>
                      Complete
                      <Check className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              {/* Skip Link */}
              {currentStep < TUTORIAL_STEPS.length - 1 && (
                <button
                  onClick={handleSkip}
                  className="w-full text-xs text-gray-500 hover:text-gray-300 transition-colors pt-2"
                >
                  Skip tutorial
                </button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
