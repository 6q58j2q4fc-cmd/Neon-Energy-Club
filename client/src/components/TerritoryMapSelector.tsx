import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { MapPin, Search, DollarSign, Users, Minus, Plus, Target, AlertTriangle, CheckCircle, Pencil, Circle, Trash2, Info, Loader2, Building2, Calendar, Clock } from "lucide-react";
import { MapView } from "@/components/Map";
import { trpc } from "@/lib/trpc";
import { TerritoryApplicationForm } from "./TerritoryApplicationForm";
import { toast } from "sonner";

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
  crossStreets?: string[];
  polygonCoords?: Array<{ lat: number; lng: number }>;
  isCustomShape?: boolean;
}

interface TerritoryMapSelectorProps {
  onTerritoryChange: (territory: TerritoryData) => void;
}

type DrawingMode = "circle" | "polygon" | "none";

// Claimed territory type
interface ClaimedTerritory {
  id: number;
  centerLat: string;
  centerLng: string;
  radiusMiles: number;
  territoryName: string;
  status: string;
  renewalDate?: Date | string | null;
  expirationDate?: Date | string | null;
}

export default function TerritoryMapSelector({ onTerritoryChange }: TerritoryMapSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [territoryAvailable, setTerritoryAvailable] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [drawingMode, setDrawingMode] = useState<DrawingMode>("circle");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Fetch claimed territories
  const { data: claimedTerritories = [], isLoading: loadingTerritories } = trpc.territory.getClaimedTerritories.useQuery(undefined, {
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false,
  });
  
  // LLM mutation for territory analysis
  const analyzeTerritoryMutation = trpc.territory.analyzeTerritory.useMutation();
  
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
    crossStreets: [],
    isCustomShape: false,
  });

  // Refs
  const circleRef = useRef<google.maps.Circle | null>(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const claimedCirclesRef = useRef<google.maps.Circle[]>([]);
  const availableOverlayRef = useRef<google.maps.Rectangle | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const initializationRef = useRef(false);

  // Population density estimates
  const getPopulationDensity = (demandMultiplier: number): number => {
    if (demandMultiplier >= 2.0) return 27000;
    if (demandMultiplier >= 1.7) return 12000;
    if (demandMultiplier >= 1.4) return 4000;
    if (demandMultiplier >= 1.2) return 1500;
    return 500;
  };

  // Demand multipliers by major cities
  const getDemandMultiplier = useCallback((lat: number, lng: number): number => {
    const highDemandCities = [
      { lat: 40.7128, lng: -74.0060, multiplier: 2.0 },
      { lat: 34.0522, lng: -118.2437, multiplier: 1.8 },
      { lat: 41.8781, lng: -87.6298, multiplier: 1.7 },
      { lat: 29.7604, lng: -95.3698, multiplier: 1.5 },
      { lat: 33.4484, lng: -112.0740, multiplier: 1.4 },
      { lat: 37.7749, lng: -122.4194, multiplier: 2.2 },
      { lat: 32.7767, lng: -96.7970, multiplier: 1.6 },
      { lat: 25.7617, lng: -80.1918, multiplier: 1.9 },
      { lat: 47.6062, lng: -122.3321, multiplier: 1.7 },
      { lat: 33.7490, lng: -84.3880, multiplier: 1.6 },
      { lat: 42.3601, lng: -71.0589, multiplier: 1.8 },
      { lat: 39.7392, lng: -104.9903, multiplier: 1.5 },
    ];

    let nearestCity = highDemandCities[0];
    let minDistance = Infinity;

    for (const city of highDemandCities) {
      const distance = Math.sqrt(Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2));
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = city;
      }
    }

    if (minDistance < 0.7) return nearestCity.multiplier;
    if (minDistance < 2) {
      const factor = 1 - (minDistance - 0.7) / 1.3;
      return 1 + (nearestCity.multiplier - 1) * factor;
    }
    return 1.0;
  }, []);

  // Calculate price
  const calculatePrice = useCallback((radiusMiles: number, lat: number, lng: number, customSquareMiles?: number) => {
    const squareMiles = customSquareMiles || Math.PI * radiusMiles * radiusMiles;
    const basePrice = 50;
    const demandMultiplier = getDemandMultiplier(lat, lng);
    const totalPrice = Math.round(squareMiles * basePrice * demandMultiplier);
    const populationDensity = getPopulationDensity(demandMultiplier);
    const estimatedPopulation = Math.round(squareMiles * populationDensity);

    return { squareMiles: Math.round(squareMiles * 100) / 100, basePrice, demandMultiplier, totalPrice, estimatedPopulation };
  }, [getDemandMultiplier]);

  // Calculate polygon area
  const calculatePolygonArea = useCallback((coords: Array<{ lat: number; lng: number }>): number => {
    if (coords.length < 3) return 0;
    if (window.google?.maps?.geometry?.spherical) {
      const path = coords.map(c => new google.maps.LatLng(c.lat, c.lng));
      const areaMeters = google.maps.geometry.spherical.computeArea(path);
      return Math.round((areaMeters / 2589988.11) * 100) / 100;
    }
    return 0;
  }, []);

  // Check territory overlap
  const checkTerritoryOverlap = useCallback((center: { lat: number; lng: number }, radiusMiles: number) => {
    if (!claimedTerritories || claimedTerritories.length === 0) {
      setTerritoryAvailable(true);
      return;
    }

    const radiusMeters = radiusMiles * 1609.34;
    
    for (const claimed of claimedTerritories) {
      const claimedCenter = { lat: parseFloat(claimed.centerLat), lng: parseFloat(claimed.centerLng) };
      const claimedRadiusMeters = claimed.radiusMiles * 1609.34;
      
      const distance = window.google?.maps?.geometry?.spherical?.computeDistanceBetween(
        new google.maps.LatLng(center.lat, center.lng),
        new google.maps.LatLng(claimedCenter.lat, claimedCenter.lng)
      ) || 0;
      
      if (distance < (radiusMeters + claimedRadiusMeters)) {
        setTerritoryAvailable(false);
        return;
      }
    }
    
    setTerritoryAvailable(true);
  }, [claimedTerritories]);

  // Extract zip code from geocoder results
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

  // Update territory state and UI
  const updateTerritory = useCallback((
    center: { lat: number; lng: number },
    radiusMiles: number,
    address?: string,
    zipCode?: string,
    customSquareMiles?: number,
    polygonCoords?: Array<{ lat: number; lng: number }>
  ) => {
    const pricing = calculatePrice(radiusMiles, center.lat, center.lng, customSquareMiles);

    const newTerritory: TerritoryData = {
      center,
      address: address || territory.address,
      zipCode: zipCode || territory.zipCode,
      radiusMiles,
      ...pricing,
      crossStreets: territory.crossStreets,
      polygonCoords,
      isCustomShape: !!polygonCoords,
    };

    setTerritory(newTerritory);
    onTerritoryChange(newTerritory);

    // Update circle on map
    if (circleRef.current && !polygonCoords) {
      circleRef.current.setCenter(center);
      circleRef.current.setRadius(radiusMiles * 1609.34);
    }

    // Update marker
    if (markerRef.current) {
      markerRef.current.position = center;
    }

    // Pan map to center with appropriate zoom
    if (mapRef.current) {
      mapRef.current.panTo(center);
      const zoom = radiusMiles <= 2 ? 13 : radiusMiles <= 5 ? 11 : radiusMiles <= 10 ? 10 : 9;
      mapRef.current.setZoom(zoom);
    }

    // Check for overlaps
    checkTerritoryOverlap(center, radiusMiles);
  }, [calculatePrice, territory.address, territory.zipCode, territory.crossStreets, onTerritoryChange, checkTerritoryOverlap]);

  // Handle search
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a location to search");
      return;
    }
    
    if (!mapReady || !geocoderRef.current || !mapRef.current) {
      toast.error("Map is still loading, please wait...");
      return;
    }

    setIsSearching(true);

    try {
      geocoderRef.current.geocode({ address: searchQuery }, (results, status) => {
        setIsSearching(false);
        if (status === "OK" && results && results[0]) {
          const location = results[0].geometry.location;
          const newCenter = { lat: location.lat(), lng: location.lng() };
          const zipCode = extractZipCode(results);
          const formattedAddress = results[0].formatted_address;

          // Update territory with new location
          updateTerritory(newCenter, territory.radiusMiles, formattedAddress, zipCode);
          toast.success(`Found: ${formattedAddress}`);
        } else {
          toast.error("Location not found. Try a different search term.");
        }
      });
    } catch (error) {
      setIsSearching(false);
      toast.error("Search failed. Please try again.");
    }
  }, [searchQuery, territory.radiusMiles, updateTerritory, mapReady]);

  // Analyze territory with LLM
  const handleAnalyzeTerritory = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeTerritoryMutation.mutateAsync({
        centerLat: territory.center.lat,
        centerLng: territory.center.lng,
        squareMiles: territory.squareMiles,
        address: territory.address,
      });
      
      if (result.crossStreets) {
        setTerritory(prev => ({ ...prev, crossStreets: result.crossStreets }));
      }
      toast.success("Territory analyzed successfully!");
    } catch (error) {
      toast.error("Analysis failed. Using estimated values.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [territory, analyzeTerritoryMutation]);

  // Clear custom shape
  const clearCustomShape = useCallback(() => {
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }
    setDrawingMode("circle");
    if (circleRef.current) {
      circleRef.current.setVisible(true);
    }
    setTerritory(prev => ({ ...prev, isCustomShape: false, polygonCoords: undefined }));
  }, []);

  // Draw claimed territories on map
  const drawClaimedTerritories = useCallback((map: google.maps.Map) => {
    // Clear existing claimed circles
    claimedCirclesRef.current.forEach(c => c.setMap(null));
    claimedCirclesRef.current = [];

    if (!claimedTerritories || claimedTerritories.length === 0) return;

    claimedTerritories.forEach((claimed: ClaimedTerritory) => {
      const claimedCircle = new google.maps.Circle({
        map,
        center: { lat: parseFloat(claimed.centerLat), lng: parseFloat(claimed.centerLng) },
        radius: claimed.radiusMiles * 1609.34,
        strokeColor: "#ff3333",
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor: "#ff3333",
        fillOpacity: 0.35,
        clickable: true,
        zIndex: 1,
      });

      google.maps.event.addListener(claimedCircle, "click", () => {
        if (infoWindowRef.current) {
          const renewalInfo = claimed.renewalDate ? `<br/><span>Renewal: ${new Date(claimed.renewalDate).toLocaleDateString()}</span>` : '';
          const expirationInfo = claimed.expirationDate ? `<br/><span>Expires: ${new Date(claimed.expirationDate).toLocaleDateString()}</span>` : '';
          
          infoWindowRef.current.setContent(`
            <div style="padding: 12px; color: #333; min-width: 200px;">
              <strong style="color: #ff3333; font-size: 14px;">🔒 Licensed Territory</strong><br/>
              <span style="font-weight: 600;">${claimed.territoryName}</span><br/>
              <span>Radius: ${claimed.radiusMiles} miles</span><br/>
              <span>Status: <strong>${claimed.status}</strong></span>
              ${renewalInfo}
              ${expirationInfo}
            </div>
          `);
          infoWindowRef.current.setPosition({ lat: parseFloat(claimed.centerLat), lng: parseFloat(claimed.centerLng) });
          infoWindowRef.current.open(map);
        }
      });

      claimedCirclesRef.current.push(claimedCircle);
    });
  }, [claimedTerritories]);

  // Setup drawing manager
  const setupDrawingManager = useCallback((map: google.maps.Map) => {
    if (!window.google?.maps?.drawing) {
      console.warn("Drawing library not loaded");
      return;
    }

    const drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: false,
      polygonOptions: {
        strokeColor: "#c8ff00",
        strokeOpacity: 0.9,
        strokeWeight: 3,
        fillColor: "#c8ff00",
        fillOpacity: 0.2,
        editable: true,
        draggable: true,
        zIndex: 10,
      },
      circleOptions: {
        strokeColor: "#c8ff00",
        strokeOpacity: 0.9,
        strokeWeight: 3,
        fillColor: "#c8ff00",
        fillOpacity: 0.2,
        editable: true,
        draggable: true,
        zIndex: 10,
      },
    });

    drawingManager.setMap(map);
    drawingManagerRef.current = drawingManager;

    // Handle polygon complete
    google.maps.event.addListener(drawingManager, "polygoncomplete", (polygon: google.maps.Polygon) => {
      if (circleRef.current) circleRef.current.setVisible(false);
      if (polygonRef.current) polygonRef.current.setMap(null);
      polygonRef.current = polygon;

      const path = polygon.getPath();
      const coords: Array<{ lat: number; lng: number }> = [];
      for (let i = 0; i < path.getLength(); i++) {
        const point = path.getAt(i);
        coords.push({ lat: point.lat(), lng: point.lng() });
      }

      const squareMiles = calculatePolygonArea(coords);
      const centerLat = coords.reduce((sum, c) => sum + c.lat, 0) / coords.length;
      const centerLng = coords.reduce((sum, c) => sum + c.lng, 0) / coords.length;
      const center = { lat: centerLat, lng: centerLng };
      const equivalentRadius = Math.sqrt(squareMiles / Math.PI);

      updateTerritory(center, equivalentRadius, territory.address, territory.zipCode, squareMiles, coords);
      drawingManager.setDrawingMode(null);
      setDrawingMode("none");
      toast.success("Custom territory drawn! You can drag the vertices to adjust.");

      // Add edit listeners
      const updatePolygon = () => {
        const newPath = polygon.getPath();
        const newCoords: Array<{ lat: number; lng: number }> = [];
        for (let i = 0; i < newPath.getLength(); i++) {
          const point = newPath.getAt(i);
          newCoords.push({ lat: point.lat(), lng: point.lng() });
        }
        const newSquareMiles = calculatePolygonArea(newCoords);
        const newCenterLat = newCoords.reduce((sum, c) => sum + c.lat, 0) / newCoords.length;
        const newCenterLng = newCoords.reduce((sum, c) => sum + c.lng, 0) / newCoords.length;
        const newCenter = { lat: newCenterLat, lng: newCenterLng };
        const newRadius = Math.sqrt(newSquareMiles / Math.PI);
        updateTerritory(newCenter, newRadius, territory.address, territory.zipCode, newSquareMiles, newCoords);
      };

      google.maps.event.addListener(polygon.getPath(), "set_at", updatePolygon);
      google.maps.event.addListener(polygon.getPath(), "insert_at", updatePolygon);
    });

    // Handle circle complete
    google.maps.event.addListener(drawingManager, "circlecomplete", (drawnCircle: google.maps.Circle) => {
      drawnCircle.setMap(null);
      const center = drawnCircle.getCenter();
      const radius = drawnCircle.getRadius();
      
      if (center && circleRef.current) {
        circleRef.current.setCenter(center);
        circleRef.current.setRadius(radius);
        circleRef.current.setVisible(true);
        
        const newCenter = { lat: center.lat(), lng: center.lng() };
        const radiusMiles = radius / 1609.34;
        
        if (geocoderRef.current) {
          geocoderRef.current.geocode({ location: newCenter }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              const zipCode = extractZipCode(results);
              updateTerritory(newCenter, radiusMiles, results[0].formatted_address, zipCode);
            } else {
              updateTerritory(newCenter, radiusMiles);
            }
          });
        }
      }
      
      drawingManager.setDrawingMode(null);
      setDrawingMode("circle");
    });
  }, [calculatePolygonArea, updateTerritory, territory.address, territory.zipCode]);

  // Handle map ready
  const handleMapReady = useCallback((map: google.maps.Map) => {
    if (initializationRef.current) return;
    initializationRef.current = true;
    
    mapRef.current = map;
    geocoderRef.current = new google.maps.Geocoder();
    infoWindowRef.current = new google.maps.InfoWindow();

    // Create center marker
    const markerContent = document.createElement("div");
    markerContent.innerHTML = `
      <div style="
        width: 24px;
        height: 24px;
        background: #c8ff00;
        border: 3px solid #0a0a0a;
        border-radius: 50%;
        box-shadow: 0 0 15px #c8ff00, 0 0 30px #c8ff00;
        animation: pulse 2s infinite;
      "></div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      </style>
    `;

    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: territory.center,
      content: markerContent,
      title: "Territory Center",
    });
    markerRef.current = marker;

    // Create main selection circle (neon green)
    const circle = new google.maps.Circle({
      map,
      center: territory.center,
      radius: territory.radiusMiles * 1609.34,
      strokeColor: "#c8ff00",
      strokeOpacity: 0.95,
      strokeWeight: 4,
      fillColor: "#c8ff00",
      fillOpacity: 0.2,
      editable: true,
      draggable: true,
      zIndex: 10,
    });
    circleRef.current = circle;

    // Circle drag event
    google.maps.event.addListener(circle, "center_changed", () => {
      const newCenter = circle.getCenter();
      if (newCenter) {
        const center = { lat: newCenter.lat(), lng: newCenter.lng() };
        if (geocoderRef.current) {
          geocoderRef.current.geocode({ location: center }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              const zipCode = extractZipCode(results);
              updateTerritory(center, territory.radiusMiles, results[0].formatted_address, zipCode);
            } else {
              updateTerritory(center, territory.radiusMiles);
            }
          });
        }
        if (markerRef.current) {
          markerRef.current.position = center;
        }
      }
    });

    // Circle radius change event
    google.maps.event.addListener(circle, "radius_changed", () => {
      const newRadius = circle.getRadius();
      if (newRadius) {
        const radiusMiles = newRadius / 1609.34;
        updateTerritory(territory.center, radiusMiles, territory.address, territory.zipCode);
      }
    });

    // Draw claimed territories
    drawClaimedTerritories(map);

    // Setup drawing manager
    setupDrawingManager(map);

    // Mark map as ready
    setMapReady(true);
    setMapLoading(false);

    // Initial overlap check
    checkTerritoryOverlap(territory.center, territory.radiusMiles);
  }, [territory.center, territory.radiusMiles, territory.address, territory.zipCode, updateTerritory, drawClaimedTerritories, setupDrawingManager, checkTerritoryOverlap]);

  // Update claimed territories when data changes
  useEffect(() => {
    if (mapRef.current && claimedTerritories) {
      drawClaimedTerritories(mapRef.current);
      checkTerritoryOverlap(territory.center, territory.radiusMiles);
    }
  }, [claimedTerritories, drawClaimedTerritories, checkTerritoryOverlap, territory.center, territory.radiusMiles]);

  // Handle radius adjustment
  const adjustRadius = (delta: number) => {
    const newRadius = Math.max(1, Math.min(50, territory.radiusMiles + delta));
    updateTerritory(territory.center, newRadius, territory.address, territory.zipCode);
  };

  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    updateTerritory(territory.center, value[0], territory.address, territory.zipCode);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  // Start polygon drawing
  const startPolygonDrawing = () => {
    if (drawingManagerRef.current) {
      drawingManagerRef.current.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
      setDrawingMode("polygon");
      if (circleRef.current) circleRef.current.setVisible(false);
      toast.info("Click on the map to draw your custom territory. Click the first point to complete.");
    }
  };

  // Start circle drawing
  const startCircleDrawing = () => {
    clearCustomShape();
    if (circleRef.current) circleRef.current.setVisible(true);
    setDrawingMode("circle");
  };

  return (
    <div className="space-y-6">
      {/* Territory Info Cards */}
      <Card className="bg-gradient-to-r from-[#ff0080]/10 to-[#00ffff]/10 border-[#ff0080]/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#ff0080]/20 flex-shrink-0">
              <Building2 className="w-5 h-5 text-[#ff0080]" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Vending Machine Exclusive Territories</h3>
              <p className="text-sm text-gray-300 mb-2">
                Claim exclusive rights to place and operate NEON vending machines in your selected area.
                <span className="text-[#ff3333] font-semibold"> Red zones</span> are already licensed,
                <span className="text-gray-400"> gray areas</span> are available, and
                <span className="text-[#c8ff00] font-semibold"> neon green</span> shows your selection.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Territory Selector Card */}
      <Card className="bg-gradient-to-br from-[#0a0a0a] to-[#0d2818] border-[#c8ff00]/30 overflow-hidden">
        <CardHeader className="border-b border-[#c8ff00]/20">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#c8ff00]/10">
              <Target className="w-6 h-6 text-[#c8ff00]" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">Vending Territory Selector</span>
              <p className="text-sm text-gray-400 font-normal mt-1">Search by zip code or address, then adjust your territory</p>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#c8ff00]/60" />
              <Input
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
              disabled={isSearching || !mapReady}
              className="h-12 px-6 bg-[#c8ff00] text-black font-bold hover:bg-[#d4ff33] transition-all disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Search className="w-5 h-5 mr-2" /> Search</>}
            </Button>
          </div>

          {/* Current Location Display */}
          <div className="bg-black/30 rounded-lg p-4 border border-[#c8ff00]/20">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-[#c8ff00]" />
              <span className="text-white font-semibold">Selected Location</span>
            </div>
            <p className="text-gray-300">{territory.address}</p>
            {territory.zipCode && (
              <p className="text-[#c8ff00] font-mono mt-1">ZIP: {territory.zipCode}</p>
            )}
          </div>

          {/* Map Container */}
          <div className="relative rounded-xl overflow-hidden border-2 border-[#c8ff00]/30" style={{ height: "450px" }}>
            {(mapLoading || loadingTerritories) && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-[#c8ff00] animate-spin mx-auto mb-4" />
                  <p className="text-white font-semibold">Loading Territory Map...</p>
                  <p className="text-gray-400 text-sm">Please wait while we load the map data</p>
                </div>
              </div>
            )}
            <MapView onMapReady={handleMapReady} />
            
            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 bg-black/90 rounded-lg p-3 border border-[#c8ff00]/30 z-10">
              <p className="text-white text-xs font-semibold mb-2">Territory Status</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#c8ff00]/30 border-2 border-[#c8ff00]"></div>
                  <span className="text-gray-300 text-xs">Your Selection</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#ff3333]/40 border-2 border-[#ff3333]"></div>
                  <span className="text-gray-300 text-xs">Licensed (Unavailable)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-500/30 border-2 border-gray-500"></div>
                  <span className="text-gray-300 text-xs">Available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Drawing Tools */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={startCircleDrawing}
              variant={drawingMode === "circle" ? "default" : "outline"}
              className={drawingMode === "circle" ? "bg-[#c8ff00] text-black hover:bg-[#d4ff33]" : "border-[#c8ff00]/50 text-[#c8ff00] hover:bg-[#c8ff00]/10"}
            >
              <Circle className="w-4 h-4 mr-2" /> Circle Mode
            </Button>
            <Button
              onClick={startPolygonDrawing}
              variant={drawingMode === "polygon" ? "default" : "outline"}
              className={drawingMode === "polygon" ? "bg-[#c8ff00] text-black hover:bg-[#d4ff33]" : "border-[#c8ff00]/50 text-[#c8ff00] hover:bg-[#c8ff00]/10"}
            >
              <Pencil className="w-4 h-4 mr-2" /> Custom Draw
            </Button>
            {territory.isCustomShape && (
              <Button
                onClick={clearCustomShape}
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Clear Shape
              </Button>
            )}
            <Button
              onClick={handleAnalyzeTerritory}
              disabled={isAnalyzing}
              variant="outline"
              className="border-[#00ffff]/50 text-[#00ffff] hover:bg-[#00ffff]/10"
            >
              {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Info className="w-4 h-4 mr-2" />}
              {isAnalyzing ? "Analyzing..." : "Analyze Territory"}
            </Button>
          </div>

          {/* Radius Slider */}
          {!territory.isCustomShape && (
            <div className="bg-black/30 rounded-lg p-4 border border-[#c8ff00]/20">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-semibold">Territory Radius</span>
                <span className="text-[#c8ff00] font-bold text-xl">{territory.radiusMiles} miles</span>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => adjustRadius(-1)}
                  variant="outline"
                  size="icon"
                  className="border-[#c8ff00]/50 text-[#c8ff00] hover:bg-[#c8ff00]/10"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Slider
                  value={[territory.radiusMiles]}
                  onValueChange={handleSliderChange}
                  min={1}
                  max={50}
                  step={0.5}
                  className="flex-1"
                />
                <Button
                  onClick={() => adjustRadius(1)}
                  variant="outline"
                  size="icon"
                  className="border-[#c8ff00]/50 text-[#c8ff00] hover:bg-[#c8ff00]/10"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Territory Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black/30 rounded-lg p-4 border border-[#c8ff00]/20 text-center">
              <p className="text-gray-400 text-sm mb-1">Area</p>
              <p className="text-[#c8ff00] font-bold text-xl">{territory.squareMiles} sq mi</p>
            </div>
            <div className="bg-black/30 rounded-lg p-4 border border-[#c8ff00]/20 text-center">
              <p className="text-gray-400 text-sm mb-1">Est. Population</p>
              <p className="text-[#c8ff00] font-bold text-xl">{territory.estimatedPopulation.toLocaleString()}</p>
            </div>
            <div className="bg-black/30 rounded-lg p-4 border border-[#c8ff00]/20 text-center">
              <p className="text-gray-400 text-sm mb-1">Demand Factor</p>
              <p className="text-[#c8ff00] font-bold text-xl">{territory.demandMultiplier.toFixed(1)}x</p>
            </div>
            <div className="bg-black/30 rounded-lg p-4 border border-[#ff0080]/20 text-center">
              <p className="text-gray-400 text-sm mb-1">License Fee</p>
              <p className="text-[#ff0080] font-bold text-xl">${territory.totalPrice.toLocaleString()}</p>
            </div>
          </div>

          {/* Territory Availability Status */}
          <div className={`rounded-lg p-4 border ${territoryAvailable ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <div className="flex items-center gap-3">
              {territoryAvailable ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div>
                    <p className="text-green-400 font-bold">Territory Available!</p>
                    <p className="text-gray-300 text-sm">This area is open for licensing. Secure it before someone else does!</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  <div>
                    <p className="text-red-400 font-bold">Territory Overlaps with Licensed Area</p>
                    <p className="text-gray-300 text-sm">Adjust your selection to avoid overlap with existing territories.</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Apply Button */}
          <Button
            onClick={() => setShowApplicationForm(true)}
            disabled={!territoryAvailable}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#c8ff00] to-[#00ff00] text-black hover:from-[#d4ff33] hover:to-[#33ff33] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <DollarSign className="w-5 h-5 mr-2" />
            Apply for This Territory - ${territory.totalPrice.toLocaleString()}
          </Button>
        </CardContent>
      </Card>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <TerritoryApplicationForm
          territory={territory}
          onClose={() => setShowApplicationForm(false)}
        />
      )}
    </div>
  );
}
