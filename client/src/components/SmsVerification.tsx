import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Phone, CheckCircle, Loader2, RefreshCw, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface SmsVerificationProps {
  onVerified?: () => void;
  compact?: boolean;
}

export default function SmsVerification({ onVerified, compact = false }: SmsVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [countdown, setCountdown] = useState(0);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = trpc.smsVerification.status.useQuery();
  
  const sendCodeMutation = trpc.smsVerification.sendCode.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Code Sent!", {
          description: "Check your phone for the 6-digit verification code.",
        });
        setStep("otp");
        setExpiresAt(data.expiresAt ? new Date(data.expiresAt) : null);
        setCountdown(60); // 60 second cooldown for resend
      } else {
        toast.info(data.message);
      }
    },
    onError: (error) => {
      toast.error("Failed to Send Code", {
        description: error.message,
      });
    },
  });
  
  const verifyCodeMutation = trpc.smsVerification.verifyCode.useMutation({
    onSuccess: () => {
      toast.success("Phone Verified!", {
        description: "Your phone number has been successfully verified.",
      });
      refetchStatus();
      onVerified?.();
    },
    onError: (error) => {
      toast.error("Verification Failed", {
        description: error.message,
      });
      // Clear OTP on error
      setOtpCode(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    },
  });
  
  const resendCodeMutation = trpc.smsVerification.resendCode.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("New Code Sent!", {
          description: "Check your phone for the new verification code.",
        });
        setExpiresAt(data.expiresAt ? new Date(data.expiresAt) : null);
        setCountdown(60);
        setOtpCode(["", "", "", "", "", ""]);
        otpInputRefs.current[0]?.focus();
      }
    },
    onError: (error) => {
      toast.error("Failed to Resend", {
        description: error.message,
      });
    },
  });
  
  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  
  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };
  
  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);
    
    const newOtp = [...otpCode];
    newOtp[index] = digit;
    setOtpCode(newOtp);
    
    // Auto-focus next input
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit when all digits entered
    if (digit && index === 5) {
      const fullCode = newOtp.join("");
      if (fullCode.length === 6) {
        verifyCodeMutation.mutate({ code: fullCode });
      }
    }
  };
  
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };
  
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otpCode];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtpCode(newOtp);
    
    // Focus last filled input or submit if complete
    if (pastedData.length === 6) {
      verifyCodeMutation.mutate({ code: pastedData });
    } else {
      otpInputRefs.current[pastedData.length]?.focus();
    }
  };
  
  const handleSendCode = () => {
    const digits = phoneNumber.replace(/\D/g, "");
    if (digits.length < 10) {
      toast.error("Invalid Phone Number", {
        description: "Please enter a valid 10-digit phone number.",
      });
      return;
    }
    sendCodeMutation.mutate({ phoneNumber: digits });
  };
  
  const handleVerifyCode = () => {
    const code = otpCode.join("");
    if (code.length !== 6) {
      toast.error("Invalid Code", {
        description: "Please enter the complete 6-digit code.",
      });
      return;
    }
    verifyCodeMutation.mutate({ code });
  };
  
  const handleResendCode = () => {
    const digits = phoneNumber.replace(/\D/g, "");
    resendCodeMutation.mutate({ phoneNumber: digits });
  };
  
  // Show loading state
  if (statusLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-[#c8ff00]" />
      </div>
    );
  }
  
  // Already verified
  if (status?.phoneVerified) {
    return (
      <div className={`flex items-center gap-2 ${compact ? 'text-sm' : ''}`}>
        <CheckCircle className="w-5 h-5 text-green-500" />
        <span className="text-green-500">Phone Verified</span>
        {status.phone && (
          <span className="text-gray-400">({status.phone})</span>
        )}
      </div>
    );
  }
  
  if (compact) {
    return (
      <div className="space-y-3">
        {step === "phone" ? (
          <div className="flex gap-2">
            <Input
              type="tel"
              placeholder="(555) 123-4567"
              value={phoneNumber}
              onChange={handlePhoneChange}
              className="bg-gray-800 border-gray-700 text-white"
            />
            <Button
              onClick={handleSendCode}
              disabled={sendCodeMutation.isPending}
              className="bg-[#c8ff00] text-black hover:bg-[#a8d900] whitespace-nowrap"
            >
              {sendCodeMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Send Code"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-1 justify-center">
              {otpCode.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => { otpInputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                  className="w-10 h-10 text-center bg-gray-800 border-gray-700 text-white text-lg font-mono"
                />
              ))}
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendCode}
                disabled={countdown > 0 || resendCodeMutation.isPending}
                className="text-xs"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
              </Button>
              <Button
                size="sm"
                onClick={handleVerifyCode}
                disabled={verifyCodeMutation.isPending || otpCode.join("").length !== 6}
                className="bg-[#c8ff00] text-black hover:bg-[#a8d900] text-xs"
              >
                {verifyCodeMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Verify"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <Card className="bg-gray-900/80 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <MessageSquare className="w-5 h-5 text-[#c8ff00]" />
          SMS Verification
        </CardTitle>
        <CardDescription className="text-gray-400">
          Verify your phone number to unlock all features and receive important notifications via SMS.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === "phone" ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 bg-gray-800 border border-gray-700 rounded-md">
                  <span className="text-lg">🇺🇸</span>
                  <span className="text-gray-400">+1</span>
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className="flex-1 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <p className="text-xs text-gray-500">
                Standard message and data rates may apply.
              </p>
            </div>
            
            <Button
              onClick={handleSendCode}
              disabled={sendCodeMutation.isPending || phoneNumber.replace(/\D/g, "").length < 10}
              className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d900] font-semibold"
            >
              {sendCodeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 mr-2" />
                  Send Verification Code
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <Alert className="bg-[#c8ff00]/10 border-[#c8ff00]/30">
              <MessageSquare className="w-4 h-4 text-[#c8ff00]" />
              <AlertDescription className="text-[#c8ff00]">
                We sent a 6-digit code to {phoneNumber}. Enter it below.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label className="text-gray-300">Verification Code</Label>
              <div className="flex gap-2 justify-center">
                {otpCode.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => { otpInputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className="w-12 h-14 text-center bg-gray-800 border-gray-700 text-white text-2xl font-mono focus:border-[#c8ff00] focus:ring-[#c8ff00]"
                  />
                ))}
              </div>
              {expiresAt && (
                <p className="text-xs text-gray-500 text-center">
                  Code expires in 10 minutes
                </p>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setStep("phone");
                  setOtpCode(["", "", "", "", "", ""]);
                }}
                className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Change Number
              </Button>
              <Button
                onClick={handleVerifyCode}
                disabled={verifyCodeMutation.isPending || otpCode.join("").length !== 6}
                className="flex-1 bg-[#c8ff00] text-black hover:bg-[#a8d900] font-semibold"
              >
                {verifyCodeMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify Code
                  </>
                )}
              </Button>
            </div>
            
            <div className="text-center">
              <Button
                variant="link"
                onClick={handleResendCode}
                disabled={countdown > 0 || resendCodeMutation.isPending}
                className="text-[#c8ff00] hover:text-[#a8d900]"
              >
                {resendCodeMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : countdown > 0 ? (
                  `Resend code in ${countdown}s`
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend Code
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Compact SMS verification indicator for sidebar/header
 */
export function SmsVerificationIndicator() {
  const { data: status, isLoading } = trpc.smsVerification.status.useQuery();
  
  if (isLoading) return null;
  
  if (status?.phoneVerified) {
    return (
      <div className="flex items-center gap-1.5 text-green-500 text-xs">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>Phone Verified</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-1.5 text-yellow-500 text-xs">
      <Phone className="w-3.5 h-3.5" />
      <span>Phone Not Verified</span>
    </div>
  );
}
