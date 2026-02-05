import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Eye, EyeOff, Zap, ArrowLeft, Check, X, User, Users, Building2 } from "lucide-react";
import { toast } from "sonner";

const USER_TYPES = [
  { 
    value: "customer", 
    label: "Customer", 
    description: "Shop for NEON products",
    icon: User 
  },
  { 
    value: "distributor", 
    label: "Distributor", 
    description: "Build your network & earn commissions",
    icon: Users 
  },
  { 
    value: "franchisee", 
    label: "Franchisee", 
    description: "Own vending machines & territories",
    icon: Building2 
  },
];

export default function Register() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    userType: "customer" as "customer" | "distributor" | "franchisee",
  });
  const [error, setError] = useState("");
  const [usernameDebounce, setUsernameDebounce] = useState("");
  const [emailDebounce, setEmailDebounce] = useState("");

  // Debounce username check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.username.length >= 3) {
        setUsernameDebounce(formData.username);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.username]);

  // Debounce email check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.email.includes("@")) {
        setEmailDebounce(formData.email);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.email]);

  const { data: usernameCheck } = trpc.auth.checkUsername.useQuery(
    { username: usernameDebounce },
    { enabled: usernameDebounce.length >= 3 }
  );

  const { data: emailCheck } = trpc.auth.checkEmail.useQuery(
    { email: emailDebounce },
    { enabled: emailDebounce.includes("@") }
  );

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      if (formData.userType === "distributor") {
        toast.success("Account created! Please complete your distributor enrollment.");
        // Store that they need to complete enrollment
        sessionStorage.setItem('pendingDistributorEnrollment', 'true');
        setLocation("/login");
      } else {
        toast.success("Account created! Please check your email to verify your account.");
        setLocation("/login");
      }
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    registerMutation.mutate(formData);
  };

  const passwordStrength = {
    length: formData.password.length >= 8,
    hasUpper: /[A-Z]/.test(formData.password),
    hasLower: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 py-12">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#c8ff00]/5 via-transparent to-[#9d4edd]/5" />
      
      {/* Back to home */}
      <Link href="/" className="absolute top-4 left-4 text-white/60 hover:text-white flex items-center gap-2 transition-colors z-20">
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
            <CardTitle className="text-2xl text-white">Create Account</CardTitle>
            <CardDescription className="text-white/60">
              Join the NEON energy revolution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              {/* Account Type Selection */}
              <div className="space-y-3">
                <Label className="text-white/80">Account Type</Label>
                <RadioGroup
                  value={formData.userType}
                  onValueChange={(value) => setFormData({ ...formData, userType: value as any })}
                  className="grid grid-cols-3 gap-2"
                >
                  {USER_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <div key={type.value}>
                        <RadioGroupItem
                          value={type.value}
                          id={type.value}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={type.value}
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-white/10 bg-white/5 p-3 hover:bg-white/10 peer-data-[state=checked]:border-[#c8ff00] peer-data-[state=checked]:bg-[#c8ff00]/10 cursor-pointer transition-all"
                        >
                          <Icon className="w-5 h-5 mb-1 text-white/60 peer-data-[state=checked]:text-[#c8ff00]" />
                          <span className="text-xs font-medium text-white">{type.label}</span>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
                <p className="text-xs text-white/40 text-center">
                  {USER_TYPES.find(t => t.value === formData.userType)?.description}
                </p>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/80">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#c8ff00]/50"
                  required
                />
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white/80">Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#c8ff00]/50 pr-10"
                    required
                    minLength={3}
                    maxLength={50}
                  />
                  {formData.username.length >= 3 && usernameCheck && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {usernameCheck.available ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {formData.username.length >= 3 && usernameCheck && !usernameCheck.available && (
                  <p className="text-xs text-red-400">Username is already taken</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#c8ff00]/50 pr-10"
                    required
                  />
                  {formData.email.includes("@") && emailCheck && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {emailCheck.available ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {formData.email.includes("@") && emailCheck && !emailCheck.available && (
                  <p className="text-xs text-red-400">Email is already registered</p>
                )}
              </div>

              {/* Phone (optional) */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white/80">Phone <span className="text-white/40">(optional)</span></Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#c8ff00]/50"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#c8ff00]/50 pr-10"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className={`flex items-center gap-1 ${passwordStrength.length ? "text-green-500" : "text-white/40"}`}>
                      {passwordStrength.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      8+ characters
                    </div>
                    <div className={`flex items-center gap-1 ${passwordStrength.hasUpper ? "text-green-500" : "text-white/40"}`}>
                      {passwordStrength.hasUpper ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      Uppercase
                    </div>
                    <div className={`flex items-center gap-1 ${passwordStrength.hasLower ? "text-green-500" : "text-white/40"}`}>
                      {passwordStrength.hasLower ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      Lowercase
                    </div>
                    <div className={`flex items-center gap-1 ${passwordStrength.hasNumber ? "text-green-500" : "text-white/40"}`}>
                      {passwordStrength.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      Number
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white/80">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-[#c8ff00]/50 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-400">Passwords do not match</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-[#c8ff00] text-black hover:bg-[#b8ef00] font-semibold"
                disabled={registerMutation.isPending || (usernameCheck && !usernameCheck.available) || (emailCheck && !emailCheck.available)}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <p className="text-sm text-white/60 text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-[#c8ff00] hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Terms */}
        <p className="mt-6 text-center text-xs text-white/40">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-[#c8ff00] hover:underline">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" className="text-[#c8ff00] hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
