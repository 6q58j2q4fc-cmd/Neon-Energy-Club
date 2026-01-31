/**
 * Territory Pricing Configuration
 * Based on Forensic Audit of U.S. Energy Drink Licensing Fees and Territory Valuation Metrics 2025-2026
 * 
 * Formula: V_sqm = (P_z * C_p * S_m * G_margin - F_lic - T_vol) / A_z * B_multi
 * Where:
 * - P_z = Population of the Zip Code/Region
 * - C_p = Per-Capita Consumption Coefficient (5.5% for young adults)
 * - S_m = Brand Market Share (NEON targeting 5% initial)
 * - G_margin = Gross Profit per Case (56% like Monster)
 * - F_lic = Total Fixed Licensing/Permit Fees
 * - T_vol = Total Volumetric Excise Tax
 * - A_z = Land area in square miles
 * - B_multi = Blue Sky Multiple (8x-16x EBITDA)
 */

// State Licensing Fees (Annual/Biennial)
export const STATE_LICENSING_FEES: Record<string, {
  name: string;
  baseFee: number;
  renewalFee: number;
  renewalPeriod: 'annual' | 'biennial';
  additionalFees: number;
  notes: string;
}> = {
  SC: {
    name: 'South Carolina',
    baseFee: 300,
    renewalFee: 2200,
    renewalPeriod: 'biennial',
    additionalFees: 500, // SLED posting, newspaper ads
    notes: 'County-based renewal schedule (even/odd years)'
  },
  MA: {
    name: 'Massachusetts',
    baseFee: 75,
    renewalFee: 300,
    renewalPeriod: 'annual',
    additionalFees: 200, // Certificate of Compliance
    notes: 'Out-of-state fee $300, volume-based compliance fees'
  },
  CA: {
    name: 'California',
    baseFee: 1200,
    renewalFee: 1200,
    renewalPeriod: 'annual',
    additionalFees: 76, // Appeals Board + Business Practices surcharges
    notes: 'CPI-adjusted: +2.72% in 2026, +3.31% in 2027'
  },
  FL: {
    name: 'Florida',
    baseFee: 400,
    renewalFee: 1250,
    renewalPeriod: 'annual',
    additionalFees: 150, // Fingerprinting, zoning
    notes: 'Per establishment/branch fee'
  },
  TX: {
    name: 'Texas',
    baseFee: 500,
    renewalFee: 500,
    renewalPeriod: 'biennial',
    additionalFees: 100,
    notes: 'Low fixed cost, high logistics cost due to sprawl'
  },
  CO: {
    name: 'Colorado',
    baseFee: 350,
    renewalFee: 350,
    renewalPeriod: 'annual',
    additionalFees: 75,
    notes: 'Boulder has highest municipal SSB tax'
  },
  WA: {
    name: 'Washington',
    baseFee: 400,
    renewalFee: 400,
    renewalPeriod: 'annual',
    additionalFees: 100,
    notes: 'Seattle SSB tax applies'
  },
  PA: {
    name: 'Pennsylvania',
    baseFee: 600,
    renewalFee: 600,
    renewalPeriod: 'annual',
    additionalFees: 150,
    notes: 'Philadelphia SSB tax applies'
  },
  AR: {
    name: 'Arkansas',
    baseFee: 250,
    renewalFee: 250,
    renewalPeriod: 'annual',
    additionalFees: 50,
    notes: 'Soft drink tax phased out by 2025 (HB1636/HB1316)'
  },
  NY: {
    name: 'New York',
    baseFee: 800,
    renewalFee: 800,
    renewalPeriod: 'annual',
    additionalFees: 200,
    notes: 'High urban density premium'
  },
  GA: {
    name: 'Georgia',
    baseFee: 350,
    renewalFee: 350,
    renewalPeriod: 'annual',
    additionalFees: 75,
    notes: 'Southeast high-consumption region'
  },
  NC: {
    name: 'North Carolina',
    baseFee: 400,
    renewalFee: 400,
    renewalPeriod: 'annual',
    additionalFees: 100,
    notes: 'Southeast high-consumption region'
  },
  AZ: {
    name: 'Arizona',
    baseFee: 300,
    renewalFee: 300,
    renewalPeriod: 'annual',
    additionalFees: 75,
    notes: 'Growing market, warm climate'
  },
  NV: {
    name: 'Nevada',
    baseFee: 500,
    renewalFee: 500,
    renewalPeriod: 'annual',
    additionalFees: 150,
    notes: 'Las Vegas high-traffic premium'
  },
  IL: {
    name: 'Illinois',
    baseFee: 550,
    renewalFee: 550,
    renewalPeriod: 'annual',
    additionalFees: 125,
    notes: 'Chicago metro premium'
  },
  OH: {
    name: 'Ohio',
    baseFee: 400,
    renewalFee: 400,
    renewalPeriod: 'annual',
    additionalFees: 100,
    notes: 'Midwest baseline'
  },
  MI: {
    name: 'Michigan',
    baseFee: 400,
    renewalFee: 400,
    renewalPeriod: 'annual',
    additionalFees: 100,
    notes: 'Midwest baseline'
  },
  NJ: {
    name: 'New Jersey',
    baseFee: 700,
    renewalFee: 700,
    renewalPeriod: 'annual',
    additionalFees: 175,
    notes: 'Northeast corridor premium'
  },
  VA: {
    name: 'Virginia',
    baseFee: 450,
    renewalFee: 450,
    renewalPeriod: 'annual',
    additionalFees: 100,
    notes: 'DC metro area premium'
  },
  TN: {
    name: 'Tennessee',
    baseFee: 350,
    renewalFee: 350,
    renewalPeriod: 'annual',
    additionalFees: 75,
    notes: 'Southeast high-consumption region'
  }
};

