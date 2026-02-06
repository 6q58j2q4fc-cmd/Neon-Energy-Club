import { useState, useEffect } from 'react';
import { MapPin, Zap, Sun, TrendingUp, DollarSign, Users, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface BusinessLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  score: number; // 0-100
  footTraffic: 'high' | 'medium' | 'low';
  powerAccess: 'grid' | 'solar' | 'hybrid' | 'none';
  estimatedMonthlyRevenue: number;
  demographics: string;
  solarPanelCost?: number;
  solarROI?: number; // months to break even
}

interface IntelligentTerritoryMapProps {
  onLocationSelect?: (location: BusinessLocation) => void;
}

export function IntelligentTerritoryMap({ onLocationSelect }: IntelligentTerritoryMapProps) {
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<BusinessLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<BusinessLocation | null>(null);

  // Simulated location suggestions based on zip code
  const generateSuggestions = (zip: string): BusinessLocation[] => {
    // In production, this would call an API with real data
    const baseLocations = [
      {
        type: 'gym',
        name: '24 Hour Fitness',
        footTraffic: 'high' as const,
        revenue: 4500,
        demographics: 'Fitness enthusiasts, 18-45',
      },
      {
        type: 'university',
        name: 'University Student Center',
        footTraffic: 'high' as const,
        revenue: 5200,
        demographics: 'Students, 18-25',
      },
      {
        type: 'office',
        name: 'Tech Office Complex',
        footTraffic: 'medium' as const,
        revenue: 3800,
        demographics: 'Professionals, 25-45',
      },
      {
        type: 'mall',
        name: 'Shopping Mall Food Court',
        footTraffic: 'high' as const,
        revenue: 4200,
        demographics: 'General public, all ages',
      },
      {
        type: 'airport',
        name: 'Airport Terminal',
        footTraffic: 'high' as const,
        revenue: 6500,
        demographics: 'Travelers, all ages',
      },
    ];

    return baseLocations.map((loc, index) => {
      const powerOptions: BusinessLocation['powerAccess'][] = ['grid', 'solar', 'hybrid', 'none'];
      const powerAccess = powerOptions[index % powerOptions.length];
      
      return {
        id: `${zip}-${index}`,
        name: loc.name,
        address: `${1000 + index * 100} Main St, ${zip}`,
        lat: 37.7749 + (Math.random() - 0.5) * 0.1,
        lng: -122.4194 + (Math.random() - 0.5) * 0.1,
        score: 75 + Math.random() * 25,
        footTraffic: loc.footTraffic,
        powerAccess,
        estimatedMonthlyRevenue: loc.revenue,
        demographics: loc.demographics,
        solarPanelCost: powerAccess === 'none' || powerAccess === 'solar' ? 8500 : undefined,
        solarROI: powerAccess === 'none' || powerAccess === 'solar' ? 18 : undefined,
      };
    });
  };

  const handleZipCodeSubmit = () => {
    if (zipCode.length === 5) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const locations = generateSuggestions(zipCode);
        setSuggestions(locations.sort((a, b) => b.score - a.score));
        setLoading(false);
      }, 1000);
    }
  };

  const getPowerIcon = (powerAccess: BusinessLocation['powerAccess']) => {
    switch (powerAccess) {
      case 'grid':
        return <Zap className="w-4 h-4 text-green-500" />;
      case 'solar':
        return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'hybrid':
        return (
          <div className="flex gap-1">
            <Zap className="w-3 h-3 text-green-500" />
            <Sun className="w-3 h-3 text-yellow-500" />
          </div>
        );
      case 'none':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getPowerLabel = (powerAccess: BusinessLocation['powerAccess']) => {
    switch (powerAccess) {
      case 'grid':
        return 'Grid Power Available';
      case 'solar':
        return 'Solar Recommended';
      case 'hybrid':
        return 'Grid + Solar Hybrid';
      case 'none':
        return 'No Power - Solar Required';
    }
  };

  return (
    <div className="space-y-6">
      {/* Zip Code Input */}
      <Card className="p-6 bg-gray-900 border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">Find Optimal Locations in Your Territory</h3>
        <div className="flex gap-3">
          <Input
            type="text"
            placeholder="Enter ZIP code"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
            onKeyPress={(e) => e.key === 'Enter' && handleZipCodeSubmit()}
            className="flex-1"
            maxLength={5}
          />
          <Button
            onClick={handleZipCodeSubmit}
            disabled={zipCode.length !== 5 || loading}
            className="bg-[#c8ff00] text-black hover:bg-[#d4ff33]"
          >
            {loading ? 'Analyzing...' : 'Find Locations'}
          </Button>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Our AI analyzes foot traffic, demographics, power access, and competition to suggest the best vending machine locations.
        </p>
      </Card>

      {/* Map Placeholder */}
      {suggestions.length > 0 && (
        <Card className="p-6 bg-gray-900 border-gray-800">
          <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
            {/* Simulated map with markers */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900">
              {suggestions.map((loc, index) => (
                <div
                  key={loc.id}
                  className="absolute w-8 h-8 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
                  style={{
                    left: `${20 + index * 15}%`,
                    top: `${30 + (index % 3) * 20}%`,
                  }}
                  onClick={() => setSelectedLocation(loc)}
                >
                  <MapPin className={`w-full h-full ${selectedLocation?.id === loc.id ? 'text-[#c8ff00]' : 'text-red-500'}`} />
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-xs whitespace-nowrap">
                    {Math.round(loc.score)}
                  </div>
                </div>
              ))}
            </div>
            <div className="relative z-10 text-center text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-600" />
              <p className="text-sm">Interactive Map</p>
              <p className="text-xs">Click markers to view location details</p>
            </div>
          </div>
        </Card>
      )}

      {/* Location Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Suggested Locations (Ranked by Score)</h3>
          {suggestions.map((location) => (
            <Card
              key={location.id}
              className={`p-6 bg-gray-900 border-gray-800 cursor-pointer transition-all hover:border-[#c8ff00]/50 ${
                selectedLocation?.id === location.id ? 'border-[#c8ff00] ring-2 ring-[#c8ff00]/20' : ''
              }`}
              onClick={() => {
                setSelectedLocation(location);
                onLocationSelect?.(location);
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">{location.name}</h4>
                  <p className="text-sm text-gray-400">{location.address}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#c8ff00]">{Math.round(location.score)}</div>
                  <div className="text-xs text-gray-500">Score</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Foot Traffic</div>
                    <div className="text-sm font-semibold text-white capitalize">{location.footTraffic}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Est. Monthly</div>
                    <div className="text-sm font-semibold text-white">${location.estimatedMonthlyRevenue.toLocaleString()}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getPowerIcon(location.powerAccess)}
                  <div>
                    <div className="text-xs text-gray-500">Power</div>
                    <div className="text-sm font-semibold text-white">{getPowerLabel(location.powerAccess).split(' ')[0]}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Demographics</div>
                    <div className="text-sm font-semibold text-white">{location.demographics.split(',')[0]}</div>
                  </div>
                </div>
              </div>

              {/* Power Access Details */}
              <div className={`p-4 rounded-lg ${
                location.powerAccess === 'grid' ? 'bg-green-500/10 border border-green-500/20' :
                location.powerAccess === 'solar' ? 'bg-yellow-500/10 border border-yellow-500/20' :
                location.powerAccess === 'hybrid' ? 'bg-blue-500/10 border border-blue-500/20' :
                'bg-red-500/10 border border-red-500/20'
              }`}>
                <div className="flex items-start gap-3">
                  {getPowerIcon(location.powerAccess)}
                  <div className="flex-1">
                    <div className="font-semibold text-white mb-1">{getPowerLabel(location.powerAccess)}</div>
                    {(location.powerAccess === 'none' || location.powerAccess === 'solar') && location.solarPanelCost && (
                      <div className="text-sm text-gray-300 space-y-1">
                        <div>Solar Panel Installation: ${location.solarPanelCost.toLocaleString()}</div>
                        <div>ROI: {location.solarROI} months to break even</div>
                        <div className="text-xs text-gray-400 mt-2">
                          ☀️ Estimated savings: $200-300/month on electricity
                          <br />
                          🌱 Environmental impact: -2.5 tons CO₂/year
                        </div>
                      </div>
                    )}
                    {location.powerAccess === 'grid' && (
                      <div className="text-sm text-gray-300">
                        Standard electrical connection available. Estimated cost: $150-250/month
                      </div>
                    )}
                    {location.powerAccess === 'hybrid' && (
                      <div className="text-sm text-gray-300">
                        Grid power with solar backup recommended for maximum reliability and cost savings
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {suggestions.length === 0 && !loading && (
        <Card className="p-12 bg-gray-900 border-gray-800 text-center">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-bold text-white mb-2">Enter Your ZIP Code</h3>
          <p className="text-gray-400">
            We'll analyze your area and suggest the best locations for your NEON vending machines,
            including power access information and solar panel recommendations.
          </p>
        </Card>
      )}
    </div>
  );
}
