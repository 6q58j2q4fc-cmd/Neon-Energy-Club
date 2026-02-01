import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { 
  Bell, 
  Users, 
  DollarSign, 
  UserPlus, 
  Megaphone, 
  ShoppingCart, 
  Mail, 
  Clock,
  CheckCircle,
  Loader2,
  ArrowLeft,
  AlertTriangle
} from "lucide-react";

const DAYS_OF_WEEK = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i.toString(),
  label: i === 0 ? "12:00 AM" : i < 12 ? `${i}:00 AM` : i === 12 ? "12:00 PM" : `${i - 12}:00 PM`,
}));

export default function NotificationPreferences() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [referrals, setReferrals] = useState(true);
  const [commissions, setCommissions] = useState(true);
  const [teamUpdates, setTeamUpdates] = useState(true);
  const [promotions, setPromotions] = useState(true);
  const [orders, setOrders] = useState(true);
  const [announcements, setAnnouncements] = useState(true);
  const [digestFrequency, setDigestFrequency] = useState<"none" | "daily" | "weekly">("none");
  const [digestDay, setDigestDay] = useState("1");
  const [digestHour, setDigestHour] = useState("9");

  // Fetch current preferences
  const { data: preferences, isLoading } = trpc.notification.getPreferences.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Update preferences mutation
  const updatePreferences = trpc.notification.updatePreferences.useMutation({
    onSuccess: () => {
      setSaved(true);
      setError('');
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (err) => {
      setError(err.message);
      setSaved(false);
    },
  });

  // Load preferences into form
  useEffect(() => {
    if (preferences) {
      setReferrals(preferences.referrals);
      setCommissions(preferences.commissions);
      setTeamUpdates(preferences.teamUpdates);
      setPromotions(preferences.promotions);
      setOrders(preferences.orders);
      setAnnouncements(preferences.announcements);
      setDigestFrequency(preferences.digestFrequency);
      setDigestDay(preferences.digestDay?.toString() || "1");
      setDigestHour(preferences.digestHour?.toString() || "9");
    }
  }, [preferences]);

  const handleSave = () => {
    updatePreferences.mutate({
      referrals,
      commissions,
      teamUpdates,
      promotions,
      orders,
      announcements,
      digestFrequency,
      digestDay: parseInt(digestDay),
      digestHour: parseInt(digestHour),
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#c8ff00]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-900/80 border-gray-800">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Login Required</h2>
            <p className="text-gray-400 mb-4">Please log in to manage your notification preferences.</p>
            <Button onClick={() => setLocation('/')} className="bg-[#c8ff00] text-black hover:bg-[#a8e600]">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/distributor-portal')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Bell className="h-6 w-6 text-[#c8ff00]" />
              Notification Preferences
            </h1>
            <p className="text-gray-400">Choose which notifications you want to receive</p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {saved && (
          <Alert className="bg-green-500/10 border-green-500/30">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-400">
              Your preferences have been saved successfully!
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="bg-red-500/10 border-red-500/30">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {/* Notification Types */}
        <Card className="bg-gray-900/80 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Email Notifications</CardTitle>
            <CardDescription className="text-gray-400">
              Select which types of notifications you'd like to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Referrals */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <UserPlus className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <Label className="text-white font-medium">New Referrals</Label>
                  <p className="text-sm text-gray-400">Get notified when someone joins using your link</p>
                </div>
              </div>
              <Switch
                checked={referrals}
                onCheckedChange={setReferrals}
                className="data-[state=checked]:bg-[#c8ff00]"
              />
            </div>

            <Separator className="bg-gray-800" />

            {/* Commissions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <DollarSign className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <Label className="text-white font-medium">Commission Payouts</Label>
                  <p className="text-sm text-gray-400">Get notified when you earn commissions</p>
                </div>
              </div>
              <Switch
                checked={commissions}
                onCheckedChange={setCommissions}
                className="data-[state=checked]:bg-[#c8ff00]"
              />
            </div>

            <Separator className="bg-gray-800" />

            {/* Team Updates */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <Label className="text-white font-medium">Team Updates</Label>
                  <p className="text-sm text-gray-400">New team members, rank changes, and milestones</p>
                </div>
              </div>
              <Switch
                checked={teamUpdates}
                onCheckedChange={setTeamUpdates}
                className="data-[state=checked]:bg-[#c8ff00]"
              />
            </div>

            <Separator className="bg-gray-800" />

            {/* Orders */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <Label className="text-white font-medium">Order Updates</Label>
                  <p className="text-sm text-gray-400">Order confirmations, shipping, and delivery</p>
                </div>
              </div>
              <Switch
                checked={orders}
                onCheckedChange={setOrders}
                className="data-[state=checked]:bg-[#c8ff00]"
              />
            </div>

            <Separator className="bg-gray-800" />

            {/* Promotions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-500/20 rounded-lg">
                  <Megaphone className="h-5 w-5 text-pink-400" />
                </div>
                <div>
                  <Label className="text-white font-medium">Promotions & Offers</Label>
                  <p className="text-sm text-gray-400">Special deals, contests, and limited-time offers</p>
                </div>
              </div>
              <Switch
                checked={promotions}
                onCheckedChange={setPromotions}
                className="data-[state=checked]:bg-[#c8ff00]"
              />
            </div>

            <Separator className="bg-gray-800" />

            {/* Announcements */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Bell className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <Label className="text-white font-medium">System Announcements</Label>
                  <p className="text-sm text-gray-400">Important updates and platform news</p>
                </div>
              </div>
              <Switch
                checked={announcements}
                onCheckedChange={setAnnouncements}
                className="data-[state=checked]:bg-[#c8ff00]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Digest Settings */}
        <Card className="bg-gray-900/80 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Mail className="h-5 w-5 text-[#c8ff00]" />
              Email Digest
            </CardTitle>
            <CardDescription className="text-gray-400">
              Receive a summary of your notifications instead of individual emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-gray-300">Digest Frequency</Label>
              <Select value={digestFrequency} onValueChange={(v: "none" | "daily" | "weekly") => setDigestFrequency(v)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="none" className="text-white">No digest (receive individual emails)</SelectItem>
                  <SelectItem value="daily" className="text-white">Daily digest</SelectItem>
                  <SelectItem value="weekly" className="text-white">Weekly digest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {digestFrequency !== "none" && (
              <div className="grid grid-cols-2 gap-4">
                {digestFrequency === "weekly" && (
                  <div className="space-y-2">
                    <Label className="text-gray-300">Day of Week</Label>
                    <Select value={digestDay} onValueChange={setDigestDay}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {DAYS_OF_WEEK.map((day) => (
                          <SelectItem key={day.value} value={day.value} className="text-white">
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-gray-300">Time</Label>
                  <Select value={digestHour} onValueChange={setDigestHour}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 max-h-[200px]">
                      {HOURS.map((hour) => (
                        <SelectItem key={hour.value} value={hour.value} className="text-white">
                          {hour.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {digestFrequency !== "none" && (
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 flex items-start gap-3">
                <Clock className="h-5 w-5 text-[#c8ff00] mt-0.5" />
                <div>
                  <p className="text-sm text-white font-medium">
                    {digestFrequency === "daily" 
                      ? `You'll receive a daily digest at ${HOURS.find(h => h.value === digestHour)?.label}`
                      : `You'll receive a weekly digest every ${DAYS_OF_WEEK.find(d => d.value === digestDay)?.label} at ${HOURS.find(h => h.value === digestHour)?.label}`
                    }
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Individual notifications will be bundled into a single email summary
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => setLocation('/distributor-portal')}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updatePreferences.isPending}
            className="bg-[#c8ff00] text-black hover:bg-[#a8e600]"
          >
            {updatePreferences.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
