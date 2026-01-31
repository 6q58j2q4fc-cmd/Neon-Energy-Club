import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, 
  MapPin, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Building2, 
  Percent,
  Info,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  calculateTerritoryPrice,
  STATE_LICENSING_FEES,
  MUNICIPAL_SSB_TAXES,
  MINIMUM_LICENSING_FEE,
  TERRITORY_TIERS,
  type TerritoryPricingInput,
  type TerritoryPricingOutput
} from '../../../shared/territoryPricing';

interface TerritoryPricingCalculatorProps {
  state?: string;
  city?: string;
  population?: number;
  areaSqMiles?: number;
  populationDensity?: number;
  onPriceCalculated?: (pricing: TerritoryPricingOutput) => void;
  compact?: boolean;
}

export function TerritoryPricingCalculator({
  state = 'CA',
  city,
  population = 50000,
  areaSqMiles = 25,
  populationDensity,
  onPriceCalculated,
  compact = false
}: TerritoryPricingCalculatorProps) {
  const [pricing, setPricing] = useState<TerritoryPricingOutput | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(!compact);
  const [highIncomePercent, setHighIncomePercent] = useState(0.15);
  const [youngAdultPercent, setYoungAdultPercent] = useState(0.18);
  const [hasFitnessOrientation, setHasFitnessOrientation] = useState(false);

  // Calculate density if not provided
  const calculatedDensity = populationDensity || (population / areaSqMiles);

  useEffect(() => {
    const input: TerritoryPricingInput = {
      state,
      city,
      population,
      areaSqMiles,
      populationDensity: calculatedDensity,
      highIncomePercent,
      youngAdultPercent,
      hasFitnessOrientation
    };

    const result = calculateTerritoryPrice(input);
    setPricing(result);
    onPriceCalculated?.(result);
  }, [state, city, population, areaSqMiles, calculatedDensity, highIncomePercent, youngAdultPercent, hasFitnessOrientation]);

  if (!pricing) return null;

  const stateFees = STATE_LICENSING_FEES[state];
  const cityKey = city ? `${city.toLowerCase().replace(/\s+/g, '-')}-${state.toLowerCase()}` : '';
  const ssbTax = MUNICIPAL_SSB_TAXES[cityKey];

  // Determine territory tier
  let tierName = 'Micro Territory';
  for (const [_, tier] of Object.entries(TERRITORY_TIERS)) {
    if (areaSqMiles <= tier.maxSqMiles) {
      tierName = tier.name;
      break;
    }
  }

  // Determine density category
  let densityCategory = 'Suburban';
  let densityColor = 'text-blue-400';
  if (calculatedDensity >= 4000) {
    densityCategory = 'Urban';
    densityColor = 'text-green-400';
  } else if (calculatedDensity < 1500) {
    densityCategory = 'Rural';
    densityColor = 'text-orange-400';
  }

  if (compact) {
    return (
      <div className="bg-black/40 backdrop-blur-sm border border-[#c8ff00]/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#c8ff00]" />
            <span className="text-white font-semibold">Territory Pricing</span>
          </div>
          <Badge className="bg-[#c8ff00]/20 text-[#c8ff00] border-[#c8ff00]/30">
            {tierName}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-400 text-xs">Total Price</p>
            <p className="text-2xl font-bold text-[#c8ff00]">
              ${pricing.finalPrice.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Per Sq Mile</p>
            <p className="text-2xl font-bold text-white">
              ${pricing.pricePerSqMile.toFixed(0)}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full text-gray-400 hover:text-white"
        >
          {showBreakdown ? 'Hide' : 'Show'} Breakdown
          {showBreakdown ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
        </Button>

        <AnimatePresence>
          {showBreakdown && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-2 text-sm">
                {pricing.breakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-gray-300">
                    <span>{item.category}</span>
                    <span className={item.amount < 0 ? 'text-red-400' : 'text-green-400'}>
                      {item.amount < 0 ? '-' : '+'}${Math.abs(item.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Card className="bg-black/60 backdrop-blur-md border-[#c8ff00]/30 overflow-hidden">
      <CardHeader className="border-b border-[#c8ff00]/20 bg-gradient-to-r from-[#c8ff00]/10 to-transparent">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="p-2 bg-[#c8ff00]/20 rounded-lg">
              <Calculator className="w-6 h-6 text-[#c8ff00]" />
            </div>
            Territory Pricing Calculator
          </CardTitle>
          <Badge className="bg-[#c8ff00] text-black font-bold px-3 py-1">
            FORENSIC AUDIT MODEL
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Territory Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/40 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <MapPin className="w-4 h-4" />
              Location
            </div>
            <p className="text-white font-semibold">{city || 'Selected Area'}, {state}</p>
          </div>
          <div className="bg-black/40 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Users className="w-4 h-4" />
              Population
            </div>
            <p className="text-white font-semibold">{population.toLocaleString()}</p>
          </div>
          <div className="bg-black/40 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Building2 className="w-4 h-4" />
              Area
            </div>
            <p className="text-white font-semibold">{areaSqMiles.toFixed(1)} sq mi</p>
          </div>
          <div className="bg-black/40 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
              Density
            </div>
            <p className={`font-semibold ${densityColor}`}>
              {calculatedDensity.toFixed(0)}/sq mi
            </p>
            <p className="text-xs text-gray-500">{densityCategory}</p>
          </div>
        </div>

        {/* Main Pricing Display */}
        <div className="bg-gradient-to-br from-[#c8ff00]/20 to-[#00ff88]/10 rounded-xl p-6 border border-[#c8ff00]/30">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Total Territory Price</p>
              <p className="text-4xl font-bold text-[#c8ff00]">
                ${pricing.finalPrice.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Min: ${MINIMUM_LICENSING_FEE.toLocaleString()}
              </p>
            </div>
            <div className="text-center border-x border-white/10">
              <p className="text-gray-400 text-sm mb-2">Price Per Square Mile</p>
              <p className="text-4xl font-bold text-white">
                ${pricing.pricePerSqMile.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {tierName}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Blue Sky Multiple</p>
              <p className="text-4xl font-bold text-cyan-400">
                {pricing.blueSkyMultiple}x
              </p>
              <p className="text-xs text-gray-500 mt-1">
                EBITDA Valuation
              </p>
            </div>
          </div>
        </div>

        {/* Multipliers Applied */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-black/40 rounded-lg p-3 border border-white/10 text-center">
            <p className="text-xs text-gray-400 mb-1">Density</p>
            <p className="text-lg font-bold text-[#c8ff00]">{pricing.densityMultiplier}x</p>
          </div>
          <div className="bg-black/40 rounded-lg p-3 border border-white/10 text-center">
            <p className="text-xs text-gray-400 mb-1">Demographic</p>
            <p className="text-lg font-bold text-purple-400">{pricing.demographicMultiplier.toFixed(2)}x</p>
          </div>
          <div className="bg-black/40 rounded-lg p-3 border border-white/10 text-center">
            <p className="text-xs text-gray-400 mb-1">Regional</p>
            <p className="text-lg font-bold text-orange-400">{pricing.regionalMultiplier}x</p>
          </div>
          <div className="bg-black/40 rounded-lg p-3 border border-white/10 text-center">
            <p className="text-xs text-gray-400 mb-1">Volume Discount</p>
            <p className="text-lg font-bold text-green-400">-{(pricing.volumeDiscount * 100).toFixed(0)}%</p>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#c8ff00]" />
              Price Breakdown
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="text-gray-400"
            >
              {showBreakdown ? 'Hide' : 'Show'}
              {showBreakdown ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
            </Button>
          </div>

          <AnimatePresence>
            {showBreakdown && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-black/40 rounded-lg border border-white/10 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-3 text-gray-400 text-sm">Category</th>
                        <th className="text-right p-3 text-gray-400 text-sm">Amount</th>
                        <th className="text-left p-3 text-gray-400 text-sm hidden md:table-cell">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pricing.breakdown.map((item, idx) => (
                        <tr key={idx} className="border-b border-white/5">
                          <td className="p-3 text-white">{item.category}</td>
                          <td className={`p-3 text-right font-mono ${item.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {item.amount < 0 ? '-' : '+'}${Math.abs(item.amount).toLocaleString()}
                          </td>
                          <td className="p-3 text-gray-400 text-sm hidden md:table-cell">{item.description}</td>
                        </tr>
                      ))}
                      <tr className="bg-[#c8ff00]/10">
                        <td className="p-3 text-white font-bold">TOTAL</td>
                        <td className="p-3 text-right font-mono font-bold text-[#c8ff00]">
                          ${pricing.finalPrice.toLocaleString()}
                        </td>
                        <td className="p-3 text-gray-400 text-sm hidden md:table-cell">Final territory licensing price</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Regulatory Info */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* State Licensing */}
          <div className="bg-black/40 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              State Licensing ({state})
            </h4>
            {stateFees ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Base Fee</span>
                  <span className="text-white">${stateFees.baseFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Renewal Fee ({stateFees.renewalPeriod})</span>
                  <span className="text-white">${stateFees.renewalFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Additional Fees</span>
                  <span className="text-white">${stateFees.additionalFees}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-white/10">
                  {stateFees.notes}
                </p>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Standard state fees apply</p>
            )}
          </div>

          {/* Municipal Tax */}
          <div className="bg-black/40 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              {ssbTax ? (
                <AlertCircle className="w-4 h-4 text-orange-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              )}
              Municipal SSB Tax
            </h4>
            {ssbTax ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">City</span>
                  <span className="text-orange-400">{ssbTax.city}, {ssbTax.state}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rate</span>
                  <span className="text-white">${ssbTax.ratePerOunce}/oz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Impact per 24ct Case</span>
                  <span className="text-red-400">-${ssbTax.impactPer24Case.toFixed(2)}</span>
                </div>
                <p className="text-xs text-orange-400/80 mt-2 pt-2 border-t border-white/10">
                  Sugar-sweetened beverage tax applies in this municipality
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-green-400 font-medium">No Municipal SSB Tax</p>
                <p className="text-gray-500 text-xs">This area has no additional beverage taxes</p>
              </div>
            )}
          </div>
        </div>

        {/* Fairness Rationale */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-white font-semibold mb-1">Fairness Rationale</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                {pricing.fairnessRationale}
              </p>
            </div>
          </div>
        </div>

        {/* Formula Reference */}
        <div className="text-center pt-4 border-t border-white/10">
          <p className="text-xs text-gray-500">
            Pricing calculated using forensic audit formula: V<sub>sqm</sub> = (P<sub>z</sub> × C<sub>p</sub> × S<sub>m</sub> × G<sub>margin</sub> - F<sub>lic</sub> - T<sub>vol</sub>) / A<sub>z</sub> × B<sub>multi</sub>
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Based on U.S. Energy Drink Licensing Fees and Territory Valuation Metrics 2025-2026
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default TerritoryPricingCalculator;
