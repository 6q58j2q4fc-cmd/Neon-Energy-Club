import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Zap, ArrowLeft, Mail, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const resetMutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetMutation.mutate({ email });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#c8ff00]/5 via-transparent to-[#9d4edd]/5" />
        
        <Link href="/" className="absolute top-4 left-4 text-white/60 hover:text-white flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="relative z-10 w-full max-w-md">
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-[#c8ff00]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#c8ff00]" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check Your Email</h2>
              <p className="text-white/60 mb-6">
                If an account exists with <span className="text-white">{email}</span>, you will receive a password reset link shortly.
              </p>
              <Link href="/login">
                <Button className="bg-[#c8ff00] text-black hover:bg-[#b8ef00]">
                  Return to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-[#c8ff00]/5 via-transparent to-[#9d4edd]/5" />
      
      <Link href="/login" className="absolute top-4 left-4 text-white/60 hover:text-white flex items-center gap-2 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Login
      </Link>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-8 h-8 text-[#c8ff00]" />
            <span className="text-3xl font-black text-white tracking-tight">NEON</span>
          </div>
          <p className="text-white/50 text-sm">Energy Drink</p>
        </div>

        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-[#c8ff00]/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Mail className="w-6 h-6 text-[#c8ff00]" />
            </div>
            <CardTitle className="text-2xl text-white">Forgot Password?</CardTitle>
            <CardDescription className="text-white/60">
              Enter your email and we'll send you a reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {resetMutation.error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
                  <AlertDescription className="text-red-400">{resetMutation.error.message}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#c8ff00]/50"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#c8ff00] text-black hover:bg-[#b8ef00] font-semibold"
                disabled={resetMutation.isPending}
              >
                {resetMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-white/60">
          Remember your password?{" "}
          <Link href="/login" className="text-[#c8ff00] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
