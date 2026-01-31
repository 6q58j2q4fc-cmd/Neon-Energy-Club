import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Timer,
  MapPin,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';

interface TerritoryData {
  name: string;
  state: string;
  area: number;
  population: number;
  centerLat: number;
  centerLng: number;
  radiusMiles: number;
  licenseFee: number;
}

interface TerritoryReservationProps {
  territory: TerritoryData;
  onReservationComplete?: (reservationId: number) => void;
  onReservationCancel?: () => void;
}

export default function TerritoryReservation({ 
  territory, 
  onReservationComplete,
  onReservationCancel 
}: TerritoryReservationProps) {
  const { user } = useAuth();
  const [isReserving, setIsReserving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Get user's active reservation
  const { data: activeReservation, refetch: refetchReservation } = trpc.territory.getMyReservation.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Create reservation mutation
  const createReservation = trpc.territory.createReservation.useMutation({
    onSuccess: (data) => {
      toast.success('Territory reserved for 48 hours!');
      refetchReservation();
      if (onReservationComplete && data.reservationId) {
        onReservationComplete(data.reservationId);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reserve territory');
    },
  });

  // Cancel reservation mutation
  const cancelReservation = trpc.territory.cancelReservation.useMutation({
    onSuccess: () => {
      toast.success('Reservation cancelled');
      refetchReservation();
      if (onReservationCancel) {
        onReservationCancel();
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel reservation');
    },
  });

  const handleReserve = async () => {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }

    setIsReserving(true);
    try {
      await createReservation.mutateAsync({
        territoryName: territory.name,
        state: territory.state,
        centerLat: territory.centerLat.toString(),
        centerLng: territory.centerLng.toString(),
        radiusMiles: territory.radiusMiles.toString(),
        areaSqMiles: territory.area.toString(),
        population: territory.population,
        licenseFee: territory.licenseFee,
      });
    } finally {
      setIsReserving(false);
    }
  };

  const handleCancel = async () => {
    if (!activeReservation) return;

    setIsCancelling(true);
    try {
      await cancelReservation.mutateAsync({
        reservationId: activeReservation.id,
      });
    } finally {
      setIsCancelling(false);
    }
  };

  // Calculate time remaining for active reservation
  const getTimeRemaining = () => {
    if (!activeReservation) return null;
    
    const expiresAt = new Date(activeReservation.expiresAt);
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    
    if (diffMs <= 0) return { expired: true, hours: 0, minutes: 0 };
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return { expired: false, hours, minutes };
  };

  const timeRemaining = getTimeRemaining();

  // If user has an active reservation
  if (activeReservation && !timeRemaining?.expired) {
    return (
      <Card className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border-emerald-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-400">
            <Shield className="h-5 w-5" />
            Territory Reserved
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-black/30 rounded-lg">
            <CheckCircle className="h-8 w-8 text-emerald-400" />
            <div>
              <p className="text-white font-semibold">{activeReservation.territoryName}</p>
              <p className="text-sm text-gray-400">{activeReservation.state}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-yellow-400" />
              <span className="text-yellow-400 font-medium">Time Remaining</span>
            </div>
            <span className="text-2xl font-bold text-yellow-400">
              {timeRemaining?.hours}h {timeRemaining?.minutes}m
            </span>
          </div>

          <div className="space-y-2 text-sm text-gray-400">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Area: {parseFloat(activeReservation.areaSqMiles as unknown as string).toFixed(2)} sq mi
            </p>
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Reserved: {new Date(activeReservation.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              className="flex-1 bg-emerald-500 hover:bg-emerald-600"
              onClick={() => window.location.href = '/franchise#apply'}
            >
              Complete Application
            </Button>
            <Button 
              variant="outline" 
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Complete your application within 48 hours to secure this territory.
          </p>
        </CardContent>
      </Card>
    );
  }

  // If reservation expired
  if (activeReservation && timeRemaining?.expired) {
    return (
      <Card className="bg-gradient-to-br from-red-500/20 to-orange-500/10 border-red-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Reservation Expired
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-400">
            Your reservation for <strong className="text-white">{activeReservation.territoryName}</strong> has expired.
            The territory is now available for others to claim.
          </p>
          <Button 
            className="w-full bg-emerald-500 hover:bg-emerald-600"
            onClick={handleReserve}
            disabled={isReserving}
          >
            {isReserving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Reserving...
              </>
            ) : (
              'Reserve Again'
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Default: Show reserve option
  return (
    <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border-cyan-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyan-400">
          <Clock className="h-5 w-5" />
          48-Hour Territory Hold
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              {territory.name}, {territory.state}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-black/30 rounded-lg">
              <p className="text-gray-500">Area</p>
              <p className="text-white font-semibold">{territory.area.toFixed(2)} sq mi</p>
            </div>
            <div className="p-3 bg-black/30 rounded-lg">
              <p className="text-gray-500">License Fee</p>
              <p className="text-emerald-400 font-semibold">
                ${territory.licenseFee.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg space-y-2">
          <h4 className="font-semibold text-cyan-400 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            What you get with a reservation:
          </h4>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Territory locked for 48 hours</li>
            <li>• No one else can claim this area</li>
            <li>• Time to complete your application</li>
            <li>• Automatic reminder before expiration</li>
          </ul>
        </div>

        <Button 
          className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600"
          onClick={handleReserve}
          disabled={isReserving}
        >
          {isReserving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Reserving Territory...
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 mr-2" />
              Reserve for 48 Hours
            </>
          )}
        </Button>

        {!user && (
          <p className="text-xs text-gray-500 text-center">
            You'll need to sign in to reserve a territory.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
