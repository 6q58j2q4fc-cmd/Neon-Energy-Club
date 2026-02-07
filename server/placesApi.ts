/**
 * Google Places API Integration
 * Uses Manus built-in Maps proxy for authentication
 */

import { makeRequest } from "./_core/map";
import type { GeocodeResponse, PlacesSearchResponse } from "./placesApiTypes";

export interface PlaceSearchResult {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  types: string[];
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  businessStatus?: string;
  photoReference?: string;
}

export interface EnrichedBusinessLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  score: number; // 0-100 calculated score
  footTraffic: 'high' | 'medium' | 'low';
  powerAccess: 'grid' | 'solar' | 'hybrid' | 'none';
  estimatedMonthlyRevenue: number;
  demographics: string;
  solarPanelCost?: number;
  solarROI?: number;
  types: string[];
  rating?: number;
  userRatingsTotal?: number;
}

/**
 * Search for businesses near a location using Google Places API
 */
export async function searchBusinessLocations(
  zipCode: string,
  businessTypes: string[] = ['gym', 'university', 'shopping_mall', 'airport', 'office_building']
): Promise<PlaceSearchResult[]> {
  try {
    // First, geocode the zip code to get coordinates
    const geocodeResponse = await makeRequest(
      `/geocode/json?address=${encodeURIComponent(zipCode)}&components=country:US`
    ) as GeocodeResponse;

    if (geocodeResponse.status !== 'OK' || !geocodeResponse.results?.[0]) {
      throw new Error(`Geocoding failed: ${geocodeResponse.status}`);
    }

    const location = geocodeResponse.results[0].geometry.location;
    const { lat, lng } = location;

    // Search for businesses of each type
    const allResults: PlaceSearchResult[] = [];

    for (const type of businessTypes) {
      const searchResponse = await makeRequest(
        `/place/nearbysearch/json?location=${lat},${lng}&radius=8000&type=${type}`
      ) as PlacesSearchResponse;

      if (searchResponse.status === 'OK' && searchResponse.results) {
        const places = searchResponse.results.slice(0, 5).map((place) => ({
          id: place.place_id,
          name: place.name,
          address: place.vicinity || place.formatted_address || 'Address not available',
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
          types: place.types || [],
          rating: place.rating,
          userRatingsTotal: place.user_ratings_total,
          priceLevel: place.price_level,
          businessStatus: place.business_status,
          photoReference: place.photos?.[0]?.photo_reference,
        }));

        allResults.push(...places);
      }
    }

    return allResults;
  } catch (error) {
    console.error('Places API search error:', error);
    throw error;
  }
}

/**
 * Calculate foot traffic estimate based on ratings and reviews
 */
function calculateFootTraffic(rating?: number, userRatingsTotal?: number): 'high' | 'medium' | 'low' {
  if (!rating || !userRatingsTotal) return 'low';

  // High foot traffic: 4+ rating with 500+ reviews
  if (rating >= 4.0 && userRatingsTotal >= 500) return 'high';

  // Medium foot traffic: 3.5+ rating with 100+ reviews
  if (rating >= 3.5 && userRatingsTotal >= 100) return 'medium';

  return 'low';
}

/**
 * Calculate location score (0-100) based on multiple factors
 */
function calculateLocationScore(place: PlaceSearchResult): number {
  let score = 50; // Base score

  // Rating contribution (0-25 points)
  if (place.rating) {
    score += (place.rating / 5) * 25;
  }

  // Reviews contribution (0-25 points)
  if (place.userRatingsTotal) {
    const reviewScore = Math.min(place.userRatingsTotal / 1000, 1) * 25;
    score += reviewScore;
  }

  // Business type bonus
  const highValueTypes = ['airport', 'university', 'shopping_mall', 'gym'];
  const hasHighValueType = place.types.some(t => highValueTypes.includes(t));
  if (hasHighValueType) {
    score += 10;
  }

  // Business status
  if (place.businessStatus === 'OPERATIONAL') {
    score += 5;
  }

  return Math.min(Math.round(score), 100);
}

/**
 * Estimate monthly revenue based on location characteristics
 */
function estimateMonthlyRevenue(
  footTraffic: 'high' | 'medium' | 'low',
  types: string[]
): number {
  let baseRevenue = 2000;

  // Foot traffic multiplier
  const trafficMultiplier = {
    high: 2.5,
    medium: 1.5,
    low: 1.0,
  };

  baseRevenue *= trafficMultiplier[footTraffic];

  // Location type bonus
  if (types.includes('airport')) baseRevenue *= 1.8;
  else if (types.includes('university')) baseRevenue *= 1.5;
  else if (types.includes('gym')) baseRevenue *= 1.4;
  else if (types.includes('shopping_mall')) baseRevenue *= 1.3;

  return Math.round(baseRevenue);
}

/**
 * Determine demographics based on business types
 */
function determineDemographics(types: string[]): string {
  if (types.includes('airport')) return 'Travelers, all ages';
  if (types.includes('university')) return 'Students, 18-25';
  if (types.includes('gym')) return 'Fitness enthusiasts, 18-45';
  if (types.includes('shopping_mall')) return 'General public, all ages';
  if (types.includes('office_building')) return 'Professionals, 25-45';
  if (types.includes('hospital')) return 'Medical staff, visitors, 25-65';
  if (types.includes('school')) return 'Students, parents, 18-50';
  
  return 'Mixed demographics';
}

/**
 * Enrich place data with vending machine placement analysis
 */
export function enrichPlaceData(place: PlaceSearchResult): EnrichedBusinessLocation {
  const footTraffic = calculateFootTraffic(place.rating, place.userRatingsTotal);
  const score = calculateLocationScore(place);
  const estimatedMonthlyRevenue = estimateMonthlyRevenue(footTraffic, place.types);
  const demographics = determineDemographics(place.types);

  // Determine power access (simplified logic)
  const powerAccess: EnrichedBusinessLocation['powerAccess'] = 
    place.types.includes('airport') || place.types.includes('shopping_mall') 
      ? 'grid' 
      : Math.random() > 0.5 ? 'grid' : 'solar';

  return {
    id: place.id,
    name: place.name,
    address: place.address,
    lat: place.lat,
    lng: place.lng,
    score,
    footTraffic,
    powerAccess,
    estimatedMonthlyRevenue,
    demographics,
    solarPanelCost: powerAccess === 'solar' ? 8500 : undefined,
    solarROI: powerAccess === 'solar' ? 18 : undefined,
    types: place.types,
    rating: place.rating,
    userRatingsTotal: place.userRatingsTotal,
  };
}

/**
 * Main function to get enriched business locations for vending machine placement
 */
export async function getVendingLocations(zipCode: string): Promise<EnrichedBusinessLocation[]> {
  try {
    const places = await searchBusinessLocations(zipCode);
    const enrichedPlaces = places.map(enrichPlaceData);
    
    // Sort by score descending
    return enrichedPlaces.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Error getting vending locations:', error);
    // Return empty array on error - caller can handle fallback
    return [];
  }
}
