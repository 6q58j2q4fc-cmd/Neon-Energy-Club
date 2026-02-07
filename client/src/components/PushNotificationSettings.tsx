import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Bell, BellOff, Loader2, CheckCircle, AlertCircle, Smartphone } from "lucide-react";

interface PushNotificationSettingsProps {
  className?: string;
}

export default function PushNotificationSettings({ className }: PushNotificationSettingsProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  const vapidKeyQuery = trpc.pushNotifications.getVapidPublicKey.useQuery();
  const subscribeMutation = trpc.pushNotifications.subscribe.useMutation();
  const unsubscribeMutation = trpc.pushNotifications.unsubscribe.useMutation();
  const testMutation = trpc.pushNotifications.testNotification.useMutation();

  useEffect(() => {
    // Check if push notifications are supported
    const checkSupport = async () => {
      const supported = "serviceWorker" in navigator && "PushManager" in window;
      setIsSupported(supported);

      if (supported) {
        setPermission(Notification.permission);

        // Check if already subscribed
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
        } catch (error) {
          console.error("Error checking subscription:", error);
        }
      }

      setIsLoading(false);
    };

    checkSupport();
  }, []);

  const handleSubscribe = async () => {
    if (!vapidKeyQuery.data?.publicKey) {
      toast.error("Unable to get notification keys. Please try again.");
      return;
    }

    try {
      setIsLoading(true);

      // Request notification permission
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== "granted") {
        toast.error("Notification permission denied", {
          description: "Please enable notifications in your browser settings.",
        });
        setIsLoading(false);
        return;
      }

      // Register service worker if not already registered
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKeyQuery.data.publicKey),
      });

      const subscriptionJson = subscription.toJSON();

      // Save subscription to server
      await subscribeMutation.mutateAsync({
        endpoint: subscription.endpoint,
        p256Dh: subscriptionJson.keys?.p256Dh || "",
        auth: subscriptionJson.keys?.auth || "",
        userAgent: navigator.userAgent,
      });

      setIsSubscribed(true);
      toast.success("Notifications enabled!", {
        description: "You'll receive alerts for team signups, commissions, and rank advancements.",
      });
    } catch (error) {
      console.error("Error subscribing:", error);
      toast.error("Failed to enable notifications", {
        description: "Please try again or check your browser settings.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      setIsLoading(true);

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        await unsubscribeMutation.mutateAsync({
          endpoint: subscription.endpoint,
        });
      }

      setIsSubscribed(false);
      toast.success("Notifications disabled", {
        description: "You won't receive push notifications anymore.",
      });
    } catch (error) {
      console.error("Error unsubscribing:", error);
      toast.error("Failed to disable notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await testMutation.mutateAsync();
      toast.success("Test notification sent!", {
        description: "Check your notifications.",
      });
    } catch (error) {
      toast.error("Failed to send test notification");
    }
  };

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="w-5 h-5 text-gray-400" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Push notifications are not supported in your browser.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#c8ff00]" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get instant alerts for team signups, commission payouts, and rank advancements.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status indicator */}
        <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5">
          {isSubscribed ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-white">Notifications Enabled</p>
                <p className="text-sm text-gray-400">You'll receive alerts on this device</p>
              </div>
            </>
          ) : permission === "denied" ? (
            <>
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="font-medium text-white">Notifications Blocked</p>
                <p className="text-sm text-gray-400">
                  Please enable notifications in your browser settings
                </p>
              </div>
            </>
          ) : (
            <>
              <Smartphone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-white">Notifications Disabled</p>
                <p className="text-sm text-gray-400">Enable to receive real-time alerts</p>
              </div>
            </>
          )}
        </div>

        {/* Toggle switch */}
        <div className="flex items-center justify-between">
          <Label htmlFor="notifications" className="text-white">
            Enable Push Notifications
          </Label>
          <Switch
            id="notifications"
            checked={isSubscribed}
            onCheckedChange={(checked) => {
              if (checked) {
                handleSubscribe();
              } else {
                handleUnsubscribe();
              }
            }}
            disabled={isLoading || permission === "denied"}
          />
        </div>

        {/* Notification types */}
        {isSubscribed && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-400">You'll be notified about:</p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <span className="text-[#c8ff00]">•</span> New team member signups
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#c8ff00]">•</span> Commission payouts
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#c8ff00]">•</span> Rank advancements
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#c8ff00]">•</span> Team orders and commissions
              </li>
            </ul>
          </div>
        )}

        {/* Test button */}
        {isSubscribed && (
          <Button
            variant="outline"
            className="w-full border-[#c8ff00]/30 text-[#c8ff00] hover:bg-[#c8ff00]/10"
            onClick={handleTestNotification}
            disabled={testMutation.isPending}
          >
            {testMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Bell className="w-4 h-4 mr-2" />
            )}
            Send Test Notification
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
