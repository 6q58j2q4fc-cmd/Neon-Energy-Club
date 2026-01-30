import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Bell, Mail, Users, DollarSign, Gift, Megaphone, Clock, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function NotificationPreferences() {
  const { data: preferences, isLoading, refetch } = trpc.notification.getPreferences.useQuery();
  const updatePreferences = trpc.notification.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success("Preferences saved", {
        description: "Your notification preferences have been updated.",
      });
      refetch();
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message || "Failed to save preferences",
      });
    },
  });

  const [localPrefs, setLocalPrefs] = useState<{
    referrals: boolean;
    commissions: boolean;
    teamUpdates: boolean;
    promotions: boolean;
    orders: boolean;
    announcements: boolean;
    digestFrequency: "none" | "daily" | "weekly";
    digestDay: number;
    digestHour: number;
  } | null>(null);

  // Use local state if available, otherwise use server data
  const currentPrefs = localPrefs || preferences;

  const handleToggle = (key: 'referrals' | 'commissions' | 'teamUpdates' | 'promotions' | 'orders' | 'announcements') => {
    if (!currentPrefs) return;
    setLocalPrefs({
      ...currentPrefs,
      [key]: !currentPrefs[key as keyof typeof currentPrefs],
    } as typeof localPrefs);
  };

  const handleDigestChange = (value: "none" | "daily" | "weekly") => {
    if (!currentPrefs) return;
    setLocalPrefs({
      ...currentPrefs,
      digestFrequency: value,
    } as typeof localPrefs);
  };

  const handleDayChange = (value: string) => {
    if (!currentPrefs) return;
    setLocalPrefs({
      ...currentPrefs,
      digestDay: parseInt(value),
    } as typeof localPrefs);
  };

  const handleHourChange = (value: string) => {
    if (!currentPrefs) return;
    setLocalPrefs({
      ...currentPrefs,
      digestHour: parseInt(value),
    } as typeof localPrefs);
  };

  const handleSave = () => {
    if (!localPrefs) return;
    updatePreferences.mutate(localPrefs);
  };

  const hasChanges = localPrefs !== null;

  if (isLoading) {
    return (
      <Card className="bg-black/40 border-[#c8ff00]/20">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#c8ff00]" />
        </CardContent>
      </Card>
    );
  }

  const days = [
    { value: "0", label: "Sunday" },
    { value: "1", label: "Monday" },
    { value: "2", label: "Tuesday" },
    { value: "3", label: "Wednesday" },
    { value: "4", label: "Thursday" },
    { value: "5", label: "Friday" },
    { value: "6", label: "Saturday" },
  ];

  const hours = Array.from({ length: 24 }, (_, i) => ({
    value: i.toString(),
    label: i === 0 ? "12:00 AM" : i < 12 ? `${i}:00 AM` : i === 12 ? "12:00 PM" : `${i - 12}:00 PM`,
  }));

  return (
    <div className="space-y-6">
      {/* Notification Types */}
      <Card className="bg-black/40 border-[#c8ff00]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Bell className="h-5 w-5 text-[#c8ff00]" />
            Notification Types
          </CardTitle>
          <CardDescription className="text-gray-400">
            Choose which notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-cyan-400" />
              <div>
                <Label className="text-white font-medium">New Referrals</Label>
                <p className="text-sm text-gray-400">Get notified when someone joins using your link</p>
              </div>
            </div>
            <Switch
              checked={currentPrefs?.referrals ?? true}
              onCheckedChange={() => handleToggle("referrals")}
            />
          </div>

          <div className="flex items-center justify-between py-2 border-t border-white/10">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-green-400" />
              <div>
                <Label className="text-white font-medium">Commission Payouts</Label>
                <p className="text-sm text-gray-400">Get notified when you earn commissions</p>
              </div>
            </div>
            <Switch
              checked={currentPrefs?.commissions ?? true}
              onCheckedChange={() => handleToggle("commissions")}
            />
          </div>

          <div className="flex items-center justify-between py-2 border-t border-white/10">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-purple-400" />
              <div>
                <Label className="text-white font-medium">Team Updates</Label>
                <p className="text-sm text-gray-400">Get notified about team member activity and rank changes</p>
              </div>
            </div>
            <Switch
              checked={currentPrefs?.teamUpdates ?? true}
              onCheckedChange={() => handleToggle("teamUpdates")}
            />
          </div>

          <div className="flex items-center justify-between py-2 border-t border-white/10">
            <div className="flex items-center gap-3">
              <Gift className="h-5 w-5 text-pink-400" />
              <div>
                <Label className="text-white font-medium">Promotions</Label>
                <p className="text-sm text-gray-400">Get notified about special offers and promotions</p>
              </div>
            </div>
            <Switch
              checked={currentPrefs?.promotions ?? true}
              onCheckedChange={() => handleToggle("promotions")}
            />
          </div>

          <div className="flex items-center justify-between py-2 border-t border-white/10">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-orange-400" />
              <div>
                <Label className="text-white font-medium">Order Updates</Label>
                <p className="text-sm text-gray-400">Get notified about order status changes</p>
              </div>
            </div>
            <Switch
              checked={currentPrefs?.orders ?? true}
              onCheckedChange={() => handleToggle("orders")}
            />
          </div>

          <div className="flex items-center justify-between py-2 border-t border-white/10">
            <div className="flex items-center gap-3">
              <Megaphone className="h-5 w-5 text-yellow-400" />
              <div>
                <Label className="text-white font-medium">Announcements</Label>
                <p className="text-sm text-gray-400">Get notified about company announcements</p>
              </div>
            </div>
            <Switch
              checked={currentPrefs?.announcements ?? true}
              onCheckedChange={() => handleToggle("announcements")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Digest */}
      <Card className="bg-black/40 border-[#c8ff00]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Mail className="h-5 w-5 text-[#c8ff00]" />
            Email Digest
          </CardTitle>
          <CardDescription className="text-gray-400">
            Receive a summary of notifications instead of individual alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Digest Frequency</Label>
            <Select
              value={currentPrefs?.digestFrequency ?? "none"}
              onValueChange={handleDigestChange}
            >
              <SelectTrigger className="bg-black/40 border-white/20 text-white">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/20">
                <SelectItem value="none" className="text-white hover:bg-white/10">
                  No digest (instant notifications)
                </SelectItem>
                <SelectItem value="daily" className="text-white hover:bg-white/10">
                  Daily digest
                </SelectItem>
                <SelectItem value="weekly" className="text-white hover:bg-white/10">
                  Weekly digest
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {currentPrefs?.digestFrequency === "weekly" && (
            <div className="space-y-2">
              <Label className="text-white">Preferred Day</Label>
              <Select
                value={currentPrefs?.digestDay?.toString() ?? "1"}
                onValueChange={handleDayChange}
              >
                <SelectTrigger className="bg-black/40 border-white/20 text-white">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/20">
                  {days.map((day) => (
                    <SelectItem key={day.value} value={day.value} className="text-white hover:bg-white/10">
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(currentPrefs?.digestFrequency === "daily" || currentPrefs?.digestFrequency === "weekly") && (
            <div className="space-y-2">
              <Label className="text-white flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Preferred Time
              </Label>
              <Select
                value={currentPrefs?.digestHour?.toString() ?? "9"}
                onValueChange={handleHourChange}
              >
                <SelectTrigger className="bg-black/40 border-white/20 text-white">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/20 max-h-60">
                  {hours.map((hour) => (
                    <SelectItem key={hour.value} value={hour.value} className="text-white hover:bg-white/10">
                      {hour.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={updatePreferences.isPending}
            className="bg-[#c8ff00] text-black hover:bg-[#a8df00] font-bold"
          >
            {updatePreferences.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Preferences
          </Button>
        </div>
      )}
    </div>
  );
}
