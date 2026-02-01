import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Package, Clock, DollarSign, CheckCircle, Loader2, ExternalLink } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface ShippingLabelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
  orderNumber: string;
  onSuccess: () => void;
}

type ShippingCarrier = 'ups' | 'fedex' | 'usps';

interface ShippingRate {
  carrier: ShippingCarrier;
  service: string;
  rate: number;
  currency: string;
  estimatedDays: number;
}

const CARRIER_COLORS: Record<ShippingCarrier, string> = {
  ups: 'bg-amber-900/30 border-amber-600/50 text-amber-400',
  fedex: 'bg-purple-900/30 border-purple-600/50 text-purple-400',
  usps: 'bg-blue-900/30 border-blue-600/50 text-blue-400',
};

const CARRIER_NAMES: Record<ShippingCarrier, string> = {
  ups: 'UPS',
  fedex: 'FedEx',
  usps: 'USPS',
};

export function ShippingLabelModal({ 
  open, 
  onOpenChange, 
  orderId, 
  orderNumber,
  onSuccess 
}: ShippingLabelModalProps) {
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [generatedLabel, setGeneratedLabel] = useState<{
    trackingNumber: string;
    trackingUrl: string;
    cost: number;
  } | null>(null);

  const { data: ratesData, isLoading: loadingRates } = trpc.admin.getShippingRates.useQuery(
    { orderId },
    { enabled: open }
  );

  const generateLabelMutation = trpc.admin.generateShippingLabel.useMutation({
    onSuccess: (data) => {
      setGeneratedLabel({
        trackingNumber: data.trackingNumber,
        trackingUrl: data.trackingUrl,
        cost: data.cost,
      });
      onSuccess();
    },
  });

  const handleGenerateLabel = () => {
    if (!selectedRate) return;
    generateLabelMutation.mutate({
      orderId,
      carrier: selectedRate.carrier,
      service: selectedRate.service,
    });
  };

  const handleClose = () => {
    setSelectedRate(null);
    setGeneratedLabel(null);
    onOpenChange(false);
  };

  // Group rates by carrier
  const groupedRates: Record<ShippingCarrier, ShippingRate[]> = ratesData?.rates.reduce((acc: Record<ShippingCarrier, ShippingRate[]>, rate: ShippingRate) => {
    if (!acc[rate.carrier]) {
      acc[rate.carrier] = [];
    }
    acc[rate.carrier].push(rate);
    return acc;
  }, { ups: [], fedex: [], usps: [] } as Record<ShippingCarrier, ShippingRate[]>) || { ups: [], fedex: [], usps: [] };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Truck className="w-5 h-5 text-[#c8ff00]" />
            Generate Shipping Label
          </DialogTitle>
          <p className="text-zinc-400 text-sm">Order: {orderNumber}</p>
        </DialogHeader>

        {generatedLabel ? (
          <div className="space-y-4">
            <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-400 mb-2">Label Generated Successfully!</h3>
              <p className="text-zinc-400 mb-4">
                Tracking Number: <span className="text-white font-mono">{generatedLabel.trackingNumber}</span>
              </p>
              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  className="border-green-600/50 text-green-400 hover:bg-green-900/30"
                  onClick={() => window.open(generatedLabel.trackingUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Track Package
                </Button>
                <Button
                  className="bg-[#c8ff00] text-black hover:bg-[#b8ef00]"
                  onClick={handleClose}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        ) : loadingRates ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#c8ff00]" />
            <span className="ml-3 text-zinc-400">Loading shipping rates...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Destination Info */}
            {ratesData?.order && (
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardContent className="pt-4">
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Ship To:</h4>
                  <p className="text-white">{ratesData.order.name}</p>
                  <p className="text-zinc-400 text-sm">{ratesData.order.address}</p>
                  <p className="text-zinc-400 text-sm">
                    {ratesData.order.city}, {ratesData.order.state} {ratesData.order.postalCode}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Shipping Options by Carrier */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-zinc-400">Select Shipping Option:</h4>
              
              {(Object.keys(groupedRates) as ShippingCarrier[]).map((carrier) => (
                <div key={carrier} className="space-y-2">
                  <Badge className={`${CARRIER_COLORS[carrier]} border`}>
                    {CARRIER_NAMES[carrier]}
                  </Badge>
                  <div className="grid gap-2">
                    {groupedRates[carrier].map((rate) => (
                      <button
                        key={`${rate.carrier}-${rate.service}`}
                        onClick={() => setSelectedRate(rate)}
                        className={`w-full p-4 rounded-lg border transition-all text-left ${
                          selectedRate?.carrier === rate.carrier && selectedRate?.service === rate.service
                            ? 'border-[#c8ff00] bg-[#c8ff00]/10'
                            : 'border-zinc-700 bg-zinc-800/30 hover:border-zinc-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white">{rate.service}</p>
                            <div className="flex items-center gap-4 mt-1 text-sm text-zinc-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {rate.estimatedDays} day{rate.estimatedDays !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-[#c8ff00]">
                              ${rate.rate.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Generate Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <Button
                variant="outline"
                className="border-zinc-700 text-zinc-400"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#c8ff00] text-black hover:bg-[#b8ef00]"
                disabled={!selectedRate || generateLabelMutation.isPending}
                onClick={handleGenerateLabel}
              >
                {generateLabelMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4 mr-2" />
                    Generate Label {selectedRate && `($${selectedRate.rate.toFixed(2)})`}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
