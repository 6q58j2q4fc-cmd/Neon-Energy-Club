import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { RotateCcw, ZoomIn, ZoomOut, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Can3DProps {
  canImage?: string;
  labelImage?: string;
}

export default function Can3D({ canImage, labelImage }: Can3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [showIngredients, setShowIngredients] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  // Auto-rotate effect
  useEffect(() => {
    if (!autoRotate || isDragging) return;
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 0.5) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [autoRotate, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setAutoRotate(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - startX;
    setRotation((prev) => (prev + delta * 0.5) % 360);
    setStartX(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setAutoRotate(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const delta = e.touches[0].clientX - startX;
    setRotation((prev) => (prev + delta * 0.5) % 360);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setRotation(0);
    setZoom(1);
    setAutoRotate(true);
  };

  // Calculate which side of the can is showing based on rotation
  const normalizedRotation = ((rotation % 360) + 360) % 360;
  const showFront = normalizedRotation < 90 || normalizedRotation > 270;
  const showBack = normalizedRotation >= 90 && normalizedRotation <= 270;

  // Nutrition facts data
  const nutritionFacts = {
    servingSize: "1 can (250ml)",
    calories: 100,
    totalFat: "0g",
    saturatedFat: "0g",
    transFat: "0g",
    cholesterol: "0mg",
    sodium: "10mg",
    totalCarbs: "24g",
    dietaryFiber: "0g",
    totalSugars: "23g",
    addedSugars: "23g",
    protein: "0g",
    vitaminC: "27mg",
    calcium: "10mg",
    iron: "0.1mg",
    potassium: "70mg",
    vitaminB6: "0.5mg",
    vitaminB12: "2.0mcg",
    niacin: "23.8mg",
    riboflavin: "0.7mg",
  };

  const ingredients = [
    "Carbonated Water",
    "Sugar",
    "Citric Acid",
    "Natural Flavors",
    "Taurine",
    "Caffeine",
    "Sodium Citrate",
    "Green Tea Extract",
    "Guarana Extract",
    "Ginseng Extract",
    "B-Vitamins Complex",
    "Niacin (B3)",
    "Vitamin B6",
    "Vitamin B12",
    "Riboflavin (B2)",
  ];

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* 3D Can Container */}
      <div
        ref={containerRef}
        className="relative h-[500px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Can wrapper with 3D perspective */}
        <div
          className="relative preserve-3d"
          style={{
            transform: `perspective(1000px) rotateY(${rotation}deg) scale(${zoom})`,
            transformStyle: "preserve-3d",
            transition: isDragging ? "none" : "transform 0.1s ease-out",
          }}
        >
          {/* Front of can */}
          <motion.div
            className="absolute inset-0 w-[200px] h-[400px] rounded-[20px] overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              transform: "translateZ(50px)",
              background: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 0 30px rgba(200,255,0,0.1)",
            }}
          >
            {/* Can body with NEON branding */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {/* Top cap */}
              <div 
                className="absolute top-0 left-0 right-0 h-8 rounded-t-[20px]"
                style={{
                  background: "linear-gradient(180deg, #c8ff00 0%, #a8d900 100%)",
                  boxShadow: "inset 0 -2px 10px rgba(0,0,0,0.3)",
                }}
              />
              
              {/* Main can body */}
              <div className="flex-1 w-full flex flex-col items-center justify-center pt-12 pb-8">
                {/* NEON Logo */}
                <div className="text-center">
                  <h1 
                    className="text-6xl font-black tracking-tighter"
                    style={{
                      color: "#c8ff00",
                      textShadow: "0 0 20px rgba(200,255,0,0.5), 0 0 40px rgba(200,255,0,0.3)",
                      fontFamily: "'Arial Black', sans-serif",
                      letterSpacing: "-0.05em",
                    }}
                  >
                    NEON
                  </h1>
                  <p 
                    className="text-xs tracking-[0.3em] mt-1"
                    style={{ color: "#c8ff00" }}
                  >
                    ENERGY DRINK®
                  </p>
                </div>
                
                {/* Size info */}
                <div className="mt-auto text-center">
                  <p className="text-white/60 text-xs">8.4 fl oz (250 ml)</p>
                  <p className="text-white/40 text-[10px]">DIETARY SUPPLEMENT</p>
                </div>
              </div>
              
              {/* Bottom */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-4 rounded-b-[20px]"
                style={{
                  background: "linear-gradient(0deg, #333 0%, #1a1a1a 100%)",
                }}
              />
            </div>
            
            {/* Reflective highlight */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 30%, transparent 70%)",
              }}
            />
          </motion.div>

          {/* Back of can (Nutrition Facts) */}
          <motion.div
            className="absolute inset-0 w-[200px] h-[400px] rounded-[20px] overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              transform: "translateZ(-50px) rotateY(180deg)",
              background: "linear-gradient(135deg, #c8ff00 0%, #a8d900 100%)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            {/* Nutrition Facts Panel */}
            <div className="absolute inset-4 bg-white rounded-lg p-3 text-black text-[8px] overflow-hidden">
              <h3 className="font-black text-sm border-b-8 border-black pb-1">Supplement Facts</h3>
              <p className="text-[7px] border-b border-black py-1">
                Serving Size: {nutritionFacts.servingSize}
              </p>
              <div className="border-b-4 border-black py-1">
                <p className="font-bold">Amount Per Serving</p>
              </div>
              <div className="border-b border-black py-0.5 flex justify-between">
                <span className="font-bold">Calories</span>
                <span className="font-bold">{nutritionFacts.calories}</span>
              </div>
              <p className="text-right text-[6px] border-b border-black">% Daily Value*</p>
              <div className="space-y-0.5 text-[7px]">
                <div className="flex justify-between border-b border-gray-300">
                  <span><b>Total Fat</b> {nutritionFacts.totalFat}</span>
                  <span>0%</span>
                </div>
                <div className="flex justify-between border-b border-gray-300">
                  <span><b>Sodium</b> {nutritionFacts.sodium}</span>
                  <span>0%</span>
                </div>
                <div className="flex justify-between border-b border-gray-300">
                  <span><b>Total Carbs</b> {nutritionFacts.totalCarbs}</span>
                  <span>9%</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 pl-2">
                  <span>Total Sugars {nutritionFacts.totalSugars}</span>
                  <span>46%</span>
                </div>
                <div className="flex justify-between border-b border-gray-300">
                  <span><b>Protein</b> {nutritionFacts.protein}</span>
                  <span></span>
                </div>
                <div className="flex justify-between border-b border-gray-300">
                  <span>Vitamin C {nutritionFacts.vitaminC}</span>
                  <span>30%</span>
                </div>
                <div className="flex justify-between border-b border-gray-300">
                  <span>Niacin {nutritionFacts.niacin}</span>
                  <span>149%</span>
                </div>
                <div className="flex justify-between border-b border-gray-300">
                  <span>Vitamin B6 {nutritionFacts.vitaminB6}</span>
                  <span>29%</span>
                </div>
                <div className="flex justify-between border-b border-gray-300">
                  <span>Vitamin B12 {nutritionFacts.vitaminB12}</span>
                  <span>83%</span>
                </div>
              </div>
              <p className="text-[5px] mt-1">
                *Percent Daily Values based on a 2,000 calorie diet.
              </p>
            </div>
          </motion.div>

          {/* Side of can (left) */}
          <motion.div
            className="absolute w-[100px] h-[400px] rounded-[10px]"
            style={{
              backfaceVisibility: "hidden",
              transform: "translateX(-100px) rotateY(-90deg)",
              background: "linear-gradient(90deg, #0a0a0a 0%, #1a1a1a 100%)",
              boxShadow: "inset 0 0 20px rgba(200,255,0,0.05)",
            }}
          >
            <div className="h-full flex items-center justify-center">
              <p 
                className="text-[10px] text-white/30 transform -rotate-90 whitespace-nowrap"
              >
                #NeonEnergyDrink • Join Our Vision For A Cleaner World
              </p>
            </div>
          </motion.div>

          {/* Side of can (right) */}
          <motion.div
            className="absolute w-[100px] h-[400px] rounded-[10px]"
            style={{
              backfaceVisibility: "hidden",
              transform: "translateX(100px) rotateY(90deg)",
              background: "linear-gradient(90deg, #1a1a1a 0%, #0a0a0a 100%)",
              boxShadow: "inset 0 0 20px rgba(200,255,0,0.05)",
            }}
          >
            <div className="h-full flex items-center justify-center">
              <p 
                className="text-[10px] text-white/30 transform rotate-90 whitespace-nowrap"
              >
                NEON CORPORATION • Fort Lauderdale, FL 33301 USA
              </p>
            </div>
          </motion.div>
        </div>

        {/* Drag instruction */}
        {autoRotate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4 animate-spin" style={{ animationDuration: "3s" }} />
            Drag to rotate • Click to stop
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setZoom((prev) => Math.min(prev + 0.2, 2))}
          className="border-[#c8ff00]/30 text-[#c8ff00] hover:bg-[#c8ff00]/10"
        >
          <ZoomIn className="w-4 h-4 mr-2" />
          Zoom In
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setZoom((prev) => Math.max(prev - 0.2, 0.5))}
          className="border-[#c8ff00]/30 text-[#c8ff00] hover:bg-[#c8ff00]/10"
        >
          <ZoomOut className="w-4 h-4 mr-2" />
          Zoom Out
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={resetView}
          className="border-[#c8ff00]/30 text-[#c8ff00] hover:bg-[#c8ff00]/10"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowIngredients(!showIngredients)}
          className="border-[#c8ff00]/30 text-[#c8ff00] hover:bg-[#c8ff00]/10"
        >
          <Info className="w-4 h-4 mr-2" />
          Ingredients
        </Button>
      </div>

      {/* Ingredients Panel */}
      {showIngredients && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-6 bg-black/50 border border-[#c8ff00]/30 rounded-xl"
        >
          <h3 className="text-xl font-bold text-[#c8ff00] mb-4">Ingredients</h3>
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ingredient, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-[#c8ff00]/10 border border-[#c8ff00]/20 rounded-full text-sm text-white/80"
              >
                {ingredient}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs text-white/50">
            * These statements have not been evaluated by the Food and Drug Administration. 
            This product is not intended to diagnose, treat, cure, or prevent any disease.
          </p>
        </motion.div>
      )}
    </div>
  );
}
