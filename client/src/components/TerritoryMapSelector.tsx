import { useState, useRef, useCallback, useEffect } from "react";
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
  
  const { data: claimedTerritories = [], isLoading: loadingTerritories } = trpc.territory.getClaimedTerritories.useQuery(undefined, {
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
  
  const analyzeTerritoryMutation = trpc.territory.analyzeTerritory.useMutation();
  
  const [territory, setTerritory] = useState<TerritoryData>({
    center: { lat: 37.7749, lng: -122.4194 },
    address: "San Francisco, CA",
    zipCode: "94102",
    radiusMiles: 5,
    squareMiles: 78.54,
    basePrice: 50,
    demandMultiplier: 1.5,
    totalPrice: 5891,
    estimatedPopulation: 250000,
    crossStreets: [],
    isCustomShape: false,
  });

  const circleRef = useRef<google.maps.Circle | null>(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const claimedCirclesRef = useRef<google.maps.Circle[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const initializationRef = useRef(false);

  const getPopulationDensity = (demandMultiplier: number): number => {
    if (demandMultiplier >= 2.0) return 27000;
    if (demandMultiplier >= 1.7) return 12000;
    if (demandMultiplier >= 1.4) return 4000;
    if (demandMultiplier >= 1.2) return 1500;
    return 500;
  };

  const getDemandMultiplier = useCallback((lat: number, lng: number): number => {
    const highDemandCities = [
      { lat: 40.7128, lng: -74.0060, multiplier: 2.0, name: "New York" },
      { lat: 34.0522, lng: -118.2437, multiplier: 1.9, name: "Los Angeles" },
      { lat: 41.8781, lng: -87.6298, multiplier: 1.8, name: "Chicago" },
      { lat: 29.7604, lng: -95.3698, multiplier: 1.7, name: "Houston" },
      { lat: 33.4484, lng: -112.0740, multiplier: 1.6, name: "Phoenix" },
      { lat: 25.7617, lng: -80.1918, multiplier: 1.8, name: "Miami" },
      { lat: 37.7749, lng: -122.4194, multiplier: 1.9, name: "San Francisco" },
      { lat: 47.6062, lng: -122.3321, multiplier: 1.7, name: "Seattle" },
      { lat: 42.3601, lng: -71.0589, multiplier: 1.8, name: "Boston" },
      { lat: 33.7490, lng: -84.3880, multiplier: 1.6, name: "Atlanta" },
      { lat: 32.7767, lng: -96.7970, multiplier: 1.6, name: "Dallas" },
      { lat: 39.7392, lng: -104.9903, multiplier: 1.5, name: "Denver" },
      { lat: 36.1699, lng: -115.1398, multiplier: 1.7, name: "Las Vegas" },
      { lat: 38.9072, lng: -77.0369, multiplier: 1.7, name: "Washington DC" },
      { lat: 39.9526, lng: -75.1652, multiplier: 1.6, name: "Philadelphia" },
    ];

    for (const city of highDemandCities) {
      const distance = Math.sqrt(Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2));
      if (distance < 0.5) return city.multiplier;
      if (distance < 1.0) return city.multiplier * 0.9;
      if (distance < 2.0) return city.multiplier * 0.7;
    }
    return 1.0;
  }, []);

  const calculatePrice = useCallback((radiusMiles: number, lat: number, lng: number, customSquareMiles?: number) => {
    const squareMiles = customSquareMiles || Math.PI * radiusMiles * radiusMiles;
    const basePrice = 50;
    const demandMultiplier = getDemandMultiplier(lat, lng);
    const totalPrice = Math.round(squareMiles * basePrice * demandMultiplier);
    const populationDensity = getPopulationDensity(demandMultiplier);
    const estimatedPopulation = Math.round(squareMiles * populationDensity);
    return { squareMiles: Math.round(squareMiles * 100) / 100, basePrice, demandMultiplier, totalPrice, estimatedPopulation };
  }, [getDemandMultiplier]);

  const calculatePolygonArea = useCallback((coords: Array<{ lat: number; lng: number }>): number => {
    if (coords.length < 3) return 0;
    if (window.google?.maps?.geometry?.spherical) {
      const path = coords.map(c => new google.maps.LatLng(c.lat, c.lng));
      const areaMeters = google.maps.geometry.spherical.computeArea(path);
      return Math.round((areaMeters / 2589988.11) * 100) / 100;
    }
    return 0;
  }, []);

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

  // Simplified search handler - non-blocking
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a location to search");
      return;
    }
    
    if (!geocoderRef.current || !mapRef.current) {
      toast.error("Map is still loading, please wait...");
      return;
    }

    setIsSearching(true);
    
    try {
      // Use Promise-based geocoding for better async handling
      const geocoder = geocoderRef.current;
      const map = mapRef.current;
      
      geocoder.geocode({ address: searchQuery }, (results, status) => {
        setIsSearching(false);
        
        if (status === "OK" && results && results[0]) {
          const location = results[0].geometry.location;
          const newCenter = { lat: location.lat(), lng: location.lng() };
          const zipCode = extractZipCode(results);
          const formattedAddress = results[0].formatted_address;

          // Update map immediately
          map.setCenter(newCenter);
          const zoom = territory.radiusMiles <= 2 ? 13 : territory.radiusMiles <= 5 ? 11 : territory.radiusMiles <= 10 ? 10 : 9;
          map.setZoom(zoom);

          // Update circle
          if (circleRef.current) {
            circleRef.current.setCenter(newCenter);
          }

          // Update marker
          if (markerRef.current) {
            markerRef.current.position = newCenter;
          }

          // Calculate new pricing
          const pricing = calculatePrice(territory.radiusMiles, newCenter.lat, newCenter.lng);

          // Update state
          const newTerritory: TerritoryData = {
            center: newCenter,
            address: formattedAddress,
            zipCode: zipCode || territory.zipCode,
            radiusMiles: territory.radiusMiles,
            ...pricing,
            crossStreets: [],
            isCustomShape: false,
          };

          setTerritory(newTerritory);
          onTerritoryChange(newTerritory);
          checkTerritoryOverlap(newCenter, territory.radiusMiles);
          
          toast.success(`Found: ${formattedAddress}`);
        } else {
          toast.error("Location not found. Try a different search term.");
        }
      });
    } catch (error) {
      setIsSearching(false);
      toast.error("Search failed. Please try again.");
    }
  }, [searchQuery, territory.radiusMiles, territory.zipCode, calculatePrice, onTerritoryChange, checkTerritoryOverlap]);

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

  const drawClaimedTerritories = useCallback((map: google.maps.Map) => {
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

      claimedCircle.addListener("click", () => {
        if (infoWindowRef.current) {
          const renewalDate = claimed.renewalDate ? new Date(claimed.renewalDate).toLocaleDateString() : "N/A";
          const expirationDate = claimed.expirationDate ? new Date(claimed.expirationDate).toLocaleDateString() : "N/A";
          
          infoWindowRef.current.setContent(`
            <div style="padding: 12px; font-family: system-ui; max-width: 250px;">
              <h3 style="margin: 0 0 8px; color: #ff3333; font-weight: bold;">${claimed.territoryName}</h3>
              <p style="margin: 4px 0; color: #666; font-size: 13px;">
                <strong>Status:</strong> <span style="color: #ff3333;">Licensed</span>
              </p>
              <p style="margin: 4px 0; color: #666; font-size: 13px;">
                <strong>Radius:</strong> ${claimed.radiusMiles} miles
              </p>
              <p style="margin: 4px 0; color: #666; font-size: 13px;">
                <strong>Renewal Date:</strong> ${renewalDate}
              </p>
              <p style="margin: 4px 0; color: #666; font-size: 13px;">
                <strong>Expiration:</strong> ${expirationDate}
              </p>
            </div>
          `);
          infoWindowRef.current.setPosition(claimedCircle.getCenter());
          infoWindowRef.current.open(map);
        }
      });

      claimedCirclesRef.current.push(claimedCircle);
    });
  }, [claimedTerritories]);

  const updateTerritoryFromCircle = useCallback((center: { lat: number; lng: number }, radiusMiles: number) => {
    const pricing = calculatePrice(radiusMiles, center.lat, center.lng);
    
    if (geocoderRef.current) {
      geocoderRef.current.geocode({ location: center }, (results, status) => {
        let address = territory.address;
        let zipCode = territory.zipCode;
        
        if (status === "OK" && results && results[0]) {
          address = results[0].formatted_address;
          zipCode = extractZipCode(results) || zipCode;
        }
        
        const newTerritory: TerritoryData = {
          center,
          address,
          zipCode,
          radiusMiles,
          ...pricing,
          crossStreets: [],
          isCustomShape: false,
        };
        
        setTerritory(newTerritory);
        onTerritoryChange(newTerritory);
        checkTerritoryOverlap(center, radiusMiles);
      });
    }
  }, [calculatePrice, territory.address, territory.zipCode, onTerritoryChange, checkTerritoryOverlap]);

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
      const pricing = calculatePrice(equivalentRadius, center.lat, center.lng, squareMiles);

      const newTerritory: TerritoryData = {
        center,
        address: territory.address,
        zipCode: territory.zipCode,
        radiusMiles: equivalentRadius,
        ...pricing,
        crossStreets: [],
        polygonCoords: coords,
        isCustomShape: true,
      };

      setTerritory(newTerritory);
      onTerritoryChange(newTerritory);
      drawingManager.setDrawingMode(null);
      setDrawingMode("none");
      toast.success("Custom territory drawn! You can drag the vertices to adjust.");

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
        const newPricing = calculatePrice(newRadius, newCenter.lat, newCenter.lng, newSquareMiles);

        setTerritory(prev => ({
          ...prev,
          center: newCenter,
          radiusMiles: newRadius,
          ...newPricing,
          polygonCoords: newCoords,
        }));
      };

      google.maps.event.addListener(polygon.getPath(), "set_at", updatePolygon);
      google.maps.event.addListener(polygon.getPath(), "insert_at", updatePolygon);
    });

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
        
        updateTerritoryFromCircle(newCenter, radiusMiles);
      }
      
      drawingManager.setDrawingMode(null);
      setDrawingMode("circle");
    });
  }, [calculatePolygonArea, calculatePrice, territory.address, territory.zipCode, onTerritoryChange, updateTerritoryFromCircle]);

  const handleMapReady = useCallback((map: google.maps.Map) => {
    if (initializationRef.current) return;
    initializationRef.current = true;
    
    mapRef.current = map;
    geocoderRef.current = new google.maps.Geocoder();
    infoWindowRef.current = new google.maps.InfoWindow();

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

    google.maps.event.addListener(circle, "center_changed", () => {
      const newCenter = circle.getCenter();
      if (newCenter) {
        const center = { lat: newCenter.lat(), lng: newCenter.lng() };
        if (markerRef.current) {
          markerRef.current.position = center;
        }
        updateTerritoryFromCircle(center, circle.getRadius()! / 1609.34);
      }
    });

    google.maps.event.addListener(circle, "radius_changed", () => {
      const newRadius = circle.getRadius();
      const center = circle.getCenter();
      if (newRadius && center) {
        const radiusMiles = newRadius / 1609.34;
        updateTerritoryFromCircle({ lat: center.lat(), lng: center.lng() }, radiusMiles);
      }
    });

    drawClaimedTerritories(map);
    setupDrawingManager(map);

    setMapReady(true);
    setMapLoading(false);
    checkTerritoryOverlap(territory.center, territory.radiusMiles);
  }, [territory.center, territory.radiusMiles, updateTerritoryFromCircle, drawClaimedTerritories, setupDrawingManager, checkTerritoryOverlap]);

  useEffect(() => {
    if (mapRef.current && claimedTerritories) {
      drawClaimedTerritories(mapRef.current);
      checkTerritoryOverlap(territory.center, territory.radiusMiles);
    }
  }, [claimedTerritories, drawClaimedTerritories, checkTerritoryOverlap, territory.center, territory.radiusMiles]);

  const adjustRadius = (delta: number) => {
    const newRadius = Math.max(1, Math.min(50, territory.radiusMiles + delta));
    const pricing = calculatePrice(newRadius, territory.center.lat, territory.center.lng);
    
    if (circleRef.current) {
      circleRef.current.setRadius(newRadius * 1609.34);
    }
    
    const newTerritory = { ...territory, radiusMiles: newRadius, ...pricing };
    setTerritory(newTerritory);
    onTerritoryChange(newTerritory);
    checkTerritoryOverlap(territory.center, newRadius);
    
    if (mapRef.current) {
      const zoom = newRadius <= 2 ? 13 : newRadius <= 5 ? 11 : newRadius <= 10 ? 10 : 9;
      mapRef.current.setZoom(zoom);
    }
  };

  const handleSliderChange = (value: number[]) => {
    const newRadius = value[0];
    const pricing = calculatePrice(newRadius, territory.center.lat, territory.center.lng);
    
    if (circleRef.current) {
      circleRef.current.setRadius(newRadius * 1609.34);
    }
    
    const newTerritory = { ...territory, radiusMiles: newRadius, ...pricing };
    setTerritory(newTerritory);
    onTerritoryChange(newTerritory);
    checkTerritoryOverlap(territory.center, newRadius);
    
    if (mapRef.current) {
      const zoom = newRadius <= 2 ? 13 : newRadius <= 5 ? 11 : newRadius <= 10 ? 10 : 9;
      mapRef.current.setZoom(zoom);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const startPolygonDrawing = () => {
    if (drawingManagerRef.current) {
      drawingManagerRef.current.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
      setDrawingMode("polygon");
      if (circleRef.current) circleRef.current.setVisible(false);
      toast.info("Click on the map to draw your custom territory. Click the first point to complete.");
    }
  };

  const startCircleDrawing = () => {
    clearCustomShape();
    if (circleRef.current) circleRef.current.setVisible(true);
    setDrawingMode("circle");
  };

  return (
    <div className="space-y-6">
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
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#c8ff00]/60" />
              <Input
                type="text"
                placeholder="Enter zip code, city, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                className="pl-12 h-12 bg-black/50 border-[#c8ff00]/30 text-white placeholder:text-gray-500 focus:border-[#c8ff00] focus:ring-[#c8ff00]/20 text-lg"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="h-12 px-6 bg-[#c8ff00] text-black font-bold hover:bg-[#d4ff33] transition-all disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Search className="w-5 h-5 mr-2" /> Search</>}
            </Button>
          </div>

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
              Analyze Territory
            </Button>
          </div>

          {!territory.isCustomShape && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold">Territory Radius</span>
                <span className="text-[#c8ff00] font-bold text-lg">{territory.radiusMiles} miles</span>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => adjustRadius(-1)}
                  variant="outline"
                  size="icon"
                  className="border-[#c8ff00]/30 text-[#c8ff00] hover:bg-[#c8ff00]/10"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Slider
                  value={[territory.radiusMiles]}
                  onValueChange={handleSliderChange}
                  min={1}
                  max={50}
                  step={1}
                  className="flex-1"
                />
                <Button
                  onClick={() => adjustRadius(1)}
                  variant="outline"
                  size="icon"
                  className="border-[#c8ff00]/30 text-[#c8ff00] hover:bg-[#c8ff00]/10"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black/30 rounded-lg p-4 border border-[#c8ff00]/20 text-center">
              <p className="text-gray-400 text-xs mb-1">Area</p>
              <p className="text-[#c8ff00] font-bold text-xl">{territory.squareMiles} sq mi</p>
            </div>
            <div className="bg-black/30 rounded-lg p-4 border border-[#c8ff00]/20 text-center">
              <p className="text-gray-400 text-xs mb-1">Est. Population</p>
              <p className="text-[#c8ff00] font-bold text-xl">{territory.estimatedPopulation.toLocaleString()}</p>
            </div>
            <div className="bg-black/30 rounded-lg p-4 border border-[#c8ff00]/20 text-center">
              <p className="text-gray-400 text-xs mb-1">Demand Factor</p>
              <p className="text-[#c8ff00] font-bold text-xl">{territory.demandMultiplier}x</p>
            </div>
            <div className="bg-black/30 rounded-lg p-4 border border-[#c8ff00]/20 text-center">
              <p className="text-gray-400 text-xs mb-1">License Fee</p>
              <p className="text-[#c8ff00] font-bold text-xl">${territory.totalPrice.toLocaleString()}</p>
            </div>
          </div>

          {territoryAvailable ? (
            <div className="bg-[#c8ff00]/10 border border-[#c8ff00]/30 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-[#c8ff00]" />
              <div>
                <p className="text-[#c8ff00] font-bold">Territory Available!</p>
                <p className="text-gray-300 text-sm">This area is open for licensing. Secure it before someone else does!</p>
              </div>
            </div>
          ) : (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <div>
                <p className="text-red-400 font-bold">Territory Overlap Detected</p>
                <p className="text-gray-300 text-sm">This area overlaps with an existing licensed territory. Please adjust your selection.</p>
              </div>
            </div>
          )}

          <Button
            onClick={() => setShowApplicationForm(true)}
            disabled={!territoryAvailable}
            className="w-full h-14 bg-[#c8ff00] text-black font-bold text-lg hover:bg-[#d4ff33] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <DollarSign className="w-5 h-5 mr-2" />
            Apply for This Territory - ${territory.totalPrice.toLocaleString()}
          </Button>
        </CardContent>
      </Card>

      {showApplicationForm && (
        <TerritoryApplicationForm
          territory={territory}
          onClose={() => setShowApplicationForm(false)}
        />
      )}
    </div>
  );
}
