/**
 * Google Places API Type Definitions
 * Inline types for API responses - no 'any' allowed
 */

export interface GeocodeResponse {
  status: 'OK' | 'ZERO_RESULTS' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST' | 'UNKNOWN_ERROR';
  results: Array<{
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
      location_type: string;
      viewport: {
        northeast: { lat: number; lng: number };
        southwest: { lat: number; lng: number };
      };
    };
    place_id: string;
    types: string[];
  }>;
  error_message?: string;
}

export interface PlacesSearchResponse {
  status: 'OK' | 'ZERO_RESULTS' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST' | 'UNKNOWN_ERROR';
  results: Array<{
    place_id: string;
    name: string;
    vicinity?: string;
    formatted_address?: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    types: string[];
    rating?: number;
    user_ratings_total?: number;
    price_level?: number;
    business_status?: string;
    photos?: Array<{
      photo_reference: string;
      height: number;
      width: number;
    }>;
  }>;
  error_message?: string;
}
