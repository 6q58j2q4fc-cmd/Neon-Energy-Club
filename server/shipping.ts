/**
 * Shipping Service Integration Layer
 * Provides abstraction for UPS, FedEx, and USPS shipping APIs
 * 
 * NOTE: This is a placeholder implementation. To enable real shipping label generation:
 * 1. Sign up for carrier API accounts (UPS, FedEx, USPS)
 * 2. Add API credentials to environment variables
 * 3. Uncomment and configure the actual API calls
 */

export type ShippingCarrier = 'ups' | 'fedex' | 'usps';

export interface ShippingAddress {
  name: string;
  company?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface ShippingPackage {
  weight: number; // in ounces
  length: number; // in inches
  width: number;
  height: number;
}

export interface ShippingRate {
  carrier: ShippingCarrier;
  service: string;
  rate: number;
  currency: string;
  estimatedDays: number;
  deliveryDate?: string;
}

export interface ShippingLabel {
  carrier: ShippingCarrier;
  trackingNumber: string;
  labelUrl: string;
  labelFormat: 'PDF' | 'PNG' | 'ZPL';
  cost: number;
  estimatedDelivery?: string;
}

// Default NEON package dimensions (case of 24 cans)
export const DEFAULT_PACKAGE: ShippingPackage = {
  weight: 288, // ~18 lbs in ounces
  length: 16,
  width: 11,
  height: 5,
};

// Origin address (NEON warehouse)
export const ORIGIN_ADDRESS: ShippingAddress = {
  name: 'NEON Energy Fulfillment',
  company: 'NEON Energy Drink',
  street1: '123 Energy Blvd',
  city: 'Los Angeles',
  state: 'CA',
  postalCode: '90001',
  country: 'US',
  phone: '1-800-NEON-NOW',
};

/**
 * Get shipping rates from all carriers
 */
export async function getShippingRates(
  destination: ShippingAddress,
  pkg: ShippingPackage = DEFAULT_PACKAGE
): Promise<ShippingRate[]> {
  const rates: ShippingRate[] = [];
  
  // UPS Rates (placeholder - would call UPS Rating API)
  rates.push(
    {
      carrier: 'ups',
      service: 'UPS Ground',
      rate: 12.99,
      currency: 'USD',
      estimatedDays: 5,
    },
    {
      carrier: 'ups',
      service: 'UPS 3 Day Select',
      rate: 24.99,
      currency: 'USD',
      estimatedDays: 3,
    },
    {
      carrier: 'ups',
      service: 'UPS 2nd Day Air',
      rate: 34.99,
      currency: 'USD',
      estimatedDays: 2,
    },
    {
      carrier: 'ups',
      service: 'UPS Next Day Air',
      rate: 54.99,
      currency: 'USD',
      estimatedDays: 1,
    }
  );
  
  // FedEx Rates (placeholder - would call FedEx Rate API)
  rates.push(
    {
      carrier: 'fedex',
      service: 'FedEx Ground',
      rate: 11.99,
      currency: 'USD',
      estimatedDays: 5,
    },
    {
      carrier: 'fedex',
      service: 'FedEx Express Saver',
      rate: 22.99,
      currency: 'USD',
      estimatedDays: 3,
    },
    {
      carrier: 'fedex',
      service: 'FedEx 2Day',
      rate: 32.99,
      currency: 'USD',
      estimatedDays: 2,
    },
    {
      carrier: 'fedex',
      service: 'FedEx Priority Overnight',
      rate: 49.99,
      currency: 'USD',
      estimatedDays: 1,
    }
  );
  
  // USPS Rates (placeholder - would call USPS Web Tools API)
  rates.push(
    {
      carrier: 'usps',
      service: 'USPS Parcel Select Ground',
      rate: 9.99,
      currency: 'USD',
      estimatedDays: 7,
    },
    {
      carrier: 'usps',
      service: 'USPS Priority Mail',
      rate: 15.99,
      currency: 'USD',
      estimatedDays: 3,
    },
    {
      carrier: 'usps',
      service: 'USPS Priority Mail Express',
      rate: 39.99,
      currency: 'USD',
      estimatedDays: 1,
    }
  );
  
  // Sort by price
  return rates.sort((a, b) => a.rate - b.rate);
}

/**
 * Generate a shipping label
 * 
 * In production, this would:
 * 1. Call the carrier's label generation API
 * 2. Return the actual tracking number and label PDF URL
 * 3. Charge the shipping cost to the merchant account
 */
export async function generateShippingLabel(
  carrier: ShippingCarrier,
  service: string,
  destination: ShippingAddress,
  pkg: ShippingPackage = DEFAULT_PACKAGE,
  orderId: string
): Promise<ShippingLabel> {
  // Generate a mock tracking number based on carrier format
  const trackingNumber = generateMockTrackingNumber(carrier, orderId);
  
  // In production, this would be the actual label URL from the carrier
  const labelUrl = `/api/shipping/label/${carrier}/${trackingNumber}`;
  
  // Get the rate for this service
  const rates = await getShippingRates(destination, pkg);
  const selectedRate = rates.find(r => r.carrier === carrier && r.service === service);
  const cost = selectedRate?.rate || 0;
  
  // Calculate estimated delivery
  const estimatedDays = selectedRate?.estimatedDays || 5;
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + estimatedDays);
  
