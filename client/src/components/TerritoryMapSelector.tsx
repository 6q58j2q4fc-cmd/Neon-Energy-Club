import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { MapPin, Search, DollarSign, Maximize2, Users, Minus, Plus, Target, ZoomIn, ZoomOut, AlertTriangle, CheckCircle, Pencil, Circle, Trash2, Info, Loader2, MapIcon, Building2 } from "lucide-react";
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

export default function TerritoryMapSelector({ onTerritoryChange }: TerritoryMapSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [territoryAvailable, setTerritoryAvailable] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [drawingMode, setDrawingMode] = useState<DrawingMode>("circle");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [crossStreets, setCrossStreets] = useState<string[]>([]);
  
  // Fetch claimed territories
  const { data: claimedTerritories = [] } = trpc.territory.getClaimedTerritories.useQuery();
  
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

  const circleRef = useRef<google.maps.Circle | null>(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const claimedCirclesRef = useRef<google.maps.Circle[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);

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

    let nearestCity = highDemandCities[0];
    let minDistance = Infinity;

    for (const city of highDemandCities) {
      const distance = Math.sqrt(
        Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = city;
      }
    }

    if (minDistance < 0.7) {
      return nearestCity.multiplier;
    } else if (minDistance < 2) {
      const factor = 1 - (minDistance - 0.7) / 1.3;
      return 1 + (nearestCity.multiplier - 1) * factor;
    }
    return 1.0;
  };

  const calculatePrice = useCallback((radiusMiles: number, lat: number, lng: number, customSquareMiles?: number) => {
    const squareMiles = customSquareMiles || Math.PI * radiusMiles * radiusMiles;
    const basePrice = 50; // Base price per square mile
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

  // Calculate polygon area using Shoelace formula
  const calculatePolygonArea = useCallback((coords: Array<{ lat: number; lng: number }>): number => {
    if (coords.length < 3) return 0;
    
    // Use Google Maps geometry library if available
    if (window.google?.maps?.geometry?.spherical) {
      const path = coords.map(c => new google.maps.LatLng(c.lat, c.lng));
      const areaMeters = google.maps.geometry.spherical.computeArea(path);
      const areaSqMiles = areaMeters / 2589988.11; // Convert sq meters to sq miles
      return Math.round(areaSqMiles * 100) / 100;
    }
    
    // Fallback calculation
    let area = 0;
    const n = coords.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += coords[i].lng * coords[j].lat;
      area -= coords[j].lng * coords[i].lat;
    }
    area = Math.abs(area) / 2;
    // Convert to square miles (rough approximation)
    const avgLat = coords.reduce((sum, c) => sum + c.lat, 0) / n;
    const latFactor = Math.cos(avgLat * Math.PI / 180);
    const sqDegrees = area;
    const sqMiles = sqDegrees * 69 * 69 * latFactor;
    return Math.round(sqMiles * 100) / 100;
  }, []);

  // Analyze territory with LLM
  const analyzeTerritory = useCallback(async (
    center: { lat: number; lng: number },
    squareMiles: number,
    address: string
  ) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeTerritoryMutation.mutateAsync({
        centerLat: center.lat,
        centerLng: center.lng,
        squareMiles,
        address,
      });
      
      if (result.crossStreets) {
        setCrossStreets(result.crossStreets);
      }
      if (result.adjustedSquareMiles) {
        // Update territory with LLM-adjusted values
        setTerritory(prev => ({
          ...prev,
          squareMiles: result.adjustedSquareMiles || prev.squareMiles,
          crossStreets: result.crossStreets,
        }));
      }
      
      toast.success("Territory analyzed successfully!");
    } catch (error) {
      console.error("Territory analysis failed:", error);
      toast.error("Could not analyze territory. Using estimated values.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [analyzeTerritoryMutation]);

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

    // Update circle on map if in circle mode
    if (circleRef.current && !polygonCoords) {
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
      const zoom = radiusMiles <= 2 ? 13 : radiusMiles <= 5 ? 11 : radiusMiles <= 10 ? 10 : 9;
      mapRef.current.setZoom(zoom);
    }

    // Check for overlaps with claimed territories
    checkTerritoryOverlap(center, radiusMiles);
  }, [calculatePrice, onTerritoryChange, territory.address, territory.zipCode, territory.crossStreets]);

  // Check if selected territory overlaps with claimed territories
  const checkTerritoryOverlap = useCallback((center: { lat: number; lng: number }, radiusMiles: number) => {
    if (!claimedTerritories || claimedTerritories.length === 0) {
      setTerritoryAvailable(true);
      return;
    }

    const radiusMeters = radiusMiles * 1609.34;
    
    for (const claimed of claimedTerritories) {
      const claimedCenter = { 
        lat: parseFloat(claimed.centerLat), 
        lng: parseFloat(claimed.centerLng) 
      };
      const claimedRadiusMeters = claimed.radiusMiles * 1609.34;
      
      const R = 6371000;
      const dLat = (claimedCenter.lat - center.lat) * Math.PI / 180;
      const dLng = (claimedCenter.lng - center.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(center.lat * Math.PI / 180) * Math.cos(claimedCenter.lat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      if (distance < (radiusMeters + claimedRadiusMeters)) {
        setTerritoryAvailable(false);
        return;
      }
    }
    
    setTerritoryAvailable(true);
  }, [claimedTerritories]);

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
            toast.success(`Found: ${formattedAddress}`);
            
            // Trigger LLM analysis
            analyzeTerritory(newCenter, territory.squareMiles, formattedAddress);
          } else {
            console.error("Geocode failed:", status);
            toast.error(`Location not found. Try a different search term.`);
          }
        }
      );
    } catch (error) {
      setIsSearching(false);
      console.error("Search error:", error);
      toast.error("Search failed. Please try again.");
    }
  }, [searchQuery, territory.radiusMiles, territory.squareMiles, updateTerritory, mapReady, analyzeTerritory]);

  // Clear custom polygon
  const clearCustomShape = useCallback(() => {
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }
    setDrawingMode("circle");
    if (circleRef.current) {
      circleRef.current.setVisible(true);
    }
    setTerritory(prev => ({
      ...prev,
      isCustomShape: false,
      polygonCoords: undefined,
    }));
  }, []);

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
        fillOpacity: 0.15,
        editable: true,
        draggable: true,
      },
      circleOptions: {
        strokeColor: "#c8ff00",
        strokeOpacity: 0.9,
        strokeWeight: 3,
        fillColor: "#c8ff00",
        fillOpacity: 0.15,
        editable: true,
        draggable: true,
      },
    });

    drawingManager.setMap(map);
    drawingManagerRef.current = drawingManager;

    // Handle polygon complete
    google.maps.event.addListener(drawingManager, "polygoncomplete", (polygon: google.maps.Polygon) => {
      // Hide the circle
      if (circleRef.current) {
        circleRef.current.setVisible(false);
      }

      // Remove previous polygon
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
      }
      polygonRef.current = polygon;

      // Get polygon coordinates
      const path = polygon.getPath();
      const coords: Array<{ lat: number; lng: number }> = [];
      for (let i = 0; i < path.getLength(); i++) {
        const point = path.getAt(i);
        coords.push({ lat: point.lat(), lng: point.lng() });
      }

      // Calculate area
      const squareMiles = calculatePolygonArea(coords);
      
      // Calculate center
      const centerLat = coords.reduce((sum, c) => sum + c.lat, 0) / coords.length;
      const centerLng = coords.reduce((sum, c) => sum + c.lng, 0) / coords.length;
      const center = { lat: centerLat, lng: centerLng };

      // Calculate equivalent radius
      const equivalentRadius = Math.sqrt(squareMiles / Math.PI);

      // Update territory
      updateTerritory(center, equivalentRadius, territory.address, territory.zipCode, squareMiles, coords);

      // Trigger LLM analysis
      analyzeTerritory(center, squareMiles, territory.address);

      // Stop drawing mode
      drawingManager.setDrawingMode(null);
      setDrawingMode("none");

      // Add listeners for polygon edits
      google.maps.event.addListener(polygon.getPath(), "set_at", () => {
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
      });

      google.maps.event.addListener(polygon.getPath(), "insert_at", () => {
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
      });
    });

    // Handle circle complete from drawing
    google.maps.event.addListener(drawingManager, "circlecomplete", (circle: google.maps.Circle) => {
      // Remove the drawn circle, we use our own
      circle.setMap(null);
      
      const center = circle.getCenter();
      const radius = circle.getRadius();
      
      if (center && circleRef.current) {
        circleRef.current.setCenter(center);
        circleRef.current.setRadius(radius);
        circleRef.current.setVisible(true);
        
        const newCenter = { lat: center.lat(), lng: center.lng() };
        const radiusMiles = radius / 1609.34;
        
        // Reverse geocode
        if (geocoderRef.current) {
          geocoderRef.current.geocode({ location: newCenter }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              const zipCode = extractZipCode(results);
              updateTerritory(newCenter, radiusMiles, results[0].formatted_address, zipCode);
              analyzeTerritory(newCenter, Math.PI * radiusMiles * radiusMiles, results[0].formatted_address);
            } else {
              updateTerritory(newCenter, radiusMiles);
            }
          });
        }
      }
      
      drawingManager.setDrawingMode(null);
      setDrawingMode("circle");
    });
  }, [calculatePolygonArea, updateTerritory, territory.address, territory.zipCode, analyzeTerritory]);

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    geocoderRef.current = new google.maps.Geocoder();
    setMapReady(true);

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

        google.maps.event.addListener(claimedCircle, "click", () => {
          if (infoWindowRef.current) {
            infoWindowRef.current.setContent(`
              <div style="padding: 8px; color: #333;">
                <strong style="color: #ff3333;">Claimed Vending Territory</strong><br/>
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

    // Listen for circle drag events
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

    // Listen for circle radius change
    google.maps.event.addListener(circle, "radius_changed", () => {
      const newRadius = circle.getRadius();
      if (newRadius) {
        const radiusMiles = newRadius / 1609.34;
        updateTerritory(territory.center, radiusMiles, territory.address, territory.zipCode);
      }
    });

    // Setup drawing manager
    setupDrawingManager(map);

    // Initial overlap check
    checkTerritoryOverlap(territory.center, territory.radiusMiles);
  }, [territory.center, territory.radiusMiles, territory.address, territory.zipCode, claimedTerritories, updateTerritory, checkTerritoryOverlap, setupDrawingManager]);

  // Update claimed circles when data changes
  useEffect(() => {
    if (!mapRef.current || !claimedTerritories) return;

    claimedCirclesRef.current.forEach(c => c.setMap(null));
    claimedCirclesRef.current = [];

    claimedTerritories.forEach((claimed: { centerLat: string; centerLng: string; radiusMiles: number; territoryName: string; status: string }) => {
      const claimedCircle = new google.maps.Circle({
        map: mapRef.current,
        center: { lat: parseFloat(claimed.centerLat), lng: parseFloat(claimed.centerLng) },
        radius: claimed.radiusMiles * 1609.34,
        strokeColor: "#ff3333",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#ff3333",
        fillOpacity: 0.2,
        clickable: true,
      });

      google.maps.event.addListener(claimedCircle, "click", () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(`
            <div style="padding: 8px; color: #333;">
              <strong style="color: #ff3333;">Claimed Vending Territory</strong><br/>
              <span>${claimed.territoryName}</span><br/>
              <span>Radius: ${claimed.radiusMiles} miles</span><br/>
              <span>Status: ${claimed.status}</span>
            </div>
          `);
          infoWindowRef.current.setPosition({ lat: parseFloat(claimed.centerLat), lng: parseFloat(claimed.centerLng) });
          infoWindowRef.current.open(mapRef.current);
        }
      });

      claimedCirclesRef.current.push(claimedCircle);
    });

    checkTerritoryOverlap(territory.center, territory.radiusMiles);
  }, [claimedTerritories, territory.center, territory.radiusMiles, checkTerritoryOverlap]);

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

  // Start polygon drawing mode
  const startPolygonDrawing = () => {
    if (drawingManagerRef.current) {
      drawingManagerRef.current.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
      setDrawingMode("polygon");
      if (circleRef.current) {
        circleRef.current.setVisible(false);
      }
      toast.info("Click on the map to draw your custom territory shape. Click the first point to complete.");
    }
  };

  // Start circle drawing mode
  const startCircleDrawing = () => {
    clearCustomShape();
    if (circleRef.current) {
      circleRef.current.setVisible(true);
    }
    setDrawingMode("circle");
  };

  return (
    <div className="space-y-6">
      {/* Vending Machine Territory Notice */}
      <Card className="bg-gradient-to-r from-[#ff0080]/10 to-[#00ffff]/10 border-[#ff0080]/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#ff0080]/20 flex-shrink-0">
              <Building2 className="w-5 h-5 text-[#ff0080]" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Vending Machine Exclusive Territories</h3>
              <p className="text-sm text-gray-300 mb-2">
                These territories are <strong className="text-[#c8ff00]">exclusively for NEON vending machine placement</strong>. 
                Claiming a territory grants you exclusive rights to place and operate NEON vending machines within the selected area.
              </p>
              <p className="text-sm text-gray-400">
                <Info className="w-4 h-4 inline mr-1 text-[#00ffff]" />
                <strong>Note:</strong> This does not affect other distributors from selling NEON products without vending machines. 
                Traditional distribution and retail sales remain open to all qualified distributors regardless of territory claims.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profit Sharing Pool Notice */}
      <Card className="bg-gradient-to-r from-[#c8ff00]/10 to-[#00ff00]/10 border-[#c8ff00]/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#c8ff00]/20 flex-shrink-0">
              <DollarSign className="w-5 h-5 text-[#c8ff00]" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Vending Machine Profit Sharing Pool</h3>
              <p className="text-sm text-gray-300">
                All <strong className="text-[#c8ff00]">active and qualified distributors</strong> participate in a profit sharing pool 
                from <strong>all vending machine sales across the network</strong>. This means even if you don't own a vending territory, 
                you can still earn from the collective success of NEON vending operations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-[#0a0a0a] to-[#1a0a2e] border-[#c8ff00]/30 overflow-hidden">
        <CardHeader className="border-b border-[#c8ff00]/20">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#c8ff00]/10">
              <Target className="w-6 h-6 text-[#c8ff00]" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">Vending Territory Selector</span>
              <p className="text-sm text-gray-400 font-normal mt-1">Search by zip code or address, then adjust your vending territory</p>
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

          {/* Drawing Mode Controls */}
          <div className="bg-black/30 rounded-xl p-4 border border-[#c8ff00]/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-[#c8ff00]" />
                <span className="font-semibold text-white">Drawing Mode</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={drawingMode === "circle" ? "default" : "outline"}
                  onClick={startCircleDrawing}
                  className={drawingMode === "circle" 
                    ? "bg-[#c8ff00] text-black hover:bg-[#d4ff33]" 
                    : "border-[#c8ff00]/30 text-[#c8ff00] hover:bg-[#c8ff00]/10"
                  }
                >
                  <Circle className="w-4 h-4 mr-1" />
                  Circle
                </Button>
                <Button
                  size="sm"
                  variant={drawingMode === "polygon" ? "default" : "outline"}
                  onClick={startPolygonDrawing}
                  className={drawingMode === "polygon" 
                    ? "bg-[#c8ff00] text-black hover:bg-[#d4ff33]" 
                    : "border-[#c8ff00]/30 text-[#c8ff00] hover:bg-[#c8ff00]/10"
                  }
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  Custom Shape
                </Button>
                {territory.isCustomShape && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={clearCustomShape}
                    className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400">
              {drawingMode === "circle" 
                ? "Drag the circle or adjust the radius slider to define your territory." 
                : drawingMode === "polygon"
                ? "Click points on the map to draw a custom shape. Click the first point to complete."
                : "Custom shape drawn. Drag vertices to adjust or clear to start over."
              }
            </p>
          </div>

          {/* Radius Slider Control - Only show for circle mode */}
          {drawingMode === "circle" && !territory.isCustomShape && (
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
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>1 mi</span>
                  <span>10 mi</span>
                  <span>25 mi</span>
                  <span>50 mi</span>
                </div>
              </div>
            </div>
          )}

          {/* Map Container */}
          <div className="relative rounded-xl overflow-hidden border-2 border-[#c8ff00]/30">
            {/* Location Badge */}
            <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-[#c8ff00]/30">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#c8ff00]" />
                <div className="text-sm">
                  {territory.zipCode && <span className="text-[#c8ff00] mr-2">{territory.zipCode}</span>}
                  <span className="text-white">{territory.address.split(",")[0]}</span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="absolute top-4 right-4 z-10 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-[#c8ff00]/30">
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#c8ff00]/50 border border-[#c8ff00]"></div>
                  <span className="text-gray-300">Your Selection</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50 border border-red-500"></div>
                  <span className="text-gray-300">Claimed Vending Territory</span>
                </div>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => mapRef.current?.setZoom((mapRef.current?.getZoom() || 10) + 1)}
                className="w-10 h-10 p-0 bg-black/80 border-[#c8ff00]/30 text-[#c8ff00] hover:bg-[#c8ff00]/10"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => mapRef.current?.setZoom((mapRef.current?.getZoom() || 10) - 1)}
                className="w-10 h-10 p-0 bg-black/80 border-[#c8ff00]/30 text-[#c8ff00] hover:bg-[#c8ff00]/10"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
            </div>

            {/* Analyzing Indicator */}
            {isAnalyzing && (
              <div className="absolute bottom-4 left-4 z-10 bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-[#00ffff]/30">
                <div className="flex items-center gap-2 text-[#00ffff]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Analyzing territory...</span>
                </div>
              </div>
            )}

            <MapView
              className="h-[450px]"
              initialCenter={territory.center}
              initialZoom={11}
              onMapReady={handleMapReady}
            />
          </div>

          {/* Cross Streets Display */}
          {crossStreets.length > 0 && (
            <div className="bg-black/30 rounded-xl p-4 border border-[#00ffff]/20">
              <div className="flex items-center gap-2 mb-3">
                <MapIcon className="w-5 h-5 text-[#00ffff]" />
                <span className="font-semibold text-white">Major Cross Streets</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {crossStreets.map((street, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 rounded-full bg-[#00ffff]/10 text-[#00ffff] text-sm border border-[#00ffff]/30"
                  >
                    {street}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Territory Info Card */}
          <div className="bg-black/30 rounded-xl p-5 border border-[#c8ff00]/20">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5 text-[#c8ff00]" />
              <div className="flex-1">
                <div className="font-semibold text-white">Selected Vending Territory</div>
                <div className="text-sm text-gray-400">
                  {territory.zipCode && <span className="text-[#c8ff00] mr-2">{territory.zipCode}</span>}
                  {territory.address.split(",")[0]}
                  {territory.isCustomShape && (
                    <span className="ml-2 text-[#ff0080]">(Custom Shape)</span>
                  )}
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
                <div className="text-lg font-bold text-[#ff0080]">×{territory.demandMultiplier.toFixed(1)}</div>
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
                    <div className="font-semibold text-green-500">Vending Territory Available!</div>
                    <div className="text-sm text-gray-400">This area is open for vending machine licensing. Apply now to secure your exclusive vending territory.</div>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  <div>
                    <div className="font-semibold text-red-500">Territory Overlap Detected</div>
                    <div className="text-sm text-gray-400">This area overlaps with an existing vending territory. Try adjusting your location or radius.</div>
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
            Apply for Vending Territory - ${territory.totalPrice.toLocaleString()}
          </Button>

          {/* Instructions */}
          <div className="bg-[#c8ff00]/5 border border-[#c8ff00]/20 rounded-xl p-4">
            <div className="text-sm font-semibold text-[#c8ff00] mb-3">How to Select Your Vending Territory</div>
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
                <div><strong>Choose Mode:</strong> Use circle for radius-based or custom shape for precise boundaries</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-[#c8ff00]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-[#c8ff00]">3</span>
                </div>
                <div><strong>Adjust:</strong> Drag, resize, or draw to define your exact vending area</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-[#c8ff00]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-[#c8ff00]">4</span>
                </div>
                <div><strong>Apply:</strong> Review the AI-calculated area and cross streets, then submit</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Form Modal */}
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
            toast.success("Vending territory application submitted successfully!");
          }}
        />
      )}
    </div>
  );
}
