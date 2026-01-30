import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Phone, CheckCircle, Loader2, X, Shield } from "lucide-react";
import { toast } from "sonner";
import SmsVerification from "./SmsVerification";

export default function VerificationBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [activeTab, setActiveTab] = useState<"email" | "sms">("email");
  
  const { data: emailStatus, isLoading: emailLoading } = trpc.emailVerification.status.useQuery();
  const { data: smsStatus, isLoading: smsLoading } = trpc.smsVerification.status.useQuery();
  
  const resendEmailMutation = trpc.emailVerification.resend.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Verification Email Sent!", {
          description: "Please check your inbox and click the verification link.",
        });
      } else {
        toast.info(data.message);
      }
    },
    onError: (error) => {
      toast.error("Failed to Send", {
        description: error.message,
      });
    },
  });
  
  const isLoading = emailLoading || smsLoading;
  const emailVerified = emailStatus?.verified || false;
  const phoneVerified = smsStatus?.phoneVerified || false;
  const isFullyVerified = emailVerified || phoneVerified; // At least one method verified
  
  // Don't show if loading, fully verified, or dismissed
  if (isLoading || isFullyVerified || dismissed) {
    return null;
  }
  
  return (
    <Alert className="mb-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30 relative">
      <Shield className="h-5 w-5 text-yellow-500" />
      <AlertTitle className="text-yellow-500 font-semibold text-lg">
        Verify Your Account
      </AlertTitle>
      <AlertDescription className="text-yellow-400/80 mt-2">
        <p className="mb-4">
          Verify your account to unlock all distributor features and receive important notifications.
          Choose your preferred verification method below.
        </p>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "email" | "sms")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
            <TabsTrigger 
              value="email" 
              className="data-[state=active]:bg-[#c8ff00] data-[state=active]:text-black"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
              {emailVerified && <CheckCircle className="w-4 h-4 ml-2 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger 
              value="sms"
              className="data-[state=active]:bg-[#c8ff00] data-[state=active]:text-black"
            >
              <Phone className="w-4 h-4 mr-2" />
              SMS
              {phoneVerified && <CheckCircle className="w-4 h-4 ml-2 text-green-500" />}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="mt-4">
            {emailVerified ? (
              <div className="flex items-center gap-2 text-green-500 p-4 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span>Email verified: {emailStatus?.email}</span>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-400">
                  We'll send a verification link to: <strong className="text-white">{emailStatus?.email || "your email"}</strong>
                </p>
                <Button
                  onClick={() => resendEmailMutation.mutate()}
                  disabled={resendEmailMutation.isPending}
                  className="bg-yellow-500 text-black hover:bg-yellow-400"
                >
                  {resendEmailMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Verification Email
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500">
                  Check your inbox and spam folder for the verification link.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="sms" className="mt-4">
            {phoneVerified ? (
              <div className="flex items-center gap-2 text-green-500 p-4 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span>Phone verified: {smsStatus?.phone}</span>
              </div>
            ) : (
              <SmsVerification compact />
            )}
          </TabsContent>
        </Tabs>
        
        <p className="text-xs text-gray-500 mt-4">
          You only need to verify one method (email OR phone) to unlock all features.
        </p>
      </AlertDescription>
      
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-yellow-500/60 hover:text-yellow-500 p-1"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </Alert>
  );
}

/**
 * Combined verification status indicator
 */
export function VerificationStatusIndicator() {
  const { data: emailStatus, isLoading: emailLoading } = trpc.emailVerification.status.useQuery();
  const { data: smsStatus, isLoading: smsLoading } = trpc.smsVerification.status.useQuery();
  
  if (emailLoading || smsLoading) return null;
  
  const emailVerified = emailStatus?.verified || false;
  const phoneVerified = smsStatus?.phoneVerified || false;
  
  if (emailVerified && phoneVerified) {
    return (
      <div className="flex items-center gap-1.5 text-green-500 text-xs">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>Fully Verified</span>
      </div>
    );
  }
  
  if (emailVerified || phoneVerified) {
    return (
      <div className="flex items-center gap-1.5 text-green-500 text-xs">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>{emailVerified ? "Email" : "Phone"} Verified</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-1.5 text-yellow-500 text-xs">
      <Shield className="w-3.5 h-3.5" />
      <span>Not Verified</span>
    </div>
  );
}
