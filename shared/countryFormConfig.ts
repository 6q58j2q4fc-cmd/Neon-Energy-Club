/**
 * Country-specific form field configurations
 * Handles different labeling and requirements for address fields across countries
 */

export type CountryCode = string;

export interface CountryFormConfig {
  postalCodeLabel: string;
  postalCodePlaceholder: string;
  postalCodePattern?: string;
  stateLabel: string;
  statePlaceholder: string;
  phoneCode: string;
  addressFormat: 'US' | 'UK' | 'EU' | 'ASIA';
}

/**
 * Get form configuration for a specific country
 */
export function getCountryFormConfig(countryCode: string): CountryFormConfig {
  const configs: Record<string, CountryFormConfig> = {
    // United States
    US: {
      postalCodeLabel: 'ZIP Code',
      postalCodePlaceholder: '12345',
      postalCodePattern: '^\\d{5}(-\\d{4})?$',
      stateLabel: 'State',
      statePlaceholder: 'Select state',
      phoneCode: '+1',
      addressFormat: 'US',
    },
    
    // Canada
    CA: {
      postalCodeLabel: 'Postal Code',
      postalCodePlaceholder: 'A1A 1A1',
      postalCodePattern: '^[A-Z]\\d[A-Z] \\d[A-Z]\\d$',
      stateLabel: 'Province',
      statePlaceholder: 'Select province',
      phoneCode: '+1',
      addressFormat: 'US',
    },
    
    // United Kingdom
    GB: {
      postalCodeLabel: 'Postcode',
      postalCodePlaceholder: 'SW1A 1AA',
      stateLabel: 'County',
      statePlaceholder: 'Enter county',
      phoneCode: '+44',
      addressFormat: 'UK',
    },
    
    // Australia
    AU: {
      postalCodeLabel: 'Postcode',
      postalCodePlaceholder: '2000',
      postalCodePattern: '^\\d{4}$',
      stateLabel: 'State/Territory',
      statePlaceholder: 'Select state',
      phoneCode: '+61',
      addressFormat: 'US',
    },
    
    // Germany
    DE: {
      postalCodeLabel: 'Postleitzahl',
      postalCodePlaceholder: '10115',
      postalCodePattern: '^\\d{5}$',
      stateLabel: 'Bundesland',
      statePlaceholder: 'Enter state',
      phoneCode: '+49',
      addressFormat: 'EU',
    },
    
    // France
    FR: {
      postalCodeLabel: 'Code Postal',
      postalCodePlaceholder: '75001',
      postalCodePattern: '^\\d{5}$',
      stateLabel: 'Région',
      statePlaceholder: 'Enter region',
      phoneCode: '+33',
      addressFormat: 'EU',
    },
    
    // Spain
    ES: {
      postalCodeLabel: 'Código Postal',
      postalCodePlaceholder: '28001',
      postalCodePattern: '^\\d{5}$',
      stateLabel: 'Provincia',
      statePlaceholder: 'Enter province',
      phoneCode: '+34',
      addressFormat: 'EU',
    },
    
    // Italy
    IT: {
      postalCodeLabel: 'CAP',
      postalCodePlaceholder: '00100',
      postalCodePattern: '^\\d{5}$',
      stateLabel: 'Provincia',
      statePlaceholder: 'Enter province',
      phoneCode: '+39',
      addressFormat: 'EU',
    },
    
    // Japan
    JP: {
      postalCodeLabel: '郵便番号 (Postal Code)',
      postalCodePlaceholder: '100-0001',
      postalCodePattern: '^\\d{3}-\\d{4}$',
      stateLabel: '都道府県 (Prefecture)',
      statePlaceholder: 'Select prefecture',
      phoneCode: '+81',
      addressFormat: 'ASIA',
    },
    
    // South Korea
    KR: {
      postalCodeLabel: '우편번호 (Postal Code)',
      postalCodePlaceholder: '06000',
      postalCodePattern: '^\\d{5}$',
      stateLabel: '시/도 (Province)',
      statePlaceholder: 'Enter province',
      phoneCode: '+82',
      addressFormat: 'ASIA',
    },
    
    // Singapore
    SG: {
      postalCodeLabel: 'Postal Code',
      postalCodePlaceholder: '018956',
      postalCodePattern: '^\\d{6}$',
      stateLabel: 'District',
      statePlaceholder: 'Enter district',
      phoneCode: '+65',
      addressFormat: 'ASIA',
    },
    
    // New Zealand
    NZ: {
      postalCodeLabel: 'Postcode',
      postalCodePlaceholder: '1010',
      postalCodePattern: '^\\d{4}$',
      stateLabel: 'Region',
      statePlaceholder: 'Enter region',
      phoneCode: '+64',
      addressFormat: 'US',
    },
    
    // Netherlands
    NL: {
      postalCodeLabel: 'Postcode',
      postalCodePlaceholder: '1012 AB',
      postalCodePattern: '^\\d{4} [A-Z]{2}$',
      stateLabel: 'Provincie',
      statePlaceholder: 'Enter province',
      phoneCode: '+31',
      addressFormat: 'EU',
    },
    
    // Belgium
    BE: {
      postalCodeLabel: 'Code Postal',
      postalCodePlaceholder: '1000',
      postalCodePattern: '^\\d{4}$',
      stateLabel: 'Province',
      statePlaceholder: 'Enter province',
      phoneCode: '+32',
      addressFormat: 'EU',
    },
    
    // Switzerland
    CH: {
      postalCodeLabel: 'PLZ / NPA',
      postalCodePlaceholder: '8000',
      postalCodePattern: '^\\d{4}$',
      stateLabel: 'Kanton / Canton',
      statePlaceholder: 'Enter canton',
      phoneCode: '+41',
      addressFormat: 'EU',
    },
    
    // Austria
    AT: {
      postalCodeLabel: 'Postleitzahl',
      postalCodePlaceholder: '1010',
      postalCodePattern: '^\\d{4}$',
      stateLabel: 'Bundesland',
      statePlaceholder: 'Enter state',
      phoneCode: '+43',
      addressFormat: 'EU',
    },
    
    // Sweden
    SE: {
      postalCodeLabel: 'Postnummer',
      postalCodePlaceholder: '100 00',
      postalCodePattern: '^\\d{3} \\d{2}$',
      stateLabel: 'Län',
      statePlaceholder: 'Enter county',
      phoneCode: '+46',
      addressFormat: 'EU',
    },
    
    // Norway
    NO: {
      postalCodeLabel: 'Postnummer',
      postalCodePlaceholder: '0001',
      postalCodePattern: '^\\d{4}$',
      stateLabel: 'Fylke',
      statePlaceholder: 'Enter county',
      phoneCode: '+47',
      addressFormat: 'EU',
    },
    
    // Denmark
    DK: {
      postalCodeLabel: 'Postnummer',
      postalCodePlaceholder: '1000',
      postalCodePattern: '^\\d{4}$',
      stateLabel: 'Region',
      statePlaceholder: 'Enter region',
      phoneCode: '+45',
      addressFormat: 'EU',
    },
    
    // Finland
    FI: {
      postalCodeLabel: 'Postinumero',
      postalCodePlaceholder: '00100',
      postalCodePattern: '^\\d{5}$',
      stateLabel: 'Maakunta',
      statePlaceholder: 'Enter region',
      phoneCode: '+358',
      addressFormat: 'EU',
    },
    
    // Poland
    PL: {
      postalCodeLabel: 'Kod Pocztowy',
      postalCodePlaceholder: '00-001',
      postalCodePattern: '^\\d{2}-\\d{3}$',
      stateLabel: 'Województwo',
      statePlaceholder: 'Enter voivodeship',
      phoneCode: '+48',
      addressFormat: 'EU',
    },
  };
  
  // Return config for country or default to US format
  return configs[countryCode] || {
    postalCodeLabel: 'Postal Code',
    postalCodePlaceholder: 'Enter postal code',
    stateLabel: 'State/Province/Region',
    statePlaceholder: 'Enter state/province',
    phoneCode: '+1',
    addressFormat: 'US',
  };
}

