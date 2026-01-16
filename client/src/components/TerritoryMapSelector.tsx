import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Search, DollarSign, Maximize2 } from "lucide-react";
import { MapView } from "@/components/Map";

export interface TerritoryData {
  center: { lat: number; lng: number };
  address: string;
  radiusMiles: number;
  squareMiles: number;
  basePrice: number;
  demandMultiplier: number;
  totalPrice: number;
}

interface TerritoryMapSelectorProps {
  onTerritoryChange: (territory: TerritoryData) => void;
}

export default function TerritoryMapSelector({ onTerritoryChange }: TerritoryMapSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [territory, setTerritory] = useState<TerritoryData>({
    center: { lat: 40.7128, lng: -74.0060 }, // Default: New York City
    address: "New York, NY",
    radiusMiles: 5,
    squareMiles: 78.54,
    basePrice: 50, // $50 per sq mile base
    demandMultiplier: 1.5, // NYC is high demand
    totalPrice: 5891,
  });

  const circleRef = useRef<google.maps.Circle | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Demand multipliers by major cities/regions
  const getDemandMultiplier = (lat: number, lng: number): number => {
    // High demand areas (major cities)
    const highDemandCities = [
      { lat: 40.7128, lng: -74.0060, name: "NYC", multiplier: 2.0 },
      { lat: 34.0522, lng: -118.2437, name: "LA", multiplier: 1.8 },
      { lat: 41.8781, lng: -87.6298, name: "Chicago", multiplier: 1.7 },
      { lat: 29.7604, lng: -95.3698, name: "Houston", multiplier: 1.5 },
      { lat: 33.4484, lng: -112.0740, name: "Phoenix", multiplier: 1.4 },
      { lat: 37.7749, lng: -122.4194, name: "SF", multiplier: 2.2 },
      { lat: 32.7767, lng: -96.7970, name: "Dallas", multiplier: 1.6 },
      { lat: 25.7617, lng: -80.1918, name: "Miami", multiplier: 1.9 },
    ];

    // Find closest city
    let closestMultiplier = 1.0; // Default for rural/suburban
    let minDistance = Infinity;

    highDemandCities.forEach((city) => {
      const distance = Math.sqrt(
        Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2)
      );
      if (distance < minDistance && distance < 0.5) {
        // Within ~50 miles
        minDistance = distance;
        closestMultiplier = city.multiplier;
      }
    });

    return closestMultiplier;
  };

  const calculatePrice = (radiusMiles: number, lat: number, lng: number) => {
    const squareMiles = Math.PI * radiusMiles * radiusMiles;
    const basePrice = 50; // $50 per sq mile
    const demandMultiplier = getDemandMultiplier(lat, lng);
    const totalPrice = Math.round(squareMiles * basePrice * demandMultiplier);

    return {
      squareMiles: Math.round(squareMiles * 100) / 100,
      basePrice,
      demandMultiplier,
      totalPrice,
    };
  };

  const updateTerritory = (
    center: { lat: number; lng: number },
    radiusMiles: number,
    address?: string
  ) => {
    const pricing = calculatePrice(radiusMiles, center.lat, center.lng);

    const newTerritory: TerritoryData = {
      center,
      address: address || territory.address,
      radiusMiles,
      ...pricing,
    };

    setTerritory(newTerritory);
    onTerritoryChange(newTerritory);
  };

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;

    // Create draggable circle
    const circle = new google.maps.Circle({
      map,
      center: territory.center,
      radius: territory.radiusMiles * 1609.34, // Convert miles to meters
      strokeColor: "#c8ff00",
      strokeOpacity: 0.8,
      strokeWeight: 3,
      fillColor: "#c8ff00",
      fillOpacity: 0.2,
      editable: true,
      draggable: true,
    });

    circleRef.current = circle;

    // Handle radius change
    google.maps.event.addListener(circle, "radius_changed", () => {
      const radiusMeters = circle.getRadius();
      const radiusMiles = radiusMeters / 1609.34;
      const center = circle.getCenter();
      if (center) {
        updateTerritory(
          { lat: center.lat(), lng: center.lng() },
          radiusMiles
        );
      }
    });

    // Handle center drag
    google.maps.event.addListener(circle, "center_changed", () => {
      const center = circle.getCenter();
      const radiusMeters = circle.getRadius();
      const radiusMiles = radiusMeters / 1609.34;
      if (center) {
        // Reverse geocode to get address
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode(
          { location: { lat: center.lat(), lng: center.lng() } },
          (results, status) => {
            if (status === "OK" && results && results[0]) {
              updateTerritory(
                { lat: center.lat(), lng: center.lng() },
                radiusMiles,
                results[0].formatted_address
              );
            }
          }
        );
      }
    });

    // Setup autocomplete for address search
    if (searchInputRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(
        searchInputRef.current,
        {
          types: ["address", "intersection", "neighborhood"],
        }
      );

      autocompleteRef.current = autocomplete;

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          const newCenter = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };

          // Update map and circle
          map.setCenter(newCenter);
          circle.setCenter(newCenter);

          updateTerritory(
            newCenter,
            territory.radiusMiles,
            place.formatted_address || place.name
          );
        }
      });
    }
  };

  const adjustRadius = (delta: number) => {
    const newRadius = Math.max(1, Math.min(50, territory.radiusMiles + delta));
    if (circleRef.current) {
      circleRef.current.setRadius(newRadius * 1609.34);
    }
    updateTerritory(territory.center, newRadius);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#c8ff00]" />
            Territory Selector
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search address, neighborhood, or cross streets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black border-[#c8ff00]/30 text-white"
            />
          </div>

          {/* Map Container */}
          <div className="relative">
            <MapView
              onMapReady={handleMapReady}
              className="w-full h-[500px] rounded-lg border-2 border-[#c8ff00]/30"
              initialCenter={territory.center}
              initialZoom={11}
            />

            {/* Map Controls Overlay */}
            <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm border border-[#c8ff00]/30 rounded-lg p-4 space-y-3">
              <div className="text-xs font-bold text-[#c8ff00] mb-2">RADIUS CONTROL</div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => adjustRadius(-1)}
                  className="border-[#c8ff00]/30 text-[#c8ff00] hover:bg-[#c8ff00]/10"
                >
                  -1 mi
                </Button>
                <div className="text-center min-w-[60px]">
                  <div className="text-lg font-bold text-[#c8ff00]">
                    {territory.radiusMiles.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">miles</div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => adjustRadius(1)}
                  className="border-[#c8ff00]/30 text-[#c8ff00] hover:bg-[#c8ff00]/10"
                >
                  +1 mi
                </Button>
              </div>
              <div className="text-xs text-gray-400 text-center">
                Drag circle to resize
              </div>
            </div>
          </div>

          {/* Territory Stats */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-[#c8ff00]/10 to-transparent border-[#c8ff00]/30">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Selected Area</div>
                    <div className="font-bold text-white">{territory.address}</div>
                  </div>
                  <MapPin className="w-5 h-5 text-[#c8ff00]" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#c8ff00]/10 to-transparent border-[#c8ff00]/30">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Territory Size</div>
                    <div className="font-bold text-white">
                      {territory.squareMiles.toFixed(2)} sq mi
                    </div>
                  </div>
                  <Maximize2 className="w-5 h-5 text-[#c8ff00]" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#c8ff00]/10 to-transparent border-[#c8ff00]/30">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Base Rate</div>
                    <div className="font-bold text-white">
                      ${territory.basePrice}/sq mi × {territory.demandMultiplier}x
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {territory.demandMultiplier > 1.5 ? "High" : territory.demandMultiplier > 1.2 ? "Medium" : "Standard"} demand area
                    </div>
                  </div>
                  <DollarSign className="w-5 h-5 text-[#c8ff00]" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#c8ff00]/20 to-transparent border-[#c8ff00]">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Total License Cost</div>
                    <div className="text-3xl font-black text-[#c8ff00] neon-text">
                      ${territory.totalPrice.toLocaleString()}
                    </div>
                  </div>
                  <DollarSign className="w-6 h-6 text-[#c8ff00]" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <div className="bg-[#c8ff00]/5 border border-[#c8ff00]/20 rounded-lg p-4">
            <div className="text-sm text-gray-300 space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-[#c8ff00] mt-1.5"></div>
                <div><strong>Search:</strong> Enter any address, neighborhood, or cross streets</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-[#c8ff00] mt-1.5"></div>
                <div><strong>Resize:</strong> Drag the edge of the green circle to adjust territory size</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-[#c8ff00] mt-1.5"></div>
                <div><strong>Move:</strong> Drag the circle to reposition your territory</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-[#c8ff00] mt-1.5"></div>
                <div><strong>Pricing:</strong> Automatically adjusts based on territory size and location demand</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
