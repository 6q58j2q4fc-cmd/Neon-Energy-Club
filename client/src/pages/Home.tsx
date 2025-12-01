import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    quantity: 1,
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "USA",
    notes: "",
  });

  const submitPreorder = trpc.preorder.submit.useMutation({
    onSuccess: () => {
      toast.success("Pre-order submitted successfully!");
      setLocation("/success");
    },
    onError: (error) => {
      toast.error(`Failed to submit pre-order: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitPreorder.mutate(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseInt(value) || 1 : value,
    }));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-[#c8ff00]/20 bg-black/50 backdrop-blur-sm fixed top-0 w-full z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#c8ff00]">NEON</h1>
          {user && user.role === "admin" && (
            <Button
              variant="outline"
              className="border-[#c8ff00] text-[#c8ff00] hover:bg-[#c8ff00] hover:text-black"
              onClick={() => setLocation("/admin")}
            >
              Admin Dashboard
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Product Image */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[#c8ff00] blur-[100px] opacity-30 rounded-full"></div>
                <img
                  src="/neon-can.png"
                  alt="NEON Energy Drink"
                  className="relative z-10 max-w-md w-full h-auto drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Right: Hero Text */}
            <div className="space-y-6">
              <h2 className="text-5xl md:text-7xl font-black leading-tight">
                THE <span className="text-[#c8ff00]">ENERGY</span> IS BACK
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                NEON Energy Drink is relaunching. Experience the legendary taste
                and energy boost that defined a generation. Pre-order now and be
                among the first to get your hands on the new NEON.
              </p>
              <div className="flex gap-4 items-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#c8ff00]">8.4 fl oz</div>
                  <div className="text-sm text-gray-400">Per Can</div>
                </div>
                <div className="h-12 w-px bg-[#c8ff00]/30"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#c8ff00]">24 Cans</div>
                  <div className="text-sm text-gray-400">Per Case</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pre-Order Form Section */}
      <section className="py-12 px-4 bg-gradient-to-b from-black to-[#0a0a0a]">
        <div className="container mx-auto max-w-2xl">
          <Card className="bg-[#0a0a0a] border-[#c8ff00]/30">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-[#c8ff00]">
                Pre-Order Now
              </CardTitle>
              <CardDescription className="text-gray-400">
                Reserve your cases of NEON Energy Drink. Limited quantities
                available for the relaunch.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#c8ff00]">
                    Contact Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="bg-black border-[#c8ff00]/30 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="bg-black border-[#c8ff00]/30 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="bg-black border-[#c8ff00]/30 text-white"
                    />
                  </div>
                </div>

                {/* Order Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#c8ff00]">
                    Order Details
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Number of Cases *</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="1"
                      required
                      value={formData.quantity}
                      onChange={handleChange}
                      className="bg-black border-[#c8ff00]/30 text-white"
                    />
                    <p className="text-sm text-gray-400">
                      Each case contains 24 cans (8.4 fl oz each)
                    </p>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#c8ff00]">
                    Shipping Address
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      className="bg-black border-[#c8ff00]/30 text-white"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        className="bg-black border-[#c8ff00]/30 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province *</Label>
                      <Input
                        id="state"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleChange}
                        className="bg-black border-[#c8ff00]/30 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal/ZIP Code *</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        required
                        value={formData.postalCode}
                        onChange={handleChange}
                        className="bg-black border-[#c8ff00]/30 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        name="country"
                        required
                        value={formData.country}
                        onChange={handleChange}
                        className="bg-black border-[#c8ff00]/30 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="bg-black border-[#c8ff00]/30 text-white min-h-[100px]"
                    placeholder="Any special instructions or comments..."
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitPreorder.isPending}
                  className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold text-lg py-6"
                >
                  {submitPreorder.isPending ? "Submitting..." : "Submit Pre-Order"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[#c8ff00]/20">
        <div className="container mx-auto text-center text-gray-400">
          <p>&copy; 2025 NEON Energy Drink. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