// Municipal Excise Taxes (Sugar-Sweetened Beverage Taxes)
export const MUNICIPAL_SSB_TAXES: Record<string, {
  city: string;
  state: string;
  ratePerOunce: number;
  impactPer16oz: number;
  impactPer24Case: number;
}> = {
  'boulder-co': {
    city: 'Boulder',
    state: 'CO',
    ratePerOunce: 0.02,
    impactPer16oz: 0.32,
    impactPer24Case: 7.68
  },
  'seattle-wa': {
    city: 'Seattle',
    state: 'WA',
    ratePerOunce: 0.0175,
    impactPer16oz: 0.28,
    impactPer24Case: 6.72
  },
  'philadelphia-pa': {
    city: 'Philadelphia',
    state: 'PA',
    ratePerOunce: 0.015,
    impactPer16oz: 0.24,
    impactPer24Case: 5.76
  },
  'san-francisco-ca': {
    city: 'San Francisco',
    state: 'CA',
    ratePerOunce: 0.01,
    impactPer16oz: 0.16,
    impactPer24Case: 3.84
  },
  'oakland-ca': {
    city: 'Oakland',
    state: 'CA',
    ratePerOunce: 0.01,
    impactPer16oz: 0.16,
    impactPer24Case: 3.84
  },
  'albany-ca': {
    city: 'Albany',
    state: 'CA',
    ratePerOunce: 0.01,
    impactPer16oz: 0.16,
    impactPer24Case: 3.84
  },
  'berkeley-ca': {
    city: 'Berkeley',
    state: 'CA',
    ratePerOunce: 0.01,
    impactPer16oz: 0.16,
    impactPer24Case: 3.84
  }
};

// Population Density Multipliers
export const DENSITY_MULTIPLIERS = {
  urban: {
    minDensity: 4000, // people per sq mi
    maxDensity: 6000,
    multiplier: 1.5,
    logisticsCostPerCaseMile: 0.15,
    description: 'High-velocity urban zone'
  },
  suburban: {
    minDensity: 1500,
    maxDensity: 3999,
    multiplier: 1.0,
    logisticsCostPerCaseMile: 0.35,
    description: 'Standard suburban territory'
  },
  rural: {
    minDensity: 0,
    maxDensity: 1499,
    multiplier: 0.6,
    logisticsCostPerCaseMile: 0.80,
    description: 'Rural logistics discount applied'
  }
};

