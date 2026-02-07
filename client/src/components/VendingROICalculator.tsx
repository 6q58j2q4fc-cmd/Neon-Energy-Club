import { useState } from 'react';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Zap, TrendingUp, DollarSign, Wifi, Camera, Bot, CheckCircle2 } from 'lucide-react';

interface CalculatorInputs {
  locationType: 'high' | 'medium' | 'low'; // foot traffic
  dailyTraffic: number;
  pricePerCan: number;
  operatingCosts: number; // monthly
  machinePrice: number;
}

interface ROIResults {
  monthlyRevenue: number;
  monthlyProfit: number;
  yearlyProfit: number;
  paybackMonths: number;
  roi: number; // percentage
}

export function VendingROICalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    locationType: 'medium',
    dailyTraffic: 500,
    pricePerCan: 3.5,
    operatingCosts: 200,
    machinePrice: 8000,
  });

  // NEON AI Vending Machine advantages
  const neonAdvantages = {
    aiSalesBoost: 1.35, // 35% more sales from AI sales bot
    selfieCamLeads: 1.15, // 15% more from selfie cam lead generation
    wifiHotspot: 1.10, // 10% more foot traffic from WiFi
    brandPremium: 1.05, // 5% premium pricing for NEON brand
  };

  // Calculate traditional vending machine ROI
  const calculateTraditionalROI = (): ROIResults => {
    const conversionRate = {
      high: 0.08, // 8% of foot traffic buys
      medium: 0.05, // 5%
      low: 0.03, // 3%
    }[inputs.locationType];

    const dailySales = inputs.dailyTraffic * conversionRate;
    const monthlyRevenue = dailySales * inputs.pricePerCan * 30;
    const monthlyProfit = monthlyRevenue - inputs.operatingCosts;
    const yearlyProfit = monthlyProfit * 12;
    const paybackMonths = inputs.machinePrice / monthlyProfit;
    const roi = (yearlyProfit / inputs.machinePrice) * 100;

    return {
      monthlyRevenue,
      monthlyProfit,
      yearlyProfit,
      paybackMonths,
      roi,
    };
  };

  // Calculate NEON AI vending machine ROI
  const calculateNeonROI = (): ROIResults => {
    const traditional = calculateTraditionalROI();

    // Apply NEON advantages
    const boostedTraffic = inputs.dailyTraffic * neonAdvantages.wifiHotspot;
    const conversionRate = {
      high: 0.08,
      medium: 0.05,
      low: 0.03,
    }[inputs.locationType];

    // AI sales bot increases conversion
    const boostedConversion = conversionRate * neonAdvantages.aiSalesBoost;
    
    // Selfie cam generates additional leads
    const dailySales = boostedTraffic * boostedConversion * neonAdvantages.selfieCamLeads;
    
    // Brand premium allows higher pricing
    const effectivePrice = inputs.pricePerCan * neonAdvantages.brandPremium;
    
    const monthlyRevenue = dailySales * effectivePrice * 30;
    
    // NEON machines have slightly higher operating costs (AI, WiFi, camera)
    const neonOperatingCosts = inputs.operatingCosts * 1.15;
    
    const monthlyProfit = monthlyRevenue - neonOperatingCosts;
    const yearlyProfit = monthlyProfit * 12;
    
    // NEON machines cost more upfront
    const neonMachinePrice = inputs.machinePrice * 1.4;
    const paybackMonths = neonMachinePrice / monthlyProfit;
    const roi = (yearlyProfit / neonMachinePrice) * 100;

    return {
      monthlyRevenue,
      monthlyProfit,
      yearlyProfit,
      paybackMonths,
      roi,
    };
  };

  const traditionalResults = calculateTraditionalROI();
  const neonResults = calculateNeonROI();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-8">
      {/* Calculator Inputs */}
      <Card className="p-6 bg-gray-900 border-gray-800">
        <h3 className="text-2xl font-bold text-white mb-6">ROI Calculator Inputs</h3>
        
        <div className="space-y-6">
          {/* Location Type */}
          <div>
            <Label className="text-white mb-3 block">Location Foot Traffic</Label>
            <div className="grid grid-cols-3 gap-3">
              {(['low', 'medium', 'high'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setInputs({ ...inputs, locationType: type })}
                  className={`py-3 px-4 rounded-lg border-2 transition-all ${
                    inputs.locationType === type
                      ? 'border-[#c8ff00] bg-[#c8ff00]/10 text-[#c8ff00]'
                      : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Traffic */}
          <div>
            <Label className="text-white mb-3 block">
              Daily Foot Traffic: <span className="text-[#c8ff00]">{inputs.dailyTraffic}</span> people
            </Label>
            <Slider
              value={[inputs.dailyTraffic]}
              onValueChange={([value]) => setInputs({ ...inputs, dailyTraffic: value })}
              min={100}
              max={2000}
              step={50}
              className="w-full"
            />
          </div>

          {/* Price Per Can */}
          <div>
            <Label className="text-white mb-3 block">
              Price Per Can: <span className="text-[#c8ff00]">{formatCurrency(inputs.pricePerCan)}</span>
            </Label>
            <Slider
              value={[inputs.pricePerCan]}
              onValueChange={([value]) => setInputs({ ...inputs, pricePerCan: value })}
              min={2}
              max={6}
              step={0.25}
              className="w-full"
            />
          </div>

          {/* Operating Costs */}
          <div>
            <Label className="text-white mb-3 block">
              Monthly Operating Costs: <span className="text-[#c8ff00]">{formatCurrency(inputs.operatingCosts)}</span>
            </Label>
            <Slider
              value={[inputs.operatingCosts]}
              onValueChange={([value]) => setInputs({ ...inputs, operatingCosts: value })}
              min={100}
              max={500}
              step={25}
              className="w-full"
            />
          </div>

          {/* Machine Price */}
          <div>
            <Label className="text-white mb-3 block">
              Traditional Machine Price: <span className="text-[#c8ff00]">{formatCurrency(inputs.machinePrice)}</span>
            </Label>
            <Slider
              value={[inputs.machinePrice]}
              onValueChange={([value]) => setInputs({ ...inputs, machinePrice: value })}
              min={5000}
              max={15000}
              step={500}
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {/* Comparison Results */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Traditional Vending Machine */}
        <Card className="p-6 bg-gray-900 border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gray-800 rounded-lg">
              <DollarSign className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Traditional Vending</h3>
              <p className="text-sm text-gray-400">Standard vending machine</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-800">
              <span className="text-gray-400">Monthly Revenue</span>
              <span className="text-white font-semibold">{formatCurrency(traditionalResults.monthlyRevenue)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-800">
              <span className="text-gray-400">Monthly Profit</span>
              <span className="text-white font-semibold">{formatCurrency(traditionalResults.monthlyProfit)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-800">
              <span className="text-gray-400">Yearly Profit</span>
              <span className="text-white font-semibold">{formatCurrency(traditionalResults.yearlyProfit)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-800">
              <span className="text-gray-400">Payback Period</span>
              <span className="text-white font-semibold">{traditionalResults.paybackMonths.toFixed(1)} months</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-400">Annual ROI</span>
              <span className="text-white font-semibold">{formatPercent(traditionalResults.roi)}</span>
            </div>
          </div>
        </Card>

        {/* NEON AI Vending Machine */}
        <Card className="p-6 bg-gradient-to-br from-[#c8ff00]/10 to-[#00ff9d]/10 border-[#c8ff00]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#c8ff00]/20 rounded-lg">
              <Zap className="w-6 h-6 text-[#c8ff00]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">NEON AI Vending</h3>
              <p className="text-sm text-[#c8ff00]">AI-powered smart machine</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-[#c8ff00]/20">
              <span className="text-gray-300">Monthly Revenue</span>
              <span className="text-[#c8ff00] font-semibold">{formatCurrency(neonResults.monthlyRevenue)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[#c8ff00]/20">
              <span className="text-gray-300">Monthly Profit</span>
              <span className="text-[#c8ff00] font-semibold">{formatCurrency(neonResults.monthlyProfit)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[#c8ff00]/20">
              <span className="text-gray-300">Yearly Profit</span>
              <span className="text-[#c8ff00] font-semibold">{formatCurrency(neonResults.yearlyProfit)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[#c8ff00]/20">
              <span className="text-gray-300">Payback Period</span>
              <span className="text-[#c8ff00] font-semibold">{neonResults.paybackMonths.toFixed(1)} months</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-300">Annual ROI</span>
              <span className="text-[#c8ff00] font-semibold">{formatPercent(neonResults.roi)}</span>
            </div>
          </div>

          {/* NEON Advantages */}
          <div className="mt-6 pt-6 border-t border-[#c8ff00]/20">
            <h4 className="text-sm font-semibold text-white mb-3">NEON Competitive Advantages:</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Bot className="w-4 h-4 text-[#c8ff00]" />
                <span>AI Sales Bot (+35% conversion)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Camera className="w-4 h-4 text-[#c8ff00]" />
                <span>Selfie Cam Lead Gen (+15% sales)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Wifi className="w-4 h-4 text-[#c8ff00]" />
                <span>WiFi Hotspot (+10% foot traffic)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-[#c8ff00]" />
                <span>Premium Brand (+5% pricing)</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Comparison Summary */}
      <Card className="p-6 bg-gradient-to-r from-[#c8ff00]/5 to-[#00ff9d]/5 border-[#c8ff00]/30">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-[#c8ff00]" />
          <h3 className="text-xl font-bold text-white">NEON AI Advantage Summary</h3>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#c8ff00] mb-2">
              {formatCurrency(neonResults.monthlyProfit - traditionalResults.monthlyProfit)}
            </div>
            <div className="text-sm text-gray-400">More Monthly Profit</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#c8ff00] mb-2">
              {formatCurrency(neonResults.yearlyProfit - traditionalResults.yearlyProfit)}
            </div>
            <div className="text-sm text-gray-400">More Yearly Profit</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#c8ff00] mb-2">
              {((neonResults.monthlyProfit / traditionalResults.monthlyProfit - 1) * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-400">Higher Profitability</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-[#c8ff00]/10 rounded-lg border border-[#c8ff00]/30">
          <p className="text-sm text-gray-300 text-center">
            <span className="font-semibold text-white">Bottom Line:</span> NEON AI vending machines generate{' '}
            <span className="text-[#c8ff00] font-bold">
              {formatCurrency(neonResults.yearlyProfit - traditionalResults.yearlyProfit)}
            </span>{' '}
            more profit per year despite higher upfront costs, delivering superior ROI through AI-powered sales optimization.
          </p>
        </div>
      </Card>
    </div>
  );
}
