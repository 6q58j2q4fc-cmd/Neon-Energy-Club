import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mail, CheckCircle, Loader2, X } from "lucide-react";
import { toast } from "sonner";

export default function EmailVerificationBanner() {
  
  const [dismissed, setDismissed] = useState(false);
  
  const { data: status, isLoading } = trpc.emailVerification.status.useQuery();
  
  const resendMutation = trpc.emailVerification.resend.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Verification Email Sent!", {
          description: "Please check your inbox and click the verification link.",
        });
      } else {
        toast.info("Already Verified", {
          description: data.message,
        });
      }
    },
    onError: (error) => {
      toast.error("Failed to Send", {
        description: error.message,
      });
    },
  });

  // Don't show if loading, verified, or dismissed
  if (isLoading || status?.verified || dismissed) {
    return null;
  }

  return (
    <Alert className="mb-4 bg-yellow-500/10 border-yellow-500/30 relative">
      <Mail className="h-4 w-4 text-yellow-500" />
      <AlertTitle className="text-yellow-500 font-semibold">
        Verify Your Email
      </AlertTitle>
      <AlertDescription className="text-yellow-400/80">
        <p className="mb-2">
          Please verify your email address ({status?.email}) to unlock all distributor features 
          and receive important notifications.
        </p>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => resendMutation.mutate()}
            disabled={resendMutation.isPending}
            className="bg-yellow-500 text-black hover:bg-yellow-400"
          >
            {resendMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Resend Verification Email
              </>
            )}
          </Button>
          <span className="text-yellow-400/60 text-sm">
            Check your inbox and spam folder
          </span>
        </div>
      </AlertDescription>
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-yellow-500/60 hover:text-yellow-500"
      >
        <X className="w-4 h-4" />
      </button>
    </Alert>
  );
}

/**
 * Compact version for sidebar or header
 */
export function EmailVerificationIndicator() {
  const { data: status, isLoading } = trpc.emailVerification.status.useQuery();
  
  if (isLoading) return null;
  
  if (status?.verified) {
    return (
      <div className="flex items-center gap-1.5 text-green-500 text-xs">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>Email Verified</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-1.5 text-yellow-500 text-xs">
      <Mail className="w-3.5 h-3.5" />
      <span>Email Not Verified</span>
    </div>
  );
}
