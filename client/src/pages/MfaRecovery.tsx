import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { Shield, Mail, CheckCircle, XCircle, AlertTriangle, Loader2, ArrowLeft, Clock } from "lucide-react";

type RecoveryStep = 'request' | 'verify' | 'submitted' | 'error';

export default function MfaRecovery() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<RecoveryStep>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Identity verification answers
  const [accountCreationDate, setAccountCreationDate] = useState('');
  const [lastOrderDetails, setLastOrderDetails] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  // Get token from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setToken(urlToken);
      setStep('verify');
    }
  }, []);

  // Request recovery mutation
  const requestRecovery = trpc.mfa.requestRecovery.useMutation({
    onSuccess: (data) => {
      setSuccess(data.message);
      setError('');
    },
    onError: (err) => {
      setError(err.message);
      setSuccess('');
    },
  });

  // Verify token query
  const verifyToken = trpc.mfa.verifyRecoveryToken.useQuery(
    { token },
    { 
      enabled: !!token && step === 'verify',
      retry: false,
    }
  );

  // Submit verification mutation
  const submitVerification = trpc.mfa.submitVerification.useMutation({
    onSuccess: (data) => {
      setSuccess(data.message);
      setStep('submitted');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleRequestRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    requestRecovery.mutate({ email });
  };

  const handleSubmitVerification = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    submitVerification.mutate({
      token,
      answers: {
        accountCreationDate,
        lastOrderDetails,
        securityQuestion,
        additionalInfo,
      },
    });
  };

  // Check if token is valid
  useEffect(() => {
    if (verifyToken.data && !verifyToken.data.valid) {
      setError(verifyToken.data.reason || 'Invalid recovery token');
      setStep('error');
    }
  }, [verifyToken.data]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-gray-900/80 border-gray-800">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#c8ff00]/20 to-purple-500/20 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-[#c8ff00]" />
          </div>
          <CardTitle className="text-2xl text-white">MFA Account Recovery</CardTitle>
          <CardDescription className="text-gray-400">
            {step === 'request' && "Lost access to your authenticator? We'll help you recover your account."}
            {step === 'verify' && "Verify your identity to complete the recovery process."}
            {step === 'submitted' && "Your request has been submitted for review."}
            {step === 'error' && "There was a problem with your recovery request."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Request Recovery */}
          {step === 'request' && (
            <form onSubmit={handleRequestRecovery} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your account email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
              </div>

              {error && (
                <Alert className="bg-red-500/10 border-red-500/30">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-500/10 border-green-500/30">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-400">{success}</AlertDescription>
                </Alert>
              )}

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h4 className="text-sm font-medium text-[#c8ff00] mb-2">What happens next?</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• We'll send a recovery link to your email</li>
                  <li>• You'll need to verify your identity</li>
                  <li>• An admin will review your request (24-48 hours)</li>
                  <li>• Once approved, MFA will be disabled</li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#c8ff00] text-black hover:bg-[#a8e600]"
                disabled={requestRecovery.isPending}
              >
                {requestRecovery.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Request Recovery'
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-gray-400 hover:text-white"
                onClick={() => setLocation('/mfa-verify')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to MFA Verification
              </Button>
            </form>
          )}

          {/* Step 2: Identity Verification */}
          {step === 'verify' && verifyToken.data?.valid && (
            <form onSubmit={handleSubmitVerification} className="space-y-4">
              <Alert className="bg-[#c8ff00]/10 border-[#c8ff00]/30">
                <Shield className="h-4 w-4 text-[#c8ff00]" />
                <AlertDescription className="text-[#c8ff00]">
                  Please answer the following questions to verify your identity.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">When did you create your account? (approximate)</Label>
                  <Input
                    placeholder="e.g., January 2024, Last month"
                    value={accountCreationDate}
                    onChange={(e) => setAccountCreationDate(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Describe your last order or activity</Label>
                  <Textarea
                    placeholder="e.g., Ordered 2 cases of NEON Original, Pre-ordered vending machine"
                    value={lastOrderDetails}
                    onChange={(e) => setLastOrderDetails(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">What type of account do you have?</Label>
                  <Input
                    placeholder="e.g., Distributor, Customer, Vending Owner"
                    value={securityQuestion}
                    onChange={(e) => setSecurityQuestion(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Any additional information to verify your identity</Label>
                  <Textarea
                    placeholder="Provide any other details that can help us verify you own this account"
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white min-h-[80px]"
                  />
                </div>
              </div>

              {error && (
                <Alert className="bg-red-500/10 border-red-500/30">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-[#c8ff00] text-black hover:bg-[#a8e600]"
                disabled={submitVerification.isPending}
              >
                {submitVerification.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Verification'
                )}
              </Button>
            </form>
          )}

          {/* Loading state for token verification */}
          {step === 'verify' && verifyToken.isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#c8ff00] mb-4" />
              <p className="text-gray-400">Verifying recovery token...</p>
            </div>
          )}

          {/* Step 3: Submitted */}
          {step === 'submitted' && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-white">Request Submitted</h3>
              <p className="text-gray-400">
                Your identity verification has been submitted. An administrator will review your request 
                within 24-48 hours. You'll receive an email once a decision has been made.
              </p>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 flex items-center gap-3">
                <Clock className="h-5 w-5 text-[#c8ff00]" />
                <span className="text-sm text-gray-400">Estimated review time: 24-48 hours</span>
              </div>
              <Button
                variant="outline"
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
                onClick={() => setLocation('/')}
              >
                Return to Home
              </Button>
            </div>
          )}

          {/* Error State */}
          {step === 'error' && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-white">Recovery Failed</h3>
              <p className="text-gray-400">{error || 'There was a problem with your recovery request.'}</p>
              <Button
                variant="outline"
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
                onClick={() => {
                  setStep('request');
                  setToken('');
                  setError('');
                }}
              >
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