// Demographic Value Drivers
export const DEMOGRAPHIC_MULTIPLIERS = {
  highIncome: {
    threshold: 0.20, // 20% of households >$100k
    multiplier: 1.25,
    description: 'Affluent region premium (wellness brands)'
  },
  youngAdult: {
    ageRange: '18-34',
    consumptionCoefficient: 0.055, // 5.5% per-capita consumption
    multiplier: 1.15,
    description: 'Young adult demographic premium'
  },
  fitnessOriented: {
    multiplier: 1.20,
    description: 'Health-conscious area (gym density)'
  }
};

// Blue Sky Multiples (EBITDA-based)
export const BLUE_SKY_MULTIPLES = {
  standard: {
    min: 8,
    max: 12,
    default: 10,
    description: 'Standard beverage wholesaler valuation'
  },
  premium: {
    min: 12,
    max: 16,
    default: 14,
    description: 'Premium/growth brand valuation'
  },
  cokeAligned: {
    multiplier: 1.15,
    description: 'Coca-Cola network synergy bonus'
  }
};

// Brand Market Share Reference
export const BRAND_MARKET_SHARE = {
  monster: 0.334, // 33.4%
  redBull: 0.44, // 44%
  celsius: 0.08, // 8% and growing
  neon: 0.05, // 5% target
  other: 0.136
};

// Gross Margin Reference
export const GROSS_MARGINS = {
  monster: 0.56, // 56%
  redBull: 0.52,
  celsius: 0.48,
  neon: 0.54, // Target margin
  industry: 0.50
};

// Regional Consumption Patterns
export const REGIONAL_MULTIPLIERS: Record<string, number> = {
  southeast: 1.20, // SC, GA, FL, NC, TN - highest consumption
  southwest: 1.10, // TX, AZ, NV
  west: 1.05, // CA, WA, CO
  northeast: 0.95, // MA, NY, PA, NJ
  midwest: 0.90 // OH, MI, IL
};

// Minimum Licensing Fee (mandatory)
export const MINIMUM_LICENSING_FEE = 2500; // $2,500 minimum per territory

// Territory Size Tiers
export const TERRITORY_TIERS = {
  micro: {
    maxSqMiles: 5,
    name: 'Micro Territory',
    discount: 0
  },
  small: {
    maxSqMiles: 25,
    name: 'Small Territory',
    discount: 0.05 // 5% volume discount
  },
  medium: {
    maxSqMiles: 100,
    name: 'Medium Territory',
    discount: 0.10 // 10% volume discount
  },
  large: {
    maxSqMiles: 500,
    name: 'Large Territory',
    discount: 0.15 // 15% volume discount
  },
  regional: {
    maxSqMiles: Infinity,
    name: 'Regional Territory',
    discount: 0.20 // 20% volume discount
  }
};

// Calculate territory pricing
export interface TerritoryPricingInput {
  state: string;
  city?: string;
  population: number;
  areaSqMiles: number;
  populationDensity: number;
  highIncomePercent: number; // % of households >$100k
  youngAdultPercent: number; // % aged 18-34
  hasFitnessOrientation?: boolean;
  isCokeAligned?: boolean;
}

export interface TerritoryPricingOutput {
  basePricePerSqMile: number;
  totalBasePrice: number;
  licensingFees: number;
  exciseTaxImpact: number;
  densityMultiplier: number;
  demographicMultiplier: number;
  regionalMultiplier: number;
  blueSkyMultiple: number;
  volumeDiscount: number;
  finalPrice: number;
  pricePerSqMile: number;
  breakdown: {
    category: string;
    amount: number;
    description: string;
  }[];
  fairnessRationale: string;
}