  console.log(`[Shipping] Generated ${carrier} label for order ${orderId}: ${trackingNumber}`);
  
  return {
    carrier,
    trackingNumber,
    labelUrl,
    labelFormat: 'PDF',
    cost,
    estimatedDelivery: deliveryDate.toISOString(),
  };
}

/**
 * Generate mock tracking numbers that match carrier formats
 */
function generateMockTrackingNumber(carrier: ShippingCarrier, orderId: string): string {
  const timestamp = Date.now().toString().slice(-8);
  const orderSuffix = orderId.replace(/\D/g, '').slice(-4).padStart(4, '0');
  
  switch (carrier) {
    case 'ups':
      // UPS format: 1Z + 6 alphanumeric + 2 digits + 8 digits
      return `1ZNEON${orderSuffix}00${timestamp}`;
    case 'fedex':
      // FedEx format: 12-15 digits
      return `7489${timestamp}${orderSuffix}`;
    case 'usps':
      // USPS format: 20-22 digits starting with 94
      return `9400111899223${timestamp}${orderSuffix}`;
    default:
      return `NEON${timestamp}${orderSuffix}`;
  }
}

/**
 * Get tracking URL for a carrier
 */
export function getTrackingUrl(carrier: ShippingCarrier, trackingNumber: string): string {
  switch (carrier) {
    case 'ups':
      return `https://www.ups.com/track?tracknum=${trackingNumber}`;
    case 'fedex':
      return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
    case 'usps':
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
    default:
      return '';
  }
}

/**
 * Validate shipping address with carrier
 * Returns normalized address if valid, throws error if invalid
 */
export async function validateAddress(
  address: ShippingAddress
): Promise<ShippingAddress> {
  // In production, this would call carrier address validation APIs
  // For now, just return the address with basic normalization
  return {
    ...address,
    state: address.state.toUpperCase(),
    postalCode: address.postalCode.replace(/\s/g, ''),
    country: address.country.toUpperCase(),
  };
}

/**
 * Cancel a shipment and void the label
 */
export async function cancelShipment(
  carrier: ShippingCarrier,
  trackingNumber: string
): Promise<boolean> {
  // In production, this would call the carrier's void/cancel API
  console.log(`[Shipping] Cancelled ${carrier} shipment: ${trackingNumber}`);
  return true;
}

// Export carrier display names
export const CARRIER_NAMES: Record<ShippingCarrier, string> = {
  ups: 'UPS',
  fedex: 'FedEx',
  usps: 'USPS',
};

// Export carrier logos (placeholder URLs)
export const CARRIER_LOGOS: Record<ShippingCarrier, string> = {
  ups: 'https://www.ups.com/assets/resources/images/UPS_logo.svg',
  fedex: 'https://www.fedex.com/content/dam/fedex-com/logos/logo.png',
  usps: 'https://www.usps.com/global-elements/header/images/utility-header/logo-sb.svg',
};
