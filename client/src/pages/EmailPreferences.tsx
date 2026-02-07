import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mail, Bell, DollarSign, TrendingUp, ShoppingCart, Loader2, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import NavigationHeader from "@/components/NavigationHeader";

export default function EmailPreferences() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Email preference states
  const [emailPrefs, setEmailPrefs] = useState({
    orderUpdates: true,
    referralNotifications: true,
    commissionAlerts: true,
    crowdfundingMilestones: true,
    marketingEmails: true,
    newsletter: true,
  });

  // SMS preference states
  const [smsPrefs, setSmsPrefs] = useState({
    orderShipped: false,
    referralRewards: false,
    commissionEarned: false,
    autoShipReminders: false,
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSavePreferences = async () => {
    setIsSaving(true);
    setIsSaved(false);

    try {
      // TODO: Implement API call to save preferences
      // await trpc.user.updateNotificationPreferences.mutate({
      //   email: emailPrefs,
      //   sms: smsPrefs,
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsSaved(true);
      toast.success("Preferences saved successfully!");

      // Reset saved state after 3 seconds
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      toast.error("Failed to save preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />

      <div className="container max-w-4xl py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Notification Preferences</h1>
          <p className="text-muted-foreground">
            Manage how you receive updates from NEON Energy
          </p>
        </div>

        <div className="space-y-6">
          {/* Email Preferences */}
          <Card as any>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Mail className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>
                    Choose which email notifications you'd like to receive
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Updates */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="order-updates" className="font-medium">
                      Order Updates
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive emails when your order is confirmed, shipped, or delivered
                  </p>
                </div>
                <Switch
                  id="order-updates"
                  checked={emailPrefs.orderUpdates}
                  onCheckedChange={(checked) =>
                    setEmailPrefs({ ...emailPrefs, orderUpdates: checked })
                  }
                />
              </div>

              <Separator />

              {/* Referral Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="referral-notifications" className="font-medium">
                      Referral Notifications
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Get notified when someone uses your referral link or when you earn rewards
                  </p>
                </div>
                <Switch
                  id="referral-notifications"
                  checked={emailPrefs.referralNotifications}
                  onCheckedChange={(checked) =>
                    setEmailPrefs({ ...emailPrefs, referralNotifications: checked })
                  }
                />
              </div>

              <Separator />

              {/* Commission Alerts */}
              {user.role === "admin" && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="commission-alerts" className="font-medium">
                          Commission Alerts
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Receive emails when you earn commissions or when payouts are processed
                      </p>
                    </div>
                    <Switch
                      id="commission-alerts"
                      checked={emailPrefs.commissionAlerts}
                      onCheckedChange={(checked) =>
                        setEmailPrefs({ ...emailPrefs, commissionAlerts: checked })
                      }
                    />
                  </div>
                  <Separator />
                </>
              )}

              {/* Crowdfunding Milestones */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="crowdfunding-milestones" className="font-medium">
                      Crowdfunding Milestones
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Get updates when we reach major crowdfunding goals and milestones
                  </p>
                </div>
                <Switch
                  id="crowdfunding-milestones"
                  checked={emailPrefs.crowdfundingMilestones}
                  onCheckedChange={(checked) =>
                    setEmailPrefs({ ...emailPrefs, crowdfundingMilestones: checked })
                  }
                />
              </div>

              <Separator />

              {/* Marketing Emails */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="marketing-emails" className="font-medium">
                      Marketing Emails
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive promotional offers, product launches, and special deals
                  </p>
                </div>
                <Switch
                  id="marketing-emails"
                  checked={emailPrefs.marketingEmails}
                  onCheckedChange={(checked) =>
                    setEmailPrefs({ ...emailPrefs, marketingEmails: checked })
                  }
                />
              </div>

              <Separator />

              {/* Newsletter */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="newsletter" className="font-medium">
                      Newsletter
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Monthly newsletter with company updates, tips, and success stories
                  </p>
                </div>
                <Switch
                  id="newsletter"
                  checked={emailPrefs.newsletter}
                  onCheckedChange={(checked) =>
                    setEmailPrefs({ ...emailPrefs, newsletter: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* SMS Preferences */}
          <Card as any>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Bell className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>SMS Notifications</CardTitle>
                  <CardDescription>
                    Get instant text message alerts for important updates
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Shipped */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-order-shipped" className="font-medium">
                    Order Shipped
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Text me when my order ships with tracking information
                  </p>
                </div>
                <Switch
                  id="sms-order-shipped"
                  checked={smsPrefs.orderShipped}
                  onCheckedChange={(checked) =>
                    setSmsPrefs({ ...smsPrefs, orderShipped: checked })
                  }
                />
              </div>

              <Separator />

              {/* Referral Rewards */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-referral-rewards" className="font-medium">
                    Referral Rewards
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Text me when I earn referral rewards
                  </p>
                </div>
                <Switch
                  id="sms-referral-rewards"
                  checked={smsPrefs.referralRewards}
                  onCheckedChange={(checked) =>
                    setSmsPrefs({ ...smsPrefs, referralRewards: checked })
                  }
                />
              </div>

              <Separator />

              {/* Commission Earned */}
              {user.role === "admin" && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sms-commission-earned" className="font-medium">
                        Commission Earned
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Text me when I earn commissions
                      </p>
                    </div>
                    <Switch
                      id="sms-commission-earned"
                      checked={smsPrefs.commissionEarned}
                      onCheckedChange={(checked) =>
                        setSmsPrefs({ ...smsPrefs, commissionEarned: checked })
                      }
                    />
                  </div>
                  <Separator />
                </>
              )}

              {/* Auto-Ship Reminders */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-autoship-reminders" className="font-medium">
                    Auto-Ship Reminders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Text me 3 days before my auto-ship renewal
                  </p>
                </div>
                <Switch
                  id="sms-autoship-reminders"
                  checked={smsPrefs.autoShipReminders}
                  onCheckedChange={(checked) =>
                    setSmsPrefs({ ...smsPrefs, autoShipReminders: checked })
                  }
                />
              </div>

              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Standard messaging rates may apply. You can opt out at any time by
                  replying STOP to any message.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePreferences}
              disabled={isSaving}
              className="min-w-[150px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isSaved ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Saved!
                </>
              ) : (
                "Save Preferences"
              )}
            </Button>
          </div>

          {/* Unsubscribe Section */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Unsubscribe from All</CardTitle>
              <CardDescription>
                Stop receiving all email and SMS notifications from NEON Energy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                If you unsubscribe, you'll no longer receive any notifications including important
                order updates and account security alerts. You can resubscribe at any time.
              </p>
              <Button variant="destructive" onClick={() => {
                toast.error("Unsubscribe functionality coming soon");
              }}>
                Unsubscribe from All Notifications
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
