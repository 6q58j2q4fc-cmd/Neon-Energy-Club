import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { language, setLanguage, availableLanguages } = useLanguage();

  const currentLang = availableLanguages.find(l => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-2 text-white/70 hover:text-white hover:bg-white/10 ${className}`}
        >
          <Globe className="w-5 h-5" strokeWidth={2.5} />
          <span className="hidden sm:inline">{currentLang?.flag} {currentLang?.code.toUpperCase()}</span>
          <span className="sm:hidden">{currentLang?.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-[#1a1a2e] border-white/20 max-h-80 overflow-y-auto"
      >
        {availableLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`
              flex items-center gap-3 cursor-pointer text-white hover:bg-white/10
              ${language === lang.code ? "bg-[#c8ff00]/20 text-[#c8ff00]" : ""}
            `}
          >
            <span className="text-lg">{lang.flag}</span>
            <div className="flex flex-col">
              <span className="font-medium">{lang.nativeName}</span>
              <span className="text-xs text-white/50">{lang.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSwitcher;
