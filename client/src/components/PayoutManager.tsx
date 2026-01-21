import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { DollarSign, CreditCard, Building2, Mail, Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw, Wallet, ArrowUpRight, Settings } from "lucide-react";

export function PayoutManager() {
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [requestAmount, setRequestAmount] = useState("");

  const utils = trpc.useUtils();
  const { data: settings, isLoading: settingsLoading } = trpc.distributor.getPayoutSettings.useQuery();
  const { data: requests, isLoading: requestsLoading } = trpc.distributor.getPayoutRequests.useQuery();
  const { data: history, isLoading: historyLoading } = trpc.distributor.getPayoutHistory.useQuery();
  const { data: commissions } = trpc.distributor.commissions.useQuery();

  const updateSettingsMutation = trpc.distributor.updatePayoutSettings.useMutation({
    onSuccess: () => {
      toast.success("Payout settings updated!");
      setShowSettingsDialog(false);
      utils.distributor.getPayoutSettings.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const requestPayoutMutation = trpc.distributor.requestPayout.useMutation({
    onSuccess: () => {
      toast.success("Payout request submitted!");
      setShowRequestDialog(false);
      setRequestAmount("");
      utils.distributor.getPayoutRequests.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [settingsForm, setSettingsForm] = useState({
    payoutMethod: settings?.payoutMethod || "stripe_connect",
    paypalEmail: settings?.paypalEmail || "",
    minimumPayout: settings?.minimumPayout || 5000,
    payoutFrequency: settings?.payoutFrequency || "weekly",
    checkMailingAddress: settings?.checkMailingAddress || "",
  });

  const handleRequestPayout = () => {
    const amount = Math.round(parseFloat(requestAmount) * 100);
    if (isNaN(amount) || amount < 1000) {
      toast.error("Minimum payout is $10.00");
      return;
    }
    if (commissions && amount > commissions.availableBalance) {
      toast.error("Amount exceeds available balance");
      return;
    }
    requestPayoutMutation.mutate({ amount });
  };

  const handleUpdateSettings = () => {
    updateSettingsMutation.mutate(settingsForm);
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const formatDate = (date: Date | string | null) => date ? new Date(date).toLocaleDateString() : "N/A";

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      pending: { bg: "bg-yellow-500/20", text: "text-yellow-500", icon: <Clock className="h-3 w-3" /> },
      approved: { bg: "bg-blue-500/20", text: "text-blue-500", icon: <CheckCircle2 className="h-3 w-3" /> },
      processing: { bg: "bg-purple-500/20", text: "text-purple-500", icon: <RefreshCw className="h-3 w-3 animate-spin" /> },
      completed: { bg: "bg-[#39FF14]/20", text: "text-[#39FF14]", icon: <CheckCircle2 className="h-3 w-3" /> },
      failed: { bg: "bg-red-500/20", text: "text-red-500", icon: <XCircle className="h-3 w-3" /> },
      cancelled: { bg: "bg-gray-500/20", text: "text-gray-500", icon: <XCircle className="h-3 w-3" /> },
    };
    const style = styles[status] || styles.pending;
    return (
      <Badge className={`${style.bg} ${style.text} flex items-center gap-1`}>
        {style.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "stripe_connect":
        return <CreditCard className="h-4 w-4" />;
      case "paypal":
        return <Wallet className="h-4 w-4" />;
      case "bank_transfer":
        return <Building2 className="h-4 w-4" />;
      case "check":
        return <Mail className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const isLoading = settingsLoading || requestsLoading || historyLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-[#39FF14]" />
      </div>
    );
  }

  const availableBalance = commissions?.availableBalance || 0;
  const minimumPayout = settings?.minimumPayout || 5000;
  const canRequestPayout = availableBalance >= minimumPayout;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Commission Payouts</h2>
          <p className="text-gray-400">Request payouts and manage your payment preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white">Payout Settings</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Configure how you want to receive your commission payouts.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-gray-300">Payout Method</Label>
                  <Select
                    value={settingsForm.payoutMethod}
                    onValueChange={(v) => setSettingsForm({ ...settingsForm, payoutMethod: v as any })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="stripe_connect" className="text-white">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" /> Stripe Connect (Instant)
                        </div>
                      </SelectItem>
                      <SelectItem value="paypal" className="text-white">
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4" /> PayPal
                        </div>
                      </SelectItem>
                      <SelectItem value="bank_transfer" className="text-white">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" /> Bank Transfer (ACH)
                        </div>
                      </SelectItem>
                      <SelectItem value="check" className="text-white">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" /> Check by Mail
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {settingsForm.payoutMethod === "paypal" && (
                  <div>
                    <Label className="text-gray-300">PayPal Email</Label>
                    <Input
                      type="email"
                      value={settingsForm.paypalEmail}
                      onChange={(e) => setSettingsForm({ ...settingsForm, paypalEmail: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="your@email.com"
                    />
                  </div>
                )}

                {settingsForm.payoutMethod === "check" && (
                  <div>
                    <Label className="text-gray-300">Mailing Address</Label>
                    <Input
                      value={settingsForm.checkMailingAddress}
                      onChange={(e) => setSettingsForm({ ...settingsForm, checkMailingAddress: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Full mailing address"
                    />
                  </div>
                )}

                <div>
                  <Label className="text-gray-300">Minimum Payout</Label>
                  <Select
                    value={settingsForm.minimumPayout.toString()}
                    onValueChange={(v) => setSettingsForm({ ...settingsForm, minimumPayout: parseInt(v) })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="1000" className="text-white">$10.00</SelectItem>
                      <SelectItem value="2500" className="text-white">$25.00</SelectItem>
                      <SelectItem value="5000" className="text-white">$50.00</SelectItem>
                      <SelectItem value="10000" className="text-white">$100.00</SelectItem>
                      <SelectItem value="25000" className="text-white">$250.00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-300">Payout Frequency</Label>
                  <Select
                    value={settingsForm.payoutFrequency}
                    onValueChange={(v) => setSettingsForm({ ...settingsForm, payoutFrequency: v as any })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="weekly" className="text-white">Weekly</SelectItem>
                      <SelectItem value="biweekly" className="text-white">Bi-weekly</SelectItem>
                      <SelectItem value="monthly" className="text-white">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-gray-400 text-sm">
                    <strong className="text-white">Processing Fees:</strong><br />
                    • Stripe Connect: 2.5%<br />
                    • PayPal: 2.5%<br />
                    • Bank Transfer: 2.5%<br />
                    • Check: Free (no fee)
                  </p>
                </div>

                <Button
                  onClick={handleUpdateSettings}
                  disabled={updateSettingsMutation.isPending}
                  className="w-full bg-[#39FF14] text-black hover:bg-[#39FF14]/80"
                >
                  {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
            <DialogTrigger asChild>
              <Button
                className="bg-[#39FF14] text-black hover:bg-[#39FF14]/80"
                disabled={!canRequestPayout}
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Request Payout
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white">Request Payout</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Enter the amount you'd like to withdraw from your available balance.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-sm">Available Balance</p>
                  <p className="text-3xl font-bold text-[#39FF14]">{formatPrice(availableBalance)}</p>
                </div>

                <div>
                  <Label className="text-gray-300">Amount to Withdraw</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="10"
                      max={availableBalance / 100}
                      value={requestAmount}
                      onChange={(e) => setRequestAmount(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white pl-7"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-gray-500 text-xs mt-1">
                    Minimum: {formatPrice(minimumPayout)} | Maximum: {formatPrice(availableBalance)}
                  </p>
                </div>

                {requestAmount && parseFloat(requestAmount) > 0 && (
                  <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Withdrawal Amount</span>
                      <span className="text-white">${parseFloat(requestAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Processing Fee (2.5%)</span>
                      <span className="text-red-400">-${(parseFloat(requestAmount) * 0.025).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-700 pt-2 flex justify-between">
                      <span className="text-gray-300 font-medium">You'll Receive</span>
                      <span className="text-[#39FF14] font-bold">
                        ${(parseFloat(requestAmount) * 0.975).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2 text-sm text-gray-400">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>
                    Payouts are processed {settings?.payoutFrequency || "weekly"}. Your payout method is{" "}
                    <strong className="text-white">
                      {settings?.payoutMethod?.replace("_", " ") || "Stripe Connect"}
                    </strong>.
                  </p>
                </div>

                <Button
                  onClick={handleRequestPayout}
                  disabled={requestPayoutMutation.isPending || !requestAmount || parseFloat(requestAmount) < 10}
                  className="w-full bg-[#39FF14] text-black hover:bg-[#39FF14]/80"
                >
                  {requestPayoutMutation.isPending ? "Processing..." : "Submit Request"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-[#39FF14]/10 to-transparent border-[#39FF14]/30">
        <CardContent className="py-6">
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Available Balance</p>
              <p className="text-3xl font-bold text-[#39FF14]">{formatPrice(availableBalance)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Total Earnings</p>
              <p className="text-3xl font-bold text-white">{formatPrice(commissions?.totalEarnings || 0)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Pending Payouts</p>
              <p className="text-3xl font-bold text-yellow-500">
                {formatPrice(requests?.filter(r => r.status === "pending" || r.status === "approved" || r.status === "processing").reduce((sum, r) => sum + r.amount, 0) || 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Total Paid Out</p>
              <p className="text-3xl font-bold text-white">
                {formatPrice(history?.reduce((sum, h) => sum + h.amount, 0) || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList className="bg-gray-800/50 border border-gray-700">
          <TabsTrigger value="requests" className="data-[state=active]:bg-[#39FF14] data-[state=active]:text-black">
            Payout Requests
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-[#39FF14] data-[state=active]:text-black">
            Payout History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Payout Requests</CardTitle>
              <CardDescription className="text-gray-400">Track the status of your payout requests</CardDescription>
            </CardHeader>
            <CardContent>
              {!requests || requests.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No payout requests yet</p>
                  <p className="text-gray-500 text-sm">Request a payout when you have at least {formatPrice(minimumPayout)} available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-700 rounded-lg">
                          {getMethodIcon(request.payoutMethod)}
                        </div>
                        <div>
                          <p className="text-white font-medium">{formatPrice(request.amount)}</p>
                          <p className="text-gray-400 text-sm">
                            Requested {formatDate(request.createdAt)} via {request.payoutMethod.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-gray-400 text-sm">Net Amount</p>
                          <p className="text-[#39FF14] font-medium">{formatPrice(request.netAmount)}</p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Payout History</CardTitle>
              <CardDescription className="text-gray-400">Completed payouts to your account</CardDescription>
            </CardHeader>
            <CardContent>
              {!history || history.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No completed payouts yet</p>
                  <p className="text-gray-500 text-sm">Completed payouts will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-[#39FF14]/20 rounded-lg">
                          <CheckCircle2 className="h-5 w-5 text-[#39FF14]" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{formatPrice(payout.amount)}</p>
                          <p className="text-gray-400 text-sm">
                            Paid {formatDate(payout.createdAt)} via {payout.payoutMethod.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                      {payout.transactionRef && (
                        <p className="text-gray-500 text-sm font-mono">{payout.transactionRef}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
