import { useState, useEffect, useRef } from "react";
import { List, X, ChevronRight } from "lucide-react";

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface MobileTOCProps {
  items: TOCItem[];
  activeId?: string;
  onItemClick?: (id: string) => void;
}

export default function MobileTOC({ items, activeId, onItemClick }: MobileTOCProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Swipe-to-close gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setTouchDelta(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const delta = e.touches[0].clientX - touchStart;
    // Only track left swipes (negative delta)
    if (delta < 0) {
      setTouchDelta(Math.max(delta, -300));
    }
  };

  const handleTouchEnd = () => {
    if (touchDelta < -100) {
      // Threshold reached - close drawer
      setIsOpen(false);
    }
    setTouchStart(null);
    setTouchDelta(0);
  };

  const handleItemClick = (id: string) => {
    onItemClick?.(id);
    setIsOpen(false);
    
    // Smooth scroll to section
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (items.length === 0) return null;

  return (
    <>
      {/* Floating TOC button - only visible on smaller screens */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 left-4 z-40 xl:hidden w-12 h-12 rounded-full bg-[#c8ff00] text-black shadow-lg shadow-[#c8ff00]/30 flex items-center justify-center hover:bg-[#d9ff33] transition-all duration-200 group"
        title="Table of Contents"
      >
        <List className="w-5 h-5" />
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-50 xl:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 left-0 bottom-0 w-[280px] max-w-[85vw] z-50 xl:hidden bg-[#0a0318]/98 backdrop-blur-xl border-r border-[#c8ff00]/30 shadow-2xl transition-transform ease-out ${
          touchDelta === 0 ? "duration-300" : "duration-0"
        } ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          transform: isOpen ? `translateX(${touchDelta}px)` : undefined,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <List className="w-5 h-5 text-[#c8ff00]" />
            Contents
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Swipe indicator */}
        <div className="flex justify-center py-2">
          <div className="flex items-center gap-1 text-[10px] text-white/30 uppercase tracking-wider">
            <ChevronRight className="w-3 h-3 rotate-180" />
            Swipe to close
          </div>
        </div>

        {/* TOC Items */}
        <nav className="p-4 overflow-y-auto max-h-[calc(100vh-120px)]">
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    activeId === item.id
                      ? "bg-[#c8ff00]/20 text-[#c8ff00] font-bold border-l-2 border-[#c8ff00]"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                  style={{
                    paddingLeft: `${12 + (item.level - 1) * 16}px`,
                  }}
                >
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