export function calculateTerritoryPrice(input: TerritoryPricingInput): TerritoryPricingOutput {
  const {
    state,
    city,
    population,
    areaSqMiles,
    populationDensity,
    highIncomePercent,
    youngAdultPercent,
    hasFitnessOrientation = false,
    isCokeAligned = false
  } = input;

  // Get state licensing fees
  const stateFees = STATE_LICENSING_FEES[state] || {
    baseFee: 400,
    renewalFee: 400,
    additionalFees: 100
  };
  const licensingFees = stateFees.baseFee + stateFees.renewalFee + stateFees.additionalFees;

  // Check for municipal SSB tax
  let exciseTaxImpact = 0;
  if (city) {
    const cityKey = `${city.toLowerCase().replace(/\s+/g, '-')}-${state.toLowerCase()}`;
    const ssbTax = MUNICIPAL_SSB_TAXES[cityKey];
    if (ssbTax) {
      // Estimate annual case volume based on population
      const estimatedAnnualCases = population * DEMOGRAPHIC_MULTIPLIERS.youngAdult.consumptionCoefficient * 12;
      exciseTaxImpact = estimatedAnnualCases * ssbTax.impactPer24Case;
    }
  }

  // Determine density category and multiplier
  let densityMultiplier = DENSITY_MULTIPLIERS.suburban.multiplier;
  let logisticsCost = DENSITY_MULTIPLIERS.suburban.logisticsCostPerCaseMile;
  let densityCategory = 'suburban';
  
  if (populationDensity >= DENSITY_MULTIPLIERS.urban.minDensity) {
    densityMultiplier = DENSITY_MULTIPLIERS.urban.multiplier;
    logisticsCost = DENSITY_MULTIPLIERS.urban.logisticsCostPerCaseMile;
    densityCategory = 'urban';
  } else if (populationDensity < DENSITY_MULTIPLIERS.rural.maxDensity) {
    densityMultiplier = DENSITY_MULTIPLIERS.rural.multiplier;
    logisticsCost = DENSITY_MULTIPLIERS.rural.logisticsCostPerCaseMile;
    densityCategory = 'rural';
  }

  // Calculate demographic multiplier
  let demographicMultiplier = 1.0;
  if (highIncomePercent >= DEMOGRAPHIC_MULTIPLIERS.highIncome.threshold) {
    demographicMultiplier *= DEMOGRAPHIC_MULTIPLIERS.highIncome.multiplier;
  }
  if (youngAdultPercent >= 0.15) { // 15% young adult threshold
    demographicMultiplier *= DEMOGRAPHIC_MULTIPLIERS.youngAdult.multiplier;
  }
  if (hasFitnessOrientation) {
    demographicMultiplier *= DEMOGRAPHIC_MULTIPLIERS.fitnessOriented.multiplier;
  }

  // Get regional multiplier
  let regionalMultiplier = 1.0;
  const southeastStates = ['SC', 'GA', 'FL', 'NC', 'TN', 'AL', 'MS', 'LA'];
  const southwestStates = ['TX', 'AZ', 'NV', 'NM'];
  const westStates = ['CA', 'WA', 'CO', 'OR', 'UT'];
  const northeastStates = ['MA', 'NY', 'PA', 'NJ', 'CT', 'RI', 'NH', 'VT', 'ME'];
  const midwestStates = ['OH', 'MI', 'IL', 'IN', 'WI', 'MN', 'IA', 'MO', 'KS', 'NE', 'SD', 'ND'];

  if (southeastStates.includes(state)) {
    regionalMultiplier = REGIONAL_MULTIPLIERS.southeast;
  } else if (southwestStates.includes(state)) {
    regionalMultiplier = REGIONAL_MULTIPLIERS.southwest;
  } else if (westStates.includes(state)) {
    regionalMultiplier = REGIONAL_MULTIPLIERS.west;
  } else if (northeastStates.includes(state)) {
    regionalMultiplier = REGIONAL_MULTIPLIERS.northeast;
  } else if (midwestStates.includes(state)) {
    regionalMultiplier = REGIONAL_MULTIPLIERS.midwest;
  }

  // Blue Sky multiple
  let blueSkyMultiple = BLUE_SKY_MULTIPLES.standard.default;
  if (isCokeAligned) {
    blueSkyMultiple *= BLUE_SKY_MULTIPLES.cokeAligned.multiplier;
  }

  // Calculate base price using the formula
  // V_sqm = (P_z * C_p * S_m * G_margin - F_lic - T_vol) / A_z * B_multi
  const consumptionCoeff = DEMOGRAPHIC_MULTIPLIERS.youngAdult.consumptionCoefficient;
  const marketShare = BRAND_MARKET_SHARE.neon;
  const grossMargin = GROSS_MARGINS.neon;
  const avgCasePrice = 59.99; // Average case price

  const annualRevenue = population * consumptionCoeff * marketShare * avgCasePrice * 12;
  const grossProfit = annualRevenue * grossMargin;
  const netValue = grossProfit - licensingFees - exciseTaxImpact;
  
  let basePricePerSqMile = (netValue / areaSqMiles) * (blueSkyMultiple / 10);
  basePricePerSqMile *= densityMultiplier * demographicMultiplier * regionalMultiplier;

  // Apply minimum price per square mile
  basePricePerSqMile = Math.max(basePricePerSqMile, 500); // $500 minimum per sq mile

  // Calculate total base price
  let totalBasePrice = basePricePerSqMile * areaSqMiles;

  // Determine territory tier and volume discount
  let volumeDiscount = 0;
  let tierName = 'Micro Territory';
  for (const [_, tier] of Object.entries(TERRITORY_TIERS)) {
    if (areaSqMiles <= tier.maxSqMiles) {
      volumeDiscount = tier.discount;
      tierName = tier.name;
      break;
    }
  }

  // Apply volume discount
  const discountAmount = totalBasePrice * volumeDiscount;
  
  // Calculate final price
  let finalPrice = totalBasePrice - discountAmount + licensingFees;
  
  // Apply minimum licensing fee
  finalPrice = Math.max(finalPrice, MINIMUM_LICENSING_FEE);

  const pricePerSqMile = finalPrice / areaSqMiles;

  // Build breakdown
  const breakdown = [
    {
      category: 'Base Territory Value',
      amount: totalBasePrice,
      description: `${areaSqMiles.toFixed(1)} sq mi × $${basePricePerSqMile.toFixed(2)}/sq mi`
    },
    {
      category: 'State Licensing Fees',
      amount: licensingFees,
      description: `${stateFees.name || state} base + renewal + additional fees`
    },
    {
      category: 'Density Adjustment',
      amount: totalBasePrice * (densityMultiplier - 1),
      description: `${densityCategory} zone (${densityMultiplier}x multiplier)`
    },
    {
      category: 'Demographic Premium',
      amount: totalBasePrice * (demographicMultiplier - 1),
      description: `Income/age/fitness factors (${demographicMultiplier.toFixed(2)}x)`
    },
    {
      category: 'Regional Adjustment',
      amount: totalBasePrice * (regionalMultiplier - 1),
      description: `${state} regional consumption pattern (${regionalMultiplier}x)`
    }
  ];

  if (exciseTaxImpact > 0) {
    breakdown.push({
      category: 'Municipal SSB Tax Impact',
      amount: -exciseTaxImpact,
      description: `${city} sugar-sweetened beverage tax`
    });
  }

  if (volumeDiscount > 0) {
    breakdown.push({
      category: 'Volume Discount',
      amount: -discountAmount,
      description: `${tierName} (${(volumeDiscount * 100).toFixed(0)}% discount)`
    });
  }

  // Generate fairness rationale
  const fairnessRationale = generateFairnessRationale({
    state,
    city,
    densityCategory,
    regionalMultiplier,
    demographicMultiplier,
    finalPrice,
    pricePerSqMile,
    areaSqMiles
  });

  return {
    basePricePerSqMile,
    totalBasePrice,
    licensingFees,
    exciseTaxImpact,
    densityMultiplier,
    demographicMultiplier,
    regionalMultiplier,
    blueSkyMultiple,
    volumeDiscount,
    finalPrice,
    pricePerSqMile,
    breakdown,
    fairnessRationale
  };
}

