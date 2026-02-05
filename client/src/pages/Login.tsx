import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, Zap, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/lib/trpc";

export default function Login() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const [error, setError] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      toast.success(`Welcome back, ${data.user.name}!`);
      
      // Check if this is a pending distributor enrollment
      const pendingEnrollment = sessionStorage.getItem('pendingDistributorEnrollment');
      if (pendingEnrollment === 'true' && data.user.userType === "distributor") {
        sessionStorage.removeItem('pendingDistributorEnrollment');
        toast.info("Please complete your distributor enrollment form.");
        setLocation("/join");
        return;
      }
      
      // Redirect based on user type
      if (data.user.userType === "distributor") {
        setLocation("/distributor");
      } else if (data.user.userType === "franchisee") {
        setLocation("/franchise-portal");
      } else if (data.user.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/");
      }
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#c8ff00]/5 via-transparent to-[#9d4edd]/5" />
      
      {/* Back to home */}
      <Link href="/" className="absolute top-4 left-4 text-white/60 hover:text-white flex items-center gap-2 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-8 h-8 text-[#c8ff00]" />
            <span className="text-3xl font-black text-white tracking-tight">NEON</span>
          </div>
          <p className="text-white/50 text-sm">Energy Drink</p>
        </div>

        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Welcome Back</CardTitle>
            <CardDescription className="text-white/60">
              Sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="usernameOrEmail" className="text-white/80">Username or Email</Label>
                <Input
                  id="usernameOrEmail"
                  type="text"
                  placeholder="Enter your username or email"
                  value={formData.usernameOrEmail}
                  onChange={(e) => setFormData({ ...formData, usernameOrEmail: e.target.value })}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#c8ff00]/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#c8ff00]/50 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-sm text-[#c8ff00] hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#c8ff00] text-black hover:bg-[#b8ef00] font-semibold"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black/50 px-2 text-white/40">Or continue with</span>
              </div>
            </div>

            {/* OAuth login */}
            <Button
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/5"
              onClick={() => window.location.href = getLoginUrl()}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
              Sign in with Manus
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <p className="text-sm text-white/60 text-center">
              Don't have an account?{" "}
              <Link href="/register" className="text-[#c8ff00] hover:underline font-medium">
                Create account
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Account types info */}
        <div className="mt-6 text-center">
          <p className="text-white/40 text-xs">
            Join as a Customer, Distributor, or Franchisee
          </p>
        </div>
      </div>
    </div>
  );
}
