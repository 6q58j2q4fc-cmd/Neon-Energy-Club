import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Package, Calendar, CreditCard, Truck, Plus, Minus, Pause, Play, X, RefreshCw, Check } from "lucide-react";

// NEON Products available for autoship
const AUTOSHIP_PRODUCTS = [
  { sku: "NEON-24PK-MIXED", name: "24-Pack Mixed Flavors", pvPerUnit: 24, pricePerUnit: 7200 },
  { sku: "NEON-24PK-ORIGINAL", name: "24-Pack Original", pvPerUnit: 24, pricePerUnit: 7200 },
  { sku: "NEON-24PK-TROPICAL", name: "24-Pack Tropical Surge", pvPerUnit: 24, pricePerUnit: 7200 },
  { sku: "NEON-24PK-BERRY", name: "24-Pack Berry Blast", pvPerUnit: 24, pricePerUnit: 7200 },
  { sku: "NEON-12PK-MIXED", name: "12-Pack Mixed Flavors", pvPerUnit: 12, pricePerUnit: 4200 },
  { sku: "NEON-12PK-ORIGINAL", name: "12-Pack Original", pvPerUnit: 12, pricePerUnit: 4200 },
];

interface AutoshipItem {
  id: number;
  autoshipId: number;
  productSku: string;
  productName: string;
  quantity: number;
  pvPerUnit: number;
  pricePerUnit: number;
}

interface Autoship {
  id: number;
  distributorId: number;
  userId: number;
  name: string | null;
  status: "active" | "paused" | "cancelled";
  processDay: number;
  totalPrice: number;
  paymentMethodId: string | null;
  shippingAddress1: string | null;
  shippingAddress2: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;
  nextProcessDate: Date | null;
  lastProcessedDate: Date | null;
  successfulOrders: number | null;
  failedAttempts: number | null;
  items: AutoshipItem[];
}