function generateFairnessRationale(params: {
  state: string;
  city?: string;
  densityCategory: string;
  regionalMultiplier: number;
  demographicMultiplier: number;
  finalPrice: number;
  pricePerSqMile: number;
  areaSqMiles: number;
}): string {
  const {
    state,
    city,
    densityCategory,
    regionalMultiplier,
    demographicMultiplier,
    finalPrice,
    pricePerSqMile,
    areaSqMiles
  } = params;

  let rationale = `This ${areaSqMiles.toFixed(1)} sq mi territory in ${state}`;
  
  if (city) {
    rationale += ` (${city})`;
  }
  
  rationale += ` is priced at $${finalPrice.toLocaleString()} ($${pricePerSqMile.toFixed(2)}/sq mi). `;

  if (densityCategory === 'urban') {
    rationale += 'The urban density premium reflects high delivery efficiency and consumer accessibility. ';
  } else if (densityCategory === 'rural') {
    rationale += 'A rural logistics discount has been applied to account for higher case-mile delivery costs. ';
  }

  if (regionalMultiplier > 1.1) {
    rationale += 'This region shows above-average energy drink consumption patterns. ';
  } else if (regionalMultiplier < 0.95) {
    rationale += 'Regional consumption patterns are below the national average. ';
  }

  if (demographicMultiplier > 1.2) {
    rationale += 'Premium demographic factors (income, age, fitness orientation) add value to this territory.';
  }

  return rationale;
}

