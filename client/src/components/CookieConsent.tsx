import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Cookie, X, Shield, Settings } from "lucide-react";

const COOKIE_CONSENT_KEY = "neon_cookie_consent";
const COOKIE_PREFERENCES_KEY = "neon_cookie_preferences";

interface CookiePreferences {
  necessary: boolean; // Always true, required for site function
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  personalization: false,
};

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Delay showing banner slightly for better UX
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
      }
    }
  }, []);

  const saveConsent = (accepted: boolean, prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, accepted ? "accepted" : "declined");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setShowBanner(false);
    setShowPreferences(false);
    
    // Dispatch event for analytics/tracking systems to respond
    window.dispatchEvent(new CustomEvent("cookieConsentChanged", { 
      detail: { accepted, preferences: prefs } 
    }));
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true,
    };
    setPreferences(allAccepted);
    saveConsent(true, allAccepted);
  };

  const handleDeclineAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false,
    };
    setPreferences(onlyNecessary);
    saveConsent(false, onlyNecessary);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences.analytics || preferences.marketing || preferences.personalization, preferences);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "necessary") return; // Can't toggle necessary cookies
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto ${
          showPreferences ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setShowPreferences(false)}
      />
      
      {/* Main Banner */}
      <div className={`absolute bottom-0 left-0 right-0 pointer-events-auto transition-transform duration-500 ${
        showPreferences ? "translate-y-full" : "translate-y-0"
      }`}>
        <div className="bg-gradient-to-r from-[#0a1a1a] via-[#0d2818] to-[#0a1a1a] border-t border-[#c8ff00]/30 shadow-[0_-10px_40px_rgba(200,255,0,0.1)]">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              {/* Icon and Text */}
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-[#c8ff00]/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#c8ff00]/30">
                  <Cookie className="w-6 h-6 text-[#c8ff00]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#c8ff00]" />
                    We Value Your Privacy
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
                    We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                    By clicking "Accept All", you consent to our use of cookies. You can customize your preferences or 
                    decline non-essential cookies.{" "}
                    <Link href="/privacy" className="text-[#c8ff00] hover:underline">
                      Read our Privacy Policy
                    </Link>
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setShowPreferences(true)}
                  className="border-white/20 text-white hover:bg-white/10 hover:text-white order-3 sm:order-1"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Customize
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDeclineAll}
                  className="border-white/20 text-white hover:bg-white/10 hover:text-white order-2"
                >
                  Decline All
                </Button>
                <Button
                  onClick={handleAcceptAll}
                  className="bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold order-1 sm:order-3"
                >
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Panel */}
      <div className={`absolute inset-x-0 bottom-0 pointer-events-auto transition-transform duration-500 ${
        showPreferences ? "translate-y-0" : "translate-y-full"
      }`}>
        <div className="bg-gradient-to-b from-[#0d2818] to-[#0a1a1a] border-t border-[#c8ff00]/30 max-h-[80vh] overflow-y-auto">
          <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-xl flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#c8ff00]" />
                Cookie Preferences
              </h3>
              <button
                onClick={() => setShowPreferences(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cookie Categories */}
            <div className="space-y-4 mb-6">
              {/* Necessary Cookies */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#c8ff00]/20 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-[#c8ff00]" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Strictly Necessary</h4>
                      <p className="text-gray-500 text-xs">Required for basic site functionality</p>
                    </div>
                  </div>
                  <div className="bg-[#c8ff00]/20 text-[#c8ff00] text-xs font-bold px-3 py-1 rounded-full">
                    Always Active
                  </div>
                </div>
                <p className="text-gray-400 text-sm">
                  These cookies are essential for the website to function properly. They enable core functionality 
                  such as security, network management, and account access. You cannot disable these cookies.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Analytics</h4>
                      <p className="text-gray-500 text-xs">Help us improve our website</p>
                    </div>
                  </div>
                  <button
                    onClick={() => togglePreference("analytics")}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      preferences.analytics ? "bg-[#c8ff00]" : "bg-gray-600"
                    }`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      preferences.analytics ? "translate-x-8" : "translate-x-1"
                    }`} />
                  </button>
                </div>
                <p className="text-gray-400 text-sm">
                  These cookies help us understand how visitors interact with our website by collecting and 
                  reporting information anonymously. This helps us improve our site and your experience.
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Marketing</h4>
                      <p className="text-gray-500 text-xs">Personalized advertisements</p>
                    </div>
                  </div>
                  <button
                    onClick={() => togglePreference("marketing")}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      preferences.marketing ? "bg-[#c8ff00]" : "bg-gray-600"
                    }`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      preferences.marketing ? "translate-x-8" : "translate-x-1"
                    }`} />
                  </button>
                </div>
                <p className="text-gray-400 text-sm">
                  These cookies are used to track visitors across websites to display ads that are relevant 
                  and engaging for the individual user. They help measure the effectiveness of advertising campaigns.
                </p>
              </div>

              {/* Personalization Cookies */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Personalization</h4>
                      <p className="text-gray-500 text-xs">Remember your preferences</p>
                    </div>
                  </div>
                  <button
                    onClick={() => togglePreference("personalization")}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      preferences.personalization ? "bg-[#c8ff00]" : "bg-gray-600"
                    }`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      preferences.personalization ? "translate-x-8" : "translate-x-1"
                    }`} />
                  </button>
                </div>
                <p className="text-gray-400 text-sm">
                  These cookies allow the website to remember choices you make (such as your preferred language 
                  or region) and provide enhanced, more personal features.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-white/10">
              <Button
                variant="outline"
                onClick={handleDeclineAll}
                className="border-white/20 text-white hover:bg-white/10 hover:text-white"
              >
                Decline All
              </Button>
              <Button
                onClick={handleSavePreferences}
                className="bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold"
              >
                Save Preferences
              </Button>
            </div>

            {/* GDPR Notice */}
            <p className="text-gray-500 text-xs text-center mt-4">
              In accordance with GDPR, CCPA, and other privacy regulations, you have the right to control your personal data.
              For more information, please read our{" "}
              <Link href="/privacy" className="text-[#c8ff00] hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to check cookie consent status
export function useCookieConsent() {
  const [consent, setConsent] = useState<{
    accepted: boolean;
    preferences: CookiePreferences;
  } | null>(null);

  useEffect(() => {
    const consentStatus = localStorage.getItem(COOKIE_CONSENT_KEY);
    const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    
    if (consentStatus && savedPrefs) {
      setConsent({
        accepted: consentStatus === "accepted",
        preferences: JSON.parse(savedPrefs),
      });
    }

    // Listen for consent changes
    const handleConsentChange = (e: CustomEvent) => {
      setConsent(e.detail);
    };

    window.addEventListener("cookieConsentChanged", handleConsentChange as EventListener);
    return () => window.removeEventListener("cookieConsentChanged", handleConsentChange as EventListener);
  }, []);

  return consent;
}
