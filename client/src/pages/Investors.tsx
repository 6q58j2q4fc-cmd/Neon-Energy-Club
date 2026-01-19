import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { 
  TrendingUp, 
  Globe, 
  Users, 
  DollarSign, 
  CheckCircle, 
  Building2, 
  Leaf, 
  Award,
  ArrowRight,
  Mail,
  Phone,
  Briefcase
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Investors() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    investmentRange: "" as "under_10k" | "10k_50k" | "50k_100k" | "100k_500k" | "500k_1m" | "over_1m" | "",
    accreditedStatus: "" as "yes" | "no" | "unsure" | "",
    investmentType: "" as "equity" | "convertible_note" | "revenue_share" | "franchise" | "other" | "",
    referralSource: "",
    message: "",
  });

  const submitMutation = trpc.investor.submit.useMutation({
    onSuccess: () => {
      alert("Inquiry Submitted! Thank you for your interest. Our team will contact you within 24-48 hours.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        investmentRange: "",
        accreditedStatus: "",
        investmentType: "",
        referralSource: "",
        message: "",
      });
    },
    onError: (error) => {
      alert("Submission Failed: " + (error.message || "Please try again later."));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.investmentRange || !formData.accreditedStatus || !formData.investmentType) {
      alert("Missing Information: Please fill in all required fields.");
      return;
    }
    submitMutation.mutate(formData as any);
  };

  const investmentRanges = [
    { value: "under_10k", label: "Under $10,000" },
    { value: "10k_50k", label: "$10,000 - $50,000" },
    { value: "50k_100k", label: "$50,000 - $100,000" },
    { value: "100k_500k", label: "$100,000 - $500,000" },
    { value: "500k_1m", label: "$500,000 - $1,000,000" },
    { value: "over_1m", label: "Over $1,000,000" },
  ];

  const investmentTypes = [
    { value: "equity", label: "Equity Investment" },
    { value: "convertible_note", label: "Convertible Note" },
    { value: "revenue_share", label: "Revenue Share Agreement" },
    { value: "franchise", label: "Franchise/Territory License" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="min-h-screen bg-[#0a1a1a]">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d2818]/80 via-[#0a1a1a] to-[#0a1a1a]" />
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-20 left-10 w-96 h-96 bg-[#c8ff00]/20 rounded-full blur-[120px]" />
          <div className="absolute top-40 right-20 w-80 h-80 bg-[#ff0080]/20 rounded-full blur-[100px]" />
        </div>
        
        <div className="container relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c8ff00]/10 border border-[#c8ff00]/30 mb-6">
              <TrendingUp className="w-4 h-4 text-[#c8ff00]" />
              <span className="text-[#c8ff00] text-sm font-medium">INVESTMENT OPPORTUNITY</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6">
              <span className="text-white">INVEST IN</span>{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c8ff00] to-[#00ffff]">NEON</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join us in revolutionizing the energy drink industry. Be part of the global relaunch 
              of a brand that reached 14 countries and became one of the fastest-growing beverages in history.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[#0d2818]/50">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Globe, value: "14", label: "Countries Reached", color: "#c8ff00" },
              { icon: Users, value: "500K+", label: "Previous Customers", color: "#00ffff" },
              { icon: DollarSign, value: "$50M+", label: "Previous Revenue", color: "#ff0080" },
              { icon: Award, value: "48", label: "US States in Year 1", color: "#c8ff00" },
            ].map((stat, i) => (
              <Card key={i} className="bg-[#1a2f1a]/50 border-[#c8ff00]/20 text-center">
                <CardContent className="pt-6">
                  <stat.icon className="w-10 h-10 mx-auto mb-3" style={{ color: stat.color }} />
                  <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Invest Section */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-4xl font-black text-center mb-4">
            <span className="text-white">WHY INVEST IN</span>{" "}
            <span className="text-[#c8ff00]">NEON?</span>
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            NEON isn't just another energy drink—it's a proven brand with a track record of explosive growth and a loyal customer base.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Proven Track Record",
                description: "Previously grew to 48 US states in year one and expanded to 14 countries within 5 years. One of the fastest-growing beverage brands in the past century.",
              },
              {
                icon: Leaf,
                title: "Health-Focused Product",
                description: "All-natural ingredients, no artificial colors or preservatives. Positioned perfectly for the growing health-conscious consumer market.",
              },
              {
                icon: Building2,
                title: "Multi-Revenue Model",
                description: "Direct sales, distributor network, franchise territories, and vending machine licensing create multiple revenue streams.",
              },
              {
                icon: Users,
                title: "Existing Customer Base",
                description: "Large subscriber base from previous operations ready for reactivation. Built-in demand from day one.",
              },
              {
                icon: Globe,
                title: "Global Expansion Ready",
                description: "Established international presence and relationships. Ready to scale globally with the right investment.",
              },
              {
                icon: Award,
                title: "Celebrity Endorsements",
                description: "Previous partnerships with major artists including Snoop Dogg, Chris Brown, and Christina Milian. Brand exposure to 15% of world population.",
              },
            ].map((item, i) => (
              <Card key={i} className="bg-[#1a2f1a]/50 border-[#c8ff00]/20 hover:border-[#c8ff00]/50 transition-all">
                <CardContent className="pt-6">
                  <item.icon className="w-12 h-12 text-[#c8ff00] mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Tiers */}
      <section className="py-20 bg-[#0d2818]/50">
        <div className="container">
          <h2 className="text-4xl font-black text-center mb-4">
            <span className="text-white">INVESTMENT</span>{" "}
            <span className="text-[#ff0080]">OPPORTUNITIES</span>
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Multiple ways to participate in the NEON relaunch, from direct investment to franchise opportunities.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Seed Investor",
                range: "$10K - $50K",
                benefits: ["Equity stake", "Quarterly updates", "Investor community access", "Early product access"],
                color: "#c8ff00",
              },
              {
                title: "Growth Partner",
                range: "$50K - $250K",
                benefits: ["Larger equity stake", "Monthly calls with founders", "Advisory board consideration", "Revenue share option"],
                color: "#00ffff",
              },
              {
                title: "Strategic Investor",
                range: "$250K - $1M",
                benefits: ["Significant equity", "Board observer rights", "Strategic input on direction", "Exclusive territory rights"],
                color: "#ff0080",
              },
              {
                title: "Lead Investor",
                range: "$1M+",
                benefits: ["Major equity position", "Board seat", "Co-investment rights", "Global expansion partnership"],
                color: "#c8ff00",
              },
            ].map((tier, i) => (
              <Card key={i} className="bg-[#1a2f1a]/50 border-2 hover:scale-105 transition-all" style={{ borderColor: `${tier.color}40` }}>
                <CardHeader>
                  <CardTitle className="text-white">{tier.title}</CardTitle>
                  <CardDescription className="text-2xl font-bold" style={{ color: tier.color }}>
                    {tier.range}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tier.benefits.map((benefit, j) => (
                      <li key={j} className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-4 h-4 text-[#c8ff00]" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section className="py-20">
        <div className="container max-w-4xl">
          <Card className="bg-[#1a2f1a]/80 border-[#c8ff00]/30">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-black text-white">
                Submit Your <span className="text-[#c8ff00]">Investment Inquiry</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Fill out the form below and our team will contact you within 24-48 hours to discuss investment opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#c8ff00]" />
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Smith"
                      required
                      className="bg-[#0a1a1a] border-[#c8ff00]/30 text-white"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#c8ff00]" />
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      required
                      className="bg-[#0a1a1a] border-[#c8ff00]/30 text-white"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#c8ff00]" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className="bg-[#0a1a1a] border-[#c8ff00]/30 text-white"
                    />
                  </div>

                  {/* Company */}
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#c8ff00]" />
                      Company/Fund Name
                    </Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Acme Ventures"
                      className="bg-[#0a1a1a] border-[#c8ff00]/30 text-white"
                    />
                  </div>
                </div>

                {/* Investment Range */}
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#c8ff00]" />
                    Investment Range *
                  </Label>
                  <Select
                    value={formData.investmentRange}
                    onValueChange={(value) => setFormData({ ...formData, investmentRange: value as any })}
                  >
                    <SelectTrigger className="bg-[#0a1a1a] border-[#c8ff00]/30 text-white">
                      <SelectValue placeholder="Select investment range" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2f1a] border-[#c8ff00]/30">
                      {investmentRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value} className="text-white hover:bg-[#c8ff00]/20">
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Investment Type */}
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#c8ff00]" />
                    Investment Type *
                  </Label>
                  <Select
                    value={formData.investmentType}
                    onValueChange={(value) => setFormData({ ...formData, investmentType: value as any })}
                  >
                    <SelectTrigger className="bg-[#0a1a1a] border-[#c8ff00]/30 text-white">
                      <SelectValue placeholder="Select investment type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2f1a] border-[#c8ff00]/30">
                      {investmentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="text-white hover:bg-[#c8ff00]/20">
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Accredited Status */}
                <div className="space-y-3">
                  <Label className="text-white">Are you an accredited investor? *</Label>
                  <RadioGroup
                    value={formData.accreditedStatus}
                    onValueChange={(value) => setFormData({ ...formData, accreditedStatus: value as any })}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="accredited-yes" className="border-[#c8ff00] text-[#c8ff00]" />
                      <Label htmlFor="accredited-yes" className="text-gray-300">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="accredited-no" className="border-[#c8ff00] text-[#c8ff00]" />
                      <Label htmlFor="accredited-no" className="text-gray-300">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unsure" id="accredited-unsure" className="border-[#c8ff00] text-[#c8ff00]" />
                      <Label htmlFor="accredited-unsure" className="text-gray-300">Not Sure</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Referral Source */}
                <div className="space-y-2">
                  <Label htmlFor="referral" className="text-white">How did you hear about us?</Label>
                  <Input
                    id="referral"
                    value={formData.referralSource}
                    onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                    placeholder="e.g., LinkedIn, referral, news article"
                    className="bg-[#0a1a1a] border-[#c8ff00]/30 text-white"
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-white">Additional Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your investment interests, questions, or how you'd like to be involved..."
                    rows={4}
                    className="bg-[#0a1a1a] border-[#c8ff00]/30 text-white"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="w-full bg-[#c8ff00] text-black hover:bg-[#a8e000] font-bold py-6 text-lg"
                >
                  {submitMutation.isPending ? (
                    "Submitting..."
                  ) : (
                    <>
                      Submit Investment Inquiry
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By submitting this form, you agree to be contacted by our investment team. 
                  All information is kept confidential and secure.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
