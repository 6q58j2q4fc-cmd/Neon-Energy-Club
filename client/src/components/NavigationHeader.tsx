import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

interface NavigationHeaderProps {
  title?: string;
  showBack?: boolean;
  showHome?: boolean;
  className?: string;
}

export default function NavigationHeader({
  title,
  showBack = true,
  showHome = true,
  className = "",
}: NavigationHeaderProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      setLocation("/");
    }
  };

  return (
    <div className={`flex items-center justify-between mb-6 ${className}`}>
      <div className="flex-1">
        {title && <h1 className="text-3xl font-bold text-white">{title}</h1>}
      </div>
      <div className="flex gap-3">
        {showBack && (
          <Button
            onClick={handleBack}
            variant="outline"
            className="border-[#c8ff00]/30 text-[#c8ff00] hover:bg-[#c8ff00]/10 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        )}
        {showHome && (
          <Button
            onClick={() => setLocation("/")}
            className="bg-[#c8ff00] hover:bg-[#d4ff33] text-black font-bold gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
        )}
      </div>
    </div>
  );
}