// Sample pricing table for 10 example territories
export const SAMPLE_TERRITORY_PRICING = [
  {
    location: 'Charleston, SC',
    state: 'SC',
    zipCode: '29401',
    population: 45000,
    areaSqMiles: 15,
    density: 3000,
    region: 'Southeast'
  },
  {
    location: 'Los Angeles, CA',
    state: 'CA',
    zipCode: '90210',
    population: 85000,
    areaSqMiles: 12,
    density: 7083,
    region: 'West'
  },
  {
    location: 'Miami, FL',
    state: 'FL',
    zipCode: '33139',
    population: 65000,
    areaSqMiles: 10,
    density: 6500,
    region: 'Southeast'
  },
  {
    location: 'Austin, TX',
    state: 'TX',
    zipCode: '78701',
    population: 55000,
    areaSqMiles: 20,
    density: 2750,
    region: 'Southwest'
  },
  {
    location: 'Boulder, CO',
    state: 'CO',
    zipCode: '80302',
    population: 35000,
    areaSqMiles: 18,
    density: 1944,
    region: 'West'
  },
  {
    location: 'Seattle, WA',
    state: 'WA',
    zipCode: '98101',
    population: 70000,
    areaSqMiles: 14,
    density: 5000,
    region: 'West'
  },
  {
    location: 'Philadelphia, PA',
    state: 'PA',
    zipCode: '19103',
    population: 60000,
    areaSqMiles: 11,
    density: 5455,
    region: 'Northeast'
  },
  {
    location: 'Little Rock, AR',
    state: 'AR',
    zipCode: '72201',
    population: 40000,
    areaSqMiles: 25,
    density: 1600,
    region: 'Southeast'
  },
  {
    location: 'Boston, MA',
    state: 'MA',
    zipCode: '02108',
    population: 50000,
    areaSqMiles: 8,
    density: 6250,
    region: 'Northeast'
  },
  {
    location: 'Rural Iowa',
    state: 'IA',
    zipCode: '50001',
    population: 5000,
    areaSqMiles: 100,
    density: 50,
    region: 'Midwest'
  }
];
