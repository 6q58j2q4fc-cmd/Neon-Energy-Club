import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { MapPin, Search, DollarSign, Maximize2, Users, Minus, Plus, Target, ZoomIn, ZoomOut, AlertTriangle, CheckCircle } from "lucide-react";
import { MapView } from "@/components/Map";
import { trpc } from "@/lib/trpc";
import { TerritoryApplicationForm } from "./TerritoryApplicationForm";

export interface TerritoryData {
  center: { lat: number; lng: number };
  address: string;
  zipCode: string;
  radiusMiles: number;
  squareMiles: number;
  basePrice: number;
  demandMultiplier: number;
  totalPrice: number;
  estimatedPopulation: number;
}

interface TerritoryMapSelectorProps {
  onTerritoryChange: (territory: TerritoryData) => void;
}

export default function TerritoryMapSelector({ onTerritoryChange }: TerritoryMapSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [territoryAvailable, setTerritoryAvailable] = useState(true);
  
  // Fetch claimed territories
  const { data: claimedTerritories = [] } = trpc.territory.getClaimedTerritories.useQuery();
  const [territory, setTerritory] = useState<TerritoryData>({
    center: { lat: 40.7128, lng: -74.0060 },
    address: "New York, NY",
    zipCode: "10001",
    radiusMiles: 5,
    squareMiles: 78.54,
    basePrice: 50,
    demandMultiplier: 1.5,
    totalPrice: 5891,
    estimatedPopulation: 250000,
  });

  const circleRef = useRef<google.maps.Circle | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const claimedCirclesRef = useRef<google.maps.Circle[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  // Population density estimates by region type (people per sq mile)
  const getPopulationDensity = (demandMultiplier: number): number => {
    if (demandMultiplier >= 2.0) return 27000; // Dense urban (NYC, SF)
    if (demandMultiplier >= 1.7) return 12000; // Urban
    if (demandMultiplier >= 1.4) return 4000;  // Suburban
    if (demandMultiplier >= 1.2) return 1500;  // Semi-rural
    return 500; // Rural
  };

  // Demand multipliers by major cities/regions
  const getDemandMultiplier = (lat: number, lng: number): number => {
    const highDemandCities = [
      { lat: 40.7128, lng: -74.0060, name: "NYC", multiplier: 2.0 },
      { lat: 34.0522, lng: -118.2437, name: "LA", multiplier: 1.8 },
      { lat: 41.8781, lng: -87.6298, name: "Chicago", multiplier: 1.7 },
      { lat: 29.7604, lng: -95.3698, name: "Houston", multiplier: 1.5 },
      { lat: 33.4484, lng: -112.0740, name: "Phoenix", multiplier: 1.4 },
      { lat: 37.7749, lng: -122.4194, name: "SF", multiplier: 2.2 },
      { lat: 32.7767, lng: -96.7970, name: "Dallas", multiplier: 1.6 },
      { lat: 25.7617, lng: -80.1918, name: "Miami", multiplier: 1.9 },
      { lat: 47.6062, lng: -122.3321, name: "Seattle", multiplier: 1.7 },
      { lat: 33.7490, lng: -84.3880, name: "Atlanta", multiplier: 1.6 },
      { lat: 42.3601, lng: -71.0589, name: "Boston", multiplier: 1.8 },
      { lat: 39.7392, lng: -104.9903, name: "Denver", multiplier: 1.5 },
    ];

    let closestMultiplier = 1.0;
    let minDistance = Infinity;

    highDemandCities.forEach((city) => {
      const distance = Math.sqrt(
        Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2)
      );
      if (distance < minDistance && distance < 0.8) {
        minDistance = distance;
        closestMultiplier = city.multiplier;
      }
    });

    return closestMultiplier;
  };

  const calculatePrice = useCallback((radiusMiles: number, lat: number, lng: number) => {
    const squareMiles = Math.PI * radiusMiles * radiusMiles;
    const basePrice = 50;
    const demandMultiplier = getDemandMultiplier(lat, lng);
    const totalPrice = Math.round(squareMiles * basePrice * demandMultiplier);
    const populationDensity = getPopulationDensity(demandMultiplier);
    const estimatedPopulation = Math.round(squareMiles * populationDensity);

    return {
      squareMiles: Math.round(squareMiles * 100) / 100,
      basePrice,
      demandMultiplier,
      totalPrice,
      estimatedPopulation,
    };
  }, []);

  const updateTerritory = useCallback((
    center: { lat: number; lng: number },
    radiusMiles: number,
    address?: string,
    zipCode?: string
  ) => {
    const pricing = calculatePrice(radiusMiles, center.lat, center.lng);

    const newTerritory: TerritoryData = {
      center,
      address: address || territory.address,
      zipCode: zipCode || territory.zipCode,
      radiusMiles,
      ...pricing,
    };

    setTerritory(newTerritory);
    onTerritoryChange(newTerritory);

    // Update circle on map
    if (circleRef.current) {
      circleRef.current.setCenter(center);
      circleRef.current.setRadius(radiusMiles * 1609.34);
    }

    // Update marker
    if (markerRef.current) {
      markerRef.current.position = center;
    }

    // Pan map to center
    if (mapRef.current) {
      mapRef.current.panTo(center);
      // Adjust zoom based on radius
      const zoom = radiusMiles <= 2 ? 13 : radiusMiles <= 5 ? 11 : radiusMiles <= 10 ? 10 : 9;
      mapRef.current.setZoom(zoom);
    }
  }, [calculatePrice, onTerritoryChange, territory.address, territory.zipCode]);

  // Extract zip code from address components
  const extractZipCode = (results: google.maps.GeocoderResult[]): string => {
    for (const result of results) {
      for (const component of result.address_components) {
        if (component.types.includes("postal_code")) {
          return component.short_name;
        }
      }
    }
    return "";
  };

  // Search by zip code or address
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || !geocoderRef.current || !mapRef.current) return;

    setIsSearching(true);

    try {
      geocoderRef.current.geocode(
        { address: searchQuery },
        (results, status) => {
          setIsSearching(false);
          if (status === "OK" && results && results[0]) {
            const location = results[0].geometry.location;
            const newCenter = {
              lat: location.lat(),
              lng: location.lng(),
            };

            const zipCode = extractZipCode(results);
            const formattedAddress = results[0].formatted_address;

            updateTerritory(newCenter, territory.radiusMiles, formattedAddress, zipCode);
          } else {
            console.error("Geocode failed:", status);
          }
        }
      );
    } catch (error) {
      setIsSearching(false);
      console.error("Search error:", error);
    }
  }, [searchQuery, territory.radiusMiles, updateTerritory]);

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    geocoderRef.current = new google.maps.Geocoder();

    // Create center marker
    const markerContent = document.createElement("div");
    markerContent.innerHTML = `
      <div style="
        width: 20px;
        height: 20px;
        background: #c8ff00;
        border: 3px solid #0a0a0a;
        border-radius: 50%;
        box-shadow: 0 0 10px #c8ff00, 0 0 20px #c8ff00;
      "></div>
    `;

    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: territory.center,
      content: markerContent,
      title: "Territory Center",
    });
    markerRef.current = marker;

    // Create draggable, resizable circle
    const circle = new google.maps.Circle({
      map,
      center: territory.center,
      radius: territory.radiusMiles * 1609.34,
      strokeColor: "#c8ff00",
      strokeOpacity: 0.9,
      strokeWeight: 3,
      fillColor: "#c8ff00",
      fillOpacity: 0.15,
      editable: true,
      draggable: true,
    });

    circleRef.current = circle;

    // Create info window for claimed territories
    infoWindowRef.current = new google.maps.InfoWindow();

    // Draw claimed territories as red circles
    if (claimedTerritories && claimedTerritories.length > 0) {
      // Clear existing claimed circles
      claimedCirclesRef.current.forEach(c => c.setMap(null));
      claimedCirclesRef.current = [];

      claimedTerritories.forEach((claimed: { centerLat: string; centerLng: string; radiusMiles: number; territoryName: string; status: string }) => {
        const claimedCircle = new google.maps.Circle({
          map,
          center: { lat: parseFloat(claimed.centerLat), lng: parseFloat(claimed.centerLng) },
          radius: claimed.radiusMiles * 1609.34,
          strokeColor: "#ff3333",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#ff3333",
          fillOpacity: 0.2,
          clickable: true,
        });

        // Add hover info
        google.maps.event.addListener(claimedCircle, "click", () => {
          if (infoWindowRef.current) {
            infoWindowRef.current.setContent(`
              <div style="padding: 8px; color: #333;">
                <strong style="color: #ff3333;">Claimed Territory</strong><br/>
                <span>${claimed.territoryName}</span><br/>
                <span>Radius: ${claimed.radiusMiles} miles</span><br/>
                <span>Status: ${claimed.status}</span>
              </div>
            `);
            infoWindowRef.current.setPosition({ lat: parseFloat(claimed.centerLat), lng: parseFloat(claimed.centerLng) });
            infoWindowRef.current.open(map);
          }
        });

        claimedCirclesRef.current.push(claimedCircle);
      });
    }

    // Handle radius change (dragging edge)
    google.maps.event.addListener(circle, "radius_changed", () => {
      const radiusMeters = circle.getRadius();
      const radiusMiles = Math.max(1, Math.min(50, radiusMeters / 1609.34));
      const center = circle.getCenter();
      
      if (center) {
        const pricing = calculatePrice(radiusMiles, center.lat(), center.lng());
        setTerritory(prev => ({
          ...prev,
          radiusMiles: Math.round(radiusMiles * 10) / 10,
          ...pricing,
        }));
      }
    });

    // Handle center drag
    google.maps.event.addListener(circle, "center_changed", () => {
      const center = circle.getCenter();
      const radiusMeters = circle.getRadius();
      const radiusMiles = radiusMeters / 1609.34;
      
      if (center) {
        // Update marker position
        if (markerRef.current) {
          markerRef.current.position = { lat: center.lat(), lng: center.lng() };
        }

        // Reverse geocode to get address
        if (geocoderRef.current) {
          geocoderRef.current.geocode(
            { location: { lat: center.lat(), lng: center.lng() } },
            (results, status) => {
              if (status === "OK" && results && results[0]) {
                const zipCode = extractZipCode(results);
                const pricing = calculatePrice(radiusMiles, center.lat(), center.lng());
                
                setTerritory(prev => ({
                  ...prev,
                  center: { lat: center.lat(), lng: center.lng() },
                  address: results[0].formatted_address,
                  zipCode: zipCode || prev.zipCode,
                  ...pricing,
                }));
              }
            }
          );
        }
      }
    });

    // Setup autocomplete for address search
    if (searchInputRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(
        searchInputRef.current,
        {
          types: ["geocode"],
          componentRestrictions: { country: "us" },
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

          let zipCode = "";
          if (place.address_components) {
            for (const component of place.address_components) {
              if (component.types.includes("postal_code")) {
                zipCode = component.short_name;
                break;
              }
            }
          }

          updateTerritory(
            newCenter,
            territory.radiusMiles,
            place.formatted_address || place.name,
            zipCode
          );
        }
      });
    }
  }, [territory.center, territory.radiusMiles, calculatePrice, updateTerritory, claimedTerritories]);

  // Check for territory overlap with claimed territories
  useEffect(() => {
    if (!claimedTerritories || claimedTerritories.length === 0) {
      setTerritoryAvailable(true);
      return;
    }

    const hasOverlap = claimedTerritories.some((claimed: { centerLat: string; centerLng: string; radiusMiles: number }) => {
      const claimedCenter = { lat: parseFloat(claimed.centerLat), lng: parseFloat(claimed.centerLng) };
      
      // Calculate distance between centers using Haversine formula
      const R = 3959; // Earth's radius in miles
      const dLat = (claimedCenter.lat - territory.center.lat) * Math.PI / 180;
      const dLng = (claimedCenter.lng - territory.center.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(territory.center.lat * Math.PI / 180) * Math.cos(claimedCenter.lat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;

      // Check if circles overlap (distance < sum of radii)
      return distance < (territory.radiusMiles + claimed.radiusMiles);
    });

    setTerritoryAvailable(!hasOverlap);
  }, [territory.center, territory.radiusMiles, claimedTerritories]);

  // Adjust radius with buttons
  const adjustRadius = (delta: number) => {
    const newRadius = Math.max(1, Math.min(50, territory.radiusMiles + delta));
    updateTerritory(territory.center, newRadius, territory.address, territory.zipCode);
  };

  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    const newRadius = value[0];
    updateTerritory(territory.center, newRadius, territory.address, territory.zipCode);
  };

  // Handle key press for search
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-[#0a0a0a] to-[#1a0a2e] border-[#c8ff00]/30 overflow-hidden">
        <CardHeader className="border-b border-[#c8ff00]/20">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#c8ff00]/10">
              <Target className="w-6 h-6 text-[#c8ff00]" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">Territory Selector</span>
              <p className="text-sm text-gray-400 font-normal mt-1">Search by zip code or address, then adjust your territory radius</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#c8ff00]/60" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Enter zip code, city, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-12 h-12 bg-black/50 border-[#c8ff00]/30 text-white placeholder:text-gray-500 focus:border-[#c8ff00] focus:ring-[#c8ff00]/20 text-lg"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="h-12 px-6 bg-[#c8ff00] text-black font-bold hover:bg-[#d4ff33] transition-all"
            >
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <MapPin className="w-5 h-5 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {/* Radius Slider Control */}
          <div className="bg-black/30 rounded-xl p-5 border border-[#c8ff00]/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-5 h-5 text-[#c8ff00]" />
                <span className="font-semibold text-white">Territory Radius</span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => adjustRadius(-1)}
                  className="w-10 h-10 p-0 border-[#c8ff00]/30 text-[#c8ff00] hover:bg-[#c8ff00]/10 hover:border-[#c8ff00]"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="text-center min-w-[80px] bg-[#c8ff00]/10 rounded-lg py-2 px-4">
                  <div className="text-2xl font-black text-[#c8ff00]">
                    {territory.radiusMiles.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-400">miles</div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => adjustRadius(1)}
                  className="w-10 h-10 p-0 border-[#c8ff00]/30 text-[#c8ff00] hover:bg-[#c8ff00]/10 hover:border-[#c8ff00]"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="px-2">
              <Slider
                value={[territory.radiusMiles]}
                onValueChange={handleSliderChange}
                min={1}
                max={50}
                step={0.5}
                className="w-full [&_[role=slider]]:bg-[#c8ff00] [&_[role=slider]]:border-[#c8ff00] [&_[role=slider]]:shadow-[0_0_10px_rgba(200,255,0,0.5)] [&_.bg-primary]:bg-[#c8ff00]"
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>1 mi</span>
                <span>10 mi</span>
                <span>25 mi</span>
                <span>50 mi</span>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div className="relative rounded-xl overflow-hidden border-2 border-[#c8ff00]/30">
            <MapView
              onMapReady={handleMapReady}
              className="w-full h-[450px]"
              initialCenter={territory.center}
              initialZoom={11}
            />

            {/* Map Zoom Controls */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => mapRef.current?.setZoom((mapRef.current.getZoom() || 11) + 1)}
                className="w-10 h-10 p-0 bg-black/80 border-[#c8ff00]/30 text-[#c8ff00] hover:bg-black hover:border-[#c8ff00]"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => mapRef.current?.setZoom((mapRef.current.getZoom() || 11) - 1)}
                className="w-10 h-10 p-0 bg-black/80 border-[#c8ff00]/30 text-[#c8ff00] hover:bg-black hover:border-[#c8ff00]"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
            </div>

            {/* Current Location Badge */}
            <div className="absolute top-4 left-4 bg-black/90 backdrop-blur-sm border border-[#c8ff00]/30 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#c8ff00]" />
                <div>
                  <div className="text-sm font-semibold text-white truncate max-w-[200px]">
                    {territory.zipCode && <span className="text-[#c8ff00] mr-2">{territory.zipCode}</span>}
                    {territory.address.split(",")[0]}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Territory Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-[#c8ff00]/10 to-transparent border-[#c8ff00]/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#c8ff00]/10">
                    <Maximize2 className="w-5 h-5 text-[#c8ff00]" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Area Coverage</div>
                    <div className="text-lg font-bold text-white">
                      {territory.squareMiles.toFixed(1)} <span className="text-sm font-normal">sq mi</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#00ffff]/10 to-transparent border-[#00ffff]/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#00ffff]/10">
                    <Users className="w-5 h-5 text-[#00ffff]" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Est. Population</div>
                    <div className="text-lg font-bold text-white">
                      {territory.estimatedPopulation.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#ff0080]/10 to-transparent border-[#ff0080]/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#ff0080]/10">
                    <Target className="w-5 h-5 text-[#ff0080]" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Demand Level</div>
                    <div className="text-lg font-bold text-white">
                      {territory.demandMultiplier >= 2.0 ? "Very High" : 
                       territory.demandMultiplier >= 1.7 ? "High" : 
                       territory.demandMultiplier >= 1.4 ? "Medium" : "Standard"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#c8ff00]/20 to-[#c8ff00]/5 border-[#c8ff00]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#c8ff00]/20">
                    <DollarSign className="w-5 h-5 text-[#c8ff00]" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">License Cost</div>
                    <div className="text-xl font-black text-[#c8ff00]">
                      ${territory.totalPrice.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-black/30 rounded-xl p-4 border border-[#c8ff00]/20">
            <div className="text-sm text-gray-400 mb-3">Pricing Breakdown</div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-white">${territory.basePrice}</div>
                <div className="text-xs text-gray-500">per sq mile</div>
              </div>
              <div>
                <div className="text-lg font-bold text-[#ff0080]">×{territory.demandMultiplier}</div>
                <div className="text-xs text-gray-500">demand multiplier</div>
              </div>
              <div>
                <div className="text-lg font-bold text-[#c8ff00]">${territory.totalPrice.toLocaleString()}</div>
                <div className="text-xs text-gray-500">total cost</div>
              </div>
            </div>
          </div>

          {/* Territory Availability Status */}
          <div className={`rounded-xl p-4 border ${territoryAvailable ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <div className="flex items-center gap-3">
              {territoryAvailable ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <div>
                    <div className="font-semibold text-green-500">Territory Available!</div>
                    <div className="text-sm text-gray-400">This area is open for licensing. Apply now to secure your exclusive territory.</div>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  <div>
                    <div className="font-semibold text-red-500">Territory Overlap Detected</div>
                    <div className="text-sm text-gray-400">This area overlaps with an existing territory. Try adjusting your location or radius.</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Apply Button */}
          <Button
            onClick={() => setShowApplicationForm(true)}
            disabled={!territoryAvailable}
            className="w-full py-6 text-lg font-bold bg-gradient-to-r from-[#c8ff00] to-[#00ff00] text-black hover:from-[#00ff00] hover:to-[#c8ff00] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(200,255,0,0.3)] hover:shadow-[0_0_40px_rgba(200,255,0,0.5)] transition-all"
          >
            Apply for This Territory - ${territory.totalPrice.toLocaleString()}
          </Button>

          {/* Instructions */}
          <div className="bg-[#c8ff00]/5 border border-[#c8ff00]/20 rounded-xl p-4">
            <div className="text-sm font-semibold text-[#c8ff00] mb-3">How to Select Your Territory</div>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-300">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-[#c8ff00]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-[#c8ff00]">1</span>
                </div>
                <div><strong>Search:</strong> Enter a zip code, city, or address to center your territory</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-[#c8ff00]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-[#c8ff00]">2</span>
                </div>
                <div><strong>Adjust:</strong> Use the slider or +/- buttons to change your radius</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-[#c8ff00]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-[#c8ff00]">3</span>
                </div>
                <div><strong>Drag:</strong> Move the circle on the map to reposition your territory</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-[#c8ff00]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-[#c8ff00]">4</span>
                </div>
                <div><strong>Resize:</strong> Drag the edge of the green circle to fine-tune the area</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Territory Application Form Modal */}
      {showApplicationForm && (
        <TerritoryApplicationForm
          territoryData={{
            centerLat: territory.center.lat,
            centerLng: territory.center.lng,
            radiusMiles: territory.radiusMiles,
            territoryName: territory.address,
            estimatedPopulation: territory.estimatedPopulation,
            termMonths: 12,
            totalCost: territory.totalPrice,
          }}
          onClose={() => setShowApplicationForm(false)}
          onSuccess={() => {
            setShowApplicationForm(false);
          }}
        />
      )}
    </div>
  );
}
