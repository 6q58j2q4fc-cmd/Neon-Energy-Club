import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  
  const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "error" | "expired">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  // Get token from URL query params
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  const verifyMutation = trpc.emailVerification.verify.useMutation({
    onSuccess: () => {
      setVerificationStatus("success");
      toast.success("Email Verified!", {
        description: "Your email has been successfully verified. Welcome to NEON!",
      });
    },
    onError: (error) => {
      if (error.message.includes("expired")) {
        setVerificationStatus("expired");
      } else {
        setVerificationStatus("error");
      }
      setErrorMessage(error.message);
      toast.error("Verification Failed", {
        description: error.message,
      });
    },
  });

  useEffect(() => {
    if (token) {
      verifyMutation.mutate({ token });
    } else {
      setVerificationStatus("error");
      setErrorMessage("No verification token provided");
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900/80 border-gray-800 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {verificationStatus === "loading" && (
              <div className="w-20 h-20 rounded-full bg-[#c8ff00]/10 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#c8ff00] animate-spin" />
              </div>
            )}
            {verificationStatus === "success" && (
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            )}
            {(verificationStatus === "error" || verificationStatus === "expired") && (
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
            )}
          </div>
          
          <CardTitle className="text-2xl font-bold text-white">
            {verificationStatus === "loading" && "Verifying Your Email..."}
            {verificationStatus === "success" && "Email Verified!"}
            {verificationStatus === "error" && "Verification Failed"}
            {verificationStatus === "expired" && "Link Expired"}
          </CardTitle>
          
          <CardDescription className="text-gray-400 mt-2">
            {verificationStatus === "loading" && "Please wait while we verify your email address."}
            {verificationStatus === "success" && "Your email has been successfully verified. You can now access all distributor features."}
            {verificationStatus === "error" && errorMessage}
            {verificationStatus === "expired" && "This verification link has expired. Please request a new one."}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {verificationStatus === "success" && (
            <>
              <div className="bg-[#c8ff00]/10 border border-[#c8ff00]/20 rounded-lg p-4">
                <h3 className="text-[#c8ff00] font-semibold mb-2">What's Next?</h3>
                <ul className="text-gray-300 text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#c8ff00]" />
                    Access your distributor portal
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#c8ff00]" />
                    Customize your personalized website
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#c8ff00]" />
                    Start sharing your referral link
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#c8ff00]" />
                    Build your team and earn commissions
                  </li>
                </ul>
              </div>
              
              <Button
                onClick={() => setLocation("/portal")}
                className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d900] font-bold"
              >
                Go to Distributor Portal
              </Button>
            </>
          )}
          
          {verificationStatus === "expired" && (
            <>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-yellow-400 text-sm">
                  Verification links expire after 24 hours for security reasons. 
                  Log in to your account and request a new verification email.
                </p>
              </div>
              
              <Button
                onClick={() => setLocation("/portal")}
                className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d900] font-bold"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Log In to Resend
              </Button>
            </>
          )}
          
          {verificationStatus === "error" && !errorMessage.includes("expired") && (
            <>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400 text-sm">
                  {errorMessage || "The verification link is invalid or has already been used."}
                </p>
              </div>
              
              <Button
                onClick={() => setLocation("/")}
                variant="outline"
                className="w-full border-gray-700 text-white hover:bg-gray-800"
              >
                Return to Home
              </Button>
            </>
          )}
          
          <div className="text-center pt-4 border-t border-gray-800">
            <p className="text-gray-500 text-sm">
              Need help?{" "}
              <a href="/contact" className="text-[#c8ff00] hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
