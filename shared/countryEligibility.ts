/**
 * Country Eligibility Configuration
 * Defines which countries can actually sign up vs view-only
 */

export const ELIGIBLE_COUNTRIES = [
  // United States
  'US',
  
  // Canada
  'CA',
  
  // European Union Countries
  'AT', // Austria
  'BE', // Belgium
  'BG', // Bulgaria
  'HR', // Croatia
  'CY', // Cyprus
  'CZ', // Czech Republic
  'DK', // Denmark
  'EE', // Estonia
  'FI', // Finland
  'FR', // France
  'DE', // Germany
  'GR', // Greece
  'HU', // Hungary
  'IE', // Ireland
  'IT', // Italy
  'LV', // Latvia
  'LT', // Lithuania
  'LU', // Luxembourg
  'MT', // Malta
  'NL', // Netherlands
  'PL', // Poland
  'PT', // Portugal
  'RO', // Romania
  'SK', // Slovakia
  'SI', // Slovenia
  'ES', // Spain
  'SE', // Sweden
] as const;

export type EligibleCountryCode = typeof ELIGIBLE_COUNTRIES[number];

/**
 * Check if a country code is eligible for signup
 */
export function isCountryEligible(countryCode: string): boolean {
  return ELIGIBLE_COUNTRIES.includes(countryCode as EligibleCountryCode);
}

/**
 * Get user-friendly message for non-eligible countries
 */
export function getIneligibilityMessage(countryCode: string): string {
  return `We're currently only accepting sign-ups from the United States, Canada, and European Union countries. We're working hard to expand to ${getCountryName(countryCode)} soon! Sign up for our waitlist to be notified when we launch in your area.`;
}

/**
 * Get country name from code (simplified version)
 */
function getCountryName(code: string): string {
  const names: Record<string, string> = {
    'JP': 'Japan',
    'AU': 'Australia',
    'NZ': 'New Zealand',
    'GB': 'United Kingdom', // Note: UK left EU but might want to add separately
    'MX': 'Mexico',
    'BR': 'Brazil',
    'AR': 'Argentina',
    'CL': 'Chile',
    'CN': 'China',
    'KR': 'South Korea',
    'IN': 'India',
    'SG': 'Singapore',
    'TH': 'Thailand',
    'MY': 'Malaysia',
    'PH': 'Philippines',
    'ID': 'Indonesia',
    'VN': 'Vietnam',
    'ZA': 'South Africa',
    'EG': 'Egypt',
    'AE': 'United Arab Emirates',
    'SA': 'Saudi Arabia',
  };
  
  return names[code] || 'your country';
}

/**
 * Validation error messages
 */
export const COUNTRY_VALIDATION_MESSAGES = {
  NOT_ELIGIBLE: 'This country is not currently eligible for sign-up',
  WAITLIST_AVAILABLE: 'Join our waitlist to be notified when we launch in your area',
  CONTACT_SUPPORT: 'For business inquiries in your region, please contact support@neonenergy.com',
} as const;