export function AutoshipManager() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAutoship, setSelectedAutoship] = useState<Autoship | null>(null);
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);

  // Form state for new autoship
  const [newAutoship, setNewAutoship] = useState({
    name: "Monthly Autoship",
    processDay: 1,
    shippingAddress1: "",
    shippingAddress2: "",
    shippingCity: "",
    shippingState: "",
    shippingPostalCode: "",
    shippingCountry: "USA",
  });

  const utils = trpc.useUtils();
  const { data: autoships, isLoading } = trpc.distributor.getAutoships.useQuery();

  const createAutoshipMutation = trpc.distributor.createAutoship.useMutation({
    onSuccess: () => {
      toast.success("Autoship created successfully!");
      setShowCreateDialog(false);
      utils.distributor.getAutoships.invalidate();
      setNewAutoship({
        name: "Monthly Autoship",
        processDay: 1,
        shippingAddress1: "",
        shippingAddress2: "",
        shippingCity: "",
        shippingState: "",
        shippingPostalCode: "",
        shippingCountry: "USA",
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateAutoshipMutation = trpc.distributor.updateAutoship.useMutation({
    onSuccess: () => {
      toast.success("Autoship updated!");
      utils.distributor.getAutoships.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const addItemMutation = trpc.distributor.addAutoshipItem.useMutation({
    onSuccess: () => {
      toast.success("Product added to autoship!");
      setShowAddProductDialog(false);
      utils.distributor.getAutoships.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeItemMutation = trpc.distributor.removeAutoshipItem.useMutation({
    onSuccess: () => {
      toast.success("Product removed from autoship");
      utils.distributor.getAutoships.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateQuantityMutation = trpc.distributor.updateAutoshipItemQuantity.useMutation({
    onSuccess: () => {
      utils.distributor.getAutoships.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreateAutoship = () => {
    if (!newAutoship.shippingAddress1 || !newAutoship.shippingCity || !newAutoship.shippingState || !newAutoship.shippingPostalCode) {
      toast.error("Please fill in all required shipping fields");
      return;
    }
    createAutoshipMutation.mutate(newAutoship);
  };

  const handleToggleStatus = (autoship: Autoship) => {
    const newStatus = autoship.status === "active" ? "paused" : "active";
    updateAutoshipMutation.mutate({
      autoshipId: autoship.id,
      status: newStatus,
    });
  };

  const handleCancelAutoship = (autoship: Autoship) => {
    if (confirm("Are you sure you want to cancel this autoship? This action cannot be undone.")) {
      updateAutoshipMutation.mutate({
        autoshipId: autoship.id,
        status: "cancelled",
      });
    }
  };

  const handleAddProduct = (product: typeof AUTOSHIP_PRODUCTS[0]) => {
    if (!selectedAutoship) return;
    addItemMutation.mutate({
      autoshipId: selectedAutoship.id,
      productSku: product.sku,
      productName: product.name,
      quantity: 1,
      pvPerUnit: product.pvPerUnit,
      pricePerUnit: product.pricePerUnit,
    });
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const formatDate = (date: Date | null) => date ? new Date(date).toLocaleDateString() : "N/A";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-[#39FF14]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Autoship Management</h2>
          <p className="text-gray-400">Set up recurring monthly orders to maintain your 48 PV activity requirement</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#39FF14] text-black hover:bg-[#39FF14]/80">
              <Plus className="h-4 w-4 mr-2" />
              Create Autoship
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Autoship</DialogTitle>
              <DialogDescription className="text-gray-400">
                Set up a recurring monthly order to maintain your distributor activity.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-gray-300">Autoship Name</Label>
                <Input
                  value={newAutoship.name}
                  onChange={(e) => setNewAutoship({ ...newAutoship, name: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Monthly Autoship"
                />
              </div>
              <div>
                <Label className="text-gray-300">Process Day (1-28)</Label>
                <Select
                  value={newAutoship.processDay.toString()}
                  onValueChange={(v) => setNewAutoship({ ...newAutoship, processDay: parseInt(v) })}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={day.toString()} className="text-white">
                        {day}{day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th"} of each month
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-white font-medium mb-3">Shipping Address</h4>
                <div className="space-y-3">
                  <Input
                    value={newAutoship.shippingAddress1}
                    onChange={(e) => setNewAutoship({ ...newAutoship, shippingAddress1: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Address Line 1 *"
                  />
                  <Input
                    value={newAutoship.shippingAddress2}
                    onChange={(e) => setNewAutoship({ ...newAutoship, shippingAddress2: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Address Line 2 (optional)"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      value={newAutoship.shippingCity}
                      onChange={(e) => setNewAutoship({ ...newAutoship, shippingCity: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="City *"
                    />
                    <Input
                      value={newAutoship.shippingState}
                      onChange={(e) => setNewAutoship({ ...newAutoship, shippingState: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="State *"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      value={newAutoship.shippingPostalCode}
                      onChange={(e) => setNewAutoship({ ...newAutoship, shippingPostalCode: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="ZIP Code *"
                    />
                    <Input
                      value={newAutoship.shippingCountry}
                      onChange={(e) => setNewAutoship({ ...newAutoship, shippingCountry: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>
              <Button
                onClick={handleCreateAutoship}
                disabled={createAutoshipMutation.isPending}
                className="w-full bg-[#39FF14] text-black hover:bg-[#39FF14]/80"
              >
                {createAutoshipMutation.isPending ? "Creating..." : "Create Autoship"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Activity Requirement Notice */}
      <Card className="bg-gradient-to-r from-[#39FF14]/10 to-transparent border-[#39FF14]/30">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#39FF14]/20 rounded-full">
              <Check className="h-5 w-5 text-[#39FF14]" />
            </div>
            <div>
              <p className="text-white font-medium">Monthly Activity Requirement: 48 PV</p>
              <p className="text-gray-400 text-sm">Order at least 2x 24-packs (48 PV) monthly to stay active and earn commissions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Autoships List */}
      {!autoships || autoships.length === 0 ? (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Autoships Yet</h3>
            <p className="text-gray-400 mb-4">Create an autoship to automatically maintain your monthly PV requirement</p>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-[#39FF14] text-black hover:bg-[#39FF14]/80">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Autoship
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {autoships.map((autoship) => (
            <Card key={autoship.id} className="bg-gray-900/50 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-white">{autoship.name || "Autoship"}</CardTitle>
                    <Badge
                      variant={autoship.status === "active" ? "default" : autoship.status === "paused" ? "secondary" : "destructive"}
                      className={
                        autoship.status === "active"
                          ? "bg-[#39FF14]/20 text-[#39FF14]"
                          : autoship.status === "paused"
                          ? "bg-yellow-500/20 text-yellow-500"
                          : "bg-red-500/20 text-red-500"
                      }
                    >
                      {autoship.status.charAt(0).toUpperCase() + autoship.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {autoship.status !== "cancelled" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(autoship)}
                          className="border-gray-600 text-gray-300 hover:bg-gray-800"
                        >
                          {autoship.status === "active" ? (
                            <>
                              <Pause className="h-4 w-4 mr-1" /> Pause
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-1" /> Resume
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelAutoship(autoship)}
                          className="border-red-600 text-red-400 hover:bg-red-900/20"
                        >
                          <X className="h-4 w-4 mr-1" /> Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <CardDescription className="text-gray-400 flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Processes on the {autoship.processDay}{autoship.processDay === 1 ? "st" : autoship.processDay === 2 ? "nd" : autoship.processDay === 3 ? "rd" : "th"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Truck className="h-4 w-4" />
                    {autoship.shippingCity}, {autoship.shippingState}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-[#39FF14]">{autoship.totalPv}</p>
                    <p className="text-xs text-gray-400">Total PV</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-white">{formatPrice(autoship.totalPrice)}</p>
                    <p className="text-xs text-gray-400">Monthly Cost</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-white">{formatDate(autoship.nextProcessDate)}</p>
                    <p className="text-xs text-gray-400">Next Order</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-white">{autoship.successfulOrders}</p>
                    <p className="text-xs text-gray-400">Orders Completed</p>
                  </div>
                </div>

                {/* PV Status */}
                {autoship.totalPv < 48 && autoship.status === "active" && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
                    <p className="text-yellow-500 text-sm">
                      ⚠️ Your autoship has {autoship.totalPv} PV. Add more products to meet the 48 PV activity requirement.
                    </p>
                  </div>
                )}
                {autoship.totalPv >= 48 && autoship.status === "active" && (
                  <div className="bg-[#39FF14]/10 border border-[#39FF14]/30 rounded-lg p-3 mb-4">
                    <p className="text-[#39FF14] text-sm">
                      ✓ Your autoship meets the 48 PV activity requirement!
                    </p>
                  </div>
                )}

                {/* Products */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-medium">Products</h4>
                    {autoship.status !== "cancelled" && (
                      <Dialog open={showAddProductDialog && selectedAutoship?.id === autoship.id} onOpenChange={(open) => {
                        setShowAddProductDialog(open);
                        if (open) setSelectedAutoship(autoship);
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                            <Plus className="h-4 w-4 mr-1" /> Add Product
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900 border-gray-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">Add Product to Autoship</DialogTitle>
                            <DialogDescription className="text-gray-400">
                              Select a product to add to your monthly autoship order.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-3 mt-4">
                            {AUTOSHIP_PRODUCTS.map((product) => (
                              <button
                                key={product.sku}
                                onClick={() => handleAddProduct(product)}
                                disabled={addItemMutation.isPending}
                                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-left"
                              >
                                <div>
                                  <p className="text-white font-medium">{product.name}</p>
                                  <p className="text-gray-400 text-sm">{product.pvPerUnit} PV</p>
                                </div>
                                <p className="text-[#39FF14] font-bold">{formatPrice(product.pricePerUnit)}</p>
                              </button>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>

                  {autoship.items.length === 0 ? (
                    <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                      <p className="text-gray-400">No products added yet. Add products to start your autoship.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {autoship.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                          <div className="flex-1">
                            <p className="text-white">{item.productName}</p>
                            <p className="text-gray-400 text-sm">{item.pvPerUnit} PV × {item.quantity} = {item.pvPerUnit * item.quantity} PV</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 border-gray-600"
                                onClick={() => {
                                  if (item.quantity > 1) {
                                    updateQuantityMutation.mutate({ itemId: item.id, quantity: item.quantity - 1 });
                                  }
                                }}
                                disabled={item.quantity <= 1 || autoship.status === "cancelled"}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="text-white w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 border-gray-600"
                                onClick={() => {
                                  updateQuantityMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 });
                                }}
                                disabled={autoship.status === "cancelled"}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-white font-medium w-20 text-right">
                              {formatPrice(item.pricePerUnit * item.quantity)}
                            </p>
                            {autoship.status !== "cancelled" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                onClick={() => removeItemMutation.mutate({ itemId: item.id })}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
