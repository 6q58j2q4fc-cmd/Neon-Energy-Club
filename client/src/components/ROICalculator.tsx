import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  MapPin, 
  Users,
  Calculator,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';

interface TerritoryData {
  name: string;
  state: string;
  area: number;
  population: number;
  density: number;
  licenseFee: number;
}

interface ROICalculatorProps {
  territory: TerritoryData;
  pricePerSqMile: number;
}

// ROI calculation constants based on industry data
const VENDING_METRICS = {
  averageCansPerMachinePerDay: 35,
  profitPerCan: 1.25, // $1.25 profit per can
  machinesPerSquareMile: {
    premiumUrban: 8,
    urban: 5,
    suburban: 2.5,
    rural: 0.8,
  },
  operatingCostPerMachinePerMonth: 150, // maintenance, restocking, etc.
  machineLeaseOrPurchase: 3500, // average cost per machine
};

export default function ROICalculator({ territory, pricePerSqMile }: ROICalculatorProps) {
  const [machineCount, setMachineCount] = useState<number[]>([10]);
  const [utilizationRate, setUtilizationRate] = useState<number[]>([75]);
  const [yearsProjection, setYearsProjection] = useState<number[]>([3]);

  // Determine density tier
  const getDensityTier = (density: number): keyof typeof VENDING_METRICS.machinesPerSquareMile => {
    if (density >= 6000) return 'premiumUrban';
    if (density >= 3000) return 'urban';
    if (density >= 1000) return 'suburban';
    return 'rural';
  };

  const densityTier = getDensityTier(territory.density);
  const recommendedMachines = Math.round(territory.area * VENDING_METRICS.machinesPerSquareMile[densityTier]);

  const calculations = useMemo(() => {
    const machines = machineCount[0];
    const utilization = utilizationRate[0] / 100;
    const years = yearsProjection[0];

    // Daily revenue per machine
    const dailyRevenuePerMachine = VENDING_METRICS.averageCansPerMachinePerDay * VENDING_METRICS.profitPerCan * utilization;
    
    // Monthly calculations
    const monthlyRevenuePerMachine = dailyRevenuePerMachine * 30;
    const monthlyOperatingCost = VENDING_METRICS.operatingCostPerMachinePerMonth * machines;
    const totalMonthlyRevenue = monthlyRevenuePerMachine * machines;
    const monthlyNetProfit = totalMonthlyRevenue - monthlyOperatingCost;

    // Annual calculations
    const annualRevenue = totalMonthlyRevenue * 12;
    const annualOperatingCosts = monthlyOperatingCost * 12;
    const annualNetProfit = monthlyNetProfit * 12;

    // Initial investment
    const territoryLicenseFee = territory.licenseFee;
    const machineInvestment = machines * VENDING_METRICS.machineLeaseOrPurchase;
    const totalInitialInvestment = territoryLicenseFee + machineInvestment;

    // Multi-year projections (assuming 5% annual growth)
    const growthRate = 0.05;
    let cumulativeProfit = 0;
    const yearlyBreakdown = [];
    
    for (let year = 1; year <= years; year++) {
      const yearProfit = annualNetProfit * Math.pow(1 + growthRate, year - 1);
      cumulativeProfit += yearProfit;
      yearlyBreakdown.push({
        year,
        revenue: annualRevenue * Math.pow(1 + growthRate, year - 1),
        profit: yearProfit,
        cumulative: cumulativeProfit,
      });
    }

    // ROI calculations
    const totalROI = ((cumulativeProfit - totalInitialInvestment) / totalInitialInvestment) * 100;
    const paybackMonths = totalInitialInvestment / monthlyNetProfit;
    const annualROI = (annualNetProfit / totalInitialInvestment) * 100;

    return {
      dailyRevenuePerMachine,
      monthlyRevenuePerMachine,
      totalMonthlyRevenue,
      monthlyOperatingCost,
      monthlyNetProfit,
      annualRevenue,
      annualOperatingCosts,
      annualNetProfit,
      territoryLicenseFee,
      machineInvestment,
      totalInitialInvestment,
      yearlyBreakdown,
      totalROI,
      paybackMonths,
      annualROI,
      cumulativeProfit,
    };
  }, [machineCount, utilizationRate, yearsProjection, territory]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          ROI PROJECTION
        </Badge>
        <h2 className="text-2xl font-bold text-white">
          Revenue & ROI Calculator
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Project your potential earnings based on territory demographics, machine placement density, and market conditions.
        </p>
      </div>

      <Card className="bg-black/40 border-emerald-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-400">
            <Calculator className="h-5 w-5" />
            Projection Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Machine Count Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-300">
                Number of Vending Machines
              </label>
              <span className="text-lg font-bold text-emerald-400">
                {machineCount[0]} machines
              </span>
            </div>
            <Slider
              value={machineCount}
              onValueChange={setMachineCount}
              min={1}
              max={Math.max(50, recommendedMachines * 2)}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Recommended for this territory: {recommendedMachines} machines ({densityTier} density)
            </p>
          </div>

          {/* Utilization Rate Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-300">
                Expected Utilization Rate
              </label>
              <span className="text-lg font-bold text-emerald-400">
                {utilizationRate[0]}%
              </span>
            </div>
            <Slider
              value={utilizationRate}
              onValueChange={setUtilizationRate}
              min={25}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Industry average: 70-85% in {densityTier} areas
            </p>
          </div>

          {/* Years Projection Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-300">
                Projection Period
              </label>
              <span className="text-lg font-bold text-emerald-400">
                {yearsProjection[0]} years
              </span>
            </div>
            <Slider
              value={yearsProjection}
              onValueChange={setYearsProjection}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-xs text-gray-400 uppercase tracking-wide">Annual ROI</p>
            <p className="text-2xl font-bold text-emerald-400">
              {calculations.annualROI.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border-cyan-500/30">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
            <p className="text-xs text-gray-400 uppercase tracking-wide">Payback Period</p>
            <p className="text-2xl font-bold text-cyan-400">
              {calculations.paybackMonths.toFixed(1)} mo
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border-yellow-500/30">
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-xs text-gray-400 uppercase tracking-wide">Monthly Profit</p>
            <p className="text-2xl font-bold text-yellow-400">
              {formatCurrency(calculations.monthlyNetProfit)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500/20 to-pink-600/10 border-pink-500/30">
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-8 w-8 text-pink-400 mx-auto mb-2" />
            <p className="text-xs text-gray-400 uppercase tracking-wide">{yearsProjection[0]}-Year Profit</p>
            <p className="text-2xl font-bold text-pink-400">
              {formatCurrency(calculations.cumulativeProfit)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Investment Breakdown */}
        <Card className="bg-black/40 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <DollarSign className="h-5 w-5 text-yellow-400" />
              Initial Investment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Territory License Fee</span>
              <span className="text-white font-medium">
                {formatCurrency(calculations.territoryLicenseFee)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">
                Machine Investment ({machineCount[0]} × ${VENDING_METRICS.machineLeaseOrPurchase.toLocaleString()})
              </span>
              <span className="text-white font-medium">
                {formatCurrency(calculations.machineInvestment)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 bg-emerald-500/10 px-3 rounded-lg">
              <span className="text-emerald-400 font-semibold">Total Investment</span>
              <span className="text-emerald-400 font-bold text-lg">
                {formatCurrency(calculations.totalInitialInvestment)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue Breakdown */}
        <Card className="bg-black/40 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <Zap className="h-5 w-5 text-cyan-400" />
              Monthly Projections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Gross Revenue</span>
              <span className="text-green-400 font-medium">
                +{formatCurrency(calculations.totalMonthlyRevenue)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Operating Costs</span>
              <span className="text-red-400 font-medium">
                -{formatCurrency(calculations.monthlyOperatingCost)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 bg-emerald-500/10 px-3 rounded-lg">
              <span className="text-emerald-400 font-semibold">Net Profit</span>
              <span className="text-emerald-400 font-bold text-lg">
                {formatCurrency(calculations.monthlyNetProfit)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Based on {VENDING_METRICS.averageCansPerMachinePerDay} cans/machine/day at ${VENDING_METRICS.profitPerCan} profit per can
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Year-by-Year Projection Table */}
      <Card className="bg-black/40 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white text-lg">
            <BarChart3 className="h-5 w-5 text-pink-400" />
            {yearsProjection[0]}-Year Projection (5% Annual Growth)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Year</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Annual Revenue</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Annual Profit</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Cumulative Profit</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">ROI to Date</th>
                </tr>
              </thead>
              <tbody>
                {calculations.yearlyBreakdown.map((year) => {
                  const roiToDate = ((year.cumulative - calculations.totalInitialInvestment) / calculations.totalInitialInvestment) * 100;
                  const isProfitable = year.cumulative >= calculations.totalInitialInvestment;
                  
                  return (
                    <tr 
                      key={year.year} 
                      className={`border-b border-gray-800 ${isProfitable ? 'bg-emerald-500/5' : ''}`}
                    >
                      <td className="py-3 px-4 text-white font-medium">Year {year.year}</td>
                      <td className="py-3 px-4 text-right text-gray-300">
                        {formatCurrency(year.revenue)}
                      </td>
                      <td className="py-3 px-4 text-right text-green-400">
                        {formatCurrency(year.profit)}
                      </td>
                      <td className="py-3 px-4 text-right text-cyan-400 font-medium">
                        {formatCurrency(year.cumulative)}
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${roiToDate >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {roiToDate >= 0 ? '+' : ''}{roiToDate.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <p className="text-xs text-yellow-400/80">
          <strong>Disclaimer:</strong> These projections are estimates based on industry averages and market research. 
          Actual results may vary based on location, competition, marketing efforts, and economic conditions. 
          Past performance does not guarantee future results. Consult with a financial advisor before making investment decisions.
        </p>
      </div>
    </div>
  );
}