/**
 * Get list of phone country codes for dropdown
 */
export const PHONE_COUNTRY_CODES = [
  { code: '+1', country: 'US/CA', flag: '🇺🇸' },
  { code: '+44', country: 'GB', flag: '🇬🇧' },
  { code: '+61', country: 'AU', flag: '🇦🇺' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+34', country: 'ES', flag: '🇪🇸' },
  { code: '+39', country: 'IT', flag: '🇮🇹' },
  { code: '+81', country: 'JP', flag: '🇯🇵' },
  { code: '+82', country: 'KR', flag: '🇰🇷' },
  { code: '+65', country: 'SG', flag: '🇸🇬' },
  { code: '+64', country: 'NZ', flag: '🇳🇿' },
  { code: '+31', country: 'NL', flag: '🇳🇱' },
  { code: '+32', country: 'BE', flag: '🇧🇪' },
  { code: '+41', country: 'CH', flag: '🇨🇭' },
  { code: '+43', country: 'AT', flag: '🇦🇹' },
  { code: '+46', country: 'SE', flag: '🇸🇪' },
  { code: '+47', country: 'NO', flag: '🇳🇴' },
  { code: '+45', country: 'DK', flag: '🇩🇰' },
  { code: '+358', country: 'FI', flag: '🇫🇮' },
  { code: '+48', country: 'PL', flag: '🇵🇱' },
];
